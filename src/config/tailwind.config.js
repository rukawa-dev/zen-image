tailwind.config = {
  theme: {
    extend: {
      colors: {
        bg: '#f8f9fa',
        accent: '#2c3e50',
        'accent-hover': '#34495e',
        'text-primary': '#1a1a1a',
        'text-secondary': '#666666',
        border: '#e9ecef',
      },
      fontFamily: {
        sans: ['Outfit', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
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
