module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        carbon: {
          950: '#050608',
          900: '#0a0b0f',
          850: '#0e1016',
          800: '#12141c',
          700: '#1a1d26',
          600: '#22263a',
          500: '#2e334d',
        },
        neon: {
          red:    '#ff1e1e',
          amber:  '#ffa500',
          green:  '#00e676',
          cyan:   '#00e5ff',
          purple: '#bf00ff',
          yellow: '#ffe600',
        },
        team: {
          redbull:   '#3671c6',
          ferrari:   '#e8002d',
          mclaren:   '#ff8000',
          mercedes:  '#27f4d2',
          aston:     '#358c75',
          alpine:    '#ff87bc',
          williams:  '#64c4ff',
          haas:      '#b6babd',
          sauber:    '#52e252',
          racing:    '#1b3d7b',
        },
      },
      fontFamily: {
        mono:    ['JetBrains Mono', 'monospace'],
        display: ['Barlow Condensed', 'sans-serif'],
        sans:    ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      animation: {
        'pulse-slow':  'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'blink':       'blink 1s step-end infinite',
        'slide-in':    'slideIn 0.4s ease-out',
        'glow-pulse':  'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%':       { opacity: '0' },
        },
        slideIn: {
          from: { transform: 'translateY(-8px)', opacity: '0' },
          to:   { transform: 'translateY(0)',    opacity: '1' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 6px rgba(0,229,255,0.3)' },
          '50%':       { boxShadow: '0 0 20px rgba(0,229,255,0.7)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
