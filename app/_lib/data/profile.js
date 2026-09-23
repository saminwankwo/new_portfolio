// Canonical source of truth for identity and socials in new_portfolio.
// Name spelling is fixed: "Samuel Nwankwo" everywhere (review issue 26).

export const PROFILE = {
  name: 'Samuel Nwankwo',
  middleName: 'Chibuike',
  handle: 'saminwankwo',
  pronouns: 'he/him',
  role: 'Full-Stack Engineer',
  headline:
    'Full-stack engineer helping founders ship web apps, ad infrastructure, and developer tools that scale.',
  longBio: [
    "Hi, I'm Samuel — a software engineer from Lagos building things for the web since 2019.",
    "I specialise in two lanes: (a) end-to-end web product engineering (React / Next.js + PHP/Laravel or Node backends + databases + deploy), and (b) paid-ad infra for performance marketers — pixels, consent, attribution, and the CRM plumbing on the backend so every dollar of ad spend is accounted for.",
    "Outside of work I run SN TECH — a small dev studio that ships POS software, marketing sites, and internal tools for small businesses across West Africa. I also write occasionally about software leadership and bootstrapping on my blog.",
    "Want to build something, fix a leaky attribution funnel, or just chat about the business of writing software? Drop me a line from /contact."
  ].join('\n\n'),
  careerStart: '2019-06-01',
  location: {
    city: 'Lagos',
    country: 'Nigeria',
    tz: 'Africa/Lagos',
    utc: 'UTC+1',
  },
  email:
    process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || 'nwankwosami@gmail.com',
  phone:
    process.env.NEXT_PUBLIC_CONTACT_PHONE?.trim() || '+234 902 092 7884',
  availability: 'Available for select freelance + contract work · Q4 2026',
  socials: {
    github:
      process.env.NEXT_PUBLIC_GITHUB_URL?.trim() ||
      'https://github.com/saminwankwo',
    linkedin:
      process.env.NEXT_PUBLIC_LINKEDIN_URL?.trim() ||
      'https://linkedin.com/in/saminwankwo',
    twitter:
      process.env.NEXT_PUBLIC_TWITTER_URL?.trim() ||
      'https://twitter.com/saminwankwo',
    whatsapp:
      process.env.NEXT_PUBLIC_WHATSAPP_URL?.trim() ||
      'https://wa.me/2349020927884',
    calendly:
      process.env.NEXT_PUBLIC_CALENDLY_URL?.trim() ||
      'https://calendly.com/nwankwosami/30min',
  },
};

export default PROFILE;
