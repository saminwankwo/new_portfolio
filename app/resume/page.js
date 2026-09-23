import Link from 'next/link';

// `metadata` export replaces the deprecated `next/head` (Issues 5 + 14 + 26).
export const metadata = {
  title: 'Resume',
  description: 'Resume of Samuel Nwankwo, Full-Stack Developer.',
};

export default function Resume() {
  return (
    <div className="min-h-screen p-8 bg-gray-950">
      <h1 className="text-2xl font-bold">Resume</h1>
      <p>This is the resume page. You can fetch and display your resume data here.</p>
      <p className="mt-4">
        <Link href="/" className="text-green-400 hover:underline">
          ← cd ~
        </Link>
      </p>
    </div>
  );
}
