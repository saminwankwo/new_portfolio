/**
 * Passive terminal "screenshot" block.
 *
 * Renders pre-rendered text content (strings / ReactNode rows) with the same
 * visual language as the interactive TerminalShell, but doesn't accept input.
 * Used by route pages to show `cat about.md`, `ls -la projects`, etc. as
 * server-rendered content so Google & OG scrapers see readable text without
 * executing JS (plan note 7).
 *
 * Props:
 *   - lines: (string | ReactNode)[] — each element renders on its own line
 *   - titleBar: optional string — fake window title, e.g. `samuel@portfolio:~$ cat about.md`
 *   - showTitleBar: boolean (default true)
 *   - variant: 'output' | 'banner' | 'error' | 'warning' | 'input'
 *   - className: optional extra classes on the wrapper
 *   - ascii: boolean — monospace banner mode: never wraps, scales via clamp()
 */
export default function TerminalBlock({
  lines = [],
  titleBar = null,
  showTitleBar = true,
  variant = 'output',
  className = '',
  ascii = false,
}) {
  const rows = Array.isArray(lines) ? lines : [lines];
  return (
    <div className={`terminal-frame ${className}`} aria-label="Terminal output">
      {showTitleBar && (
        <div className="terminal-frame__titlebar">
          <span className="terminal-frame__dot terminal-frame__dot--close" aria-hidden />
          <span className="terminal-frame__dot terminal-frame__dot--min" aria-hidden />
          <span className="terminal-frame__dot terminal-frame__dot--max" aria-hidden />
          <span className="ml-2 truncate">{titleBar ?? 'samuel@portfolio: ~'}</span>
        </div>
      )}
      <div className="terminal-frame__body">
        <pre className={ascii ? 'terminal-ascii' : ''} style={{ margin: 0 }}>
          {rows.map((row, i) => (
            <div key={i} className={`terminal-line terminal-line--${variant}`}>
              {row === '' || row == null ? '\u00A0' : row}
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}
