import fs from 'node:fs';
import path from 'node:path';
import TerminalBlock from '../_components/TerminalBlock';
import PROFILE from '../_lib/data/profile.js';

// `metadata` export replaces the deprecated `next/head` (Issues 5 + 14 + 26).
export const metadata = {
  title: '~/resume.pdf',
  description:
    'Download the resume of Samuel Nwankwo — Full-Stack Engineer (Node.js, PHP/Laravel, React/Next.js, ad infrastructure).',
};

// The PDF binary is intentionally out of scope for the repo (plan note 2) —
// if it isn't in public/ yet, we render a graceful install-panel instead of a
// broken iframe.
const PDF_PATH = path.join(process.cwd(), 'public', 'samuel-nwankwo-resume.pdf');
let pdfStats = null;
try {
  pdfStats = fs.statSync(PDF_PATH);
} catch {
  pdfStats = null;
}
const HAS_PDF = Boolean(pdfStats);
const PDF_SIZE = pdfStats ? `${Math.round((pdfStats.size / 1024) * 10) / 10}K` : '0K';

export default function Resume() {
  const headerLines = HAS_PDF
    ? [
        '/home/samuel/resume.pdf: PDF document, 2 pages, ' + PDF_SIZE,
        'owner: samuel  ·  mode: -rw-r--r--  ·  updated: ' + new Date().toISOString().slice(0, 10),
        '',
        'Open with:  open resume.pdf        (new tab)',
        'Download :  curl /resume.pdf --output Samuel_Nwankwo_Resume.pdf',
      ]
    : [
        '/home/samuel/resume.pdf: cannot open — No such file or directory',
        '',
        `Resume coming soon. Email me for the latest copy → ${PROFILE.email}`,
      ];

  return (
    <div className="flex flex-col gap-4">
      <TerminalBlock
        lines={headerLines}
        titleBar="samuel@portfolio:~$ file /home/samuel/resume.pdf"
        variant={HAS_PDF ? 'banner' : 'warning'}
      />

      {HAS_PDF ? (
        <div className="terminal-frame">
          <div className="terminal-frame__titlebar">
            <span className="terminal-frame__dot terminal-frame__dot--close" aria-hidden />
            <span className="terminal-frame__dot terminal-frame__dot--min" aria-hidden />
            <span className="terminal-frame__dot terminal-frame__dot--max" aria-hidden />
            <span className="ml-2 truncate">evince resume.pdf</span>
          </div>
          <div className="terminal-frame__body">
            <iframe
              src="/samuel-nwankwo-resume.pdf#view=FitH"
              title="Samuel Nwankwo — resume (PDF)"
              className="h-[70vh] w-full rounded border-0 bg-white/95"
            />
          </div>
        </div>
      ) : (
        <div className="terminal-frame">
          <div className="terminal-frame__titlebar">
            <span className="terminal-frame__dot terminal-frame__dot--close" aria-hidden />
            <span className="terminal-frame__dot terminal-frame__dot--min" aria-hidden />
            <span className="terminal-frame__dot terminal-frame__dot--max" aria-hidden />
            <span className="ml-2 truncate">apt-get install resume.pdf</span>
          </div>
          <div className="terminal-frame__body">
            <p className="terminal-line terminal-line--warning">
              {'$ sudo apt-get install resume.pdf'}
            </p>
            <p className="terminal-line terminal-line--error mt-2">
              {'E: Unable to locate package resume.pdf (not checked into the repo yet).'}
            </p>
            <p className="terminal-line terminal-line--output mt-4">
              {'→ Ask for a fresh copy and it lands in your inbox within 24h:'}
            </p>
            <p className="mt-2">
              <a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a>
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <a
          className="term-form__btn"
          href="/samuel-nwankwo-resume.pdf"
          download="Samuel_Nwankwo_Resume.pdf"
        >
          $ curl /resume.pdf --output Samuel_Nwankwo_Resume.pdf
        </a>
        <a className="term-form__btn term-form__btn--ghost" href="/contact">
          $ cd /contact
        </a>
      </div>
    </div>
  );
}
