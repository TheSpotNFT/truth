import React, { useEffect, useState } from 'react';
import "../index.css"
import { ethers, Contract } from "ethers";
import { AVAXTRUCKS_ADDRESS, AVAXTRUCKS_ABI } from '../components/Contracts/AvaxTrucksContract';
import background from "../assets/avaxtrucks/background.png";
import hotpink from "../assets/avaxtrucks/Hot_Pink.png";


function Card({
  account,
  image,
  alt,
  title,
  link,
  line1,
  line2,
  line3,
  line4,
  totalminted,
  docs,
  setTxProcessing
}) {

  const contractAddress = '0xC231e5Ce8f65f996463BE8b486E88BB14219C468';
  const contractABI = [
    {
      constant: true,
      inputs: [{ name: '_owner', type: 'address' }],
      name: 'balanceOf',
      outputs: [{ name: 'balance', type: 'uint256' }],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [
        { name: '_owner', type: 'address' },
        { name: '_index', type: 'uint256' },
      ],
      name: 'tokenOfOwnerByIndex',
      outputs: [{ name: 'tokenId', type: 'uint256' }],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
  ];



  // Function to check if a wallet holds an NFT and return the tokenID
  async function getTokenID() {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('Ethereum provider not found. Make sure you have a compatible wallet installed.');
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contractInstance = new ethers.Contract(contractAddress, contractABI, provider);

    try {
      // Call the balanceOf function of the contract to get the token count owned by the walletAddress
      console.log("Trying...");
      console.log(account);
      const tokenCount = await contractInstance.balanceOf(account);

      // If the wallet holds at least one token, retrieve the first tokenID
      if (parseInt(tokenCount, 10) > 0) {
        const tokenID = await contractInstance.tokenOfOwnerByIndex(account, 0);
        return tokenID.toString(); // Convert BigNumber to string

      } else {
        // If the wallet does not hold any tokens, return null or handle it as you wish
        return null;
      }

    } catch (error) {
      console.error('Error while fetching NFT data:', error);
      // Handle the error here
    }
  }

  const onClickUrl = (url) => {
    return () => openInNewTab(url);
  };
  const openInNewTab = (url) => {
    const newWindow = window.open(url, "_blank", "noopener,noreferrer");
    if (newWindow) newWindow.opener = null;
  };

  const [textinput, setTextinput] = useState("1");
  const [textinput1, setTextinput1] = useState("1");
  const [totalRemaining, setTotalRemaining] = useState("1");

  const textinputUser = (event) => {
    setTextinput(event.target.value);
  };
  const textinputUser1 = (event) => {
    setTextinput1(event.target.value);
  };

  let remaining;

  async function getRemainingNFTs() {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        if (AVAXTRUCKS_ABI && AVAXTRUCKS_ADDRESS && signer) {
          const contract = new Contract(AVAXTRUCKS_ADDRESS, AVAXTRUCKS_ABI, signer);
          let options = {
            value: ethers.utils.parseEther(".1"),
          };

          remaining = await contract.totalSupply();
          setTotalRemaining(remaining.toNumber());

        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      // setTxProcessing(false);
    }
  }

  useEffect(() => {
    getRemainingNFTs();
  }, [])


  async function mintNFT(setTxProcessing) {
    //setTxProcessing(true);
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        if (AVAXTRUCKS_ABI && AVAXTRUCKS_ADDRESS && signer) {
          const contract = new Contract(
            AVAXTRUCKS_ADDRESS,
            AVAXTRUCKS_ABI,
            signer
          );

          let options = {
            // price is 0.25 avax
            value: ethers.utils.parseEther(`${textinput * 0.15}`),
            gasLimit: 20000000,
          };

          let tx = await contract.mint(textinput, options);
          console.log(tx.hash);
          //setTxProcessing(false);
          /*alert(
            "Minted Successfully! View your NFT on Campfire, Kalao or Joepegs!"
          );*/
        } else {
          console.log("error with contract abi, address, or signer");
        }
      }
    } catch (error) {
      console.log("Error on mint");
      console.log(error);
      alert(error.data.message);
    } finally {
      //setTxProcessing(false);
    }
  }


  function alertClick() {
    alert("Wen Mint??!!!");
  }

  function alertClick1() {
    alert("Generating...");
  }

  const [showDocs, setShowDocs] = useState(true);
  const [tokenId, setTokenId] = useState("0");

  /*useEffect(() => {
    getTokenID();
  }, [account]);*/

  return (


    <div className="items-center md:grid md:grid-cols-2 sm:grid-cols-1 hover:z-0 rounded shadow-lg bg-black bg-background bg-cover bg-opacity-90 opacity-90 duration-300 md:w-[600px] md:h-[500px] lg:h-auto lg:w-[800px] xl:w-[1050px] snap-start snap-mandatory z-0">
      <div>
        <img className="md:w-full sm:w-2/3 sm:mx-auto sm:pt-0 md:pl-10 lg:pl-8 text-black p-2" src={hotpink} alt={alt}></img>
        <div className="px-6 py-4">


          <div className="w-full flex pl-3 pb-4 pt-16">
            <div className="flex pr-4 pt-1 pb-4">
              <input
                type="number"
                className="border-2 border-slate-600 bg-slate-400 text-left pixelated text-xl placeholder-slate-600 pl-2 pr-4 w-16"
                placeholder="Amount"
                value={textinput}
                onChange={textinputUser.bind(this)}
              />{" "}
            </div>
            <div className="w-full md:pb-3"><button
              className="m-1 w-full bg-black rounded-sm px-1 py-5 border-4 border-gray-200 text-white
     hover:bg-gray-200 hover:text-gray-900 duration-300 pixelated font-bold text-lg"

              onClick={() => mintNFT()}
            //onClick={alertClick}
            >
              Mint {textinput}
            </button></div>
            {/*<div className="w-full md:pb-2 pl-4"><button
              className="m-1 w-full rounded-sm px-1 py-1 border-2 border-gray-200 text-gray-200
     hover:bg-gray-200 hover:text-gray-900 duration-300 font-mansalva font-bold md:text-lg sm:text-base"

              onClick={() => claimNFT()}
            // onClick={alertClick}
            >
              Claim {textinput}
  </button></div>*/}
          </div>
        </div></div>

      <div className={`sm:pl-0 md:pl-0 md:pt-2 lg:pt-8 sm:pr-0 md:pr-4 pixelated text-white drop-shadow-2xl shadow-black w-full ${showDocs === true ? 'visible' : 'hidden'}`}>
        <div className='bg-black bg-opacity-60'>
          <div className='md:pt-4 lg-pt-16 lg:text-4xl md:text-2xl w-full pt-4 sm:text-lg pb-4'>Avax Trucks</div>
          <div className='md:pt-0 lg:pt-2 xl:pt-20 sm:pt-4 md:text-xl sm:text-lg w-full'>Supply: 3.5k</div>

          <div className='md:pt-2 lg:pt-4 sm:text-lg md:text-xl w-full'>{line3}</div>
          <div className='md:pt-2 lg:pt-4 sm:text-lg md:text-xl w-full'>{line4}</div>
          {/*<div className='pt-4'><div className='pixelated pb-4 px-4'>Input your PDX Token ID: <input
            type="number"
            className="border-2 border-slate-600 bg-slate-400 text-left pixelated text-lg placeholder-slate-600 pl-2 pr-4 w-16"
            placeholder="Amount"
            value={textinput1}
            onChange={textinputUser1.bind(this)}
          /></div><div className='md:pr-2'><button
            className="m-1 md:w-full lg:w-1/2 rounded-sm px-1 py-1 border-4 bg-black border-gray-200 text-white
     hover:bg-gray-200 hover:text-gray-900 duration-300 font-mansalva font-bold md:text-sm lg:text-md"
          
          >
            Claim PDX Free Mints!
          </button></div></div>*/}
          <div className='pt-4 md:pb-2 sm:text-lg md:text-lg lg:text-3xl w-full'></div></div>
        <div className='flex md:pt-20 lg:pt-0 xl:pt-4 pb-6 md:pb-6 sm:pt-4 sm:pb-2 text-lg w-full content-end p-4'><button
          className="m-1 w-1/2 rounded-sm pr-2 pl-2 px-1 py-1 border-4 bg-black border-gray-200 text-white
     hover:bg-gray-200 hover:text-gray-900 duration-300 font-mansalva font-bold md:text-sm lg:text-lg"
          /*disabled={props.txProcesssing}
        onClick={() => mintNFT()}*/
          onClick={() => {
            setShowDocs((v) => !v);
          }}
        >
          Info
        </button><button
          className="m-1 sm:w-1/2 md:w-full lg:w-1/2 rounded-sm px-1 py-1 border-4 bg-black border-gray-200 text-white
     hover:bg-gray-200 hover:text-gray-900 duration-300 font-mansalva font-bold md:text-xs lg:text-sm"
          /*disabled={props.txProcesssing}
        onClick={() => mintNFT()}*/
          onClick={onClickUrl("https://campfire.exchange/collections/0x5b18091102e1815a594d708ef0d270d9fe8467b4")}
        >
            View NFTs
          </button></div>


      </div>
      <div className={`sm:pl-4 md:pl-0 md:pt-2 lg:pt-8 sm:pr-0 md:pr-4 pixelated text-white drop-shadow-2xl shadow-black w-full ${showDocs === true ? 'hidden' : 'visible'}`}>

        <div className='pixelated bg-black bg-opacity-60 text-white shadow-lg lg:pt-10 xl:pt-8 sm:pt-4 md:pt-10 xl:text-2xl lg:text-1xl md:text-base sm:text-lg w-full pb-10 px-4'>
          <div className='md:pt-2 sm:pt-4 md:text-lg sm:text-md w-full'>Built for Truckers.</div>
          <div className='pt-4 sm:text-base md:text-lg w-full'>By Truckers.</div>
          <div className='pt-4 sm:text-base md:text-lg w-full'>Rebuilding the trucking community around the world.</div>
        </div>

        <div className='md:pt-0 lg:pt-0 xl:pt-1 pb-2 md:pb-5 sm:pt-4 sm:pb-2 text-lg w-full place-content-end'><button
          className="m-1 w-2/3 rounded-sm px-1 py-1 border-2 border-gray-200 bg-black
     hover:bg-gray-200 hover:text-gray-900 duration-300 pixelated text-white shadow-lg font-bold text-lg"
          /*disabled={props.txProcesssing}
        onClick={() => mintNFT()}*/
          onClick={() => {
            setShowDocs((v) => !v);
          }}
        >
          Supply Data
        </button></div>


      </div>
    </div>




  )
}
export default Card;
