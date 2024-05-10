import React, { useState, useEffect } from "react";
import { ethers, Contract } from "ethers";
import { AVAXCOOKSLIKESANDTIPS_ABI, AVAXCOOKSLIKESANDTIPS_ADDRESS } from "../Contracts/AvaxCooksLikeAndTip";

const NFTCard = ({ token, account }) => {
  const { metadata, tokenId } = token;
  const { name, imageUri } = metadata || {};
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [tipAmount, setTipAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState("COQ");

  const availableTokens = [
    { symbol: "COQ", address: "0x420FcA0121DC28039145009570975747295f2329" },
    { symbol: "NOCHILL", address: "0xAcFb898Cff266E53278cC0124fC2C7C94C8cB9a5" },
    { symbol: "MEOW", address: "0x8aD25B0083C9879942A64f00F20a70D3278f6187" },
  ];

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
  }, [tokenId]);

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
  

  return (
    <div className="border p-4 m-2 shadow-md rounded-lg bg-avax-white w-96">
      {/* Display the imageUri if it exists */}
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

      <h2 className="font-bold text-lg mt-2 text-center">{name || "Unnamed Recipe"}</h2>

      {/* Row for Like button and count */}
      <div className="flex items-center justify-end mt-2 space-x-2 pb-4">
        <button
          onClick={handleLike}
          className="bg-avax-red hover:bg-red-800 text-white px-2 py-1 rounded"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            width="25"
            height="25"
            fill={hasLiked ? "black" : "white"}
          >
            <path d="M78.4,38.4c-0.8,0-1.6,0-2.4,0c-0.3-10.1-7.7-18.2-16.8-18.2c-7.3,0-13.6,4.9-16,11.7c-2.4-6.9-8.7-11.7-16-11.7
      c-9.1,0-16.5,8.1-16.8,18.2c-0.8,0-1.6,0-2.4,0C9.9,38.4,4,44.2,4,51.5c0,7.2,5.9,13.1,13.1,13.1H21v19.8c0,2.4,2,4.4,4.4,4.4
      h49.2c2.4,0,4.4-2,4.4-4.4V64.6h3.9c7.2,0,13.1-5.9,13.1-13.1C96,44.2,90.1,38.4,78.4,38.4z M70.6,73.3H29.4v-8.8h41.2V73.3z"/>
          </svg>
        </button>
        <p className="text-gray-600 text-lg font-bold pl-4">{likes}</p>
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
