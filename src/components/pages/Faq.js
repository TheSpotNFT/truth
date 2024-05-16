import React from 'react';

const Docs = () => {
  const addAvalancheNetwork = async () => {
    try {
      if (window.ethereum) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0xA86A', // Avalanche Mainnet Chain ID in hexadecimal
            chainName: 'Avalanche Network',
            nativeCurrency: {
              name: 'AVAX',
              symbol: 'AVAX', // 2-6 characters long
              decimals: 18,
            },
            rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
            blockExplorerUrls: ['https://snowtrace.io/']
          }],
        });
      } else {
        alert('MetaMask is not installed. Please install it to use this feature.');
      }
    } catch (error) {
      console.error('Failed to add Avalanche network:', error);
    }
  };

  return (
    <div className="container mx-auto p-4 md:px-16">
      <h1 className="text-2xl font-bold text-center text-gray-200 my-4 pb-8">FAQ & Getting Started</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-avax-black text-gray-200 p-4 rounded-lg shadow-md pb-12">
          <h2 className="font-semibold mb-2 pb-4 text-xl">What is the iprs?</h2>
          <p>Living on the avalanche blockchain, the InterPlanetary Recipe System brings tokenization to recipe assets. This means users who submit recipes can receive tips and get credit for their contributions to the recipes on the blockchain, forever.</p>
        </div>
        <div className="bg-avax-black text-gray-200 p-4 rounded-lg shadow-md">
          <h2 className="font-semibold mb-2 pb-4 text-xl">How to Install a Web3 Wallet?</h2>
          <p>To interact with our site and features like liking, bookmarking, tipping, and contributing, you need a Web3 wallet such as MetaMask.</p>
          <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-600">Download MetaMask</a>
        </div>
        <div className="bg-avax-black text-gray-200 p-4 rounded-lg shadow-md">
          <h2 className="font-semibold mb-2 pb-4 text-xl">How to Add the Avalanche Network?</h2>
          <button onClick={addAvalancheNetwork} className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-300">Add Avalanche Network</button>
        </div>
        <div className="bg-avax-black text-gray-200 p-4 rounded-lg shadow-md">
          <h2 className="font-semibold mb-2 pb-4 text-xl">Join Our Community</h2>
          <p>Follow us on Twitter @__iprs and DM us your wallet address to receive FREE AVAX to get started. This offer is part of a promotional campaign to welcome new users.</p>
          <a href="https://twitter.com/__iprs" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-600">Follow @__iprs</a>
        </div>
      </div>
    </div>
  );
};

export default Docs;
