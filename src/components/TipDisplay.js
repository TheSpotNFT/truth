import React, { useEffect, useState } from "react";
import { ethers, Contract } from "ethers";
import { AVAXCOOKSLIKESANDTIPS_ABI, AVAXCOOKSLIKESANDTIPS_ADDRESS } from "../components/Contracts/AvaxCooksLikeAndTip";
import { DOTFIRE_ABI, DOTFIRE_ADDRESS } from "../components/Contracts/DotFire";
import AVVY from '@avvy/client';

const TipDisplay = ({ displayTokens }) => {
  const [tips, setTips] = useState([]);

  // Mapping of token addresses to their symbols
  const tokenMap = {
    "0x420FcA0121DC28039145009570975747295f2329": "COQ",
    "0xAcFb898Cff266E53278cC0124fC2C7C94C8cB9a5": "NOCHILL",
    "0x8aD25B0083C9879942A64f00F20a70D3278f6187": "MEOW",
    "0x05B0Def5c00bA371683D7035934BcF82B737C364": "KINGSHIT.X",
    "0xEbB5d4959B2FbA6318FbDa7d03cd44aE771fc999": "KONG"
  };

  const getUsername = async (address) => {
    if (!address) return address;

    const { ethereum } = window;
    if (!ethereum) return address;

    const provider = new ethers.providers.Web3Provider(ethereum);

    try {
      const avvy = new AVVY(provider);

      // First, check for .avax domain
      try {
        const avvyUsername = await avvy.name(address).reverse(AVVY.RECORDS.EVM);
        if (avvyUsername) {
          return avvyUsername;
        }
      } catch (avvyError) {
        console.error(`AVVY error for address ${address}:`, avvyError);
      }

      // If .avax lookup fails or no username, check for .fire domain
      try {
        const dotfireContract = new Contract(DOTFIRE_ADDRESS, DOTFIRE_ABI, provider);
        const dotfireUsername = await dotfireContract.usernameFor(address);
        if (dotfireUsername) {
          return dotfireUsername;
        }
      } catch (dotfireError) {
        console.error(`DOTFIRE error for address ${address}:`, dotfireError);
      }

      // If no username found, return the address
      return address;
    } catch (error) {
      console.error(`Error fetching username for address ${address}:`, error);
      return address;
    }
  };

  useEffect(() => {
    const fetchEvents = async () => {
      const { ethereum } = window;
      if (!ethereum) return;

      const provider = new ethers.providers.Web3Provider(ethereum);
      const contract = new Contract(AVAXCOOKSLIKESANDTIPS_ADDRESS, AVAXCOOKSLIKESANDTIPS_ABI, provider);

      // Create a map of token IDs to token names
      const tokenMap2 = displayTokens.reduce((acc, token) => {
        acc[token.tokenId] = token.metadata.name || "Unnamed NFT";
        return acc;
      }, {});

      const currentBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(currentBlock - 2000, 0);

      const eventFilter = contract.filters.Tip();
      const logs = await provider.getLogs({
        ...eventFilter,
        fromBlock,
        toBlock: 'latest'
      });

      const events = await Promise.all(logs.map(async log => {
        const parsedLog = contract.interface.parseLog(log);
        const tokenSymbol = tokenMap[parsedLog.args.token] || 'Unknown Token';
        const nftName = tokenMap2[parsedLog.args.tokenId.toString()] || `Token #${parsedLog.args.tokenId}`;

        const fromUsername = await getUsername(parsedLog.args.from);
        const toUsername = await getUsername(parsedLog.args.to);

        return `${fromUsername} tipped ${toUsername} ${ethers.utils.formatEther(parsedLog.args.amount)} of ${tokenSymbol} for ${nftName}`;
      }));

      setTips(events.slice(-20).reverse());

      const onNewTip = async (from, to, token, amount, tokenId) => {
        const formattedAmount = ethers.utils.formatEther(amount);
        const tokenSymbol = tokenMap[token] || 'Unknown Token';
        const nftName = tokenMap2[tokenId] || `Token #${tokenId}`;

        const fromUsername = await getUsername(from);
        const toUsername = await getUsername(to);

        const newTip = `${fromUsername} tipped ${toUsername} ${formattedAmount} of ${tokenSymbol} for ${nftName}`;
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
    <div className="z-10 relative mx-auto bg-white p-4 border border-gray-300 rounded-lg w-96 pr-2 max-h-96 overflow-y-auto shadow-lg opacity-90">
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
