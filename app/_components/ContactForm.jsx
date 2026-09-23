'use client';

import { useState } from 'react';
import PROFILE from '../_lib/data/profile.js';

const FIELDS = [
  { name: 'name',  label: 'name',  type: 'text',    placeholder: 'Ada Obi' },
  { name: 'email', label: 'email', type: 'email',   placeholder: 'you@company.com' },
  { name: 'topic', label: 'topic', type: 'text',    placeholder: 'project | contract | hello' },
];

const EMPTY = { name: '', email: '', topic: '', message: '', _gotcha: '' };

/**
 * `./send-message.sh` — the contact form, styled as a terminal command run.
 * Posts to /api/contact so the Formspree endpoint stays server-side only.
 */
export default function ContactForm() {
  const [values, setValues] = useState(EMPTY);
  const [state, setState] = useState('idle'); // idle | sending | ok | error
  const [notice, setNotice] = useState(null);

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    if (state === 'sending') return;

    // Terminal-style inline validation (no browser tooltips — errors belong
    // in the scrollback like every other command output).
    const problems = [];
    if (values.name.trim().length < 2) problems.push('name must be at least 2 characters');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) problems.push('email address looks invalid');
    if (values.message.trim().length < 10) problems.push('message must be at least 10 characters');
    if (problems.length) {
      setState('error');
      setNotice(`[✗] ${problems.join(' · ')}`);
      return;
    }

    setState('sending');
    setNotice(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setState('ok');
        setNotice(data.message || '[✓] message queued — expect a reply within 24h');
        setValues(EMPTY);
      } else {
        setState('error');
        setNotice(data.message || '[✗] message could not be sent — email me directly');
      }
    } catch {
      setState('error');
      setNotice('[✗] network error — email me directly');
    }
  }

  return (
    <div className="terminal-frame">
      <div className="terminal-frame__titlebar">
        <span className="terminal-frame__dot terminal-frame__dot--close" aria-hidden />
        <span className="terminal-frame__dot terminal-frame__dot--min" aria-hidden />
        <span className="terminal-frame__dot terminal-frame__dot--max" aria-hidden />
        <span className="ml-2 truncate">samuel@portfolio:~$ ./send-message.sh</span>
      </div>

      <div className="terminal-frame__body">
        <form onSubmit={onSubmit} className="flex flex-col gap-3" noValidate>
          {FIELDS.map((f) => (
            <div
              key={f.name}
              className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3"
            >
              <label
                htmlFor={`cf-${f.name}`}
                className="term-form__label shrink-0 sm:w-28"
              >
                {f.label} <span className="text-terminal-accent">&gt;</span>
              </label>
              <input
                id={`cf-${f.name}`}
                name={f.name}
                type={f.type}
                value={values[f.name]}
                onChange={set(f.name)}
                placeholder={f.placeholder}
                autoComplete={f.name === 'email' ? 'email' : 'name'}
                className="term-form__field"
              />
            </div>
          ))}

          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-3">
            <label htmlFor="cf-message" className="term-form__label shrink-0 sm:w-28">
              message <span className="text-terminal-accent">&gt;</span>
            </label>
            <textarea
              id="cf-message"
              name="message"
              rows={5}
              value={values.message}
              onChange={set('message')}
              placeholder="What are we building? Timeline? Budget range?"
              className="term-form__field resize-y"
            />
          </div>

          {/* Honeypot: hidden from humans, still posted to the server. */}
          <div className="hidden">
            <label htmlFor="cf-website">Leave this field empty</label>
            <input
              id="cf-website"
              name="_gotcha"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={values._gotcha}
              onChange={set('_gotcha')}
            />
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="term-form__btn"
              disabled={state === 'sending'}
            >
              {state === 'sending' ? '…sending' : '[ENTER] SEND MESSAGE'}
            </button>
            <span className="text-terminal-fg-dim text-sm">
              no spam · reply within 24h · or{' '}
              <a href={`mailto:${PROFILE.email}`}>email me directly</a>
            </span>
          </div>

          {notice && (
            <p
              role="status"
              className={
                state === 'ok'
                  ? 'terminal-line terminal-line--banner mt-1'
                  : 'terminal-line terminal-line--error mt-1'
              }
            >
              {notice}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
