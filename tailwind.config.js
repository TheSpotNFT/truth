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
      'avax-red': '#C21700',
      'avax-white': '#f3f2f2',
      'avax-black': '#000000',
      'sphere-red': '#cc5500',
      'sphere-yellow': '#FFFDD0',
      'sphere-green': '#808000',
      'sphere-white': '#fffdd0',
      'sphere-dark': '#2e2828',
      'bold-red':'#FF0000',
      'bold-orange':'#FFA500',
      'dark-teal':'#1e5479',
      'light-teal': '#4cb1ac'
    
    },
      backgroundImage: {
        'background': "url('./assets/avaxtrucks/background.png')",

      }
  },
  },
  plugins: [require('tailwind-scrollbar-hide')],
}
