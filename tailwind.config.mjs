/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'terminal-bg':      'var(--terminal-bg)',
        'terminal-fg':      'var(--terminal-fg)',
        'terminal-fg-dim':  'var(--terminal-fg-dim)',
        'terminal-accent':  'var(--terminal-accent)',
        'terminal-error':   'var(--terminal-error)',
        'terminal-warning': 'var(--terminal-warning)',
        'terminal-path':    'var(--terminal-path)',
        'terminal-border':  'var(--terminal-border)',
        'terminal-selection': 'var(--terminal-selection)',
      },
      fontFamily: {
        terminal: [
          '"JetBrains Mono"',
          '"Fira Code"',
          '"SF Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          '"Liberation Mono"',
          '"Courier New"',
          'monospace',
        ],
      },
      keyframes: {
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-2px)' },
          '75%': { transform: 'translateX(2px)' },
        },
      },
      animation: {
        blink: 'blink 1.1s steps(2, start) infinite',
        scanline: 'scanline 8s linear infinite',
        shake: 'shake 0.2s ease-in-out',
      },
    },
  },
  plugins: [],
}
