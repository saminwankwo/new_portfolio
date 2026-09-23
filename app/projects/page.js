import TerminalBlock from '../_components/TerminalBlock';
import PROJECTS from '../_lib/data/projects.js';
import { readFile } from '../_lib/fileSystem.js';

// Static metadata replaces the deprecated `next/head` (Issues 5 + 14 + 26).
export const metadata = {
  title: '~/projects',
  description:
    '32 selected projects by Samuel Nwankwo — auth SDKs, multi-tenant SaaS, e-commerce APIs, ML and serverless, healthcare, ERP and CI/CD infrastructure.',
};

const PERMS = '-rw-r--r--';
const MTIME = 'Sep 22 10:00';

function humanSize(value) {
  const units = ['B', 'K', 'M', 'G'];
  let i = 0;
  let n = Number(value) || 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${Math.round(n * 10) / 10}${units[i]}`;
}

/** One `ls -la` row per project; the name links to the real destination. */
function projectRow(project) {
  const href = project.link || project.github;
  const size = humanSize(JSON.stringify(project).length);
  const name = href ? (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {project.name}
    </a>
  ) : (
    <span>{project.name}</span>
  );
  return (
    <span key={project.id}>
      {`${PERMS}  ${'samuel'.padEnd(6)}  ${'staff'.padEnd(5)}  ${size.padStart(6)}  ${MTIME}  `}
      {name}
      {`  — ${project.description}  [${project.status}]`}
    </span>
  );
}

// Pre-expanded example so the page shows a full project card without JS.
const sample = readFile('/home/samuel/projects/devxp.md');
const sampleLines = sample.ok && sample.kind === 'text' ? sample.content.split('\n') : [];

export default function Projects() {
  const lines = [
    `total ${PROJECTS.length}`,
    ...PROJECTS.map(projectRow),
    '',
    `${PROJECTS.length} entries · run \`cat projects/<slug>.md\` for details, \`open projects/<slug>\` to launch it.`,
  ];

  return (
    <div className="flex flex-col gap-4">
      <TerminalBlock lines={lines} titleBar="samuel@portfolio:~$ ls -la /home/samuel/projects" />

      <TerminalBlock
        lines={sampleLines}
        titleBar="samuel@portfolio:~$ cat projects/devxp.md"
        variant="banner"
      />

      <p className="terminal-line terminal-line--warning">
        {'→ '}
        <a href="https://github.com/saminwankwo?tab=repositories" target="_blank" rel="noopener noreferrer">
          more repos on GitHub
        </a>{' '}
        · <a href="https://github.com/saminwankwo/saminwankwo.github.io" target="_blank" rel="noopener noreferrer">source of this site</a>
      </p>
    </div>
  );
}
