'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const WELCOME = [
  'Hi, I am Samuel',
  'I am a software developer',
  'Welcome to my interactive portfolio!',
  'Type "help" to see available commands.',
];

// Every advertised command maps to a real route (Issue 12).
const ROUTES = {
  projects: '/projects',
  experience: '/experience',
  resume: '/resume',
  contact: '/contact',
};

const COMMANDS = ['help', ...Object.keys(ROUTES), 'back'];

const Terminal = () => {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [logs, setLogs] = useState(WELCOME);
  const [pageTitle, setPageTitle] = useState('Interactive Terminal');

  // Runtime title updates for typed commands; the static default metadata is
  // exported from app/page.js + app/layout.js (Issues 5 + 14).
  useEffect(() => {
    document.title = `${pageTitle} · Samuel Nwankwo`;
  }, [pageTitle]);

  const handleCommand = (command) => {
    const trimmed = command.trim();
    const key = trimmed.toLowerCase();
    let output = '';

    setPageTitle(
      trimmed ? trimmed.charAt(0).toUpperCase() + trimmed.slice(1) : 'Interactive Terminal'
    );

    switch (key) {
      case 'help':
        output = `Available commands: ${COMMANDS.join(', ')}`;
        break;
      case 'projects':
      case 'experience':
      case 'resume':
      case 'contact':
        output = `Navigating to ${key}...`;
        router.push(ROUTES[key]);
        break;
      case 'back':
        output = 'Navigating back...';
        router.back();
        break;
      default:
        output = `Command not found: ${trimmed}. Type "help" to see available commands.`;
    }
    setLogs((prevLogs) => [...prevLogs, `> ${trimmed}`, output]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      handleCommand(input);
      setInput('');
    }
  };

  return (
    <div className="flex h-[100dvh] flex-col bg-gray-900 p-4 font-mono text-green-300">
      <div role="log" aria-live="polite" className="h-4/5 flex-1 overflow-auto">
        {logs.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2">
        <label htmlFor="terminal-input" className="sr-only">
          Terminal command input
        </label>
        <span aria-hidden="true">$</span>
        <input
          id="terminal-input"
          type="text"
          autoComplete="off"
          aria-describedby="terminal-hint"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-w-0 flex-1 border-none bg-transparent text-green-300"
          autoFocus
        />
        <span id="terminal-hint" className="sr-only">
          Type a command and press Enter. Type help to list commands.
        </span>
      </form>
    </div>
  );
};

export default Terminal;
