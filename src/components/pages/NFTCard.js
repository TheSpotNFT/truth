import React, { useState, useEffect, useMemo } from "react";
import { ethers, Contract } from "ethers";
import { PROVABLETRUTHLIKESANDTIPS_ABI, PROVABLETRUTHLIKESANDTIPS_ADDRESS } from "../Contracts/PROVABLETRUTHLikeAndTip";
import { InlineShareButtons } from 'sharethis-reactjs';
import CommentSection from "../CommentSection";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const NFTCard = ({ token, account, showBookmarks, galleryLikes, onTipsFetch, expanded, viewMode }) => {
  const { name, image, attributes = [], description, tokenId } = token.parsedMetadata || {};
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [tipAmount, setTipAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState("NOCHILL");
  const [showDetails, setShowDetails] = useState(false);
  const [showTipInputs, setShowTipInputs] = useState(false);
  const [totalTips, setTotalTips] = useState({});
  const [hasBookmarked, setHasBookmarked] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [shareImage, setShareImage] = useState('');

  const finalTokenId = token.tokenId; // Use token.tokenId directly for all function calls


  // Ensure attributes is always an array, default to empty if undefined
  const safeAttributes = Array.isArray(attributes) ? attributes : [];

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const toggleTipInputs = () => {
    setShowTipInputs(!showTipInputs);
  };

  useEffect(() => {
    setShowDetails(expanded);
  }, [expanded]);

  const availableTokens = useMemo(() => [
    { symbol: "COQ", address: "0x420FcA0121DC28039145009570975747295f2329" },
    { symbol: "NOCHILL", address: "0xAcFb898Cff266E53278cC0124fC2C7C94C8cB9a5" },
    { symbol: "MEOW", address: "0x8aD25B0083C9879942A64f00F20a70D3278f6187" },
    { symbol: "KINGSHIT.X", address: "0x05B0Def5c00bA371683D7035934BcF82B737C364" },
    { symbol: "KONG", address: "0xEbB5d4959B2FbA6318FbDa7d03cd44aE771fc999" },
  ], []);

  // Safely fetch the content attribute value
  const content = safeAttributes.find(attr => attr.trait_type === "Content")?.value || "";

  const fetchTotalTips = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.error("Ethereum object not found");
        return;
      }

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const contract = new Contract(
        PROVABLETRUTHLIKESANDTIPS_ADDRESS,
        PROVABLETRUTHLIKESANDTIPS_ABI,
        signer
      );

      let tips = {};
      for (const token of availableTokens) {
        const tipDetails = await contract.getTipsForToken(finalTokenId, token.address);
        const total = tipDetails.reduce((acc, tip) => acc.add(ethers.BigNumber.from(tip.amount)), ethers.BigNumber.from(0));
        const formattedTotal = ethers.utils.formatEther(total.toString());
        tips[token.symbol] = Math.floor(parseFloat(formattedTotal)).toString();
      }
      setTotalTips(tips);
    } catch (error) {
      console.error("Error fetching total tips:", error);
    }
  };

  useEffect(() => {
    fetchTotalTips();
  }, [finalTokenId, account, availableTokens]);

  useEffect(() => {
    console.log("Token received in NFTCard:", token);
    console.log("Parsed Metadata:", token.parsedMetadata);
    console.log("Token ID:", finalTokenId);
  }, [token]);
  

  // Fetch contributor and creator information safely
  const contributorObj = safeAttributes.find(attr => attr.trait_type === "Contributor");
  const contributor = contributorObj ? contributorObj.value : "Unknown";
  
  const creatorObj = safeAttributes.find(attr => attr.trait_type === "Creator");
  const creator = creatorObj ? creatorObj.value : null;
  const formattedCreator = creator ? `${creator.slice(0, 4)}...${creator.slice(-4)}` : null;

  const fetchLikesAndCheckLiked = async (finalTokenId) => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new Contract(
          PROVABLETRUTHLIKESANDTIPS_ADDRESS,
          PROVABLETRUTHLIKESANDTIPS_ABI,
          signer
        );

        const count = await contract.likes(finalTokenId);
        setLikes(parseInt(count.toString(), 10));

        const liked = await contract.hasLiked(finalTokenId, account);
        setHasLiked(liked);
      }
    } catch (error) {
      console.error("Error fetching likes count or checking liked status:", error);
    }
  };

  const onBookmark = async (finalTokenId) => {
    try {
      console.log("Attempting to bookmark token ID:", finalTokenId);
      const { ethereum } = window;
      if (!ethereum) {
        console.error("Ethereum object not found");
        return;
      }
  
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const contract = new Contract(
        PROVABLETRUTHLIKESANDTIPS_ADDRESS,
        PROVABLETRUTHLIKESANDTIPS_ABI,
        signer
      );
  
      const tx = await contract.bookmark(finalTokenId);
      await tx.wait();
      console.log("Successfully bookmarked token ID:", finalTokenId);
      fetchBookmarkStatus();
    } catch (error) {
      console.error("Error toggling bookmark state:", error);
    }
  };

  const fetchBookmarkStatus = async () => {
    try {
      if (!window.ethereum) return;
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new Contract(
        PROVABLETRUTHLIKESANDTIPS_ADDRESS,
        PROVABLETRUTHLIKESANDTIPS_ABI,
        signer
      );

      const bookmarked = await contract.hasBookmarked(finalTokenId, account);
      setHasBookmarked(bookmarked);
    } catch (error) {
      console.error("Error fetching bookmark status:", error);
    }
  };

  useEffect(() => {
    fetchBookmarkStatus();
  }, [account]);

  useEffect(() => {
    console.log("Account prop received:", account);
    fetchBookmarkStatus();
  }, [account]);

  useEffect(() => {
    const checkNetwork = async () => {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const network = await provider.getNetwork();
        console.log("Connected network:", network);
        if (network.chainId !== 43114) { // Replace with your target chain ID
          console.error("Incorrect network. Please switch to the correct network.");
        }
      }
    };
    checkNetwork();
  }, []);
  
  

  const onLike = async (finalTokenId) => {
    try {
      console.log("Attempting to like token ID:", finalTokenId);
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new Contract(
          PROVABLETRUTHLIKESANDTIPS_ADDRESS,
          PROVABLETRUTHLIKESANDTIPS_ABI,
          signer
        );
        console.log("Signer address:", await signer.getAddress());
  
        const tx = await contract.like(finalTokenId);
        await tx.wait();
        console.log("Successfully liked token ID:", finalTokenId);
        fetchLikesAndCheckLiked(finalTokenId);
      } else {
        console.error("Ethereum object not found");
      }
    } catch (error) {
      console.error("Error toggling like state:", error);
    }
  };

  const onTip = async (finalTokenId, tokenAddress, amount) => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.error("Ethereum object is not available");
        return;
      }

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const signerAddress = await signer.getAddress();

      const tokenContract = new Contract(
        tokenAddress,
        [
          "function approve(address spender, uint256 amount) public returns (bool)",
          "function allowance(address owner, address spender) public view returns (uint256)"
        ],
        signer
      );

      const contract = new Contract(
        PROVABLETRUTHLIKESANDTIPS_ADDRESS,
        PROVABLETRUTHLIKESANDTIPS_ABI,
        signer
      );

      const amountWei = ethers.utils.parseEther(amount);

      const currentAllowance = await tokenContract.allowance(signerAddress, PROVABLETRUTHLIKESANDTIPS_ADDRESS);
      if (currentAllowance.lt(amountWei)) {
        const approveTx = await tokenContract.approve(PROVABLETRUTHLIKESANDTIPS_ADDRESS, amountWei);
        await approveTx.wait();
      }

      const tipTx = await contract.tip(finalTokenId, tokenAddress, amountWei);
      await tipTx.wait();
    } catch (error) {
      console.error("Error performing tip:", error);
    }
  };

  useEffect(() => {
    fetchLikesAndCheckLiked(finalTokenId);
  }, [account]);

  const handleLike = () => {
    if (!account) {
      console.error("No account connected. Please connect your wallet.");
      return;
    }
    onLike(finalTokenId);
  };

  const handleTip = () => {
    const tokenData = availableTokens.find((token) => token.symbol === selectedToken);
    if (!tokenData) {
      console.error(`Token data not found for symbol: ${selectedToken}`);
      return;
    }

    if (!tipAmount || tipAmount === "0") {
      console.error("Tip amount is missing or zero");
      return;
    }

    onTip(finalTokenId, tokenData.address, tipAmount);
  };

  const handleBookmark = () => {
    if (!account) {
      console.error("No account connected. Please connect your wallet.");
      return;
    }
    onBookmark(finalTokenId);
  };

  const sanitizeName = (name) => {
    return name.replace(/[()]/g, '').replace(/\s+/g, '_');
  };

  const copyLinkToClipboard = () => {
    if (!name) {
      console.error("Piece name not found");
      return;
    }
    const articleName = sanitizeName(name);
    const link = `${window.location.origin}/?articleName=${articleName}`;
    navigator.clipboard.writeText(link).then(() => {
      alert("Link copied to clipboard!");
    }).catch(err => {
      console.error("Failed to copy link: ", err);
    });
  };

  useEffect(() => {
    if (name && image) {
      const articleName = sanitizeName(name);
      setShareUrl(`${window.location.origin}/?articleName=${articleName}`);
      setShareImage(`https://gateway.pinata.cloud/ipfs/${image.split("ipfs://")[1]}`);
    }
  }, [name, image]);

  // Determine the image URL to use
  const imageUrl = image ? `https://gateway.pinata.cloud/ipfs/${image.split("ipfs://")[1]}` : null;

  return (
    <div className={`text-white border pr-4 pl-4 pb-4 pt-2 m-2 shadow-md rounded-lg bg-neutral-900 border-neutral-900 transition-all duration-300 ease-in-out ${showDetails ? 'fixed inset-0 z-50 h-screen overflow-y-auto pt-36' : (viewMode === 'list' ? 'w-full lg:w-full' : 'w-full lg:w-1/3 2xl:w-1/6')} ${showBookmarks ? (hasBookmarked ? 'block' : 'hidden') : 'block'}`}>
      {viewMode === 'list' ? (
        <div className="flex items-center bg-neutral-700 p-4 rounded-lg">
          <div className="w-1/12 text-left">
            <img src={imageUrl} alt={name} className="w-full h-auto max-h-24 object-contain" />
          </div>
          <div className="w-1/3 flex items-center justify-between pl-4">
            <span className="text-left">{name}</span>
            <button onClick={toggleDetails} className="bg-neutral-800 text-white rounded px-4 py-2">View Article</button>
          </div>
          <div className="w-1/3 flex items-center justify-between pl-4">
            <span className="text-left">{contributor}</span>
            <button onClick={toggleTipInputs} className="bg-avax-red text-white rounded px-4 py-2 hover:bg-red-800">Tip</button>
          </div>
        </div>
      ) : (
        <>
          <div className="relative pt-4">
            {imageUrl ? (
              <div className="relative group">
                <img
                  src={imageUrl}
                  alt={name}
                  onClick={toggleDetails}
                  className="mx-auto w-full object-cover rounded duration-300 border-zinc-900 border-8 max-w-[100vw] sm:max-w-[80vw] md:max-w-[33vw] lg:max-w-[25vw] group-hover:scale-105"
                />
                <button onClick={toggleDetails} className="absolute top-0 right-0 p-2">
                  <div style={{ transform: `rotate(${showDetails ? '135deg' : '0deg'})`, transition: 'transform 0.3s ease' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-plus" viewBox="0 0 16 16">
                      <path fillRule="evenodd" d="M8 3.5a.5.5 0 0 1 .5.5v4.5h4.5a.5.5 0 0 1 0 1H8.5v4.5a.5.5 0 0 1-1 0V9.5H3a.5.5 0 0 1 0-1h4.5V4a.5.5 0 0 1 .5-.5z"/>
                    </svg>
                  </div>
                </button>
              </div>
            ) : (
              <div className="w-full h-48 bg-avax-black flex items-center justify-center rounded">
                No Image Available
              </div>
            )}
          </div>

          <h2 className="font-bold text-lg xl:text-2xl mt-2 text-center pt-8">{name || "Unnamed Piece"}</h2>
          <h2 className="font-bold text-lg mt-2 text-center pb-2">{`Contributor: ${contributor || "None"}`}</h2>
          {creator && (
            <h2 className="font-bold text-lg mt-2 text-center pb-8">
              Creator: <a href={`https://snowscan.xyz/address/${creator}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{formattedCreator}</a>
            </h2>
          )}

          <div className="flex items-center justify-end mt-2 space-x-2 pb-4 sm:pr-6 lg:pr-6 xl:pr-4 2xl:pr-3">
            <div className="pr-2"><p className="text-gray-600 text-lg font-bold pl-4">{likes}</p></div>
            <button
              onClick={handleLike}
              className={`bg-avax-red hover:opacity-100 text-white px-2 py-1 rounded ${hasLiked ? 'bg-avax-red opacity-100' : 'opacity-50'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="25" height="25" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </button>
            <div className="pl-4">
              <button onClick={handleBookmark} className={`bg-avax-red hover:opacity-100 text-white px-2 py-1 rounded ${hasBookmarked ? 'bg-avax-red opacity-100' : 'opacity-50'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="25" height="25" fill="currentColor">
                  <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z"/>
                </svg>
              </button>
            </div>
            <div className="pl-4">
              <button onClick={copyLinkToClipboard} className="bg-avax-red text-white pl-2 pr-2 py-1 rounded hover:bg-red-600">
                <svg
                  fill="currentColor"
                  width="25"
                  height="25"
                  viewBox="0 0 32 32"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <style>{'.cls-1 { fill: none; }'}</style>
                  </defs>
                  <path d="M11.9474,19a4.9476,4.9476,0,0,1-3.4991-8.4465l5.1053-5.1043a4.9482,4.9482,0,0,1,6.9981,6.9976l-.5523.5526-1.4158-1.4129.5577-.5579a2.95,2.95,0,0,0-.0039-4.1653,3.02,3.02,0,0,0-4.17,0l-5.1047,5.104a2.9474,2.9474,0,0,0,0,4.1692,3.02,3.02,0,0,0,4.17,0l1.4143,1.4145A4.9176,4.9176,0,0,1,11.9474,19Z" />
                  <path d="M19.9474,17a4.9476,4.9476,0,0,1-3.4991-8.4465l.5526-.5526,1.4143-1.4146-.5526.5523a2.9476,2.9476,0,0,0,0,4.1689,3.02,3.02,0,0,0,4.17,0c.26-.26,4.7293-4.7293,5.1053-5.1045a2.951,2.951,0,0,0,0-4.1687,3.02,3.02,0,0,0-4.17,0L21.5536,3.449a4.9483,4.9483,0,0,1,6.9981,6.9978c-.3765.376-4.844,4.8428-5.1038,5.1035A4.9193,4.9193,0,0,1,19.9474,17Z" />
                  <path d="M24,30H4a2.0021,2.0021,0,0,1-2-2V8A2.0021,2.0021,0,0,1,4,6H8V8H4V28H24V18h2V28A2.0021,2.0021,0,0,1,24,30Z" />
                  <rect id="Transparent_Rectangle" width="32" height="32" fill="none" />
                </svg>
              </button>
            </div>
            {/*<div className="pl-4">
              <button onClick={refreshMetadata} className="bg-avax-red text-white pl-2 pr-2 py-1 rounded hover:bg-red-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  width="25"
                  height="25"
                  viewBox="0 0 32 32"
                >
                  <path d="M 15 3 C 12.031398 3 9.3028202 4.0834384 7.2070312 5.875 A 1.0001 1.0001 0 1 0 8.5058594 7.3945312 C 10.25407 5.9000929 12.516602 5 15 5 C 20.19656 5 24.450989 8.9379267 24.951172 14 L 22 14 L 26 20 L 30 14 L 26.949219 14 C 26.437925 7.8516588 21.277839 3 15 3 z M 4 10 L 0 16 L 3.0507812 16 C 3.562075 22.148341 8.7221607 27 15 27 C 17.968602 27 20.69718 25.916562 22.792969 24.125 A 1.0001 1.0001 0 1 0 21.494141 22.605469 C 19.74593 24.099907 17.483398 25 15 25 C 9.80344 25 5.5490109 21.062074 5.0488281 16 L 8 16 L 4 10 z" fill="white"></path>
                </svg>
              </button>
            </div>*/}
          </div>
          {showTipInputs && (
            <>
              <div className="pb-4">
                <input
                  type="number"
                  placeholder="Tip Amount"
                  disabled={!account}
                  value={tipAmount}
                  onChange={(e) => setTipAmount(e.target.value)}
                  className={`shadow appearance-none border rounded py-2 px-3 bg-neutral-800 border-neutral-700 text-gray-100 leading-tight focus:outline-none focus:shadow-outline ${showDetails ? "w-96" : "w-full"}`}
                />
              </div>
              <select
                value={selectedToken}
                onChange={(e) => setSelectedToken(e.target.value)}
                disabled={!account}
                className={`shadow border rounded py-2 px-3 text-gray-100 bg-neutral-700 border-neutral-800 leading-tight focus:outline-none ${account ? 'opacity-100' : 'opacity-50 cursor-not-allowed'} ${showDetails ? "w-96" : "w-full"}`}
              >
                {availableTokens.map((token, index) => (
                  <option key={index} value={token.symbol}>{token.symbol}</option>
                ))}
              </select>
              <div className="pt-4">
                <button onClick={handleTip} className={`bg-neutral-800 ${showDetails ? "w-96" : "w-full"} hover:bg-avax-red duration-300 text-white px-3 py-1 rounded`}>
                  Submit Tip
                </button>
              </div>
            </>
          )}
          <div className="pt-4">
            <button onClick={toggleTipInputs} className={`bg-neutral-800 ${showDetails ? "w-96" : "w-full"} hover:bg-avax-red duration-300 text-white px-3 py-1 rounded`}>
              {showTipInputs ? "Hide Tipping" : "Tip Piece Holder"}
            </button>
          </div>
          <div className="pt-4">
            <button onClick={toggleDetails} className={`bg-neutral-800 ${showDetails ? "w-96" : "w-full"} hover:bg-avax-red duration-300 text-white px-3 py-1 rounded`}>
              {showDetails ? "Hide Piece" : "View Piece"}
            </button>
            {/* Comments Section */}
           
          </div>
          {showDetails && (
            <div className="grid grid-cols-2 gap-4 p-4">
              <div className="col-span-2 bg-zinc-800 text-avax-white rounded p-2 drop-shadow-md mb-2 text-sm md:text-base xl:text-lg sm:pb-36 md:pb-0">
                <ReactQuill value={content} readOnly={true} theme="bubble" />
              </div>
         
            </div>
          )}
        </>
      )}
      <div className="text-gray-600 text-xs pt-4">{finalTokenId}</div>
    </div>
  );
};

export default NFTCard;
