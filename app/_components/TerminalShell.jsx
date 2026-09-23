'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { COMMANDS, COMMAND_NAMES, VALID_THEMES } from '../_lib/commands.js';
import {
  homePath, resolvePath, routeToDir, prettyPath,
  isDir, listDir as fsListDir,
} from '../_lib/fileSystem.js';

/* ============================== Context ================================ */

const STORAGE_KEY = 'sn_term_state_v1';

const TerminalContext = createContext(null);

export function useTerminal() {
  const ctx = useContext(TerminalContext);
  if (!ctx) throw new Error('useTerminal must be used inside <TerminalShell>');
  return ctx;
}

/* ================================ Shell ================================= */

/** Collision-proof entry id (works across reloads + restored sessions). */
function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

const BOOT_HISTORY = [
  {
    id: 'boot-1',
    type: 'banner',
    content: 'snsh 1.0 — connected to samuel@portfolio (NwankwoOS 1.0, Carbon Dark).',
  },
  {
    id: 'boot-2',
    type: 'output',
    content:
      '← tip: ArrowUp/ArrowDown = history · Tab = autocomplete · Ctrl+L = clear · Ctrl+C = cancel',
  },
];

/**
 * The persistent terminal shell.
 *
 * Mounted ONCE in `app/layout.js` (layouts survive navigation, templates do
 * not) so scrollback history, cwd, theme and input history all persist across
 * `router.push()` and browser back/forward.
 *
 * Layout of the shell:
 *   .terminal-scroll  → route content (server-rendered, SEO) + transcript
 *   .terminal-input-row → pinned prompt + stdin, always visible
 */
