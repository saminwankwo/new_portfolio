import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Canonical metadata for every route (Issue 14). Child pages override via the
// `metadata` export, which composes with the `title.template` below.
export const metadata = {
  title: {
    default: "Samuel Nwankwo · Portfolio",
    template: "%s · Samuel Nwankwo",
  },
  description:
    "Interactive terminal-style portfolio of Samuel Nwankwo — Full-Stack Developer.",
  keywords: [
    "Samuel Nwankwo",
    "Full-Stack Developer",
    "Backend Engineer",
    "Node.js",
    "PHP",
    "Laravel",
    "Portfolio",
  ],
  authors: [{ name: "Samuel Nwankwo" }],
  creator: "Samuel Nwankwo",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Samuel Nwankwo · Portfolio",
    title: "Samuel Nwankwo · Portfolio",
    description:
      "Interactive terminal-style portfolio of Samuel Nwankwo — Full-Stack Developer.",
  },
  twitter: {
    card: "summary",
    title: "Samuel Nwankwo · Portfolio",
    description:
      "Interactive terminal-style portfolio of Samuel Nwankwo — Full-Stack Developer.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
