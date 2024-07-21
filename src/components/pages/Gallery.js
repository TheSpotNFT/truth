import React, { useState, useEffect } from "react";
import { ethers, Contract } from "ethers";
import axios from "axios";
import NFTCard from "./NFTCard";
import { PROVABLETRUTHLIKESANDTIPS_ABI, PROVABLETRUTHLIKESANDTIPS_ADDRESS } from '../Contracts/PROVABLETRUTHLikeAndTip';
import { PROVABLETRUTH_ABI, PROVABLETRUTH_ADDRESS } from "../Contracts/PROVABLETRUTH";
import { useLocation } from 'react-router-dom';
import { signInAnonymously } from "../../firebase3";

const Gallery = ({ account }) => {
  const [allTokens, setAllTokens] = useState([]);
  const [displayTokens, setDisplayTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalSupply, setTotalSupply] = useState(0); // New state for total supply
  const [pageToken, setPageToken] = useState(null);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [articleType, setArticleType] = useState('all');
  const [sortLikes, setSortLikes] = useState(false);
  const [likes, setLikes] = useState(0);
  const [community, setCommunity] = useState('All Communities');
  const [searchText1, setSearchText1] = useState('');
  const [searchText2, setSearchText2] = useState('');
  const [searchText3, setSearchText3] = useState('');
  const [recipeNameSearch, setRecipeNameSearch] = useState('');
  const [contributorSearch, setContributorSearch] = useState('');
  const [sortOption, setSortOption] = useState('random');
  const [sortTips, setSortTips] = useState(false);
  const [tipsData, setTipsData] = useState({});
  const [expandedTokenId, setExpandedTokenId] = useState(null);
  const [viewMode, setViewMode] = useState('card'); // New state for view mode

  useEffect(() => {
    // Sign in anonymously on component mount
    signInAnonymously();
  }, []);

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

  const fetchAllItems = async () => {
    if (loading) return;
    setLoading(true);
  
    try {
      const provider = new ethers.providers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc'); // Use Avalanche public RPC
      const contract = new Contract(
        PROVABLETRUTH_ADDRESS,
        PROVABLETRUTH_ABI,
        provider
      );
  
      // Ensure totalSupply is a function in the contract
      if (typeof contract.totalSupply !== "function") {
        console.error("totalSupply is not a function in the contract");
        return;
      }
  
      const totalSupply = await contract.totalSupply();
      setTotalSupply(totalSupply.toNumber()); // Update the total supply state
      console.log("Total supply fetched:", totalSupply.toString());
  
      const fetchMetadata = async (tokenId) => {
        const options = {
          method: 'GET',
          url: `https://glacier-api.avax.network/v1/chains/43114/nfts/collections/0x8f58F10fD2Ec58e04a26F0A178E727BC60224ddA/tokens/${tokenId}`,
          headers: { accept: 'application/json' }
        };
  
        try {
          const response = await axios.request(options);
          if (response.data && response.data.metadata) {
            const metadata = {
              tokenId: tokenId,
              name: response.data.metadata.name,
              description: response.data.metadata.description,
              image: response.data.metadata.imageUri,
              attributes: JSON.parse(response.data.metadata.attributes)
            };
            return metadata;
          } else {
            console.error(`Metadata not found for token ID ${tokenId}`);
            return null;
          }
        } catch (error) {
          console.error(`Error fetching metadata for token ID ${tokenId}:`, error);
          return null;
        }
      };
  
      const tokenPromises = [];
      for (let i = 1; i <= totalSupply; i++) {
        tokenPromises.push(fetchMetadata(i));
      }
  
      const allFetchedTokens = (await Promise.all(tokenPromises)).filter(token => token !== null);
  
      setAllTokens(allFetchedTokens);
      filterAndSortTokens(allFetchedTokens);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchAllItems();
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
          PROVABLETRUTHLIKESANDTIPS_ADDRESS,
          PROVABLETRUTHLIKESANDTIPS_ABI,
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
    if (allTokens.length > 0) {
      allTokens.forEach(token => fetchLikesAndCheckLiked(token.tokenId));
    }
  }, [allTokens]);

  useEffect(() => {
    filterAndSortTokens(allTokens);
  }, [articleType, community, searchText1, searchText2, searchText3, recipeNameSearch, contributorSearch, sortOption, sortLikes, sortTips]);

  const filterAndSortTokens = (tokens) => {
    // Ensure tokens have proper metadata and attributes
    let filteredTokens = tokens.filter(token => token.name && token.description && token.attributes);
    
    //console.log('Full Token List:', tokens);
   // console.log('Tokens after initial filtering:', filteredTokens);

    // Filter based on article type (category)
    if (articleType !== 'all') {
        filteredTokens = filteredTokens.filter(token => token.description.toLowerCase() === articleType.toLowerCase());
    }
    //console.log('Tokens after articleType filtering:', filteredTokens);

    // Apply search terms filtering (keyword search in content)
    const searchTerms = [searchText1, searchText2, searchText3].filter(text => text.trim() !== '');
    if (searchTerms.length > 0) {
        filteredTokens = filteredTokens.filter(token => {
            try {
                const contentAttribute = token.attributes.find(attr => attr.trait_type === 'Content');
                return contentAttribute && searchTerms.every(term =>
                    contentAttribute.value.toLowerCase().includes(term.toLowerCase())
                );
            } catch (error) {
                console.error("Error parsing attributes for search terms filtering:", error, token);
                return false;
            }
        });
    }
    //console.log('Tokens after search terms filtering:', filteredTokens);

    // Filter based on article name (title)
    if (recipeNameSearch.trim() !== '') {
        filteredTokens = filteredTokens.filter(token => token.name.toLowerCase().includes(recipeNameSearch.toLowerCase()));
    }
    //console.log('Tokens after recipeNameSearch filtering:', filteredTokens);

    // Filter based on contributor search
    if (contributorSearch.trim() !== '') {
        filteredTokens = filteredTokens.filter(token => {
            try {
                return token.attributes.some(attr => attr.trait_type === "Contributor" && attr.value.toLowerCase().includes(contributorSearch.toLowerCase()));
            } catch (error) {
               // console.error("Error parsing attributes for contributorSearch filtering:", error, token);
                return false;
            }
        });
    }
    //console.log('Tokens after contributorSearch filtering:', filteredTokens);

    // Apply sorting based on selected option
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
            filteredTokens.sort((a, b) => b.tokenId - a.tokenId);
            break;
        case 'oldest':
            filteredTokens.sort((a, b) => a.tokenId - b.tokenId);
            break;
        case 'random':
        default:
            filteredTokens = shuffleArray(filteredTokens);
            break;
    }

    setDisplayTokens(filteredTokens);
    //console.log('Final filtered tokens:', filteredTokens);
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

  const sanitizeName = (name) => {
    return name.replace(/[()]/g, '').replace(/\s+/g, '_');
  };

  return (
    <div className="container mx-auto p-4 pt-0 md:pt-4">
      <h1 className="text-6xl pb-8 pt-12 font-bold mb-4 text-neutral-800">Browse {totalSupply} Articles</h1> {/* Use totalSupply here */}
      <div className="py-0 md:pb-0 md:py-0 lg:px-32 xl:px-48 mx-auto 2xl:px-32">
        {/* Search Inputs */}
        <div className="flex flex-col md:flex-row items-center justify-center w-full space-y-2 md:space-y-0 mt-2 pb-2">
          <div className="flex-1 w-full md:pr-2">
            <input
              type="text"
              value={recipeNameSearch}
              onChange={(e) => setRecipeNameSearch(e.target.value)}
              placeholder="Search article name..."
              className="text-gray-200 bg-neutral-700 shadow-md text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            />
          </div>
          <div className="flex-1 w-full md:pr-0 pl-2">
            <input
              type="text"
              value={contributorSearch}
              onChange={(e) => setContributorSearch(e.target.value)}
              placeholder="Search by contributor..."
              className="text-gray-200 bg-neutral-700 shadow-md text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            />
          </div>
        </div>
      </div>
      <div className="mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-center w-full space-y-2 md:space-y-0 md:mt-2 pb-20 xl:px-48 lg:px-32 2xl:px-32">
          <div className="flex-1 w-full md:pr-2">
            <select
              className="bg-neutral-700 border-neutral-800 text-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              value={articleType}
              onChange={(e) => setArticleType(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="News">News</option>
              <option value="Opinion">Opinion</option>
              <option value="Lifestyle">Lifestyle</option>
              <option value="Technology">Technology</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Sports">Sports</option>
              <option value="Science">Science</option>
              <option value="Health">Health</option>
              <option value="Business">Business</option>
              <option value="Travel">Travel</option>
              <option value="Food">Food</option>
              <option value="Education">Education</option>
              <option value="Art">Art</option>
              <option value="Other">Other</option>
            </select>
          </div>
  
          <div className="flex-1 w-full md:pl-2">
            <select
              className="bg-neutral-700 border-neutral-800 text-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="random">Random Order</option>
              <option value="newest">Newest to Oldest</option>
              <option value="oldest">Oldest to Newest</option>
              {/*<option value="likesDesc">Most Likes First</option>
              <option value="tipsDesc">Most Tipped First</option>*/}
            </select>
          </div>
        </div>
      </div>
      <div className="mt-4">
        {viewMode === 'card' ? (
          <div className="relative flex flex-wrap justify-center z-10 opacity-95 col-span-3">
            {displayTokens.slice().reverse().map((token, index) => (
              <NFTCard
                key={index}
                token={token}
                account={account}
                showBookmarks={showBookmarks}
                onTipsFetch={handleTipsFetch}
                expanded={expandedTokenId === token.tokenId} // Pass the expanded state
                viewMode={viewMode}
              />
            ))}
          </div>
        ) : (
          <div className="relative z-10 opacity-95 w-2/3 mx-auto">
            <div className="grid grid-cols-1 gap-4 text-gray-200">
              <div className="bg-neutral-800 p-4 rounded-lg space-y-4">
                <div className="flex px-4 py-2 items-center">
                  <div className="w-1/12"></div>
                  <div className="w-1/3 text-left font-bold">Article Name</div>
                  <div className="w-1/3 text-left font-bold">Contributor</div>
                </div>
                {displayTokens.slice().reverse().map((token, index) => (
                  <NFTCard
                    key={index}
                    token={token}
                    account={account}
                    showBookmarks={showBookmarks}
                    onTipsFetch={handleTipsFetch}
                    expanded={expandedTokenId === token.tokenId} // Pass the expanded state
                    viewMode={viewMode}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      {loading && <p>Loading...</p>}
    </div>
  );
};

export default Gallery;