export default function TerminalShell({ children, initialCwd, initialTheme = 'dark' }) {
  const router = useRouter();
  const pathname = usePathname();

  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const mountedRef = useRef(false);
  /* Where the scrollback should sit after the next render:
     true  → show the start of the screen (initial load / route change)
     false → follow the newest output (command execution) */
  const wantTopRef = useRef(true);

  /* ------------------------------- state ------------------------------- */
  const [mounted, setMounted] = useState(false);
  const [cwd, setCwd] = useState(initialCwd || homePath());
  const [theme, setThemeState] = useState(initialTheme);
  const [history, setHistory] = useState([]);
  const [rawInput, setRawInput] = useState('');
  const [inputHistory, setInputHistory] = useState([]);
  const [historyCursor, setHistoryCursor] = useState(-1);
  const [pendingDraft, setPendingDraft] = useState('');
  const [shake, setShake] = useState(false);

  /* ----------------------------- helpers ------------------------------ */
  // Unique per session AND per reload: avoids colliding with ids restored
  // from localStorage.
  const nextId = useCallback(() => uid(), []);

  const pushToHistory = useCallback((type, content, raw = null) => {
    setHistory((prev) => [...prev, { id: nextId(), type, content, raw, ts: Date.now() }]);
  }, [nextId]);

  const clearHistory = useCallback(() => setHistory([]), []);

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 220);
  }, []);

  const setTheme = useCallback((name) => {
    setThemeState(name);
    try {
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', name);
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(`${STORAGE_KEY}:theme`, name);
      }
    } catch (_) {}
  }, []);

  /* --------------------------- SSR → mount --------------------------- */
  useEffect(() => {
    mountedRef.current = true;

    // Restore persisted session (theme, cwd, input history, transcript).
    try {
      const t = localStorage.getItem(`${STORAGE_KEY}:theme`);
      // Ignore anything that isn't a known theme (stale/typo'd values would
      // leave the palette falling back to `:root` while state says otherwise).
      if (t && VALID_THEMES.includes(t)) {
        setThemeState(t);
        document.documentElement.setAttribute('data-theme', t);
      }
      const c = localStorage.getItem(`${STORAGE_KEY}:cwd`);
      if (c) setCwd(c);
      const ih = JSON.parse(localStorage.getItem(`${STORAGE_KEY}:inputs`) || '[]');
      if (Array.isArray(ih) && ih.length) setInputHistory(ih);
      const h = JSON.parse(localStorage.getItem(`${STORAGE_KEY}:history`) || 'null');
      setHistory(
        Array.isArray(h) && h.length
          ? h.slice(-150)
          : BOOT_HISTORY.map((b) => ({ ...b, ts: Date.now() }))
      );
    } catch (_) {
      setHistory(BOOT_HISTORY.map((b) => ({ ...b, ts: Date.now() })));
    }

    setMounted(true);

    // Focus input on mount (desktop only; mobile soft keyboard is annoying).
    try {
      const isTouch = 'ontouchstart' in window;
      if (!isTouch) setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 50);
    } catch (_) {}

    return () => { mountedRef.current = false; };
  }, []);

  // Persist session state.
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(`${STORAGE_KEY}:cwd`, cwd);
    } catch (_) {}
  }, [cwd, mounted]);
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(`${STORAGE_KEY}:inputs`, JSON.stringify(inputHistory.slice(-100)));
    } catch (_) {}
  }, [inputHistory, mounted]);
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(`${STORAGE_KEY}:history`, JSON.stringify(history.slice(-150)));
    } catch (_) {}
  }, [history, mounted]);

  /* ---------------- Sync cwd ↔ pathname (URL ↔ FS dir) ---------------- */
  // Declared BEFORE the scroll effect so that on a route change the scroll
  // target is already "top of the new screen" when the effect runs.
  useEffect(() => {
    if (!mounted) return;
    wantTopRef.current = true; // a new screen starts at its first line
    const targetDir = routeToDir(pathname);
    if (targetDir === cwd) return;

    // Navigated via deep link, browser back/forward, or a <Link> click.
    // Mirror it into the transcript so the scrollback reflects how we got here.
    setCwd(targetDir);
    const rel = pathname === '/' ? '~' : pathname;
    setHistory((prev) => {
      if (prev[prev.length - 1]?.raw === `cd ${rel}`) return prev; // just appended by `cd`
      return [
        ...prev,
        { id: uid(), type: 'input', content: renderPrompt(targetDir) + ` cd ${rel}`, raw: `cd ${rel}`, ts: Date.now() },
        { id: uid(), type: 'output', content: `(navigated from URL: ${pathname})`, ts: Date.now() },
      ];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, mounted]);

  /* ------------------------- Autoscroll on append --------------------- */
  useEffect(() => {
    if (!mounted) return;
    const el = scrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      if (!el.isConnected) return;
      el.scrollTo({
        top: wantTopRef.current ? 0 : el.scrollHeight,
        behavior: 'instant',
      });
    });
  }, [history, mounted, children]);

  /* ------------------------- command execution ------------------------ */
  const exec = useCallback(async (rawCommand) => {
    // A command produces output below → follow it to the bottom.
    wantTopRef.current = false;

    const trimmed = String(rawCommand || '').trim();
    if (!trimmed) {
      pushToHistory('input', renderPrompt(cwd), '');
      return;
    }

    setInputHistory((prev) => [...prev, trimmed].slice(-200));
    setHistoryCursor(-1);

    // Tokenize (naive split on whitespace — good enough for our simple commands)
    const tokens = trimmed.split(/\s+/);
    const cmdName = tokens[0];
    const argv = tokens.slice(1);

    pushToHistory('input', renderPrompt(cwd) + ' ' + trimmed, trimmed);

    const cmd = COMMANDS[cmdName];
    if (!cmd) {
      pushToHistory('error', `snsh: command not found: ${cmdName}. Type 'help' to list commands.`);
      triggerShake();
      return;
    }

    const shellCtx = {
      cwd,
      pathname,
      history: [...history, { type: 'input', raw: trimmed, content: trimmed }],
      env: buildEnv(cwd),
      setCwd,
      pushToHistory,
      error: (s) => pushToHistory('error', s),
      out:   (s) => pushToHistory('output', s),
      banner:(s) => pushToHistory('banner', s),
      warning:(s) => pushToHistory('warning', s),
    };

    let result;
    try {
      result = cmd.run(shellCtx, argv);
    } catch (e) {
      pushToHistory('error', `snsh: ${cmdName}: ${e?.message ?? String(e)}`);
      return;
    }

    if (result && typeof result.effects === 'function') {
      try {
        await result.effects({ router, clearHistory, setTheme, pathname });
      } catch (e) {
        pushToHistory('error', `${cmdName}: effect failed: ${e?.message ?? String(e)}`);
      }
    }
  }, [cwd, pathname, history, pushToHistory, clearHistory, setTheme, router, triggerShake]);

  /* --------------------------- keyboard events ------------------------- */
  const onKeyDown = (e) => {
    const input = inputRef.current;
    // Only capture keys while stdin has focus; otherwise let the browser be.
    if (!input || input !== document.activeElement) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      const value = input.value;
      setRawInput('');
      setPendingDraft('');
      void exec(value);
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (inputHistory.length === 0) return;
      if (historyCursor === -1) setPendingDraft(input.value);
      const nextCursor = historyCursor === -1
        ? inputHistory.length - 1
        : Math.max(0, historyCursor - 1);
      setHistoryCursor(nextCursor);
      setRawInput(inputHistory[nextCursor] ?? '');
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyCursor === -1) return;
      const nextCursor = historyCursor + 1;
      if (nextCursor >= inputHistory.length) {
        setHistoryCursor(-1);
        setRawInput(pendingDraft);
      } else {
        setHistoryCursor(nextCursor);
        setRawInput(inputHistory[nextCursor] ?? '');
      }
      return;
    }

    if (e.ctrlKey && (e.key === 'l' || e.key === 'L')) {
      e.preventDefault();
      wantTopRef.current = true; // empty screen → nothing to follow
      clearHistory();
      return;
    }
    if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) {
      // Cancel current input: echo `^C` then a fresh prompt line.
      e.preventDefault();
      pushToHistory('input', renderPrompt(cwd) + ' ' + input.value + '^C', input.value);
      setRawInput('');
      setHistoryCursor(-1);
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      handleTabAutocomplete(input);
    }
  };

  const handleTabAutocomplete = (input) => {
    const val = input.value || '';
    const tokens = val.split(/\s+/);

    // Completing the first token → command name.
    if (tokens.length === 1) {
      const prefix = tokens[0];
      if (!prefix) return;
      const matches = COMMAND_NAMES.filter((n) => n.startsWith(prefix));
      if (matches.length === 1) {
        setRawInput(matches[0] + ' ');
      } else if (matches.length > 1) {
        pushToHistory('input', renderPrompt(cwd) + ' ' + val, val);
        pushToHistory('output', matches.join('   '));
      }
      return;
    }

    // Otherwise complete the path in the last token.
    const lastTok = tokens[tokens.length - 1] ?? '';
    if (!lastTok || /^-/.test(lastTok)) return;

    const abs = resolvePath(cwd, lastTok);
    const parentDir = lastTok.endsWith('/') || isDir(abs)
      ? abs
      : resolvePath(cwd, dirnameOf(lastTok));
    const prefix = lastTok.includes('/') ? lastTok.slice(0, lastTok.lastIndexOf('/') + 1) : '';
    const partialName = lastTok.includes('/') ? lastTok.slice(lastTok.lastIndexOf('/') + 1) : lastTok;
    const entries = readDirNames(parentDir);
    const matches = entries.filter((n) => n.startsWith(partialName));

    if (matches.length === 1) {
      const done = prefix + matches[0] + (isDir(resolvePath(parentDir, matches[0])) ? '/' : '');
      setRawInput([...tokens.slice(0, -1), done].join(' '));
    } else if (matches.length > 1) {
      pushToHistory('input', renderPrompt(cwd) + ' ' + val, val);
      pushToHistory('output', matches.join('   '));
    }
  };

  /* Clicking the scrollback focuses stdin, but never steals a text selection
     or a click that is landing on a link / form control. */
  const onScrollClick = (e) => {
    if (e.target.closest('a, button, input, textarea, select, label')) return;
    const sel = typeof window !== 'undefined' ? window.getSelection() : null;
    if (sel && String(sel).length > 0) return;
    inputRef.current?.focus({ preventScroll: true });
  };

  const contextValue = useMemo(() => ({
    cwd, setCwd, theme, setTheme, pathname,
    history, pushToHistory, clearHistory, exec,
    inputHistory,
    focus: () => inputRef.current?.focus({ preventScroll: true }),
  }), [cwd, theme, pathname, history, pushToHistory, clearHistory, exec, inputHistory]);

  /* ------------------------------ render ------------------------------ */
  return (
    <TerminalContext.Provider value={contextValue}>
      <div className={'terminal-shell ' + (shake ? 'animate-shake' : '')}>
        <div
          ref={scrollRef}
          className="terminal-scroll"
          tabIndex={-1}
          role="region"
          aria-label="Terminal scrollback"
          onClick={onScrollClick}
        >
          {/* Route content — server-rendered by each page (SEO-canonical). */}
          <div className="route-content">{children}</div>

          {/* Transcript — client-only after mount to avoid hydration mismatch. */}
          {mounted && (
            <div className="flex flex-col gap-1" aria-live="polite">
              {history.map((h) => (
                <HistoryLine key={h.id} entry={h} />
              ))}
            </div>
          )}
        </div>

        {/* Pinned stdin row */}
        <div className="terminal-input-row" onKeyDown={onKeyDown}>
          <PromptSpan id="sn-term-prompt" cwd={mounted ? cwd : homePath()} />
          <label htmlFor="sn-term-input" className="sr-only">
            Terminal input. Type a command and press Enter to run it.
          </label>
          <input
            id="sn-term-input"
            ref={inputRef}
            value={mounted ? rawInput : ''}
            onChange={(e) => setRawInput(e.target.value)}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            autoComplete="off"
            aria-describedby="sn-term-prompt sn-term-help"
            className="terminal-input flex-1"
            placeholder="type `help` and press Enter"
            disabled={!mounted}
          />
          <span aria-hidden className="hidden sm:inline text-terminal-accent animate-blink select-none ml-0.5">
            ▊
          </span>
          <p id="sn-term-help" className="sr-only">
            Use Tab to autocomplete commands and file paths. Use Arrow Up and Arrow Down to
            navigate command history. Press Ctrl+L to clear the screen.
          </p>
        </div>
      </div>
    </TerminalContext.Provider>
  );
}

