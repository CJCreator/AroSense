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
        // Primary brand colors
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          DEFAULT: '#0ea5e9',
        },
        // Semantic colors
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
          DEFAULT: '#22c55e',
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          600: '#d97706',
          DEFAULT: '#f59e0b',
        },
        error: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
          DEFAULT: '#ef4444',
        },
        // Page-specific theme colors
        'energetic-green': { 50: '#f7fee7', 100: '#ecfccb', 500: '#84cc16', 600: '#65a30d', DEFAULT: '#84cc16', light: '#ecfccb' },
        'inclusive-orange': { 50: '#fff7ed', 100: '#ffedd5', 500: '#f97316', 600: '#ea580c', DEFAULT: '#f97316', light: '#ffedd5' },
        'urgent-red': { 50: '#fef2f2', 100: '#fee2e2', 500: '#ef4444', 600: '#dc2626', DEFAULT: '#ef4444', light: '#fee2e2' },
        'trustworthy-blue': { 50: '#eff6ff', 100: '#dbeafe', 500: '#3b82f6', 600: '#2563eb', DEFAULT: '#3b82f6', light: '#dbeafe' },
        'therapeutic-purple': { 50: '#faf5ff', 100: '#f3e8ff', 500: '#a855f7', 600: '#9333ea', DEFAULT: '#a855f7', light: '#f3e8ff' },
        'secure-dark-blue': { 50: '#eff6ff', 100: '#dbeafe', 500: '#2563eb', 600: '#1d4ed8', DEFAULT: '#2563eb', light: '#dbeafe' },
        'brand-teal': { 50: '#f0fdfa', 100: '#ccfbf1', 500: '#14b8a6', 600: '#0d9488', DEFAULT: '#14b8a6', light: '#ccfbf1' },
        'vibrant-yellow-green': { 50: '#f7fee7', 100: '#ecfccb', 500: '#84cc16', 600: '#65a30d', DEFAULT: '#84cc16', light: '#ecfccb' },
        'gentle-pastel-blue': { 50: '#f0f9ff', 100: '#e0f2fe', 500: '#0ea5e9', 600: '#0284c7', DEFAULT: '#0ea5e9', light: '#e0f2fe' },
        'empowering-pink': { 50: '#fdf2f8', 100: '#fce7f3', 500: '#ec4899', 600: '#db2777', DEFAULT: '#ec4899', light: '#fce7f3' },
        'nurturing-peach': { 50: '#fff7ed', 100: '#ffedd5', 500: '#fb923c', 600: '#ea580c', DEFAULT: '#fb923c', light: '#ffedd5' },
        'reward-gold': { 50: '#fefce8', 100: '#fef3c7', 500: '#eab308', 600: '#ca8a04', DEFAULT: '#eab308', light: '#fef3c7' },
        'modern-teal': { 50: '#f0fdfa', 100: '#ccfbf1', 500: '#14b8a6', 600: '#0d9488', DEFAULT: '#14b8a6', light: '#ccfbf1' },
        'engaging-magenta': { 50: '#fdf4ff', 100: '#fae8ff', 500: '#d946ef', 600: '#c026d3', DEFAULT: '#d946ef', light: '#fae8ff' },
        'sophisticated-grey': { 50: '#f9fafb', 100: '#f3f4f6', 500: '#6b7280', 600: '#4b5563', DEFAULT: '#6b7280', light: '#f3f4f6' },
        // Legacy colors for backward compatibility
        accent: '#ec4899',
        background: '#f8fafc',
        surface: '#ffffff',
        textPrimary: '#1e293b',
        textSecondary: '#64748b',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'strong': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 2px 10px -2px rgba(0, 0, 0, 0.04)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.sr-only': {
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: '0',
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: '0',
        },
        '.focus\:not-sr-only:focus': {
          position: 'static',
          width: 'auto',
          height: 'auto',
          padding: 'inherit',
          margin: 'inherit',
          overflow: 'visible',
          clip: 'auto',
          whiteSpace: 'normal',
        },
        '.reduce-motion *': {
          animationDuration: '0.01ms !important',
          animationIterationCount: '1 !important',
          transitionDuration: '0.01ms !important',
        },
        '.high-contrast': {
          filter: 'contrast(150%)',
        },
        '.text-small': {
          fontSize: '14px',
        },
        '.text-medium': {
          fontSize: '16px',
        },
        '.text-large': {
          fontSize: '18px',
        },
      });
    },
  ],
}