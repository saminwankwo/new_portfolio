'use client';

// Root-level error boundary. It replaces the whole document, so it must
// render its own <html> and <body> (Issue 6).
export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0a',
          color: '#86efac',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        <p style={{ fontSize: '12px', color: '#f87171' }}>Application error</p>
        <h1 style={{ margin: '0.5rem 0', fontSize: '1.5rem' }}>
          Samuel Nwankwo · Portfolio
        </h1>
        <p style={{ color: '#9ca3af' }}>
          An unexpected error occurred. Please try again.
        </p>
        <pre style={{ maxWidth: '100%', overflow: 'auto', color: '#f87171' }}>
          {error?.message || 'Unknown error'}
        </pre>
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: '1.5rem',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '4px',
            background: '#86efac',
            color: '#052e16',
            fontFamily: 'inherit',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
