import Link from 'next/link';

export const metadata = {
  title: 'Page not found',
  description: 'The page you are looking for does not exist.',
};

// Branded 404 in the terminal's visual language (Issue 6).
export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-gray-950 p-8 font-mono text-green-300">
      <p className="text-sm text-gray-400">404</p>
      <h1 className="mt-2 text-2xl font-bold">bash: cd: no such file or directory</h1>
      <p className="mt-4 text-center text-gray-400">
        The page you are looking for does not exist or has been moved.
      </p>
      <pre className="mt-6 text-sm text-green-400">
{`$ ls
projects/  experience/  resume/  contact/`}
      </pre>
      <Link
        href="/"
        className="px-4 py-2 mt-6 text-gray-900 bg-green-400 rounded hover:bg-green-300"
      >
        cd ~ (back home)
      </Link>
    </div>
  );
}
