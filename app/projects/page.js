import Link from 'next/link';

// Static metadata replaces the deprecated `next/head` (Issues 5 + 14 + 26).
export const metadata = {
  title: 'Projects',
  description:
    'Selected projects by Samuel Nwankwo — developer tooling, prediction APIs, multi-tenant SaaS and e-commerce backends.',
};

const projects = [
  {
    title: "DevXP.dev",
    description: "A platform to help developers practice skills like test-driven development, code reviews, and mastering Git workflows.",
    techStack: ["Node.js", "Express", "MongoDB", "AWS"],
  },
  {
    title: "Sports Prediction API",
    description: "An API-driven sports prediction model that integrates a pre-trained machine learning model for real-time forecasts.",
    techStack: ["Node.js", "Express", "MongoDB", "AWS"],
  },
  {
    title: "Multitenancy in Laravel",
    description: "A multi-tenant SaaS system managing separate databases per tenant to optimize resource usage.",
    techStack: ["PHP", "Laravel", "MySQL"],
  },
  {
    title: "Project Atlas",
    description: "A scalable microservices-based analytics platform aggregating data from various APIs for real-time insights.",
    techStack: ["Node.js", "Express", "MongoDB", "AWS"],
  },
  {
    title: "E-Commerce API",
    description: "A robust RESTful API for an e-commerce platform featuring secure payment integrations and efficient inventory management.",
    techStack: ["PHP", "Laravel", "MySQL"],
  },
  {
    title: "Interactive Developer Portfolio",
    description: "A dynamic web application showcasing personal projects with real-time updates from GitHub.",
    techStack: ["React", "Node.js", "AWS"],
    // Only verified, live destinations are linked — the previous
    // `https://example.com/*` placeholders all pointed at a parked domain (Issue 2).
    link: "https://github.com/saminwankwo/saminwankwo.github.io",
    linkLabel: "View on GitHub",
  },
];

export default function Projects() {
  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <h1 className="mb-8 text-4xl font-bold text-center">Projects</h1>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {projects.map((project) => (
          <article
            key={project.title}
            className="p-6 border border-gray-800 rounded-lg bg-gray-900 shadow-md"
          >
            <h2 className="mb-2 text-2xl font-semibold">{project.title}</h2>
            <p className="mb-4">{project.description}</p>
            <p className="mb-4 text-sm text-gray-400">
              Tech Stack: {project.techStack.join(', ')}
            </p>
            {project.link ? (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:underline"
              >
                {project.linkLabel} ↗
              </a>
            ) : (
              <Link href="/contact" className="text-green-400 hover:underline">
                Ask me about this project →
              </Link>
            )}
          </article>
        ))}
      </div>
      <p className="mt-10 text-center">
        <a
          href="https://github.com/saminwankwo?tab=repositories"
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-400 hover:underline"
        >
          More projects on GitHub ↗
        </a>
      </p>
    </div>
  );
}