/* ============================== Subcomponents ========================== */

function HistoryLine({ entry }) {
  const cls = `terminal-line terminal-line--${entry.type}`;
  return (
    <div className={cls}>
      {typeof entry.content === 'string'
        ? entry.content.split('\n').map((line, i) => <div key={i}>{line || '\u00A0'}</div>)
        : entry.content}
    </div>
  );
}

function PromptSpan({ cwd, id }) {
  return (
    <span id={id} className="terminal-prompt whitespace-nowrap">
      samuel@portfolio
      <span className="text-terminal-fg-dim">:</span>
      <span className="terminal-path">{prettyPath(cwd)}</span>
      <span className="text-terminal-fg-dim">$</span>
      <span className="inline-block w-2" />
    </span>
  );
}

/* ================================= Helpers ============================= */

function renderPrompt(cwd) {
  return `samuel@portfolio:${prettyPath(cwd)}$ `;
}

function buildEnv(cwd) {
  return {
    HOME: homePath(),
    USER: 'samuel',
    PWD: cwd,
    SHELL: 'snsh 1.0',
    TERM: 'xterm-256color',
  };
}

function dirnameOf(path) {
  if (!path) return '.';
  const i = path.lastIndexOf('/');
  return i <= 0 ? '.' : path.slice(0, i);
}

function readDirNames(dirAbs) {
  try {
    const entries = fsListDir(dirAbs, { all: false, long: false }) ?? [];
    return entries.map((e) => e.name);
  } catch (_) {
    return [];
  }
}
