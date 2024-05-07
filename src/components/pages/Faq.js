import React, { useState, useEffect } from "react";
import spotbot from "../../assets/avaxtrucks/background.png";
import Card from "../TierCards";
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import "../../index.css";
import image from "../../assets/avaxtrucks/background.png";
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
    <div className="container flex-auto mx-auto w-full bg-transparent">
      <div className="pt-10 lg:pt-20 px-9 bg-transparent">
      <div className="pixelated text-2xl">FAQ</div>
</div>
<div className='flex relative items-center overflow-hidden z-[0]'>

</div>
    </div>
  );
};

export default Docs;
