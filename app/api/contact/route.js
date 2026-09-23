import { NextResponse } from 'next/server';

/**
 * POST /api/contact
 *
 * Proxies the contact form to Formspree so the endpoint URL stays server-side
 * (plan step 25). Includes honeypot + validation + a small in-memory rate
 * limit. No new dependencies — validation is plain functions on purpose
 * (plan step 26 recommends skipping zod).
 */

const RATE_WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 3;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** key → [timestamps] — module-scope, lives for the lifetime of the process. */
const hits = new Map();

const OK_MESSAGE = '[✓] message queued — expect a reply within 24h';

function json(status, payload) {
  return NextResponse.json(payload, { status });
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, message: '[✗] malformed request body' });
  }

  const name = String(body?.name ?? '').trim();
  const email = String(body?.email ?? '').trim();
  const topic = String(body?.topic ?? '').trim().slice(0, 120);
  const message = String(body?.message ?? '').trim().slice(0, 5000);
  const honeypot = body?._gotcha ?? body?.website ?? '';

  // Honeypot tripped: pretend success so the bot learns nothing.
  if (honeypot) return json(200, { ok: true, message: OK_MESSAGE });

  const errors = [];
  if (name.length < 2 || name.length > 100) errors.push('name must be 2–100 characters');
  if (email.length > 254 || !EMAIL_RE.test(email)) errors.push('email address looks invalid');
  if (message.length < 10) errors.push('message must be at least 10 characters');
  if (errors.length) return json(400, { ok: false, message: `[✗] ${errors.join(' · ')}` });

  // Rate limit: 3 messages / minute per IP+email.
  const ip =
    (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown';
  const key = `${ip}|${email.toLowerCase()}`;
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    return json(429, {
      ok: false,
      message: '[✗] rate limit — wait a minute, or just email me directly',
    });
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 500) hits.clear(); // crude memory guard

  const endpoint = process.env.FORMSPREE_ENDPOINT?.trim();
  if (!endpoint || /your_form_id_here/.test(endpoint)) {
    return json(503, {
      ok: false,
      message:
        '[✗] mail relay not configured — email ' +
        (process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'nwankwosami@gmail.com') +
        ' directly',
    });
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ name, email, topic, message }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      return json(502, {
        ok: false,
        message: `[✗] upstream rejected the message (${res.status}) — email me directly`,
      });
    }
    return json(200, { ok: true, message: OK_MESSAGE });
  } catch {
    return json(502, {
      ok: false,
      message: '[✗] could not reach the mail relay — email me directly',
    });
  }
}
