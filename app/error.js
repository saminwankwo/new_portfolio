'use client';

// Per-route error boundary: renders when a route segment throws and offers a
// retry without unmounting the whole app (Issue 6).
export default function Error({ error, reset }) {
  return (
    <div className="terminal-frame">
      <div className="terminal-frame__titlebar">
        <span className="terminal-frame__dot terminal-frame__dot--close" aria-hidden />
        <span className="terminal-frame__dot terminal-frame__dot--min" aria-hidden />
        <span className="terminal-frame__dot terminal-frame__dot--max" aria-hidden />
        <span className="ml-2 truncate">snsh: segmentation fault</span>
      </div>
      <div className="terminal-frame__body">
        <p className="terminal-line terminal-line--error">Segment error</p>
        <p className="terminal-line terminal-line--banner mt-2">Something went wrong.</p>
        <p className="terminal-line terminal-line--output mt-2">
          An unexpected error occurred while rendering this page.
        </p>
        <pre className="terminal-line terminal-line--error mt-4 whitespace-pre-wrap">
          {error?.message || 'Unknown error'}
        </pre>
        <button type="button" onClick={reset} className="term-form__btn mt-6">
          $ retry
        </button>
      </div>
    </div>
  );
}
