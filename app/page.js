import Link from 'next/link';
import TerminalBlock from './_components/TerminalBlock';
import PROFILE from './_lib/data/profile.js';

// The interactive prompt lives in layout.js (persistent shell), so this route
// only renders server-side content: the boot banner, `whoami`, and a hint.
export const metadata = {
  title: { absolute: 'Samuel Nwankwo ~ /home/samuel' },
  description:
    'Terminal-style portfolio of Samuel Nwankwo — full-stack engineer building web apps, ad infrastructure and developer tools. Type `help` to explore.',
};

// figlet-style block banner (6 rows, generated offline so it never wraps oddly).
const BANNER = [
  '███████   █████   ██   ██  ██   ██  ███████  ██',
  '██       ██   ██  ███  ██  ██   ██  ██       ██',
  '███████  ██   ██  ████ ██  ██   ██  ██████   ██',
  '      ██  ███████  ██ ████  ██   ██  ██       ██',
  '      ██  ██   ██  ██  ██   ██   ██  ██       ██',
  '███████  ██   ██  ██  ██   ███████  ███████  ███████',
  '',
  '██    ██  ██  █  ██   █████   ██    ██  ██   ██  ██  █  ██   █████',
  '███   ██  ██  █  ██  ██   ██  ███   ██  ██  ██   ██  █  ██  ██   ██',
  '████  ██   ██ █ ██   ██   ██  ████  ██  ██ ██     ██ █ ██   ██   ██',
  '██ ██ ██   ██ █ ██   ███████  ██ ██ ██  ████      ██ █ ██   ██   ██',
  '██  ████    ██ ██    ██   ██  ██  ████  ██ ██      ██ ██    ██   ██',
  '██   ███    ██ ██    ██   ██  ██   ███  ██  ██     ██ ██     █████',
];

function yearsSince(ymd) {
  const ms = Date.now() - new Date(ymd).getTime();
  return Math.max(0, Math.floor(ms / (365.25 * 24 * 3600 * 1000)));
}

export default function Home() {
  const whoami = [
    `${PROFILE.name}  (@${PROFILE.handle})`,
    `  role       : ${PROFILE.role}`,
    `  location   : ${PROFILE.location.city}, ${PROFILE.location.country} (${PROFILE.location.utc})`,
    `  email      : ${PROFILE.email}`,
    `  building   : since ${PROFILE.careerStart.slice(0, 4)} · ${yearsSince(PROFILE.careerStart)}+ years shipping`,
    `  status     : ${PROFILE.availability}`,
    '',
    PROFILE.headline,
  ];

  return (
    <div className="flex flex-col gap-4">
      <TerminalBlock
        lines={BANNER}
        ascii
        variant="banner"
        showTitleBar={false}
        titleBar="samuel@portfolio: ~$ ./welcome.sh"
      />

      <TerminalBlock lines={whoami} titleBar="samuel@portfolio: ~$ whoami" />

      <p className="terminal-line terminal-line--warning">
        {'← tip → '}
        type <code className="text-terminal-accent">&apos;help&apos;</code> and press Enter, or jump
        straight to:{' '}
        <Link href="/projects">cd projects</Link> ·{' '}
        <Link href="/experience">cd experience</Link> ·{' '}
        <Link href="/contact">cat contact.txt</Link> ·{' '}
        <Link href="/resume">open resume.pdf</Link>
      </p>
    </div>
  );
}
