import TerminalShell from './_components/TerminalShell';
import { routeToDir } from './_lib/fileSystem';

/**
 * Next.js App Router `template.js` wraps each route's page on navigation,
 * unlike `layout.js` which persists across navigations.
 *
 * We still mount TerminalShell here so that (a) its internal state survives
 * inside a layout-like structure and (b) every route gets the shell wrapper
 * that contains route content inside the scrollback. The shell itself
 * listens to pathname changes for syncing cwd ↔ URL state.
 */
export default function Template({ children }) {
  return (
    <div className="flex min-h-[100dvh] w-full flex-col items-stretch justify-start">
      <TerminalShell initialCwd={routeToDir('/')} initialTheme="green">
        {children}
      </TerminalShell>
    </div>
  );
}
