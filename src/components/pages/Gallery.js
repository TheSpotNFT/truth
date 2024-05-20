import React, { useState, useEffect } from "react";
import NFTCard from "./NFTCard";
import { ethers, Contract } from "ethers";
import { AVAXCOOKSLIKESANDTIPS_ABI, AVAXCOOKSLIKESANDTIPS_ADDRESS } from '../Contracts/AvaxCooksLikeAndTip';
import logo from "../../assets/iprs_spot.png";
import logothin from "../../assets/iprs_thin.png";
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
  const [recipeNameSearch, setRecipeNameSearch] = useState('');
  const [contributorSearch, setContributorSearch] = useState(''); // New state variable
  const [sortOption, setSortOption] = useState('random'); // New state variable
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
        filterAndSortTokens(data.tokens); // Apply filter and sort on initial fetch
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
    filterAndSortTokens(allTokens);
  }, [mealType, community, searchText1, searchText2, searchText3, recipeNameSearch, contributorSearch, sortOption, sortLikes, sortTips]);

  const filterAndSortTokens = (tokens) => {
    let filteredTokens = tokens.filter(token => token.metadata && token.metadata.attributes);

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

    if (recipeNameSearch.trim() !== '') {
      filteredTokens = filteredTokens.filter(token => {
        try {
          const metadata = token.metadata;
          return metadata.name.toLowerCase().includes(recipeNameSearch.toLowerCase());
        } catch (error) {
          console.error("Error parsing metadata:", error);
          return false;
        }
      });
    }

    if (contributorSearch.trim() !== '') {
      filteredTokens = filteredTokens.filter(token => {
        try {
          const attributes = JSON.parse(token.metadata.attributes);
          return attributes.some(attr => attr.trait_type === "Contributor" && attr.value.toLowerCase().includes(contributorSearch.toLowerCase()));
        } catch (error) {
          console.error("Error parsing attributes:", error);
          return false;
        }
      });
    }

    switch (sortOption) {
      case 'likesDesc':
        filteredTokens.sort((a, b) => b.likes - a.likes);
        break;
      case 'tipsDesc':
        filteredTokens.sort((a, b) => {
          const tipsA = Object.values(tipsData[a.tokenId] || {}).reduce((acc, val) => acc + parseFloat(val), 0);
          const tipsB = Object.values(tipsData[b.tokenId] || {}).reduce((acc, val) => acc + parseFloat(val), 0);
          return tipsB - tipsA;
        });
        break;
      case 'newest':
        filteredTokens.sort((a, b) => a.tokenId - b.tokenId);
        break;
      case 'oldest':
        filteredTokens.sort((a, b) => b.tokenId - a.tokenId);
        break;
      case 'random':
      default:
        filteredTokens = shuffleArray(filteredTokens);
        break;
    }

    setDisplayTokens(filteredTokens);
  };

  const toggleBookmarks = () => {
    setShowBookmarks(!showBookmarks);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const recipeName = params.get("recipeName");
    if (recipeName) {
      const formattedName = recipeName.replace(/_/g, ' ');
      const token = allTokens.find(token => token.metadata && token.metadata.name === formattedName);
      if (token) {
        setExpandedTokenId(token.tokenId);
      }
    }
  }, [location, allTokens]);

  return (
    <div className="container mx-auto p-4 pt-0 md:pt-4">
      <div className="mx-auto w-64 h-64 pt-6 pointer-events-none block md:hidden pb-8">
        <img src={logothin} alt="Logo" />
      </div>
      <h1 className="text-6xl pb-8 pt-12 font-bold mb-4 text-neutral-800">Browse Recipes</h1>
      <div className="py-0 md:pb-0 md:py-0 lg:px-32 xl:px-48 mx-auto 2xl:px-32">
        {/* Search Inputs */}
        <div className="flex flex-col md:flex-row items-center justify-center w-full space-y-2 md:space-y-0 mt-2 pb-2">
          <div className="flex-1 w-full md:pr-2">
            <input
              type="text"
              value={recipeNameSearch}
              onChange={(e) => setRecipeNameSearch(e.target.value)}
              placeholder="Search recipe name..."
              className="text-gray-200 bg-neutral-700 shadow-md text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            />
          </div>
          <div className="flex-1 w-full md:pr-2 md:pl-2">
            <input
              type="text"
              value={searchText1}
              onChange={(e) => setSearchText1(e.target.value)}
              placeholder="Search ingredient 1..."
              className="text-gray-200 bg-neutral-700 shadow-md text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            />
          </div>
          <div className="flex-1 w-full md:px-2">
            <input
              type="text"
              value={searchText2}
              onChange={(e) => setSearchText2(e.target.value)}
              placeholder="Search ingredient 2..."
              className="text-gray-200 bg-neutral-700 shadow-md text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            />
          </div>
          <div className="flex-1 w-full md:pl-2">
            <input
              type="text"
              value={searchText3}
              onChange={(e) => setSearchText3(e.target.value)}
              placeholder="Search ingredient 3..."
              className="text-gray-200 bg-neutral-700 shadow-md text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            />
          </div>
        </div>
      </div>
      <div className="mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-center w-full space-y-2 md:space-y-0 md:mt-2 pb-20 xl:px-48 lg:px-32 2xl:px-32">
          <div className="flex-1 w-full md:pr-2">
            <input
              type="text"
              value={contributorSearch}
              onChange={(e) => setContributorSearch(e.target.value)}
              placeholder="Search by contributor..."
              className="text-gray-200 bg-neutral-700 shadow-md text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            />
          </div>
          <div className="flex-1 w-full md:pr-2">
            <select
              className="bg-neutral-700 border-neutral-800 text-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
            >
              <option value="all">All Meals</option>
              <option value="Breakfast">Breakfast</option>
              <option value="Dressings">Dressings</option>
              <option value="Lunch">Lunch</option>
              <option value="Sauces">Sauces</option>
              <option value="Dinner">Dinner</option>
              <option value="Desserts">Desserts</option>
              <option value="Drinks">Drinks</option>
              <option value="Snacks">Snacks</option>
            </select>
          </div>
          <div className="flex-1 w-full md:px-2">
            <select
              className="bg-neutral-700 border-neutral-800 text-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
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
          <select
            className="bg-neutral-700 border-neutral-800 text-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="random">Random Order</option>
            <option value="likesDesc">Most Likes First</option>
            <option value="tipsDesc">Most Tipped First</option>
            <option value="newest">Newest to Oldest</option>
            <option value="oldest">Oldest to Newest</option>
          </select>
        </div>
        </div>
        
      </div>
      <div className="">
        <div className="relative flex flex-wrap justify-center z-10 opacity-95 col-span-3">
          {displayTokens.slice().reverse().map((token, index) => (
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
      <div className="fixed bottom-5 left-10 w-96 h-96 pointer-events-none z-0 hidden md:block opacity-100">
        <img src={logo} alt="Logo" />
      </div>
    </div>
  );
};

export default Gallery;
