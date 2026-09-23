/**
 * Passive terminal "screenshot" block.
 *
 * Renders pre-rendered text content (strings / ReactNode arrays) with the
 * same visual language as the interactive TerminalShell, but doesn't accept
 * input. Used by route pages to show `cat about.md`, `ls projects`, etc.
 * as server-rendered content so Google & OG scrapers see readable text
 * without executing JS.
 *
 * Props:
 *   - lines: string[] | ReactNode[] (each element = one line)
 *   - titleBar: optional string (shown in the fake window title bar, e.g.
 *               `cat about.md` →  "samuel@portfolio: cat about.md")
 *   - showTitleBar: boolean (default true)
 *   - className: optional extra classes on the wrapper
 *   - ascii: boolean — if true, apply monospace/tighter terminal-ascii class
 */
export default function TerminalBlock({
  lines = [],
  titleBar = null,
  showTitleBar = true,
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
          <span className="ml-2 truncate">
            {titleBar ?? 'samuel@portfolio: ~'}
          </span>
        </div>
      )}
      <div className="terminal-frame__body">
        <pre
          className={ascii ? 'terminal-ascii' : ''}
          style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
        >
          {rows.map((row, i) => (
            <div key={i} className="terminal-line terminal-line--output">
              {row}
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}
