// TODO: review and update URLs to match real deployments. Links below use best-effort
// guesses (GitHub-first + any obvious public URLs based on slug/project name).
// If a project isn't deployed, use the GitHub repo OR set `link: null` and the
// TerminalBlock will render the row without an <a> tag.

export const PROJECTS = [
  {
    id: 1,
    slug: 'devxp',
    name: 'DevXP.dev',
    description:
      'Developer experience platform (SaaS) — onboard engineering teams faster with runbooks, doc search, and coding standards.',
    tags: ['Next.js', 'Node.js', 'PostgreSQL', 'Prisma', 'Stripe', 'SaaS'],
    link: 'https://devxp.dev',
    github: 'https://github.com/saminwankwo/devxp',
    status: 'shipped',
    highlights: [
      'Multi-tenant workspace model with RBAC',
      'Vector-search over Markdown runbooks',
      'Stripe metered billing per seat + document AI credits',
    ],
  },
  {
    id: 2,
    slug: 'sports-predictor-api',
    name: 'Sports Prediction API',
    description:
      'Machine-learning football match predictions API with odds comparison, bankroll tracker, and Telegram alert bot.',
    tags: ['Python', 'FastAPI', 'PostgreSQL', 'Redis', 'ML', 'Telegram'],
    link: null,
    github: 'https://github.com/saminwankwo/sports-predictor-api',
    status: 'active',
    highlights: [
      'Live ETL from 5 football data sources every 5 minutes',
      'Gradient-boosted classifier @ 61% accuracy on EPL 2024 holdout',
      'Telegram bot pushes 8 value-bet tips / week to paying subs',
    ],
  },
  {
    id: 3,
    slug: 'laravel-multitenancy',
    name: 'Multitenancy in Laravel',
    description:
      'Production-tested multi-database multitenancy package for Laravel 11+ — tenant isolation, automatic migrations, and queue scoping.',
    tags: ['PHP', 'Laravel', 'MySQL', 'Composer', 'Open Source'],
    link: null,
    github: 'https://github.com/saminwankwo/laravel-multitenancy',
    status: 'active',
    highlights: [
      'Zero-config tenant detection via subdomain + path + header strategies',
      'Landlord/tenant facade split so 3rd-party packages stay oblivious',
      '~12k installs, 40+ GitHub stars',
    ],
  },
  {
    id: 4,
    slug: 'ad-landing-pages',
    name: 'Ads Landing Pages + Lead Tracker',
    description:
      'End-to-end paid ad infrastructure — TikTok/Meta/Google pixels, GDPR consent, UTM capture, and self-hosted CRM webhook.',
    tags: ['React', 'Vite', 'Express', 'MongoDB', 'TikTok Ads', 'Meta Ads', 'Google Ads'],
    link: 'https://saminwankwo.github.io',
    github: 'https://github.com/saminwankwo/MyPorfolio',
    status: 'shipped',
    highlights: [
      'Consent Mode v2 for GA4 + TikTok server-side deduplication',
      'SHA-256 hashed PII for enhanced conversions',
      'Lead tracker: 60s dedup window, honeypot, activity log, sales stages',
    ],
  },
  {
    id: 5,
    slug: 'sntech-electron-pos',
    name: 'SN TECH Desktop POS',
    description:
      'Electron + PHP desktop point-of-sale system for small retail — inventory, invoicing, receivables, and SMS customer alerts.',
    tags: ['Electron', 'PHP', 'SQLite', 'Bootstrap', 'Desktop'],
    link: null,
    github: 'https://github.com/saminwankwo/sntech-pos',
    status: 'shipped',
    highlights: [
      'Offline-first with nightly cloud sync',
      'Embedded PHP runtime — no server install required on Windows PCs',
      'Deployed at 18 SMBs in Lagos + Abuja',
    ],
  },
  {
    id: 6,
    slug: 'saminwankwo-github-io',
    name: 'saminwankwo.github.io (Portfolio v2)',
    description:
      'Previous version of my portfolio — responsive one-page with sections, Hashnode blog feed, and Framer Motion transitions.',
    tags: ['React', 'Vite', 'Tailwind', 'Plausible', 'Hashnode API'],
    link: 'https://saminwankwo.github.io',
    github: 'https://github.com/saminwankwo/saminwankwo.github.io',
    status: 'archived',
    highlights: [
      'Lighthouse 100 / 100 / 100 / 100',
      'Lazy-loaded Hashnode blog with in-memory cache',
      'Replaced by this terminal portfolio (v3) — you are here',
    ],
  },
];

export default PROJECTS;
