import PROFILE from './data/profile.js';
import SKILLS from './data/skills.js';
import PROJECTS from './data/projects.js';
import { ROLES, EDUCATION } from './data/experience.js';

const HOME = '/home/samuel';

function bulletJoin(bullets) {
  return bullets.map((b) => `  ▸ ${b}`).join('\n');
}

function joinLines(arr) { return arr.join('\n'); }

function fmtDate(ym) {
  if (ym === 'Present') return ym;
  const [y, m] = ym.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[Number(m) - 1] || ym} ${y}`;
}

/* ------------------------- Markdown-ish content ------------------------ */

const ABOUT_MD = joinLines([
  `# ${PROFILE.name} <${PROFILE.handle}>`,
  `Role:     ${PROFILE.role} · ${PROFILE.availability}`,
  `Location: ${PROFILE.location.city}, ${PROFILE.location.country} (${PROFILE.location.tz} · ${PROFILE.location.utc})`,
  `Email:    ${PROFILE.email}`,
  ``,
  PROFILE.longBio,
  ``,
  `Useful next steps:`,
  `  • cat skills.md         — grouped skills`,
  `  • ls projects           — shipped + active work`,
  `  • cat experience/index.md — career timeline`,
  `  • open contact          — reach out`,
  `  • open resume.pdf       — download resume`,
]);

const SKILLS_MD = joinLines(
  Object.entries(SKILLS).flatMap(([group, list]) => [
    `## ${group}`,
    list.map((s) => `  • ${s}`).join('\n'),
    '',
  ])
);

const CONTACT_TXT = joinLines([
  `name      ${PROFILE.name}  (handle: ${PROFILE.handle})`,
  `email     ${PROFILE.email}`,
  `phone     ${PROFILE.phone}`,
  `location  ${PROFILE.location.city}, ${PROFILE.location.country} (${PROFILE.location.utc})`,
  ``,
  `links:`,
  `  github     ${PROFILE.socials.github}`,
  `  linkedin   ${PROFILE.socials.linkedin}`,
  `  twitter/x  ${PROFILE.socials.twitter}`,
  `  whatsapp   ${PROFILE.socials.whatsapp}`,
  `  calendly   ${PROFILE.socials.calendly}   [book a 30-min call]`,
]);

const PROJECT_INDEX_LINES = PROJECTS.map(
  (p) => `${p.slug}.md    ⟶  ${p.name} [${p.status}]`
);

const PROJECT_FILES = Object.fromEntries(
  PROJECTS.map((p) => [
    `${p.slug}.md`,
    joinLines([
      `# ${p.name}`,
      ``,
      `status     : ${p.status}`,
      `link       : ${p.link || '(not deployed, see github)'}`,
      `github     : ${p.github || '—'}`,
      `tags       : ${p.tags.join(' · ')}`,
      ``,
      p.description,
      ``,
      `## Highlights`,
      p.highlights.map((h) => `  ▸ ${h}`).join('\n'),
      '',
      `Open the project:  open projects/${p.slug}`,
    ]),
  ])
);

const EXP_INDEX = joinLines([
  `## ROLES`,
  '',
  ...ROLES.flatMap((r) => [
    `${fmtDate(r.startDate)} → ${fmtDate(r.endDate)}    ${r.role}`,
    `    ${r.company}  (${r.location})`,
    bulletJoin(r.bullets),
    '',
  ]),
  `## EDUCATION`,
  '',
  ...EDUCATION.flatMap((e) => [
    `${e.startDate} → ${e.endDate}    ${e.degree}`,
    `    ${e.school}`,
    `    ${e.detail}`,
    '',
  ]),
]);

const EXP_FILES = Object.fromEntries(
  ROLES.map((r) => [
    `${r.slug}.md`,
    joinLines([
      `# ${r.role}`,
      ``,
      `company  : ${r.company}`,
      `period   : ${fmtDate(r.startDate)} → ${fmtDate(r.endDate)}`,
      `location : ${r.location}`,
      ``,
      bulletJoin(r.bullets),
    ]),
  ])
);

/* -------------------------------- Tree --------------------------------- */

/**
 * File types:
 *   - 'file'   => content string (plain text / markdown-style)
 *   - 'dir'    => children object
 *   - 'link'   => virtual symlink (target: string absolute path)
 *   - 'asset'  => external public resource (url: string, info: { size, type })
 */
export const FS = {
  type: 'dir',
  children: {
    home: {
      type: 'dir',
      children: {
        samuel: {
          type: 'dir',
          children: {
            'about.md':   { type: 'file', content: ABOUT_MD, meta: { size: ABOUT_MD.length, modified: PROFILE.careerStart } },
            'skills.md':  { type: 'file', content: SKILLS_MD, meta: { size: SKILLS_MD.length } },
            'contact.txt':{ type: 'file', content: CONTACT_TXT, meta: { size: CONTACT_TXT.length } },
            'resume.pdf': {
              type: 'asset',
              url: '/samuel-nwankwo-resume.pdf',
              info: {
                size: 188416,
                type: 'PDF document, 2 pages',
              },
            },
            projects: {
              type: 'dir',
              children: Object.fromEntries(
                PROJECTS.map((p, i) => [
                  p.slug,
                  { type: 'link', target: `/home/samuel/projects/${p.slug}.md`, project: p, order: i },
                ])
              ),
              // Also expose the .md files directly:
              ...Object.fromEntries(
                Object.entries(PROJECT_FILES).map(([name, content]) => [
                  name,
                  { type: 'file', content, meta: { size: content.length } },
                ])
              ),
              index: {
                type: 'file',
                content: joinLines(PROJECT_INDEX_LINES),
                meta: { size: PROJECT_INDEX_LINES.join('\n').length },
              },
            },
            experience: {
              type: 'dir',
              children: {
                'index.md': { type: 'file', content: EXP_INDEX, meta: { size: EXP_INDEX.length } },
                ...Object.fromEntries(
                  Object.entries(EXP_FILES).map(([name, content]) => [
                    name,
                    { type: 'file', content, meta: { size: content.length } },
                  ])
                ),
              },
            },
          },
        },
      },
    },
  },
};

