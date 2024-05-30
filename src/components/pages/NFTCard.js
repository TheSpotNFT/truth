import React, { useState, useEffect } from "react";
import { ethers, Contract } from "ethers";
import { AVAXCOOKSLIKESANDTIPS_ABI, AVAXCOOKSLIKESANDTIPS_ADDRESS } from "../Contracts/AvaxCooksLikeAndTip";
import { InlineShareButtons } from 'sharethis-reactjs';
import CommentSection from "../CommentSection";

const NFTCard = ({ token, account, showBookmarks, galleryLikes, onTipsFetch, expanded, viewMode }) => {
  const { metadata, tokenId } = token;
  const { name, imageUri, attributes: attributesStr } = metadata || {};
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [tipAmount, setTipAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState("NOCHILL");
  const [showDetails, setShowDetails] = useState(false);
  const [showTipInputs, setShowTipInputs] = useState(false);
  const [totalTips, setTotalTips] = useState({});
  const [hasBookmarked, setHasBookmarked] = useState(false);

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const toggleTipInputs = () => {
    setShowTipInputs(!showTipInputs);
  };

  useEffect(() => {
    setShowDetails(expanded);
  }, [expanded]);

  const availableTokens = [
    { symbol: "COQ", address: "0x420FcA0121DC28039145009570975747295f2329" },
    { symbol: "NOCHILL", address: "0xAcFb898Cff266E53278cC0124fC2C7C94C8cB9a5" },
    { symbol: "MEOW", address: "0x8aD25B0083C9879942A64f00F20a70D3278f6187" },
    { symbol: "KINGSHIT.X", address: "0x05B0Def5c00bA371683D7035934BcF82B737C364" },
    { symbol: "KONG", address: "0xEbB5d4959B2FbA6318FbDa7d03cd44aE771fc999" },
  ];

  let attributes = [];
  try {
    attributes = JSON.parse(attributesStr);
  } catch (e) {
    console.error("Failed to parse attributes", e);
  }

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
        AVAXCOOKSLIKESANDTIPS_ADDRESS,
        AVAXCOOKSLIKESANDTIPS_ABI,
        signer
      );

      let tips = {};
      for (const token of availableTokens) {
        const tipDetails = await contract.getTipsForToken(tokenId, token.address);
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
  }, [tokenId, account]);

  const contributorObj = attributes.find(attr => attr.trait_type === "Contributor");
  const contributor = contributorObj ? contributorObj.value : "Unknown";

  const fetchLikesAndCheckLiked = async (tokenId) => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new Contract(
          AVAXCOOKSLIKESANDTIPS_ADDRESS,
          AVAXCOOKSLIKESANDTIPS_ABI,
          signer
        );

        const count = await contract.likes(tokenId);
        setLikes(parseInt(count.toString(), 10));

        const liked = await contract.hasLiked(tokenId, account);
        setHasLiked(liked);
      }
    } catch (error) {
      console.error("Error fetching likes count or checking liked status:", error);
    }
  };

  const onBookmark = async (tokenId) => {
    try {
      const { ethereum } = window;
      if (!ethereum) return;

      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const contract = new Contract(
        AVAXCOOKSLIKESANDTIPS_ADDRESS,
        AVAXCOOKSLIKESANDTIPS_ABI,
        signer
      );

      const tx = await contract.bookmark(tokenId);
      await tx.wait();
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
        AVAXCOOKSLIKESANDTIPS_ADDRESS,
        AVAXCOOKSLIKESANDTIPS_ABI,
        signer
      );

      const bookmarked = await contract.hasBookmarked(tokenId, account);
      setHasBookmarked(bookmarked);
    } catch (error) {
      console.error("Error fetching bookmark status:", error);
    }
  };

  useEffect(() => {
    fetchBookmarkStatus();
  }, [account]);

  const onLike = async (tokenId) => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new Contract(
          AVAXCOOKSLIKESANDTIPS_ADDRESS,
          AVAXCOOKSLIKESANDTIPS_ABI,
          signer
        );

        const tx = await contract.like(tokenId);
        await tx.wait();
        fetchLikesAndCheckLiked(tokenId);
      }
    } catch (error) {
      console.error("Error toggling like state:", error);
    }
  };

  const onTip = async (tokenId, tokenAddress, amount) => {
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
        AVAXCOOKSLIKESANDTIPS_ADDRESS,
        AVAXCOOKSLIKESANDTIPS_ABI,
        signer
      );

      const amountWei = ethers.utils.parseEther(amount);

      const currentAllowance = await tokenContract.allowance(signerAddress, AVAXCOOKSLIKESANDTIPS_ADDRESS);
      if (currentAllowance.lt(amountWei)) {
        const approveTx = await tokenContract.approve(AVAXCOOKSLIKESANDTIPS_ADDRESS, amountWei);
        await approveTx.wait();
      }

      const tipTx = await contract.tip(tokenId, tokenAddress, amountWei);
      await tipTx.wait();
    } catch (error) {
      console.error("Error performing tip:", error);
    }
  };

  useEffect(() => {
    fetchLikesAndCheckLiked(tokenId);
  }, [account]);

  const handleLike = () => {
    onLike(tokenId);
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

    onTip(tokenId, tokenData.address, tipAmount);
  };

  const handleBookmark = () => {
    onBookmark(tokenId);
  };

  const copyLinkToClipboard = () => {
    if (!name) {
      console.error("Recipe name not found");
      return;
    }
    const recipeName = name.replace(/\s+/g, '_'); // Replace spaces with underscores
    const link = `${window.location.origin}/?recipeName=${recipeName}`;
    navigator.clipboard.writeText(link).then(() => {
      alert("Link copied to clipboard!");
    }).catch(err => {
      console.error("Failed to copy link: ", err);
    });
  };

  return (
    <div className={`text-white border pr-4 pl-4 pb-4 pt-2 m-2 shadow-md rounded-lg bg-neutral-900 border-neutral-900 transition-all duration-300 ease-in-out ${showDetails ? 'fixed inset-0 z-50 h-screen overflow-y-auto pt-36' : (viewMode === 'list' ? 'w-full lg:w-full' : 'w-full lg:w-1/4 2xl:w-1/6')} ${showBookmarks ? (hasBookmarked ? 'block' : 'hidden') : 'block'}`}>
      {viewMode === 'list' ? (
        <div className="flex items-center bg-neutral-700 p-4 rounded-lg">
          <div className="w-1/12 text-left">
            <img src={`https://gateway.pinata.cloud/ipfs/${imageUri.split("ipfs://")[1]}`} alt={name} className="w-full h-auto max-h-24 object-contain" />
          </div>
          <div className="w-1/3 flex items-center justify-between pl-4">
            <span className="text-left">{name}</span>
            <button onClick={toggleDetails} className="bg-neutral-800 text-white rounded px-4 py-2">View Recipe</button>
          </div>
          <div className="w-1/3 flex items-center justify-between pl-4">
            <span className="text-left">{contributor}</span>
            <button onClick={toggleTipInputs} className="bg-avax-red text-white rounded px-4 py-2 hover:bg-red-800">Tip</button>
          </div>
        </div>
      ) : (
        <>
          <div className="relative pt-4">
            {imageUri ? (
              <div className="relative group">
                <img
                  src={`https://gateway.pinata.cloud/ipfs/${imageUri.split("ipfs://")[1]}`}
                  alt={name}
                  onClick={toggleDetails}
                  className="mx-auto w-full object-cover rounded duration-300 border-zinc-900 border-8 max-w-[100vw] sm:max-w-[80vw] md:max-w-[50vw] lg:max-w-[33vw] group-hover:scale-105"
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

          <h2 className="font-bold text-lg xl:text-2xl mt-2 text-center pt-8">{name || "Unnamed Recipe"}</h2>
          <h2 className="font-bold text-lg mt-2 text-center pb-8">{`Contributor: ${contributor || "None"}`}</h2>

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
                  <path d="M19.9474,17a4.9476,4.9476,0,0,1-3.4991-8.4465l.5526-.5526,1.4143,1.4146-.5526.5523a2.9476,2.9476,0,0,0,0,4.1689,3.02,3.02,0,0,0,4.17,0c.26-.26,4.7293-4.7293,5.1053-5.1045a2.951,2.951,0,0,0,0-4.1687,3.02,3.02,0,0,0-4.17,0L21.5536,3.449a4.9483,4.9483,0,0,1,6.9981,6.9978c-.3765.376-4.844,4.8428-5.1038,5.1035A4.9193,4.9193,0,0,1,19.9474,17Z" />
                  <path d="M24,30H4a2.0021,2.0021,0,0,1-2-2V8A2.0021,2.0021,0,0,1,4,6H8V8H4V28H24V18h2V28A2.0021,2.0021,0,0,1,24,30Z" />
                  <rect id="Transparent_Rectangle" width="32" height="32" fill="none" />
                </svg>
              </button>
            </div>
          </div>
          {/* Add ShareThis Inline Share Buttons */}
          <div className="pt-2">
            <InlineShareButtons
              config={{
                alignment: 'center',  // alignment of buttons (left, center, right)
                color: 'social',      // set the color of buttons (social, white)
                enabled: true,        // show/hide buttons (true, false)
                font_size: 16,        // font size for the buttons
                labels: 'cta',        // button labels (cta, counts, null)
                language: 'en',       // which language to use (see LANGUAGES)
                networks: [           // which networks to include (see SHARING NETWORKS)
                  'twitter',
                  'facebook',
                  'pinterest'
                ],
                padding: 12,          // padding within buttons (INTEGER)
                radius: 4,            // the corner radius on each button (INTEGER)
                show_total: false,
                size: 40,             // the size of each button (INTEGER)
                url: `${window.location.origin}/?recipeName=${name ? name.replace(/\s+/g, '_') : tokenId}`, // Use the recipe name or tokenId as the URL
                image: `https://gateway.pinata.cloud/ipfs/${imageUri?.split("ipfs://")[1]}`,  // Use the NFT image URL
                description: `Check out this amazing recipe: ${name}`,  // Use the recipe name as the description
                title: name,            // Use the recipe name as the title
              }}
            />
          </div>
          <div className="pt-0 pb-4 pl-2 pr-2 ">
            {Object.entries(totalTips).some(([symbol, amount]) => parseFloat(amount) > 0) && (
              <h3 className="text-lg font-semibold mb-2">Tips</h3>
            )}
            {Object.entries(totalTips).map(([symbol, amount], index) => (
              parseFloat(amount) > 0 && (
                <div key={index} className="flex justify-between items-center py-1">
                  {amount} {`$${symbol}`}
                </div>
              )
            ))}
          </div>
          {showTipInputs && (
            <>
              <div className="pb-4"><input
                type="number"
                placeholder="Tip Amount"
                disabled={!account}
                value={tipAmount}
                onChange={(e) => setTipAmount(e.target.value)}
                className={`shadow appearance-none border rounded py-2 px-3 bg-neutral-800 border-neutral-700 text-gray-100 leading-tight focus:outline-none focus:shadow-outline ${showDetails ? "w-96" : "w-full"}`}
              /></div>
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
              {showTipInputs ? "Hide Tipping" : "Tip Recipe Holder"}
            </button>
          </div>
          <div className="pt-4">
            <button onClick={toggleDetails} className={`bg-neutral-800 ${showDetails ? "w-96" : "w-full"} hover:bg-avax-red duration-300 text-white px-3 py-1 rounded`}>
              {showDetails ? "Hide Recipe" : "View Recipe"}
            </button>
                {/* Comments Section */}
                <div className="w-full pt-4">
                <CommentSection erc721TokenId={token.tokenId} account={account} />
              </div>
          </div>
          {showDetails && (
            <div className="grid grid-cols-2 gap-4 p-4">
              <div className="col-span-1">
                {attributes.slice(0, -1).map((attr, index) => (
                  <div key={index} className="bg-zinc-800 text-avax-white rounded p-2 drop-shadow-md mb-2 text-sm md:text-base xl:text-lg">
                    <p>{attr.trait_type}: <strong>
                      {attr.trait_type === "X Username" ? 
                      <a href={`https://arena.social/${attr.value}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">{attr.value}</a> :
                        attr.value 
                      }</strong>
                    </p>
                  </div>
                ))}
              </div>
              <div className="col-span-1 flex flex-col justify-between">
                {attributes.length > 0 && (
                  <div className="bg-zinc-800 text-avax-white rounded p-2 drop-shadow-md h-full flex items-center justify-center text-sm md:text-base xl:text-lg">
                    <p>
                      <div>{attributes[attributes.length - 1].trait_type}</div>
                      <strong>
                        {attributes[attributes.length - 1].trait_type === "X Username" ? 
                          <a href={`https://twitter.com/${attributes[attributes.length - 1].value}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">{attributes[attributes.length - 1].value}</a> :
                          attributes[attributes.length - 1].value}
                      </strong>
                    </p>
                  </div>
                )}
              </div>
          
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NFTCard;
