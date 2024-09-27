import React, { useState, useEffect } from "react";
import { ethers, Contract } from "ethers";
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
  const [moralisInitialized, setMoralisInitialized] = useState(false);

  useEffect(() => {
    // Sign in anonymously on component mount
    console.log("Attempting to sign in anonymously");
    signInAnonymously()
      .then(() => console.log("Anonymous sign-in successful"))
      .catch(err => console.error("Anonymous sign-in failed", err));
  }, []);

  useEffect(() => {
    console.log("Calling fetchAllItems");
    fetchAllItems();
  }, []); // Call fetchAllItems once on component mount

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
    console.log("Sort tips toggled:", !sortTips);
  };

  const handleTipsFetch = (tokenId, tips) => {
    console.log("Fetched tips for token ID", tokenId, ":", tips);
    setTipsData(prev => ({ ...prev, [tokenId]: tips }));
  };

  const fetchAllItems = async () => {
    if (loading) return;
    setLoading(true);
    console.log("Fetching all items...");
  
    try {
      let allFetchedTokens = [];
      let cursor = null;
  
      while (true) {
        console.log("Fetching page with cursor:", cursor); // Debugging line
  
        const url = new URL(`https://deep-index.moralis.io/api/v2.2/nft/0x8f58F10fD2Ec58e04a26F0A178E727BC60224ddA`);
        const params = {
          chain: "avalanche",
          format: "decimal",
          limit: 100,
          cursor: cursor,
        };
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  
        const options = {
          method: "GET",
          headers: {
            accept: "application/json",
            "X-API-Key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjUzNzNiZmVlLTMxODctNGVlMi1hNTJjLWQzNmFmYzQ1OTAzMiIsIm9yZ0lkIjoiMjQ4NzU1IiwidXNlcklkIjoiMjUxOTk2IiwidHlwZUlkIjoiZDc0ZjE3OWQtNjYxMC00N2JmLWJjYzctYjJjZWIyNmZmY2VmIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3MjczMTM0NzEsImV4cCI6NDg4MzA3MzQ3MX0.eT8VsglTQqOnENcgO2TD_jfMH0GLFVrkvVUBLrdzmek",
          },
        };
  
        const response = await fetch(url, options);
        const data = await response.json();
  
        if (response.ok && data && Array.isArray(data.result)) {
          console.log(`Fetched ${data.result.length} tokens`); // Debugging line
  
          // Parse the metadata for each token
          const parsedTokens = data.result.map(token => {
            try {
              if (token.metadata) {
                token.parsedMetadata = JSON.parse(token.metadata);
              } else {
                token.parsedMetadata = {};
              }
            } catch (error) {
              console.error(`Error parsing metadata for token ID ${token.token_id}:`, error);
              token.parsedMetadata = {}; // Set to an empty object on error
            }
            return token;
          });
  
          allFetchedTokens = [...allFetchedTokens, ...parsedTokens];
  
          if (data.cursor) {
            cursor = data.cursor;
          } else {
            console.log("No more pages to fetch."); // Debugging line
            break; // No more pages
          }
        } else {
          throw new Error(data.message || "Error fetching data");
        }
      }
  
      console.log("Total tokens fetched:", allFetchedTokens.length); // Debugging line
  
      setAllTokens(allFetchedTokens);
      filterAndSortTokens(allFetchedTokens);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };
  
  
  
  


  useEffect(() => {
    console.log("Tokens or filter options changed, filtering and sorting tokens...");
    filterAndSortTokens(allTokens);
  }, [allTokens, articleType, community, searchText1, searchText2, searchText3, recipeNameSearch, contributorSearch, sortOption, sortLikes, sortTips]);

  const filterAndSortTokens = (tokens) => {
    console.log("checking...", tokens);
    console.log("Filtering and sorting tokens...", tokens.length);
    
    let filteredTokens = tokens.map(token => {
      let parsedMetadata = {};

      if (token.metadata) {
        if (typeof token.metadata === 'string') {
          try {
            parsedMetadata = JSON.parse(token.metadata);
          } catch (error) {
            console.error("Error parsing token metadata:", error);
            parsedMetadata = {};
          }
        } else {
          parsedMetadata = token.metadata;
        }
      }

      return {
        ...token,
        parsedMetadata,
        tokenId: Number(token.token_id) // Convert tokenId to number
      };
    }).filter(token => {
      return token.parsedMetadata && token.parsedMetadata.attributes;
    });

    console.log("Filtered tokens after parsing metadata:", filteredTokens.length);

    // Filter based on article type (category)
    if (articleType !== 'all') {
      filteredTokens = filteredTokens.filter(token => token.parsedMetadata.description.toLowerCase() === articleType.toLowerCase());
    }

    // Apply search terms filtering (keyword search in content)
    const searchTerms = [searchText1, searchText2, searchText3].filter(text => text.trim() !== '');
    if (searchTerms.length > 0) {
      filteredTokens = filteredTokens.filter(token => {
        const contentAttribute = token.parsedMetadata.attributes.find(attr => attr.trait_type === 'Content');
        return contentAttribute && searchTerms.every(term =>
          contentAttribute.value.toLowerCase().includes(term.toLowerCase())
        );
      });
    }

    // Filter based on article name (title)
    if (recipeNameSearch.trim() !== '') {
      filteredTokens = filteredTokens.filter(token => token.parsedMetadata.name.toLowerCase().includes(recipeNameSearch.toLowerCase()));
    }

    // Filter based on contributor search
    if (contributorSearch.trim() !== '') {
      filteredTokens = filteredTokens.filter(token => {
        return token.parsedMetadata.attributes.some(attr => attr.trait_type === "Contributor" && attr.value.toLowerCase().includes(contributorSearch.toLowerCase()));
      });
    }

    console.log("Filtered tokens after all conditions:", filteredTokens.length);

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
    console.log("Display tokens set:", filteredTokens.length);
  };

  const toggleBookmarks = () => {
    setShowBookmarks(!showBookmarks);
    console.log("Show bookmarks toggled:", !showBookmarks);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const recipeName = params.get("recipeName");
    if (recipeName) {
      const formattedName = recipeName.replace(/_/g, ' ');
      const token = allTokens.find(token => token.metadata && token.metadata.name === formattedName);
      if (token) {
        setExpandedTokenId(token.tokenId);
        console.log("Expanded token ID set to:", token.tokenId);
      }
    }
  }, [location, allTokens]);

  return (
    <div className="container mx-auto p-4 pt-0 md:pt-4">
      <h1 className="text-6xl pb-8 pt-12 font-bold mb-4 text-neutral-800">Browse {displayTokens.length} Piece</h1> {/* Use totalSupply here */}
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
          <div className="flex-1 w-full md:pr-0 md:pl-2">
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