/* ------------------------------- Resolvers ------------------------------ */

export function normalizeSlashes(p) {
  if (!p) return '/';
  // Replace multiple slashes
  let out = p.replace(/\/+/g, '/');
  // Remove trailing slash (except root)
  if (out !== '/' && out.endsWith('/')) out = out.slice(0, -1);
  return out || '/';
}

/**
 * Resolve an arbitrary user-supplied path (relative or absolute, with ~/ .. . etc.)
 * against the current working directory. Always returns an absolute FS path string.
 */
export function resolvePath(cwd, input) {
  if (input == null) return cwd;
  const home = HOME;
  let p = String(input).trim();
  if (p === '') return cwd;
  if (p === '~' || p.startsWith('~/')) p = home + p.slice(1);
  if (!p.startsWith('/')) p = `${cwd}/${p}`;
  p = normalizeSlashes(p);

  const parts = p.split('/').filter(Boolean);
  const out = [];
  for (const part of parts) {
    if (part === '.') continue;
    if (part === '..') { out.pop(); continue; }
    out.push(part);
  }
  return '/' + out.join('/');
}

function getNodeAt(absPath) {
  const parts = normalizeSlashes(absPath).split('/').filter(Boolean);
  let node = FS;
  for (const part of parts) {
    if (node.type === 'link') node = getNodeAt(node.target);
    if (node.type !== 'dir') return null;
    if (!node.children?.[part]) return null;
    node = node.children[part];
  }
  return node;
}

function getLeafAt(absPath) {
  const node = getNodeAt(absPath);
  if (!node) return null;
  if (node.type === 'link') return { node: getNodeAt(node.target), linkSource: node, absPath };
  return { node, absPath };
}

export function isDir(absPath) {
  const n = getNodeAt(absPath);
  if (!n) return false;
  if (n.type === 'link') return isDir(n.target);
  return n.type === 'dir';
}

export function isFile(absPath) {
  const n = getNodeAt(absPath);
  if (!n) return false;
  if (n.type === 'link') return isFile(n.target);
  return n.type === 'file' || n.type === 'asset';
}

/**
 * List entries of a directory. If path points to a file, returns null.
 * Each entry: { name, type: 'dir'|'file'|'asset'|'link', size, modified }
 */
export function listDir(absPath, { all = false, long = false } = {}) {
  const resolved = getLeafAt(absPath);
  if (!resolved) return null;
  const { node } = resolved;
  if (node.type !== 'dir') return null;
  const children = node.children || {};
  const names = Object.keys(children);
  if (all) names.unshift('.', '..');
  return names
    .filter((n) => (all ? true : !n.startsWith('.')))
    .map((name) => {
      let child = children[name];
      let entryType = child.type;
      let target = null;
      if (child.type === 'link') {
        const t = getNodeAt(child.target);
        if (t) entryType = t.type;
        target = child.target;
      }
      const size =
        child.meta?.size ?? (entryType === 'dir' ? 4096 : 0);
      const modified = child.meta?.modified ?? child.project ? '—' : '—';
      return {
        name,
        type: entryType,
        originalType: child.type,
        size,
        modified,
        target,
        linkProject: child.project,
      };
    });
}

/**
 * Read a file's content (or asset info for assets). Returns:
 *   { ok: true,  kind: 'text', content }      for files
 *   { ok: true,  kind: 'asset', url, info }   for assets
 *   { ok: false, reason: 'no such file|is a directory|path not found' } otherwise
 */
export function readFile(absPath) {
  const resolved = getLeafAt(absPath);
  if (!resolved) return { ok: false, reason: 'path not found' };
  const { node } = resolved;
  if (node.type === 'dir') return { ok: false, reason: 'is a directory' };
  if (node.type === 'file') return { ok: true, kind: 'text', content: node.content };
  if (node.type === 'asset') return { ok: true, kind: 'asset', url: node.url, info: node.info };
  return { ok: false, reason: 'no such file' };
}

/** Return absolute home path string */
export function homePath() { return HOME; }

/** Like shell basename */
export function basename(path) {
  const p = normalizeSlashes(path);
  if (p === '/') return '/';
  const parts = p.split('/').filter(Boolean);
  return parts[parts.length - 1] || '';
}

/** Map known routes to FS dirs and vice-versa */
export const ROUTE_TO_DIR = {
  '/':          '/home/samuel',
  '/projects':  '/home/samuel/projects',
  '/experience':'/home/samuel/experience',
  '/contact':   '/home/samuel',
  '/resume':    '/home/samuel',
};

export const DIR_TO_ROUTE = {
  '/home/samuel':            '/',
  '/home/samuel/projects':   '/projects',
  '/home/samuel/experience': '/experience',
};

export function dirToRoute(absPath) {
  const p = normalizeSlashes(absPath);
  if (DIR_TO_ROUTE[p]) return DIR_TO_ROUTE[p];
  // Inside project file -> still /projects
  if (p.startsWith('/home/samuel/projects')) return '/projects';
  if (p.startsWith('/home/samuel/experience')) return '/experience';
  return null;
}

export function routeToDir(pathname) {
  return ROUTE_TO_DIR[pathname] ?? '/home/samuel';
}
