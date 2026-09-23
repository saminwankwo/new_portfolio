# snsh — terminal portfolio

The interactive terminal portfolio of **Samuel Nwankwo** (`saminwankwo`) — every
route is a "screen" inside one persistent shell: dark neutral palette by default,
same prompt, keyboard-first navigation.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
npm run start   # serve the production build
npm run lint
```

Requires Node >= 20 (see `.nvmrc`).

## Stack

- **Next.js 15** (App Router, Turbopack) + **React 19**
- **Tailwind CSS 3.4** with a CSS-variable terminal palette (`app/globals.css`)
- **Zero runtime dependencies** beyond those — no UI kit, no state library

## How it fits together

| File | Role |
|---|---|
| `app/layout.js` | Mounts the persistent `TerminalShell` (layouts survive navigation → history/cwd/theme persist) + site metadata |
| `app/template.js` | Thin structural wrapper around each route body |
| `app/_components/TerminalShell.jsx` | Interactive shell: scrollback, pinned prompt, history, Tab-completion, autoscroll |
| `app/_components/TerminalBlock.jsx` | Server-rendered "screenshot" block used by route pages (crawlable HTML) |
| `app/_lib/commands.js` | The command registry (`COMMANDS`) — 13 commands |
| `app/_lib/fileSystem.js` | Virtual FS tree powering `ls` / `cd` / `cat` / `open` |
| `app/_lib/data/` | Single source of truth: projects, experience, profile, skills (projects/experience ported from `saminwankwo.github.io`) |
| `app/api/contact/route.js` | Server-side proxy for the contact form (keeps Formspree secret) |

Route bodies are **server components** rendered as terminal blocks, so search
engines and link previews see real text without executing JS. The scrollback
history is extra UX sugar layered on top.

## Commands

```
help   ls [-la]   cd <path>   cat <file>   open <path|url>   whoami
neofetch   pwd   echo   curl   clear   history   theme <name>
```

Keyboard: `↑`/`↓` history · `Tab` autocomplete · `Ctrl+L` clear · `Ctrl+C` cancel.

Themes: `theme dark | green | amber | retro-amber | blue | synthwave` (persisted
in `localStorage`; `dark` is the default).

## Configuration

Copy `.env.example` to `.env.local`:

- `NEXT_PUBLIC_SITE_URL` — canonical URL (SEO, sitemap, OG)
- `FORMSPREE_ENDPOINT` — contact form relay (server-side only). Until it is
  set, `/api/contact` answers `503` with a friendly "email me directly".
- `NEXT_PUBLIC_CONTACT_EMAIL` / phone / social URLs

## Resume PDF

Drop your PDF at `public/samuel-nwankwo-resume.pdf`. If it is missing, the
`/resume` route renders a graceful placeholder instead of a broken iframe.

## Deploy

Any Node 20+ host (Vercel, Railway, Render…): `npm run build && npm start`.
