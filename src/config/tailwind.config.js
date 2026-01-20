tailwind.config = {
  theme: {
    extend: {
      colors: {
        bg: '#011627',
        surface: '#0b2942',
        accent: '#049e8a',
        'accent-secondary': '#c792ea',
        'accent-hover': '#05c4ab',
        'text-primary': '#d6deeb',
        'text-secondary': '#5f7e97',
        border: '#1d3b53',
      },
      fontFamily: {
        sans: ['Escoredream', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      maxWidth: {
        'custom': '1200px',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    }
  }
}
