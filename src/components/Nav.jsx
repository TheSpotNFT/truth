import React, { useState } from "react";
import LogoutButton from "./Logout";
import { GiHamburgerMenu } from "react-icons/gi";
import "../index.css";
import truck from "../assets/avaxtrucks/Plum.png";

export const Nav = ({
  account,
  web3Modal,
  loadWeb3Modal,
  web3Provider,
  setWeb3Provider,
  logoutOfWeb3Modal,
}) => {

  let Links = [
    { name: "Add Recipe", link: "/" },
    { name: "View Recipes", link: "/gallery" },
    { name: "Getting Started", link: "/faq" },
    { name: "Twitter", link: "https://twitter.com/avaxcooks" },
  ];

  const [open, setOpen] = useState(false);
  console.log(account);

  return (
    <nav className="main-nav pb-20 md:pb-20 lg:pb-15 xl:pb-15 2xl:pb-15 z-10 relative">
      <div className="shadow-sm w-full fixed top-0 left-0 bg-avax-red pt-4 sm:pb-2">
        <div className="flex items-center justify-between bg-avax-red py-0 px-7">
          <div className="desktop-nav">
            <ul
              className={`overflow-y-visible xl:flex xl:items-center absolute xl:static bg-avax-red z-10
                left-0 sm:w-full md:w-1/3 xl:w-auto xl:pl-0 pl-0 transition-all duration-300 ease-in ${open ? "md:top-[60px] sm:top-[85px] opacity-100 overflow-y-visible shadow-md" : "top-[-200px] md:top-[-200px]"
                }`}
            >
              <div className="text-3xl font-bold hidden xl:flex items-end">
                iprs
                <div className="text-xs ml-2">interplanetary recipe system</div>
              </div>
              {Links.map((link) => (
                <li
                  key={link.name}
                  className="overflow-y-visible z-10 md:ml-8 lg:ml-8 xl:ml-8 text-2xl md:text-2xl font-bold hover:text-avax-white duration-300 md:my-4 lg:my-4 xl:my-0 xxl:my-0 my-4 pl-8 2xl:pl-6"
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
          </div><div className="text-3xl font-bold xl:hidden lg:flex items-end pl-32 md:pl-32 pb-2">
            iprs
            <div className="text-xs ml-2">interplanetary recipe system</div>
          </div>
          <div
            onClick={() => setOpen(!open)}
            className="text-3xl absolute left-8 top-6 cursor-pointer xl:hidden z-10"
          >
            <GiHamburgerMenu />
          </div>
          <LogoutButton
            account={account}
            web3Modal={web3Modal}
            loadWeb3Modal={loadWeb3Modal}
            web3Provider={web3Provider}
            setWeb3Provider={setWeb3Provider}
            logoutOfWeb3Modal={logoutOfWeb3Modal}
          />
        </div>
      </div>
    </nav>
  );
};