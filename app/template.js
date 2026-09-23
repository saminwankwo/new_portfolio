/**
 * App Router `template.js` remounts on every navigation, while `layout.js`
 * persists. The interactive `TerminalShell` is therefore mounted in
 * `layout.js` so its scrollback history / cwd / theme survive navigation.
 *
 * This template only provides the structural wrapper around the route body
 * and injects the route content into the shell's scroll area. The shell
 * itself listens to `usePathname()` and appends a synthetic `$ cd <path>`
 * line when the URL changes (deep-link, browser back/forward, link click).
 */
export default function Template({ children }) {
  return <div className="route-content">{children}</div>;
}
