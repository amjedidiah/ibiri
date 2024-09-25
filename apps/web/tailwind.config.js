const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(
      __dirname,
      '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'
    ),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    screens: {
      xs: '390px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      chromebook: '1200px',
      xl: '1280px',
      '2xl': '1536px',
      '3xl': '1921px',
      'landscape-sm': {
        raw: '(min-width: 600px) and (max-width: 1024px) and (min-height: 600px) and (orientation: landscape)',
      },
      'landscape-md': {
        raw: '(min-width: 768px) and (max-width: 1366px) and (max-height: 700px) and (orientation: landscape)',
      },
    },
    extend: {
      colors: {
        'primary-bg': '#3D4EE3',
      },
    },
  },
};
