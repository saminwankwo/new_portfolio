'use client';

// Per-route error boundary: renders when a route segment throws and offers a
// retry without unmounting the whole app (Issue 6).
export default function Error({ error, reset }) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-gray-950 p-8 font-mono text-green-300">
      <p className="text-sm text-red-400">Segment error</p>
      <h1 className="mt-2 text-2xl font-bold">Something went wrong.</h1>
      <p className="mt-4 text-center text-gray-400">
        An unexpected error occurred while rendering this page.
      </p>
      <pre className="mt-4 max-w-full overflow-auto text-sm text-red-400">
        {error?.message || 'Unknown error'}
      </pre>
      <button
        type="button"
        onClick={reset}
        className="px-4 py-2 mt-6 text-gray-900 bg-green-400 rounded hover:bg-green-300"
      >
        Try again
      </button>
    </div>
  );
}
