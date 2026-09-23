// Source of truth: /saminwankwo.github.io/src/data/experience.js
// Update both files when roles or education change in the future.
// Dates are ISO `YYYY-MM` so `fmtDate()` in fileSystem.js can render them.

export const ROLES = [
  {
    slug: 'phunplan',
    company: 'Phunplan',
    role: 'Backend Engineer',
    startDate: '2025-12',
    endDate: '2026-07',
    location: 'Port Harcourt, Nigeria · Full-time, Remote',
    bullets: [
      'Built scalable backend services with NestJS and MongoDB on DigitalOcean infrastructure.',
    ],
  },
  {
    slug: 'sweeftly',
    company: 'Sweeftly',
    role: 'Backend Engineer',
    startDate: '2024-05',
    endDate: '2025-08',
    location: 'Cumbernauld, Scotland · Full-time, Remote',
    bullets: [
      'Architected e-commerce API (v1 Express.js → v2 NestJS) handling thousands of daily orders with chat-style ordering flow.',
      'Integrated 3 delivery partners (Stuart, Shipday, Gophr) + Stripe/Apple Pay; webhook reconciliation reduced payment discrepancies by ~90%.',
      'Deployed behind AWS ELB with autoscaling groups; achieved 99.9% uptime with S3 media uploads and automated backups.',
      'Built WhatsApp notification bot cutting support ticket volume by ~35%.',
    ],
  },
  {
    slug: 'olotu-square',
    company: 'Olotu Square',
    role: 'Software Developer',
    startDate: '2024-05',
    endDate: '2025-12',
    location: 'Port Harcourt, Nigeria · Contract, Remote',
    bullets: [
      'Migrated PHP monolith → Laravel; reduced deployment errors by ~50% through standardized architecture and automated tests.',
      'Multi-tenant SaaS with isolated DBs; cut client onboarding from 3 days to under 2 hours.',
      'GitHub Actions + Docker CI/CD enabling zero-downtime deployments.',
      'Led 4-month backend training for 12+ developers — 80% now in active backend roles.',
    ],
  },
  {
    slug: 'webxiel',
    company: 'Webxiel',
    role: 'Laravel Developer',
    startDate: '2024-01',
    endDate: '2024-10',
    location: 'Enugu State, Nigeria · Contract, Remote',
    bullets: [
      'Laravel microservice for landlord-to-tenant mobile API serving 10,000+ users.',
      'JWT auth, secure RESTful endpoints, webhook integrations for push notifications.',
      'Optimized N+1 queries; improved average endpoint response time by ~40%.',
    ],
  },
  {
    slug: 'igiet-ltd',
    company: 'iGiet Ltd',
    role: 'Software Engineer',
    startDate: '2023-11',
    endDate: '2024-09',
    location: 'Port Harcourt, Nigeria · Contract, Remote',
    bullets: [
      'Parrot mobile app backend shipped from 0 to production in 6 weeks.',
      'REST+GraphQL hybrid API cut client data payload by ~30%.',
      'SSR + asset optimization reduced initial load time by ~50%.',
    ],
  },
  {
    slug: 'credib',
    company: 'Credib',
    role: 'Backend Developer',
    startDate: '2022-08',
    endDate: '2024-02',
    location: 'Port Harcourt, Nigeria · Full-time, Remote',
    bullets: [
      'GraphQL API gateway across 5+ microservices; reduced frontend integration complexity by ~60%.',
      'Paystack split payments + S3 serving 50,000+ assets.',
      'Redis caching cut avg DB query load by ~45%; RabbitMQ async job queues.',
      'Maintained 99.7% uptime across all containerized AWS EC2 production services.',
    ],
  },
  {
    slug: 'emblic',
    company: 'Emblic Technologies',
    role: 'Software Developer',
    startDate: '2020-03',
    endDate: '2022-07',
    location: 'Port Harcourt, Nigeria · On-site',
    bullets: [
      'OfficePro — enterprise office suite (HR, Payroll, Inventory, Invoicing, Attendance) at 5+ corporate clients.',
      'Hospital Management System used by 3 healthcare facilities.',
      'MyReminda published to Google Play; 1,000+ downloads.',
      'POS solution for supermarket chains; legacy payroll converted with Excel/PDF reporting.',
    ],
  },
];

// NOTE: the source portfolio has no education section — these entries were
// already in this repo. Verify them before shipping (TODO for the owner).
export const EDUCATION = [
  {
    school: 'University of Lagos',
    degree: 'B.Sc. (Hons) Computer Science',
    startDate: '2015',
    endDate: '2019',
    detail: 'Final-year project: "A Web-Based Admission Screening Platform" — Laravel + MySQL, deployed internally for the department.',
  },
  {
    school: 'Self-directed / Certs',
    degree: 'Professional Certifications',
    startDate: '2020',
    endDate: 'Ongoing',
    detail: [
      'AWS Certified Cloud Practitioner (CLF-C02) — 2023',
      'Meta Blueprint Certified Media Planning Professional — 2024',
      'Google Ads Search Certification — 2024',
    ].join(' · '),
  },
];

const EXPERIENCE = { ROLES, EDUCATION };

export default EXPERIENCE;
