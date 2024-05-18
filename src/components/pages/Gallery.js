import React, { useState, useEffect } from "react";
import NFTCard from "./NFTCard";
import { ethers, Contract } from "ethers";
import { AVAXCOOKSLIKESANDTIPS_ABI, AVAXCOOKSLIKESANDTIPS_ADDRESS } from '../Contracts/AvaxCooksLikeAndTip';
import logo from "../../assets/iprs_spot.png";
import { useLocation } from 'react-router-dom';

const Gallery = ({ account }) => {
  const [allTokens, setAllTokens] = useState([]);
  const [displayTokens, setDisplayTokens] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageToken, setPageToken] = useState(null);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [mealType, setMealType] = useState('all');
  const [sortLikes, setSortLikes] = useState(false);
  const [likes, setLikes] = useState(0);
  const [community, setCommunity] = useState('All Communities');
  const [searchText1, setSearchText1] = useState('');
  const [searchText2, setSearchText2] = useState('');
  const [searchText3, setSearchText3] = useState('');
  const [sortTips, setSortTips] = useState(false);
  const [tipsData, setTipsData] = useState({});
  const [expandedTokenId, setExpandedTokenId] = useState(null);
  const shuffleArray = (array) => {
    const shuffledArray = array.slice();
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
  };

  const [shuffledTokens, setShuffledTokens] = useState([]);

  useEffect(() => {
    setShuffledTokens(shuffleArray(displayTokens));
  }, [displayTokens]);

  const location = useLocation();

  const toggleSortTips = () => {
    setSortTips(!sortTips);
  };

  const handleTipsFetch = (tokenId, tips) => {
    setTipsData(prev => ({ ...prev, [tokenId]: tips }));
  };

  const fetchItems = async () => {
    if (loading) return;
    setLoading(true);

    const pageTokenParam = pageToken ? `&pageToken=${pageToken}` : "";
    const url = `https://glacier-api.avax.network/v1/chains/43114/nfts/collections/0x568863597b44AA509a45C15eE3Cab3150a562d32/tokens?pageSize=100${pageTokenParam}`;
    const options = { method: "GET", headers: { accept: "application/json" } };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      if (response.ok && Array.isArray(data.tokens)) {
        setTokens((prevTokens) => [...prevTokens, ...data.tokens]);
        setPageToken(data.nextPageToken); 
        setAllTokens(data.tokens);
        setDisplayTokens(data.tokens);
      } else {
        throw new Error(data.message || "Error fetching data");
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const toggleSortLikes = () => {
    setSortLikes(!sortLikes);
  };

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
      }
    } catch (error) {
      console.error("Error fetching likes count or checking liked status:", error);
    }
  };

  useEffect(() => {
    fetchLikesAndCheckLiked();
  }, [account]);

  useEffect(() => {
    filterAndSortTokens();
  }, [mealType, allTokens, sortLikes, community, searchText1, searchText2, searchText3, sortTips]);

  const filterAndSortTokens = () => {
    let filteredTokens = allTokens.filter(token => token.metadata && token.metadata.attributes);

    if (mealType !== 'all') {
      filteredTokens = filteredTokens.filter(token => {
        try {
          const attributes = JSON.parse(token.metadata.attributes);
          return attributes.some(attr => attr.trait_type === "Category" && attr.value === mealType);
        } catch (error) {
          console.error("Error parsing attributes:", error);
          return false;
        }
      });
    }

    if (community !== 'All Communities') {
      filteredTokens = filteredTokens.filter(token => {
        try {
          const attributes = JSON.parse(token.metadata.attributes);
          return attributes.some(attr => attr.trait_type === "Community Tag" && attr.value === community);
        } catch (error) {
          console.error("Error parsing attributes:", error);
          return false;
        }
      });
    }

    const searchTerms = [searchText1, searchText2, searchText3].filter(text => text.trim() !== '');

    if (searchTerms.length > 0) {
      filteredTokens = filteredTokens.filter(token => {
        try {
          const attributes = JSON.parse(token.metadata.attributes);
          return searchTerms.every(term =>
            attributes.some(attr => attr.value.toLowerCase().includes(term.toLowerCase()))
          );
        } catch (error) {
          console.error("Error parsing attributes:", error);
          return false;
        }
      });
    }

    if (sortLikes) {
      filteredTokens = filteredTokens.slice().sort((a, b) => b.likes - a.likes);
    }

    if (sortTips) {
      filteredTokens = filteredTokens.slice().sort((a, b) => {
        const tipsA = Object.values(tipsData[a.tokenId] || {}).reduce((acc, val) => acc + parseFloat(val), 0);
        const tipsB = Object.values(tipsData[b.tokenId] || {}).reduce((acc, val) => acc + parseFloat(val), 0);
        return tipsB - tipsA;
      });
    }

    setDisplayTokens(filteredTokens);
  };

  const toggleBookmarks = () => {
    setShowBookmarks(!showBookmarks);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenId = params.get("tokenId");
    if (tokenId) {
      setExpandedTokenId(tokenId);
    }
  }, [location]);

  return (
    <div className="container mx-auto p-4 pt-8 md:pt-4">
      <div className="mx-auto w-72 h-72 pointer-events-none block md:hidden pb-8">
        <img src={logo} alt="Logo" />
      </div>
      <h1 className="text-6xl pb-16 pt-8 font-bold mb-4 text-avax-white">Browse Recipes</h1>
      <div className="py-0 md:pb-0 md:py-0 mx-auto">
        {/* Search Inputs */}
        <div className="flex flex-col md:flex-row items-center justify-center w-full space-y-2 md:space-y-0 mt-2 pb-2">
          <div className="flex-1 w-full md:pr-2">
            <input
              type="text"
              value={searchText1}
              onChange={(e) => setSearchText1(e.target.value)}
              placeholder="Search ingredient 1..."
              className="border text-gray-200 bg-zinc-700 border-zinc-800 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            />
          </div>
          <div className="flex-1 w-full md:px-2">
            <input
              type="text"
              value={searchText2}
              onChange={(e) => setSearchText2(e.target.value)}
              placeholder="Search ingredient 2..."
              className="border text-gray-200 bg-zinc-700 border-zinc-800 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            />
          </div>
          <div className="flex-1 w-full md:pl-2">
            <input
              type="text"
              value={searchText3}
              onChange={(e) => setSearchText3(e.target.value)}
              placeholder="Search ingredient 3..."
              className="border text-gray-200 bg-zinc-700 border-zinc-800 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            />
          </div>
        </div>
      </div>
      <div className="mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-center w-full space-y-2 md:space-y-0 md:mt-2 pb-20">
        <div className="flex-1 w-full md:pr-2">
          <select
            className="bg-zinc-700 border-zinc-800 text-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
          >
            <option value="all">All Meals</option>
            <option value="Breakfast">Breakfast</option>
            <option value="Lunch">Lunch</option>
            <option value="Dinner">Dinner</option>
            <option value="Desserts">Desserts</option>
            <option value="Snacks">Snacks</option>
          </select>
        </div>

        <div className="flex-1 w-full md:px-2">
          <select
            className="bg-zinc-700 border-zinc-800 text-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            value={community}
            onChange={(e) => setCommunity(e.target.value)}
          >
            <option value="All Communities">All Communities</option>
            <option value="Avax Apes">Avax Apes</option>
            <option value="Cuddlefish">Cuddlefish</option>
            <option value="Kingshit">Kingshit</option>
            <option value="Steady">Steady</option>
            <option value="The Spot">The Spot</option>
            <option value="The Arena">The Arena</option>
            <option value="No Chill">No Chill</option>
            <option value="Cozyverse">Cozyverse</option>
            <option value="Quirkies">Quirkies</option>
            <option value="Creature World">Creature World</option>
          </select>
        </div>

        <div className="flex-1 w-full md:pl-2">
          <button
            onClick={toggleBookmarks}
            className="bg-avax-red text-black hover:text-white font-bold py-2 px-4 rounded-lg w-full"
          >
            {showBookmarks ? "Show All" : "Show Bookmarked"}
          </button>
        </div>
      </div></div>

      <div className="">
        <div className="relative flex flex-wrap justify-center z-10 opacity-95 col-span-3">
          {shuffledTokens.slice().reverse().map((token, index) => (
            <NFTCard
              key={index}
              token={token}
              account={account}
              showBookmarks={showBookmarks}
              onTipsFetch={handleTipsFetch}
              expanded={expandedTokenId === token.tokenId} // Pass the expanded state
            />
          ))}
        </div>
      </div>
      {loading && <p>Loading...</p>}
      
      <div className="fixed bottom-20 left-10 w-96 h-96 pointer-events-none z-0 hidden md:block opacity-100">
        <img src={logo} alt="Logo" />
      </div>
    </div>
  );
};

export default Gallery;
