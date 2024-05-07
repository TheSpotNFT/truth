import React, { useEffect, useState } from 'react';
import "../index.css"




function Card({
  image,
  alt,
  title,
  link,
  line1,
  line2,
  line3,
  line4,
  line5,
  line6,
  line7,
  buttonText,
  buttonText2,
}) {

  const onClickUrl = (url) => {
    return () => openInNewTab(url);
  };
  const openInNewTab = (url) => {
    const newWindow = window.open(url, "_blank", "noopener,noreferrer");
    if (newWindow) newWindow.opener = null;
  };

  const [textinput, setTextinput] = useState("1");

  const textinputUser = (event) => {
    setTextinput(event.target.value);
  };

  function alertClick() {
    alert("The Trucks are coming...");
  }




  return (


    <div className="items-center p-2 grid md:grid-cols-2 sm:grid-cols-1 hover:z-0 rounded shadow-lg bg-zinc-500 bg-opacity-95 hover:bg-opacity-100 hover:opacity-100 hover:bg-zinc-400 duration-300 w-full lg:w-[1250px] snap-start">
      <div>
        <img className="w-full text-black sm:p-2 md:p-6" src={image} alt={alt}></img>
        <div className="px-6 py-4">


          <div className="w-full flex pr-2 pl-1">


          </div>
        </div></div>

      <div className='relative overscroll-contain w-full '>
        <div className='sm:pt-2 md:pt-6 md:pr-4 md:text-5xl w-full pt-4 sm:text-4xl'>{title}</div>
        <div className='md:pt-10 sm:pt-4 md:text-2xl sm:text-md w-full'>{line1}</div>
        <div className='pt-4 sm:text-base md:text-2xl w-full'>{line2}</div>
        <div className='pt-4 sm:text-base md:text-2xl w-full'>{line3}</div>
        <div className='pt-4 sm:text-base md:text-2xl w-full'>{line4}</div>
        <div className='pt-4 sm:text-sm md:text-2xl w-full'>{line5}</div>
        <div className='pt-4 sm:text-base md:text-xl w-full'>{line6}</div>
        <div className='pt-4 p-2 sm:text-[10px] md:text-sm w-full'>{line7}</div>
        <div className='text-lg w-full content-end'><button
          className="m-1 w-2/3 rounded-sm px-1 py-1 border-2 bg-avaxtruck-pink border-gray-200 text-white
     hover:bg-white hover:text-gray-900 duration-300 font-bold text-lg"
          /*disabled={props.txProcesssing}
        onClick={() => mintNFT()}*/
          onClick={onClickUrl("https://twitter.com/TheSpotUG")}
        >
          {buttonText}
        </button></div>
        <div className='text-lg w-full content-end'><button
          className="m-1 w-2/3 rounded-sm px-1 py-1 border-2 bg-avaxtruck-pink border-gray-200 text-white
     hover:bg-white hover:text-gray-900 duration-300 font-bold text-lg"
          /*disabled={props.txProcesssing}
        onClick={() => mintNFT()}*/
          onClick={onClickUrl("https://twitter.com/TheSpotUG")}
        >
          {buttonText2}
        </button></div>



      </div>
    </div>




  )
}
export default Card;