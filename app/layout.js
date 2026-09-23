import './globals.css';
import Scanlines from './_components/Scanlines';
import TerminalShell from './_components/TerminalShell';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Samuel Nwankwo ~ /home/samuel',
    template: '%s · Samuel Nwankwo',
  },
  description:
    'Interactive terminal-style portfolio of Samuel Nwankwo — Full-Stack Engineer building web apps, ad tracking, and developer platforms.',
  keywords: [
    'Samuel Nwankwo',
    'Full-Stack Developer',
    'Backend Engineer',
    'Node.js',
    'PHP',
    'Laravel',
    'Next.js',
    'React',
    'Ad Tracking',
    'Lead Tracker',
    'Portfolio',
    'Terminal Portfolio',
    'saminwankwo',
  ],
  authors: [{ name: 'Samuel Nwankwo', url: siteUrl }],
  creator: 'Samuel Nwankwo',
  publisher: 'Samuel Nwankwo',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Samuel Nwankwo · Portfolio',
    title: 'Samuel Nwankwo ~ /home/samuel',
    description:
      'Interactive terminal-style portfolio of Samuel Nwankwo — Full-Stack Engineer building web apps, ad tracking, and developer platforms.',
    images: [
      { url: '/og-image.png', width: 1200, height: 630, alt: 'Samuel Nwankwo — interactive terminal portfolio' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@saminwankwo',
    title: 'Samuel Nwankwo ~ /home/samuel',
    description:
      'Interactive terminal-style portfolio of Samuel Nwankwo — Full-Stack Engineer building web apps, ad tracking, and developer platforms.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '48x48', type: 'image/x-icon' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)',  color: '#0d1117' },
    { media: '(prefers-color-scheme: light)', color: '#0d1117' },
  ],
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

/**
 * The terminal shell lives in the ROOT LAYOUT (not template.js) on purpose:
 * layouts persist across navigations, so scrollback history, cwd, theme and
 * input history survive `router.push()` / browser back-forward (plan note 5).
 *
 * The shell is also the scroll container: `main.terminal-screen` is a fixed
 * 100dvh flex column, the shell flexes to fill it, the scrollback scrolls
 * internally, and the input row stays pinned at the bottom.
 */
export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className="font-terminal"
      suppressHydrationWarning
    >
      <body className="antialiased">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Scanlines />
        <main id="main-content" className="terminal-screen">
          <TerminalShell>{children}</TerminalShell>
        </main>
      </body>
    </html>
  );
}
