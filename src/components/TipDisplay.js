import React, { useEffect, useState } from "react";
import { ethers, Contract } from "ethers";
import { AVAXCOOKSLIKESANDTIPS_ABI, AVAXCOOKSLIKESANDTIPS_ADDRESS } from "../components/Contracts/AvaxCooksLikeAndTip";
import { DOTFIRE_ABI, DOTFIRE_ADDRESS } from "../components/Contracts/DotFire";

const TipDisplay = ({displayTokens}) => {
  const [tips, setTips] = useState([]);

  // Mapping of token addresses to their symbols
  const tokenMap = {
    "0x420FcA0121DC28039145009570975747295f2329": "COQ",
    "0xAcFb898Cff266E53278cC0124fC2C7C94C8cB9a5": "NOCHILL",
    "0x8aD25B0083C9879942A64f00F20a70D3278f6187": "MEOW",
    "0x05B0Def5c00bA371683D7035934BcF82B737C364": "KINGSHIT.X"
  };

  useEffect(() => {
    const fetchEvents = async () => {
      const { ethereum } = window;
      const provider = new ethers.providers.Web3Provider(ethereum);
      const contract = new Contract(AVAXCOOKSLIKESANDTIPS_ADDRESS, AVAXCOOKSLIKESANDTIPS_ABI, provider);

         // Create a map of token IDs to token names
        const tokenMap2 = displayTokens.reduce((acc, token) => {
        // Assuming the tokenId and name are stored in the token object
        acc[token.tokenId] = token.metadata.name || "Unnamed NFT"; // Fallback to "Unnamed NFT" if no name is provided
  
        return acc;
      }, {});

      const currentBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(currentBlock - 2000, 0);  // Adjust based on your needs

      const eventFilter = contract.filters.Tip();
      const logs = await provider.getLogs({
        ...eventFilter,
        fromBlock,
        toBlock: 'latest'
      });

      const events = logs.map(log => {
        const parsedLog = contract.interface.parseLog(log);
        const tokenSymbol = tokenMap[parsedLog.args.token] || 'Unknown Token';  // Ensure parsedLog.args.token is indeed the token address
        const nftName = tokenMap2[parsedLog.args.tokenId.toString()] || `Token #${parsedLog.args.tokenId}`;
        return `${parsedLog.args.from} tipped ${parsedLog.args.to} ${ethers.utils.formatEther(parsedLog.args.amount)} of ${tokenSymbol} for ${nftName}`;
      }).slice(-20).reverse();  // Slice the last 20 and reverse to display newest at the top
      

      setTips(events);

      const onNewTip = (from, to, token, amount, tokenId) => {
        const formattedAmount = ethers.utils.formatEther(amount);
        const tokenSymbol = tokenMap[token] || 'Unknown Token';
        const nftName = tokenMap2[tokenId] || `Token #${tokenId}`;
        const newTip = `${from} tipped ${to} ${formattedAmount} of ${tokenSymbol} for ${nftName}`;
        setTips(prevTips => [newTip, ...prevTips.slice(0, 19)]);
      };

      contract.on(eventFilter, onNewTip);

      return () => {
        contract.removeListener(eventFilter, onNewTip);
      };
    };

    fetchEvents();
  }, [displayTokens]);

  return (
    <div className="fixed z-10 bottom-5 right-5 bg-white p-4 border border-gray-300 rounded-lg w-3/5 max-h-96 overflow-y-auto shadow-lg opacity-90">
      <h2 className="text-lg font-semibold">Tip Log</h2>
      <ul>
        {tips.map((tip, index) => (
          <li key={index} className="break-words">{tip}</li>
        ))}
      </ul>
    </div>
  );
};

export default TipDisplay;
