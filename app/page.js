import Terminal from './components/Terminal';

// Static metadata for the home route (Issues 5 + 14). The terminal updates
// `document.title` at runtime for individual commands; the fallback/default
// lives here instead of the deprecated `next/head`.
export const metadata = {
  title: 'Interactive Terminal',
  description:
    "Interactive terminal portfolio of Samuel Nwankwo — type a command to explore projects, experience, resume and contact.",
};

export default function Home() {
  return <Terminal />;
}
