import React, { useState } from "react";
import LogoutButton from "./Logout";

import "../index.css";
import logo from "../assets/iprs_thin.png";

export const Nav = ({
  account,
  web3Modal,
  loadWeb3Modal,
  web3Provider,
  setWeb3Provider,
  logoutOfWeb3Modal,
}) => {
  let Links = [
    { name: "Add Piece", link: "/gallery" },
    { name: "Read", link: "/" },
    { name: "Getting Started", link: "/faq" },
    { name: "Twitter", link: "https://twitter.com/thespotUG" },
    { name: "Discord", link: "https://discord.gg/pJT7ndQ88F" },
    { name: "ProSo Contract", link: "https://snowscan.xyz/address/0x8f58F10fD2Ec58e04a26F0A178E727BC60224ddA" },
    { name: "LikesAndTips Contract", link: "https://snowscan.xyz/address/0x4d2ca1228eAAbB03aB2F5686598451341F69Db55" },

  ];

  const [open, setOpen] = useState(false);
  //console.log(account);

  return (
    <nav className="main-nav pb-20 md:pb-20 lg:pb-15 xl:pb-15 2xl:pb-15 relative z-20 bg-neutral-700">
      <div className="w-full fixed top-0 left-0 bg-neutral-700 pt-4 sm:pb-2 z-30">
        <div className="flex items-center justify-between bg-neutral-700 py-0 px-7">
          <div className="flex flex-col items-center w-full xl:flex-row xl:justify-between">
            <div className="flex items-center justify-center w-full xl:justify-start xl:w-auto pl-2">

              <span className="text-lg md:flex hidden md:text-3xl font-bold text-white z-30 pl-20">ProSo</span>
            </div>
            <ul
              className={`pr-12 overflow-y-visible xl:flex xl:items-center absolute xl:static bg-neutral-700 left-0 sm:w-full md:w-1/3 xl:w-auto xl:pl-0 pl-0 transition-all duration-300 ease-in ${open ? "md:top-20 sm:top-[75px] opacity-100 shadow-md" : "top-[-350px] md:top-[-375px] z-10"
                }`}
            >
              {Links.map((link) => (
                <li
                  key={link.name}
                  className="overflow-y-visible md:ml-8 lg:ml-8 xl:ml-8 text-2xl md:text-2xl font-bold text-avax-white hover:text-avax-black duration-300 md:my-4 lg:my-4 xl:my-0 xxl:my-0 my-4 pl-8 2xl:pl-6 z-20"
                >
                  <a
                    target={
                      (link.name === "Twitter" ||
                        link.name === "Discord") &&
                      "_blank"
                    }
                    href={link.link}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div
            onClick={() => setOpen(!open)}
            className="text-3xl absolute left-8 top-6 md:top-6 cursor-pointer xl:hidden z-40"
          >
            <div className="mx-auto justify-center items-center text-white font-4xl pb-2 w-36">?</div>
          </div>
          <div className="z-30"><LogoutButton
            account={account}
            web3Modal={web3Modal}
            loadWeb3Modal={loadWeb3Modal}
            web3Provider={web3Provider}
            setWeb3Provider={setWeb3Provider}
            logoutOfWeb3Modal={logoutOfWeb3Modal}
          /></div>
        </div>
      </div>
    </nav>
  );
};
