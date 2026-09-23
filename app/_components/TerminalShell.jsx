'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { COMMANDS, COMMAND_NAMES } from '../_lib/commands.js';
import {
  homePath, resolvePath, routeToDir, dirToRoute,
  normalizeSlashes, isDir, readFile, listDir as fsListDir,
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

const MOUNTED_HISTORY_BOOT = [
  {
    id: 'boot-1',
    type: 'banner',
    content:
      "snsh 1.0 — Samuel Nwankwo's interactive portfolio shell.\n" +
      'Type `help` and press Enter to get started. Try `neofetch` or `ls projects` for flavor.',
  },
  {
    id: 'boot-2',
    type: 'output',
    content:
      '← tip: ArrowUp/ArrowDown = history · Tab = autocomplete · Ctrl+L = clear · Ctrl+C = cancel',
  },
];

export default function TerminalShell({ children, initialCwd, initialTheme = 'green' }) {
  const router = useRouter();
  const pathname = usePathname();

  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const mountedRef = useRef(false);
  const nextIdRef = useRef(1000);

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
  const nextId = useCallback(() => ++nextIdRef.current, []);

  const pushToHistory = useCallback((type, content, raw = null) => {
    setHistory((prev) => [
      ...prev,
      {
        id: nextId(),
        type,
        content,
        raw,
        ts: Date.now(),
      },
    ]);
  }, [nextId]);

  const clearHistory = useCallback(() => setHistory([]), []);

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
    setMounted(true);
    // Restore persisted theme + cwd + history + input history
    try {
      const t = localStorage.getItem(`${STORAGE_KEY}:theme`);
      if (t) { setThemeState(t); document.documentElement.setAttribute('data-theme', t); }
      const c = localStorage.getItem(`${STORAGE_KEY}:cwd`);
      if (c) setCwd(c);
      const ih = JSON.parse(localStorage.getItem(`${STORAGE_KEY}:inputs`) || '[]');
      if (Array.isArray(ih) && ih.length) setInputHistory(ih);
      const h = JSON.parse(localStorage.getItem(`${STORAGE_KEY}:history`) || 'null');
      if (Array.isArray(h) && h.length) {
        setHistory(h.slice(-150));
      } else {
        setHistory(MOUNTED_HISTORY_BOOT.map((b, i) => ({ ...b, id: nextIdRef.current + i, ts: Date.now() })));
      }
    } catch (_) {}

    // Focus input on mount (desktop only; mobile soft keyboard is annoying)
    try {
      const isTouch = 'ontouchstart' in window;
      if (!isTouch) setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 50);
    } catch (_) {}

    return () => { mountedRef.current = false; };
  }, []);

  // Persist when state changes (debounced by just writing on every change; small size)
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
  useEffect(() => {
    if (!mounted) return;
    const targetDir = routeToDir(pathname);
    if (targetDir !== cwd) {
      // User navigated via browser back/forward or deep-link URL.
      // Show a synthetic `cd /target` in scrollback so the state + URL agree.
      setCwd(targetDir);
      const rel = pathname === '/' ? '~' : pathname;
      setHistory((prev) => {
        // Avoid duplicate if we just appended
        if (prev[prev.length - 1]?.raw === `cd ${rel}`) return prev;
        const id1 = ++nextIdRef.current;
        const id2 = ++nextIdRef.current;
        return [
          ...prev,
          { id: id1, type: 'input', content: renderPrompt(targetDir) + ` cd ${rel}`, raw: `cd ${rel}`, ts: Date.now() },
          { id: id2, type: 'output', content: `(navigated from URL: ${pathname})`, ts: Date.now() },
        ];
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, mounted]);

  /* ------------------------- Autoscroll on append --------------------- */
  useEffect(() => {
    if (!mounted) return;
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'instant',
      });
    });
  }, [history, mounted, children]);

  /* ------------------------- command execution ------------------------ */
  const exec = useCallback(async (rawCommand) => {
    const trimmed = String(rawCommand || '').trim();
    if (!trimmed) {
      pushToHistory('input', renderPrompt(cwd), '');
      return;
    }

    // Save into input history
    setInputHistory((prev) => {
      const arr = [...prev, trimmed];
      return arr.slice(-200);
    });
    setHistoryCursor(-1);

    // Tokenize (naive split on whitespace — good enough for our simple commands)
    const tokens = trimmed.split(/\s+/);
    const cmdName = tokens[0];
    const argv = tokens.slice(1);

    // Print input line first
    pushToHistory('input', renderPrompt(cwd) + ' ' + trimmed, trimmed);

    const cmd = COMMANDS[cmdName];
    if (!cmd) {
      pushToHistory(
        'error',
        `snsh: command not found: ${cmdName}. Type 'help' to list commands.`
      );
      triggerShake();
      return;
    }

    const shellCtx = {
      cwd,
      history: [...history, { type: 'input', raw: trimmed, content: trimmed }],
      env: buildEnv(cwd),
      setCwd(nextCwd) { setCwd(nextCwd); },
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
        await result.effects({
          router,
          clearHistory,
          setTheme,
        });
      } catch (e) {
        pushToHistory('error', `${cmdName}: effect failed: ${e?.message ?? String(e)}`);
      }
    }
  }, [cwd, history, pushToHistory, clearHistory, setTheme, router]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 200);
  };

  /* --------------------------- keyboard events ------------------------- */
  const onKeyDown = (e) => {
    const input = inputRef.current;
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
      clearHistory();
      return;
    }
    if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) {
      // Cancel current input: echo `^C` then new prompt line, clear input
      e.preventDefault();
      pushToHistory('input', renderPrompt(cwd) + ' ' + input.value + '^C', input.value);
      setRawInput('');
      setHistoryCursor(-1);
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      handleTabAutocomplete(input);
      return;
    }
  };

  const handleTabAutocomplete = (input) => {
    const val = input.value || '';
    const beforeCursor = val;
    const tokens = beforeCursor.split(/\s+/);
    // If we're completing the first token → command name
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
    // Otherwise completing a path argument (last token)
    const lastTok = tokens[tokens.length - 1] ?? '';
    const isPathArg = !/^-/.test(lastTok);
    if (!isPathArg || !lastTok) return;
    const abs = resolvePath(cwd, lastTok);
    const parentDir = lastTok.endsWith('/') || isDir(abs) ? abs : resolvePath(cwd, dirnameOf(lastTok));
    const prefix = lastTok.includes('/') ? lastTok.slice(0, lastTok.lastIndexOf('/') + 1) : '';
    const partialName = lastTok.includes('/') ? lastTok.slice(lastTok.lastIndexOf('/') + 1) : lastTok;
    const entries = readDirNames(parentDir);
    const matches = entries.filter((n) => n.startsWith(partialName));
    if (matches.length === 1) {
      const newLast = prefix + matches[0] + (isDir(resolvePath(parentDir, matches[0])) ? '/' : '');
      const newTokens = [...tokens.slice(0, -1), newLast];
      setRawInput(newTokens.join(' '));
    } else if (matches.length > 1) {
      pushToHistory('input', renderPrompt(cwd) + ' ' + val, val);
      pushToHistory('output', matches.join('   '));
    }
  };

  const contextValue = useMemo(() => ({
    cwd, setCwd, theme, setTheme,
    history, pushToHistory, clearHistory, exec,
    inputHistory, focus: () => inputRef.current?.focus({ preventScroll: true }),
  }), [cwd, theme, history, pushToHistory, clearHistory, exec, inputHistory]);

  /* ------------------------------ render ------------------------------ */
  const visibleHistory = mounted ? history : [];  // Avoid SSR/Client mismatch

  return (
    <TerminalContext.Provider value={contextValue}>
      <div
        ref={scrollRef}
        className={
          'w-full max-w-5xl mx-auto outline-none ' +
          (shake ? 'animate-shake' : '')
        }
        style={{
          flexGrow: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
        tabIndex={-1}
        role="region"
        aria-label="Interactive terminal"
        onClick={() => inputRef.current?.focus({ preventScroll: true })}
      >
        {/* Route content (rendered server-side by individual pages) */}
        <div className="mb-4 focus:outline-none">
          {children}
        </div>

        {/* Scrollback history (rendered client-only for hydration safety) */}
        {mounted && (
          <div className="flex flex-col gap-1" aria-live="polite">
            {visibleHistory.map((h) => (
              <HistoryLine key={h.id} entry={h} />
            ))}
          </div>
        )}

        {/* Current input row */}
        <div className="mt-1 terminal-input-row" onKeyDown={onKeyDown}>
          <PromptSpan cwd={mounted ? cwd : homePath()} />
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
            aria-label="Terminal command input"
            aria-describedby="sn-term-help"
            className="terminal-input flex-1"
            placeholder="type `help` and press Enter"
            disabled={!mounted}
          />
          <span aria-hidden className="hidden sm:inline text-terminal-accent animate-blink select-none ml-0.5">▊</span>
        </div>
        <p id="sn-term-help" className="sr-only">
          Use Tab to autocomplete commands and file paths. Use Arrow Up and Arrow Down to navigate
          command history. Press Ctrl+L to clear the screen.
        </p>
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
        ? entry.content.split('\n').map((line, i) => <div key={i}>{line}</div>)
        : entry.content}
    </div>
  );
}

function PromptSpan({ cwd }) {
  return (
    <span className="terminal-prompt whitespace-nowrap">
      samuel@portfolio
      <span className="text-terminal-fg-dim">:</span>
      <span className="terminal-path">{cwd === homePath() ? '~' : cwd}</span>
      <span className="text-terminal-fg-dim">$</span>
      <span className="inline-block w-2" />
    </span>
  );
}

/* ================================= Helpers ============================= */

function renderPrompt(cwd) {
  return `samuel@portfolio:${cwd === homePath() ? '~' : cwd}$ `;
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
