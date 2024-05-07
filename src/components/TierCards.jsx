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
  buttonText
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


    <div className="grid md:grid-cols-1 sm:grid-cols-1 hover:z-0 rounded shadow-lg bg-zinc-500 bg-opacity-95 hover:bg-opacity-100 hover:opacity-100 hover: hover:scale-105 hover:bg-zinc-400 duration-300 sm:w-[300px] md:w-[400px] md:h-[600px] snap-start">


      <div className='w-full'>
        <div className='text-3xl md:pt-10 md:text-5xl w-full pt-4 sm:text-4xl'>{title}</div>
        <div className='md:pt-10 sm:pt-4 md:text-3xl sm:text-md w-full'>{line1}</div>
        <div className='pt-4 sm:text-md md:text-2xl w-full'>{line2}</div>
        <div className='pt-4 sm:text-md md:text-2xl w-full'>{line3}</div>
        <div className='pt-4 sm:text-md md:text-2xl w-full'>{line4}</div>
        <div className='pt-4 sm:text-sm md:text-2xl w-full p-2'>{line5}</div>
        <div className='pt-10 sm:pb-6 sm:text-lg md:text-3xl w-full'>{line6}</div>
      </div>
    </div>




  )
}
export default Card;