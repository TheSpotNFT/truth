import React, { useEffect } from "react";
import "./App.css";
import { Nav } from "./components/Nav";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import Main from "./components/pages/Main";
import Gallery from "./components/pages/Gallery"
import Faq from "./components/pages/Faq";
import { useState, useCallback } from "react";
import { web3ModalSetup } from "./helpers/Web3Modal";
import { ethers } from "ethers";


function App() {
  // using web3Modal to handle login and account logic
  const [account, setAccount] = useState("");
  const [txProcessing, setTxProcessing] = useState(false);
  const [web3Provider, setWeb3Provider] = useState(null);
  const web3Modal = web3ModalSetup();

  const logoutOfWeb3Modal = async () => {
    await web3Modal.clearCachedProvider();
    if (
      web3Provider &&
      web3Provider.provider &&
      typeof web3Provider.provider.disconnect == "function"
    ) {
      await web3Provider.provider.disconnect();
    }
    setTimeout(() => {
      window.location.reload();
    }, 1);
  };

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setWeb3Provider(new ethers.providers.Web3Provider(provider));

    provider.on("chainChanged", (chainId) => {
      console.log(`Chain changed to -- ${chainId}`);
      setWeb3Provider(new ethers.providers.Web3Provider(provider));
      setTimeout(() => {
        window.location.reload();
      }, 1);
    });

    provider.on("accountsChanged", () => {
      console.log(`Account changed`);
      setWeb3Provider(new ethers.providers.Web3Provider(provider));
    });

    // Subscribe to session disconnection
    provider.on("disconnect", (code, reason) => {
      console.log("Disconnecting...");
      console.log(code, reason);
      logoutOfWeb3Modal();
    });
    // eslint-disable-next-line
  }, [setWeb3Provider]);

  useEffect(() => {
    if (web3Modal && web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  useEffect(() => {
    const getAddress = async () => {
      if (web3Provider && web3Provider.getSigner()) {
        const newAddress = await web3Provider.getSigner().getAddress();
        setAccount(newAddress);
      }
    };
    getAddress();
  }, [web3Provider]);



  return (
    //<div className="App bg-background bg-no-repeat bg-cover bg-center bg-fixed">
     <div className="App bg-darkgray opacity-90">
      <Router>
        <div className="bg-transparent w-full h-100">
          <div className="z-10">
          <Nav
            account={account}
            web3Modal={web3Modal}
            loadWeb3Modal={loadWeb3Modal}
            web3Provider={web3Provider}
            setWeb3Provider={setWeb3Provider}
            logoutOfWeb3Modal={logoutOfWeb3Modal}
          /></div>
          <div className="flex justify-center items-center gap-2 bg-transparent z-0">
            <Routes>
              <Route
                path="/"
                exact
                element={
                  <Main
                    account={account}
                    web3Modal={web3Modal}
                    loadWeb3Modal={loadWeb3Modal}
                    web3Provider={web3Provider}
                    setWeb3Provider={setWeb3Provider}
                    logoutOfWeb3Modal={logoutOfWeb3Modal}
                    txProcessing={txProcessing}
                    setTxProcessing={setTxProcessing}
                  />
                }
              />
              <Route
                path="/gallery"
                exact
                element={
                  <Gallery
                    account={account}
                    web3Modal={web3Modal}
                    loadWeb3Modal={loadWeb3Modal}
                    web3Provider={web3Provider}
                    setWeb3Provider={setWeb3Provider}
                    logoutOfWeb3Modal={logoutOfWeb3Modal}
                    txProcessing={txProcessing}
                    setTxProcessing={setTxProcessing}
                  />
                }
              />
               <Route
                path="/faq"
                exact
                element={
                  <Faq
                    account={account}
                    web3Modal={web3Modal}
                    loadWeb3Modal={loadWeb3Modal}
                    web3Provider={web3Provider}
                    setWeb3Provider={setWeb3Provider}
                    logoutOfWeb3Modal={logoutOfWeb3Modal}
                    txProcessing={txProcessing}
                    setTxProcessing={setTxProcessing}
                  />
                }
              />
            </Routes>
          </div>
        </div>

        <div className="footer">
          <Footer />
        </div>
      </Router>
    </div>
  );
}

export default App;
