import Link from 'next/link';

// `metadata` export replaces the deprecated `next/head` (Issues 5 + 14 + 26).
export const metadata = {
  title: 'Experience',
  description: 'Work experience, roles and skills of Samuel Nwankwo, Full-Stack Developer.',
};

export default function Experience() {
    return (
        <div className="min-h-screen p-8 bg-gray-950">
            <h1 className="text-2xl font-bold">Experience</h1>
            <p>This is the experience page. Include your work experience and skills here.</p>
            <p className="mt-4">
                <Link href="/" className="text-green-400 hover:underline">
                    ← cd ~
                </Link>
            </p>
        </div>
    );
}
