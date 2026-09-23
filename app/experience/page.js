import TerminalBlock from '../_components/TerminalBlock';
import { readFile } from '../_lib/fileSystem.js';

// `metadata` export replaces the deprecated `next/head` (Issues 5 + 14 + 26).
export const metadata = {
  title: '~/experience',
  description:
    'Work experience, roles and education of Samuel Nwankwo — backend engineer (Phunplan, Sweeftly, Olotu Square, Webxiel, iGiet, Credib, Emblic).',
};

// Single source of truth: the same content `cat experience/index.md` prints
// inside the interactive shell.
const index = readFile('/home/samuel/experience/index.md');
const lines = index.ok && index.kind === 'text' ? index.content.split('\n') : [];

export default function Experience() {
  return (
    <div className="flex flex-col gap-4">
      <TerminalBlock
        lines={lines}
        titleBar="samuel@portfolio:~$ cat /home/samuel/experience/index.md"
        variant="banner"
      />

      <p className="terminal-line terminal-line--warning">
        {'→ '}try <code className="text-terminal-accent">cat experience/phunplan.md</code> in the
        prompt for a single role, or{' '}
        <a href="/samuel-nwankwo-resume.pdf" download>
          curl /resume.pdf
        </a>{' '}
        for the PDF.
      </p>
    </div>
  );
}
