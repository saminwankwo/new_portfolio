import Link from 'next/link';
import TerminalBlock from './_components/TerminalBlock';

export const metadata = {
  title: '404 — no such file or directory',
  description: 'The page you are looking for does not exist in this shell.',
};

// Branded 404 in the terminal's visual language (Issue 6). The persistent
// prompt from layout.js sits below it, so you can recover by typing a command.
export default function NotFound() {
  const lines = [
    <span key="err" className="text-terminal-error">
      bash: cd: no such file or directory
    </span>,
    '',
    'exit status 1 — that path does not exist in this shell.',
    '',
    'Did you mean:',
    '  cd ~              back to the home directory',
    '  cd projects       6 shipped + active projects',
    '  cd experience     roles, timeline, education',
    '  cat contact.txt   email / socials / calendar link',
    '  open resume.pdf   download the résumé',
  ];

  return (
    <div className="flex flex-col gap-4">
      <TerminalBlock lines={lines} titleBar="samuel@portfolio: ~$ cd /nope" />

      <div className="flex flex-wrap gap-3">
        <Link className="term-form__btn" href="/">
          cd ~ (back home)
        </Link>
        <Link className="term-form__btn term-form__btn--ghost" href="/projects">
          cd projects
        </Link>
      </div>
    </div>
  );
}
