// Tailwind CSS Configuration with ResQ Meal Color Theme
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ResQ Meal Custom Colors
        primary: {
          avocado: '#72891B',
          'avocado-light': '#8FA330',
          'avocado-dark': '#556314',
        },
        secondary: {
          red: '#CB2602',
          'red-light': '#E63D1A',
          'red-dark': '#A01F00',
        },
        accent: {
          peach: '#F8D78F',
          'peach-light': '#FDE5B8',
          'peach-dark': '#F0C651',
        },
        // Additional colors
        success: '#72891B',
        warning: '#F8D78F',
        danger: '#CB2602',
      },
      spacing: {
        '4.5': '1.125rem',
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
}

export default config

