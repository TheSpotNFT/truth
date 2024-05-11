import React, { useState, useEffect } from "react";
import { ethers, Contract } from "ethers";
import { AVAXCOOKSLIKESANDTIPS_ABI, AVAXCOOKSLIKESANDTIPS_ADDRESS } from "../Contracts/AvaxCooksLikeAndTip";

const NFTCard = ({ token, account, showBookmarks }) => {
 
  const { metadata, tokenId } = token;
  const { name, imageUri, attributes: attributesStr } = metadata || {};
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [tipAmount, setTipAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState("NOCHILL");

  const availableTokens = [
    { symbol: "COQ", address: "0x420FcA0121DC28039145009570975747295f2329" },
    { symbol: "NOCHILL", address: "0xAcFb898Cff266E53278cC0124fC2C7C94C8cB9a5" },
    { symbol: "MEOW", address: "0x8aD25B0083C9879942A64f00F20a70D3278f6187" },
  ];

  let attributes = [];
  try {
    attributes = JSON.parse(attributesStr);
  } catch (e) {
    console.error("Failed to parse attributes", e);
  }

    // Find the contributor value from the parsed attributes array
    const contributorObj = attributes.find(attr => attr.trait_type === "Contributor");
    const contributor = contributorObj ? contributorObj.value : "Unknown";

  // Function to fetch likes count and check if the current user has liked this token
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
        
        // Fetch likes count
        const count = await contract.likes(tokenId);
        setLikes(parseInt(count.toString(), 10));

        // Check if the current user has liked the token
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
      fetchBookmarkStatus();  // Refresh bookmark status after toggling
    } catch (error) {
      console.error("Error toggling bookmark state:", error);
    }
  };
  

  const [hasBookmarked, setHasBookmarked] = useState(false);

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
  
  }, [account]); // Re-fetch when tokenId or account changes
  

  // Function to like or unlike a token
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

        // Toggle the like state
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
  
      // Convert the tip amount to a big number
      const amountWei = ethers.utils.parseEther(amount);
  
      // Check the current allowance for the tipping contract
      const currentAllowance = await tokenContract.allowance(signerAddress, AVAXCOOKSLIKESANDTIPS_ADDRESS);
      console.log(`Current allowance: ${currentAllowance.toString()}`);
      console.log(`Amount Wei: ${amountWei.toString()}`);
  
      if (currentAllowance.lt(amountWei)) {
        // Approve the tipping contract to spend the required amount
        console.log(`Approving ${amountWei.toString()} for tipping contract.`);
        const approveTx = await tokenContract.approve(AVAXCOOKSLIKESANDTIPS_ADDRESS, amountWei);
        await approveTx.wait();
      } else {
        console.log("Approval not required, already enough allowance.");
      }
  
      // Perform the tipping transaction
      console.log(`Sending tip: ${amountWei.toString()} to token ${tokenId}`);
      const tipTx = await contract.tip(tokenId, tokenAddress, amountWei);
      await tipTx.wait();
      console.log("Tip transaction complete.");
    } catch (error) {
      console.error("Error performing tip:", error);
    }
  };
  
  
  // Fetch likes count and liked status when the component mounts
  useEffect(() => {
    fetchLikesAndCheckLiked(tokenId);
  }, [account]);

  // Handle Like button click
  const handleLike = () => {
    onLike(tokenId);
  };

  const handleTip = () => {
    // Find the selected token data from the available tokens list
    const tokenData = availableTokens.find((token) => token.symbol === selectedToken);
  
    // Check if the token data was found
    if (!tokenData) {
      console.error(`Token data not found for symbol: ${selectedToken}`);
      return;
    }
  
    // Ensure a tip amount is entered
    if (!tipAmount || tipAmount === "0") {
      console.error("Tip amount is missing or zero");
      return;
    }
  
    // Log the data and proceed with the tipping transaction
    console.log("Tipping...", tokenId, tokenData.address, tipAmount);
    onTip(tokenId, tokenData.address, tipAmount);
  };
  
  const handleBookmark = () => {
    onBookmark(tokenId);
  };

  return (
    <div className={`border p-4 m-2 shadow-md rounded-lg bg-avax-white w-96 ${showBookmarks ? (hasBookmarked ? 'block' : 'hidden') : 'block'}`}>
      {/* Display the imageUri if it exists */}
      <div className="pt-4">
      {imageUri ? (
        <img
          src={`https://gateway.pinata.cloud/ipfs/${imageUri.split("ipfs://")[1]}`}
          alt={name}
          className="mx-auto h-48 object-cover rounded"
          onClick={() => window.open(`https://campfire.exchange/collections/0x568863597b44AA509a45C15eE3Cab3150a562d32/${tokenId}`, '_blank')}
        />
      ) : (
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded">
          No Image Available
        </div>
      )}
</div>
      <h2 className="font-bold text-lg mt-2 text-center pt-8">{name || "Unnamed Recipe"}</h2>
      <h2 className="font-bold text-lg mt-2 text-center pb-8">{`Contributor: ${contributor || "None"}`}</h2>
      {/* Row for Like button and count */}
      <div className="flex items-center justify-end mt-2 space-x-2 pb-4">
        <button
          onClick={handleLike}
          className={`bg-avax-red hover:opacity-100 text-white px-2 py-1 rounded ${hasLiked ? 'bg-avax-red opacity-100' : 'opacity-50'}`}
        >
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="25" height="25" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
        </button>
        <p className="text-gray-600 text-lg font-bold pl-4">{likes}</p>
        <div className="pl-4"><button onClick={handleBookmark} className={`bg-avax-red hover:opacity-100 text-white px-2 py-1 rounded ${hasBookmarked ? 'bg-avax-red opacity-100' : 'opacity-50'}`}>
        {/* Simple bookmark icon */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="25" height="25" fill="currentColor">
    <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z"/>
</svg>
      </button></div>
      </div>

      {/* Tip Amount Input */}
      <div className="pb-4"><input
        type="number"
        placeholder="Tip Amount"
        value={tipAmount}
        onChange={(e) => setTipAmount(e.target.value)}
        className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-full"
      /></div>

      {/* Token Selection Dropdown */}
      <select
        value={selectedToken}
        onChange={(e) => setSelectedToken(e.target.value)}
        className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      >
        {availableTokens.map((token, index) => (
          <option key={index} value={token.symbol}>
            {token.symbol}
          </option>
        ))}
      </select>
      <div className="pt-4">
        {/* Tip button */}
        <button onClick={handleTip} className="bg-gray-800 w-full hover:bg-blue-600 text-white px-3 py-1 rounded">
          Tip Recipe Holder
        </button>
      </div>
    </div>
  );
};

export default NFTCard;
