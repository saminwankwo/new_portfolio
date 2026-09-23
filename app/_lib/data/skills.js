// Intentional category ordering = skills most-relevant to the work I take on first.
// Marketing/Tracking is highlighted because this portfolio is the entry point for
// ad-operators and performance-marketing clients.

export const SKILLS = {
  'Languages': [
    'JavaScript / TypeScript',
    'PHP 8+',
    'Python 3',
    'SQL',
    'HTML + CSS',
    'Bash / Shell',
  ],
  'Frontend': [
    'React 18 / 19',
    'Next.js 14 / 15 (App Router)',
    'Vite',
    'Tailwind CSS',
    'Framer Motion',
    'Accessibility (WCAG 2.2 AA)',
  ],
  'Backend & APIs': [
    'Node.js (Express, Fastify, NestJS)',
    'Laravel 9 – 11',
    'REST + OpenAPI / JSON:API',
    'Webhooks (signature verification, idempotency)',
    'Temporal / queue workers (BullMQ, Horizon)',
    'Web scraping (Playwright, Scrapy)',
  ],
  'Databases & Storage': [
    'PostgreSQL (Prisma + raw SQL)',
    'MySQL / MariaDB',
    'MongoDB (Mongoose)',
    'Redis (caching, rate limit, queues)',
    'SQLite (embedded / desktop)',
    'S3-compatible object storage',
  ],
  'DevOps & Deploy': [
    'Docker + docker-compose',
    'Vercel · Netlify · Render',
    'GitHub Actions CI/CD',
    'AWS basics (EC2, RDS, S3, CloudFront, IAM)',
    'Nginx + Linux hardening',
    'Observability: Sentry, Prometheus, log tailing',
  ],
  'Marketing & Ad Tracking': [
    'TikTok Events Manager · Conversions API',
    'Meta CAPI · Pixel',
    'Google Ads · GA4 · Consent Mode v2',
    'Server-side event deduplication',
    'UTM + click-ID capture + attribution stitching',
    'Plausible · PostHog self-hosted',
  ],
  'Tooling & Workflow': [
    'Git (feature-branch + PRs, trunk-based when appropriate)',
    'Vitest · Jest · PHPUnit',
    'Playwright / Cypress E2E',
    'Linear / GitHub Issues for planning',
    'Figma → code handoff (Storybook optional)',
  ],
  'Soft Skills': [
    'Technical communication (written + verbal)',
    'Scope + project estimation (T-shirt sizing → 2-week sprints)',
    'Stakeholder management for non-technical founders',
    'Hiring, onboarding, and mentoring junior engineers',
  ],
};

export default SKILLS;
