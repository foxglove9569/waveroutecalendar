/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Roboto', 'sans-serif'],
        lcd: ['"Fira Code"', 'monospace'],
      },
      fontSize: {
        '2xs': '10px',
        'xs': '11px',
        'sm': '12px',
        'base': '13px',
      },
      colors: {
        fl: {
          bg: '#1A1C20',
          panel: '#222429',
          panelLight: '#2A2C32',
          borderOuter: '#111215',
          borderInner: '#383B42',
          orange: '#FF6600',
          green: '#00E676',
          cyan: '#00B0FF',
          magenta: '#D500F9',
          yellow: '#FFEA00',
          textMuted: '#9BA0A8',
          textMain: '#FFFFFF',
          stepOff: '#2E3036',
          gridDark: '#1E2024',
          gridLight: '#222429',
        }
      },
      boxShadow: {
        'fl-panel': 'inset 1px 1px 0px #383B42, inset -1px -1px 0px #111215, 0 4px 6px -1px rgba(0, 0, 0, 0.5)',
        'fl-btn': 'inset 1px 1px 0px rgba(255,255,255,0.1), inset -1px -1px 0px rgba(0,0,0,0.5)',
        'fl-btn-active': 'inset 1px 1px 0px rgba(0,0,0,0.5), inset -1px -1px 0px rgba(255,255,255,0.1)',
        'fl-led': '0 0 5px',
        'fl-note': 'inset 0 2px 2px rgba(255,255,255,0.2), inset 0 -2px 2px rgba(0,0,0,0.3)',
      }
    },
  },
  plugins: [],
}
