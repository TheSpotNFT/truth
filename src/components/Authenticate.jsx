import React from 'react';
import { useMoralis } from 'react-moralis'
import logo from "../assets/5.jpg"

export default function Authenticate({account, web3Modal, loadWeb3Modal, web3Provider, setWeb3Provider, logoutOfWeb3Modal}) {
    
  return (
    <div className="bg-slate-900 flex w-full h-screen align-middle">
    <div className="m-auto">
    <img src={logo} className="max-w-md" alt="Gravedigger Logo"></img>
    <div className="align-middle px-40 py-10">
    <button className="align-middle rounded-lg px-4 py-2 border-4 border-spot-yellow text-spot-yellow 
    hover:bg-spot-yellow hover:text-black duration-300 hover:border-white font-mono text-l" onClick={() => loadWeb3Modal()}><b>Authenticate</b></button>
    </div>
    </div>
      </div>
  )
}
