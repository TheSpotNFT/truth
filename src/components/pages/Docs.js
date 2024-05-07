import React, { useState, useEffect } from "react";
import Card from "../DocCard";
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import "../../index.css";
import image from "../../assets/avaxtrucks/background.png";
import truck from "../../assets/avaxtrucks/background.png";
import {Spring} from 'react-spring';

const Docs = ({
  account,
  web3Modal,
  loadWeb3Modal,
  web3Provider,
  setWeb3Provider,
  logoutOfWeb3Modal,
  txProcessing,
  setTxProcessing,
}) => {
  const [spotsMinted, setSpotsMinted] = useState([]);
  const [isLoading, setIsLoading] = useState(false)

  const onClickUrl = (url) => {
    return () => openInNewTab(url);
  };
  const openInNewTab = (url) => {
    const newWindow = window.open(url, "_blank", "noopener,noreferrer");
    if (newWindow) newWindow.opener = null;
  };

const observer = new IntersectionObserver(entries => {

})

  function alertClick() {
    alert("");
  }
 
//Slider
const slideLeft = () => {
  var slider = document.getElementById('slider')
  slider.scrollLeft = slider.scrollLeft - 800
}
const slideRight = () => {
  var slider = document.getElementById('slider')
  slider.scrollLeft = slider.scrollLeft + 800
}

  return (
    <div className="flex-auto mx-auto w-full bg-transparent">
      <div className="md:pt-16 sm:pt-4 px-9 bg-transparent">
      
</div>
<div className='grid grid-cols-1 mx-auto content-center bg-transparent'>

        <div id='slider' className="p-10 gap-5 grid justify-center pixelated mx-auto w-full h-full overflow-x-scroll scroll whitespace-nowrap scroll-smooth scrollbar-hide snap-mandatory snap-x bg-transparent">
      
      <div className="fade bg-opacity-90">
      <Card 
      image={truck}
      alt="Avax Trucks"
      title="Avax Trucks"
      link=""
      line1="Built for truckers."
      line2="By truckers."
      line3="Rebuilding the trucking community around the world."
      line4=""
      line5="Join our discord and join the web3 trucking community."
      line6=""
      line7=""
      buttonText="DM on Twitter"
      buttonText2="Join our Discord"
    
      /></div>


          
         
           
     
      </div>  
  
    </div>

    </div>
  );
};

export default Docs;
