module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    screens: {
      
      'sm': '380px',
      'md': '834px',
      'lg': '1124px',
      'xl': '1640px',
      '2xl': '1890px'
      

    },
    container: {
      center: true,
    
    },
    extend: {
      colors: {
      'avaxtruck-green': '#1eff05',
      'avaxtruck-pink': '#ff05ea',
      'avaxtruck-yellow': '#fffc00',
    
    },
      backgroundImage: {
        'background': "url('./assets/avaxtrucks/background.png')",

      }
  },
  },
  plugins: [require('tailwind-scrollbar-hide')],
}
