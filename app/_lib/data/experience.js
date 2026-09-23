// Manually curated from the source-of-truth at the sibling portfolio project:
// Source of truth: /saminwankwo.github.io/src/config/index.js
// Update both files when roles or education change in the future.

export const ROLES = [
  {
    slug: 'sn-tech',
    company: 'SN TECH',
    role: 'Full-Stack Engineer / Founder',
    startDate: '2023-03',
    endDate: 'Present',
    location: 'Lagos, NG · Remote',
    bullets: [
      'Founded and bootstrapped a 3-person dev studio delivering web + desktop apps to 40+ SMB clients across West Africa.',
      'Shipped the in-house SN TECH Lead Tracker (MongoDB + Express + React CRM), replacing Google Sheets for 12+ active paid-ad campaigns.',
      'Built ad landing page playbook (TikTok/Meta/Google pixels, consent-mode v2, SHA-256 hashed enhanced conversions) with 38% average conversion uplift across 6 client campaigns in 2024–2025.',
      'Led desktop POS deployment (Electron + embedded PHP) at 18 retail sites — onboarding in < 4 hours per site.',
    ],
  },
  {
    slug: 'freelance-fullstack',
    company: 'Freelance · Upwork / Toptal',
    role: 'Senior Full-Stack Developer',
    startDate: '2021-01',
    endDate: '2023-02',
    location: 'Remote',
    bullets: [
      'Delivered 20+ client projects (SaaS MVPs, e-commerce stores, marketing sites, data scrapers) across Node.js, PHP/Laravel, and React stacks.',
      'Owned full lifecycle: discovery → architecture → build → deploy → monitoring. Avg Lighthouse score > 96.',
      '100% 5-star client feedback; promoted to Toptal Expert tier within 9 months.',
    ],
  },
  {
    slug: 'backend-contract',
    company: 'Fintech (NDA)',
    role: 'Backend Engineer (Contract)',
    startDate: '2022-06',
    endDate: '2022-12',
    location: 'Remote',
    bullets: [
      'Rebuilt disbursements service from Python → NestJS — reduced P99 from 2.4s → 380ms, removed 2 out-of-hours on-call pages / week.',
      'Implemented idempotency keys + Redis distributed locks to protect the ledger during double-post incidents.',
      'Wrote end-to-end test harness that surfaced a $2.10 rounding bug before it reached production.',
    ],
  },
  {
    slug: 'junior-dev',
    company: 'Local Agency',
    role: 'Junior Web Developer',
    startDate: '2019-06',
    endDate: '2020-12',
    location: 'Lagos, NG',
    bullets: [
      'Converted 40+ Figma designs into WordPress + Laravel sites with <1% client rejection rate.',
      'Built internal task automation tool (PHP + bash crons) saving the team ~11 hours / week on reporting.',
      'Mentored 2 interns on Laravel best practices and Git workflow.',
    ],
  },
];

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
