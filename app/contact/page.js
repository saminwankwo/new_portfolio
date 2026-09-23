import Link from 'next/link';

// `metadata` export replaces the deprecated `next/head` (Issues 5 + 14 + 26).
export const metadata = {
  title: 'Contact',
  description: 'Get in touch with Samuel Nwankwo, Full-Stack Developer.',
};

export default function Contact() {
  return (
    <div className="min-h-screen p-8 bg-gray-950">
      <h1 className="text-2xl font-bold">Contact</h1>
      <p>This is the contact page. Include your contact form or details here.</p>
      <p className="mt-4">
        <Link href="/" className="text-green-400 hover:underline">
          ← cd ~
        </Link>
      </p>
    </div>
  );
}
