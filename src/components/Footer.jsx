import React from 'react'

function Footer() {
  return (
    <div className='text-gray-500 font-mono mb-3 pt-96'><p>&copy; {new Date().getFullYear()} InterPlanetary Recipe System. Brought to you by  <a href="https://thespot.art" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-600">The Spot on Avax.</a></p></div>
  )
}

export default Footer;