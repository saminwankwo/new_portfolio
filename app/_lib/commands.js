import {
  listDir, readFile, resolvePath, homePath, prettyPath,
  isDir, dirToRoute, routeToDir,
} from './fileSystem.js';
import PROFILE from './data/profile.js';
import PROJECTS from './data/projects.js';

const VALID_THEMES = ['green', 'amber', 'retro-amber', 'blue', 'synthwave'];

/** URL routes that are *not* directories in the virtual FS. */
const ROUTE_PATHS = new Set(['/', '/projects', '/experience', '/contact', '/resume']);
/** Route path → the FS directory `cd` should land in. (`/` is excluded: it
 *  really exists as the FS root, so plain path resolution handles it.) */
const ROUTE_ALIASES = {
  '/projects':   '/home/samuel/projects',
  '/experience': '/home/samuel/experience',
  '/contact':    '/home/samuel',
  '/resume':     '/home/samuel',
};

function navigate(route) {
  return {
    effects: async ({ router }) => {
      try { router.push(route); } catch (_) {}
    },
  };
}

const ASCII_SN_LOGO = [
  '  SSSSS  N   N ',
  ' S    S  NN  N ',
  ' S       N N N ',
  '  SSSSS  N  NN ',
  '      S  N   N ',
  ' S    S  N   N ',
  '  SSSSS  N   N ',
].join('\n');

/**
 * Command registry.
 * Each command: { help, run(ctx, argv) }
 *
 * ctx: {
 *   cwd, setCwd, env, history,
 *   pushToHistory(type, content), // content: string | ReactNode
 *   router (from next/navigation),
 *   error(str) / out(str) / banner(str) helpers,
 * }
 *
 * Commands MUST be pure functions (no React hooks, no browser globals) so
 * they're unit-testable. Browser interactions (router.push, open, theme
 * html[data-theme]) are called through the context or by returning an
 * `effects` promise the shell awaits.
 */
