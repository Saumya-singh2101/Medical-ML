/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  safelist: [
    'bg-cyan', 'bg-magenta', 'bg-lime', 'bg-amber',
    'text-cyan', 'text-magenta', 'text-lime', 'text-amber',
    'shadow-neon-cyan', 'shadow-neon-magenta', 'shadow-neon-lime', 'shadow-neon-amber',
  ],
  theme: {
    extend: {
      colors: {
        void: '#06080f',
        panel: '#0b0f1c',
        panel2: '#10172a',
        cyan: {
          DEFAULT: '#00f0ff',
        },
        magenta: {
          DEFAULT: '#ff2e88',
        },
        lime: {
          DEFAULT: '#b6ff3c',
        },
        amber: {
          DEFAULT: '#ffb000',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'neon-cyan': '0 0 6px rgba(0,240,255,0.7), 0 0 24px rgba(0,240,255,0.35)',
        'neon-magenta': '0 0 6px rgba(255,46,136,0.7), 0 0 24px rgba(255,46,136,0.35)',
        'neon-lime': '0 0 6px rgba(182,255,60,0.7), 0 0 24px rgba(182,255,60,0.3)',
        'neon-amber': '0 0 6px rgba(255,176,0,0.7), 0 0 24px rgba(255,176,0,0.3)',
      },
      animation: {
        scan: 'scan 2.4s linear infinite',
        pulseGlow: 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: 0.5 },
          '50%': { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
