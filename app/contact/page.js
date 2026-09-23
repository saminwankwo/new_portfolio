import TerminalBlock from '../_components/TerminalBlock';
import ContactForm from '../_components/ContactForm';
import PROFILE from '../_lib/data/profile.js';

// `metadata` export replaces the deprecated `next/head` (Issues 5 + 14 + 26).
export const metadata = {
  title: '~/contact',
  description:
    'Get in touch with Samuel Nwankwo — email, GitHub, LinkedIn, X, WhatsApp, Calendly, or send a message straight from this page.',
};

function link(label, url, display) {
  return (
    <span key={label}>
      {`  ${label.padEnd(10)}`}
      <a href={url} target="_blank" rel="noopener noreferrer">
        {display ?? url}
      </a>
    </span>
  );
}

export default function Contact() {
  const lines = [
    `name      ${PROFILE.name}  (handle: ${PROFILE.handle})`,
    <span key="email">
      {'email     '}
      <a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a>
    </span>,
    `phone     ${PROFILE.phone}`,
    `location  ${PROFILE.location.city}, ${PROFILE.location.country} (${PROFILE.location.utc})`,
    `status    ${PROFILE.availability}`,
    '',
    'links:',
    link('github', PROFILE.socials.github),
    link('linkedin', PROFILE.socials.linkedin),
    link('twitter/x', PROFILE.socials.twitter),
    link('whatsapp', PROFILE.socials.whatsapp),
    link('calendly', PROFILE.socials.calendly, `${PROFILE.socials.calendly}   [book a 30-min call]`),
    '',
    'or send a message without leaving this shell →',
  ];

  return (
    <div className="flex flex-col gap-4">
      <TerminalBlock
        lines={lines}
        titleBar="samuel@portfolio:~$ cat /home/samuel/contact.txt"
        variant="banner"
      />
      <ContactForm />
    </div>
  );
}