export const COMMANDS = {
  help: {
    help: 'Show available commands. Usage: help [command]',
    run(ctx, argv) {
      const [topic] = argv;
      if (topic && COMMANDS[topic]) {
        ctx.out(`$ help ${topic}\n  ${COMMANDS[topic].help}`);
        return;
      }
      const rows = Object.keys(COMMANDS).sort().map((name) => {
        const h = COMMANDS[name].help;
        const firstLine = h.split('\n')[0];
        return `  ${name.padEnd(10, ' ')}  ${firstLine}`;
      });
      ctx.banner(
        'Available commands (13 total)\n' +
        rows.join('\n') +
        `\n\nTip: tab-complete command names · ArrowUp/Down for history · Ctrl+L = clear`
      );
    },
  },

  clear: {
    help: 'Clear the scrollback. Shortcut: Ctrl+L',
    run(ctx) {
      return { effects: async ({ clearHistory }) => { clearHistory(); } };
    },
  },

  history: {
    help: 'Show the last 50 commands typed in this session',
    run(ctx) {
      const inputs = ctx.history.filter((h) => h.type === 'input').slice(-50);
      const out = inputs.length === 0
        ? '(no commands yet — type help)'
        : inputs.map((h, i) => `${String(i + 1).padStart(3, ' ')}  ${h.raw}`).join('\n');
      ctx.out(out);
    },
  },

  pwd: {
    help: 'Print the current working directory',
    run(ctx) {
      ctx.out(prettyPath(ctx.cwd));
    },
  },

  whoami: {
    help: 'Print identity, role, and contact summary',
    run(ctx) {
      ctx.out(
        [
          `${PROFILE.name}  (@${PROFILE.handle})`,
          `  role       : ${PROFILE.role}`,
          `  pronouns   : ${PROFILE.pronouns}`,
          `  location   : ${PROFILE.location.city}, ${PROFILE.location.country} (${PROFILE.location.utc})`,
          `  email      : ${PROFILE.email}`,
          `  availability: ${PROFILE.availability}`,
        ].join('\n')
      );
    },
  },

  echo: {
    help: 'Print text to the terminal. Usage: echo Hello world · echo $HOME',
    run(ctx, argv) {
      const home = homePath();
      const env = { HOME: home, USER: PROFILE.handle, PWD: ctx.cwd, SHELL: 'snsh 1.0' };
      const rendered = argv.join(' ').replace(/\$(\w+)/g, (_, name) => env[name] ?? '');
      ctx.out(rendered);
    },
  },

  ls: {
    help: 'List directory contents. Usage: ls [-l] [-a] [path]',
    run(ctx, argv) {
      let all = false;
      let long = false;
      const paths = [];
      for (const a of argv) {
        if (a.startsWith('-')) {
          if (a.includes('a')) all = true;
          if (a.includes('l')) long = true;
        } else {
          paths.push(a);
        }
      }
      const targets = paths.length ? paths : [ctx.cwd];
      targets.forEach((raw, idx) => {
        const abs = resolvePath(ctx.cwd, raw);
        const entries = listDir(abs, { all, long });
        if (entries === null) {
          ctx.error(`ls: cannot access '${raw}': No such file or directory`);
          return;
        }
        if (targets.length > 1) ctx.banner(`${raw}:`);
        if (long) {
          const rows = entries.map((e) => {
            const t = e.type === 'dir' ? 'd' : (e.originalType === 'link' ? 'l' : '-');
            const perms = t === 'd' ? 'drwxr-xr-x' : '-rw-r--r--';
            const size = humanSize(e.size);
            const owner = 'samuel';
            const group = 'staff';
            const name = e.type === 'dir' ? `${e.name}/` : e.name;
            const link = e.originalType === 'link' ? ` → ${e.target ?? ''}` : '';
            const desc = e.linkProject ? `— ${e.linkProject.name} [${e.linkProject.status}]` : '';
            return `${perms}  ${owner.padEnd(6)}  ${group.padEnd(5)}  ${size.padStart(7)}  ${name.padEnd(22)} ${link} ${desc}`;
          });
          ctx.out(rows.join('\n'));
        } else {
          const cols = entries.map((e) => {
            const suffix = e.type === 'dir' ? '/' : '';
            const l = e.originalType === 'link' ? '@' : '';
            return e.name + suffix + l;
          });
          ctx.out(columnWrap(cols, 3));
        }
        if (idx < targets.length - 1) ctx.out('');
      });
    },
  },

  cd: {
    help: 'Change directory. Usage: cd ~ · cd projects · cd .. · cd /experience',
    run(ctx, argv) {
      const [target = '~'] = argv;

      // Absolute route paths (`cd /experience`, `cd /contact`) resolve against
      // the URL table, not just the virtual FS — and they update the browser
      // URL so the page stays shareable.
      if (Object.hasOwn(ROUTE_ALIASES, target)) {
        const abs = ROUTE_ALIASES[target];
        ctx.setCwd(abs);
        if (target !== ctx.pathname) return navigate(target);
        return;
      }

      const abs = resolvePath(ctx.cwd, target);
      if (!isDir(abs)) {
        ctx.error(`cd: no such file or directory: ${target}`);
        return;
      }
      ctx.setCwd(abs);
      const route = dirToRoute(abs);
      if (route && route !== ctx.pathname) return navigate(route);
    },
  },

  cat: {
    help: 'Concatenate and print a file. Usage: cat about.md · cat projects/devxp.md',
    run(ctx, argv) {
      if (argv.length === 0) {
        ctx.error(`cat: missing operand`);
        return;
      }
      for (const raw of argv) {
        const abs = resolvePath(ctx.cwd, raw);
        if (isDir(abs)) {
          ctx.error(`cat: ${raw}: Is a directory`);
          continue;
        }
        const r = readFile(abs);
        if (!r.ok) {
          ctx.error(`cat: ${raw}: No such file or directory`);
          continue;
        }
        if (r.kind === 'text') {
          ctx.banner(`$ cat ${raw}`);
          ctx.out(r.content);
        } else if (r.kind === 'asset') {
          ctx.banner(`$ cat ${raw}`);
          ctx.out(`(binary file: ${r.info.type}, ${humanSize(r.info.size)})`);
          ctx.out(`Open with: open ${raw}  (opens in new tab)`);
        }
      }
    },
  },

  open: {
    help: [
      'Open a file, route, or URL.',
      '  open projects/<slug>    →  open the real project in a new tab',
      '  open contact            →  navigate to /contact',
      '  open resume.pdf         →  download / view the PDF',
      '  open https://...        →  open external URL in a new tab',
    ].join('\n'),
    run(ctx, argv) {
      const [target] = argv;
      if (!target) { ctx.error('open: missing target'); return; }

      if (/^https?:\/\//.test(target)) {
        return browserOpen(ctx, target);
      }

      // Known route? (`open contact`, `open /resume`, `open /projects`)
      const bare = target.replace(/^\//, '');
      const route = ROUTE_PATHS.has(target)
        ? target
        : ROUTE_PATHS.has(`/${bare}`) ? `/${bare}` : null;
      if (route) {
        ctx.setCwd(routeToDir(route));
        if (route !== ctx.pathname) {
          ctx.out(`(opening ${route})`);
          return navigate(route);
        }
        ctx.out(`(already at ${route})`);
        return;
      }

      // Project file?
      const abs = resolvePath(ctx.cwd, target);
      const leaf = readFile(abs);
      const dirNode = isDir(abs) ? listDir(abs, { all: false }) : null;

      // Project dir alias: projects/<slug>
      const parts = abs.split('/').filter(Boolean);
      const projectsIdx = parts.indexOf('projects');
      if (projectsIdx >= 0 && parts[projectsIdx + 1]) {
        const slug = parts[projectsIdx + 1].replace(/\.md$/, '');
        const proj = PROJECTS.find((p) => p.slug === slug || p.slug === slug);
        if (proj) {
          const where = proj.link || proj.github;
          if (where) return browserOpen(ctx, where);
          ctx.out(`open: ${target} has no deploy URL. github: ${proj.github ?? '—'}`);
          return;
        }
      }

      if (leaf.kind === 'asset') return openAsset(ctx, leaf.url, target);

      if (leaf.ok && leaf.kind === 'text') {
        // "open" for a text file → equivalent to cat + prompt
        ctx.banner(`$ open ${target}  (text file)`);
        ctx.out(leaf.content);
        return;
      }

      if (dirNode) {
        const route = dirToRoute(abs);
        if (route) {
          ctx.setCwd(abs);
          if (route !== ctx.pathname) return navigate(route);
          return;
        }
        ctx.out(`open: ${target} is a directory (use ls to list, cd to enter).`);
        return;
      }

      ctx.error(`open: ${target}: No such file, route, or URL`);
    },
  },

  curl: {
    help: 'Download a resource. Usage: curl /resume.pdf [--save Samuel_Nwankwo_Resume.pdf]',
    run(ctx, argv) {
      const flags = argv.filter((a) => a.startsWith('--'));
      const saveFlag = flags.find((f) => f.startsWith('--save='));
      const saveName = saveFlag ? saveFlag.split('=')[1] : null;
      const target = argv.find((a) => !a.startsWith('--'));
      if (!target) { ctx.error('curl: missing URL'); return; }

      if (target === '/resume.pdf' || target.endsWith('resume.pdf')) {
        const url = '/samuel-nwankwo-resume.pdf';
        return {
          effects: async () => {
            if (typeof window === 'undefined') return;
            ctx.banner(`$ curl -sIL ${target}`);
            if (!(await assetExists(url))) {
              ctx.error('curl: (22) The requested URL returned error: 404 Not Found');
              ctx.out('resume.pdf is not installed yet — email me for the latest copy.');
              return;
            }
            const a = document.createElement('a');
            a.href = url;
            a.download = saveName || 'Samuel_Nwankwo_Resume.pdf';
            document.body.appendChild(a);
            a.click();
            a.remove();
            ctx.out('[✓] Download started — check your browser\'s downloads.');
          },
        };
      }

      ctx.banner(`$ curl -sL ${target}`);
      ctx.out(
        [
          `  % Total    % Received  Dload  Upload   Total   Spent    Left  Speed`,
          `  100   132      0   132    0     0    420      0 --:--:-- --:--:-- --:--:--   421`,
          ``,
          `(simulated fetch; for real downloads use curl /resume.pdf or click a link.)`,
        ].join('\n')
      );
    },
  },

  neofetch: {
    help: 'Display a stylized "system info" card. Pure fun.',
    run(ctx) {
      const now = new Date();
      const start = new Date(PROFILE.careerStart);
      const yearsOfXP = ((now - start) / (365.25 * 24 * 3600 * 1000)).toFixed(1);
      const lines = [
        `${PROFILE.handle}@portfolio`,
        '─'.repeat(PROFILE.handle.length + 11),
        `OS         : NwankwoOS 1.0 (${PROFILE.location.tz})`,
        `Host       : Browser · ${typeof navigator !== 'undefined' ? navigator.platform || 'Web' : 'Web'}`,
        `Kernel     : React 19 / Next.js 15`,
        `Uptime     : ${yearsOfXP} years of building things for the web`,
        `Shell      : snsh 1.0`,
        `Resolution : ${typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '(client-side)'}`,
        `Theme      : ${currentThemeName()} (switch with 'theme <name>')`,
        `Terminal   : SN-Term v1 (tab-complete, history, reduced-motion aware)`,
        `CPU        : Full-Stack Engineer × 24 (${PROFILE.location.country} based)`,
        `Memory     : ∞ ideas  /  1 MacBook Pro`,
        `Projects   : ${PROJECTS.length} shipped + active`,
        `Availability: ${PROFILE.availability}`,
      ];
      const out = zipTwoColumns(ASCII_SN_LOGO.split('\n'), lines);
      ctx.banner(out);
    },
  },

  theme: {
    help: `Swap terminal palette. Themes: ${VALID_THEMES.join(', ')}. Usage: theme amber`,
    run(ctx, argv) {
      const [name] = argv;
      if (!name) {
        ctx.out(`Current theme: ${currentThemeName()}\nAvailable: ${VALID_THEMES.join(', ')}`);
        return;
      }
      if (!VALID_THEMES.includes(name)) {
        ctx.error(`theme: '${name}' not found. Valid: ${VALID_THEMES.join(', ')}`);
        return;
      }
      return {
        effects: async ({ setTheme }) => {
          if (setTheme) setTheme(name);
          else if (typeof document !== 'undefined') document.documentElement.setAttribute('data-theme', name);
          ctx.banner(`Theme changed → ${name}. Saved for this session.`);
        },
      };
    },
  },
};

/* -------------------------------- helpers ------------------------------- */

function currentThemeName() {
  if (typeof document === 'undefined') return 'green';
  const t = document.documentElement.getAttribute('data-theme');
  return VALID_THEMES.includes(t) ? t : 'green';
}

function browserOpen(ctx, url) {
  return {
    effects: async () => {
      if (typeof window === 'undefined') return;
      window.open(url, '_blank', 'noopener,noreferrer');
      ctx.banner(`$ open ${url}`);
      ctx.out('[↗] Opened in new tab.');
    },
  };
}

/** HEAD-check a local asset so we never open a 404 tab (missing resume PDF). */
async function assetExists(url) {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.ok;
  } catch (_) {
    return false;
  }
}

