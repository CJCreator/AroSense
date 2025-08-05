/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#67e8f9',
          DEFAULT: '#06b6d4',
          dark: '#0e7490',
        },
        secondary: {
          light: '#fde047',
          DEFAULT: '#facc15',
          dark: '#eab308',
        },
        accent: '#f472b6',
        background: '#f8fafc',
        surface: '#ffffff',
        textPrimary: '#1e293b',
        textSecondary: '#64748b',
        'energetic-green': { DEFAULT: '#8BC34A', light: '#E6F0DC' },
        'inclusive-orange': { DEFAULT: '#FF9800', light: '#FFEBCF' },
        'urgent-red': { DEFAULT: '#F44336', light: '#FDDCDC' },
        'trustworthy-blue': { DEFAULT: '#2196F3', light: '#D2E7FA' },
        'therapeutic-purple': { DEFAULT: '#9C27B0', light: '#EBD4F2' },
        'secure-dark-blue': { DEFAULT: '#1976D2', light: '#D1E3F6' },
        'brand-teal': { DEFAULT: '#00BCD4', light: '#CCF2F7' },
        'vibrant-yellow-green': { DEFAULT: '#CDDC39', light: '#F5F8D9' },
        'gentle-pastel-blue': { DEFAULT: '#90CAF9', light: '#E8F4FD' },
        'empowering-pink': { DEFAULT: '#E91E63', light: '#FAD2DE' },
        'nurturing-peach': { DEFAULT: '#FFAB91', light: '#FFEFEB' },
        'reward-gold': { DEFAULT: '#FFD700', light: '#FFF6CC' },
        'modern-teal': { DEFAULT: '#00838F', light: '#CCE6E9' },
        'engaging-magenta': { DEFAULT: '#E040FB', light: '#F8D9FE' },
        'sophisticated-grey': { DEFAULT: '#757575', light: '#E0E0E0' },
      }
    },
  },
  plugins: [],
}