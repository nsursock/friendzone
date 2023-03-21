module.exports = {
  content: ['./src/**/*.{js,md,twig,svg,html,njk}'],
  safelist: [{
    pattern: /hljs+/,
  }],
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('tailwindcss-debug-screens'),
    require('@tailwindcss/line-clamp'),
    require('tailwind-highlightjs'),
  ],
  theme: {
    hljs: {
      theme: 'night-owl',
    },
    extend: {
      zIndex: {
        100: 100,
      },

      keyframes: {
        show: {
          "0%, 49.99%": { opacity: 0, "z-index": 10 },
          "50%, 100%": { opacity: 1, "z-index": 50 },
        },
        vote: {
          '0%, 100%': {
            transform: 'rotate(0deg)',
          },
          '25%': {
            transform: 'rotate(-30deg)',
          },
          '75%': {
            transform: 'rotate(30deg)',
          },
        }
      },

      animation: {
        show: "show 0.7s",
        'ping-once': "ping 1s cubic-bezier(0, 0, 0.2, 1)",
        'spin-slow': 'spin 3s linear infinite',
        vote: 'vote 1s cubic-bezier(.17,.67,.83,.67) ease-in-out',
      },
    },
    container: {
      center: true,
      padding: '1.5rem',
    },
    debugScreens: {
      position: ['bottom', 'right'],
    },
    extend: {},
  },
}