function openAsset(ctx, url, target) {
  return {
    effects: async () => {
      if (typeof window === 'undefined') return;
      ctx.banner(`$ open ${target}`);
      if (!(await assetExists(url))) {
        ctx.error(`open: ${target}: 404 — file not installed yet.`);
        ctx.out(`Email me for a copy → ${PROFILE.email}`);
        return;
      }
      window.open(url, '_blank', 'noopener,noreferrer');
      ctx.out('[↗] Opened in new tab.');
    },
  };
}

function humanSize(bytes) {
  if (!bytes) return '0B';
  const units = ['B', 'K', 'M', 'G'];
  let i = 0;
  let n = Number(bytes) || 0;
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
  const v = Math.round(n * 10) / 10;
  return `${v}${units[i]}`;
}

function columnWrap(items, cols = 3) {
  const max = Math.max(...items.map((i) => i.length), 12);
  const colW = max + 3;
  const lines = [];
  let line = [];
  for (const it of items) {
    line.push(it.padEnd(colW, ' '));
    if (line.length === cols) { lines.push(line.join('')); line = []; }
  }
  if (line.length) lines.push(line.join(''));
  return lines.join('\n');
}

function zipTwoColumns(left, right) {
  const rows = Math.max(left.length, right.length);
  const out = [];
  const pad = 40;
  for (let i = 0; i < rows; i++) {
    const l = (left[i] ?? '').padEnd(pad, ' ');
    const r = right[i] ?? '';
    out.push(`${l}${r}`);
  }
  return out.join('\n');
}

export const COMMAND_NAMES = Object.keys(COMMANDS).sort();
export { VALID_THEMES, PROFILE as _profile_ref };
