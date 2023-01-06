module.exports = {
  content: ['./src/**/*.{js,md,twig,svg,html,njk}'],
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('tailwindcss-debug-screens'),
  ],
  theme: {
    extend: {
      zIndex: {
        100: 100,
      },

      keyframes: {
        show: {
          "0%, 49.99%": { opacity: 0, "z-index": 10 },
          "50%, 100%": { opacity: 1, "z-index": 50 },
        },
      },

      animation: {
        show: "show 0.7s",
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
