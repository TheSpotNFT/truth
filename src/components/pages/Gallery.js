// Gallery.js
import React, { useState, useEffect } from "react";
import NFTCard from "./NFTCard";


const Gallery = ({ account }) => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageToken, setPageToken] = useState(null);

  const fetchItems = async () => {
    if (loading) return;
    setLoading(true);

    const pageTokenParam = pageToken ? `&pageToken=${pageToken}` : "";
    const url = `https://glacier-api.avax.network/v1/chains/43114/nfts/collections/0x568863597b44AA509a45C15eE3Cab3150a562d32/tokens?pageSize=100`;
    const options = { method: "GET", headers: { accept: "application/json" } };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
        console.log(data);
      if (response.ok && Array.isArray(data.tokens)) {
        setTokens((prevTokens) => [...prevTokens, ...data.tokens]);
        setPageToken(data.nextPageToken); // Update pageToken if it exists
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
    fetchItems(); // Initial fetch
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-avax-white">Avax Cooks</h1>
      <div className="flex flex-wrap justify-center">
        {tokens.map((token, index) => (
          <NFTCard key={index} token={token} account={account} />
        ))}
      </div>
      {loading && <p>Loading...</p>}
    </div>
  );
};

export default Gallery;
