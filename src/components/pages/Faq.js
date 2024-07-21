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
      <h1 className="text-2xl font-bold text-center text-gray-200 my-4 pb-8 pt-8">FAQ & Getting Started</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-neutral-800 text-gray-200 p-4 rounded-lg shadow-md pb-12">
          <h2 className="font-semibold mb-2 pb-4 text-xl">What is the Provable Truth?</h2>
          <p>Verify your sources. No more do you need to wonder if an article or information is true or false. A user is required to verify via the blockchain that they are the source of the post. You can track users posts and verify that those users actually submitted the info. This is the first step in provable info online. Each post costs $5 to post and the creator's wallet is traceable.</p>
        </div>
        <div className="bg-neutral-800 text-gray-200 p-4 rounded-lg shadow-md">
          <h2 className="font-semibold mb-2 pb-4 text-xl">How to Install a Web3 Wallet?</h2>
          <p>To interact with our site and features like posting an article, you need a Web3 wallet such as MetaMask.</p>
          <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-600">Download MetaMask</a>
        </div>
        <div className="bg-neutral-800 text-gray-200 p-4 rounded-lg shadow-md">
          <h2 className="font-semibold mb-2 pb-4 text-xl">How to Add the Avalanche Network?</h2>
          <button onClick={addAvalancheNetwork} className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-300">Add Avalanche Network</button>
        </div>
        {/*<div className="bg-neutral-800 text-gray-200 p-4 rounded-lg shadow-md">
          <h2 className="font-semibold mb-2 pb-4 text-xl">Join Our Community</h2>
          <p>Follow us on Twitter @__iprs and DM us your wallet address to receive FREE AVAX to get started. This offer is part of a promotional campaign to welcome new users.</p>
          <a href="https://twitter.com/__iprs" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-600">Follow @__iprs</a>
        </div>
        <div className="bg-neutral-800 text-gray-200 p-4 rounded-lg shadow-md">
          <h2 className="font-semibold mb-2 pb-4 text-xl">Comments</h2>
          <p>We do commenting a little differently here. When you want to submit a comment you will also be sending a Good Vibe or Bad Vibe token with your comment. Depending on if your comment is good or bad, you will either send a Good Vibe token or a Bad Vibe token to the holder of the Recipe NFT. The Vibe token costs 0.2 avax. This creates an incentive to post meaningful comments and the owner of the NFT gets 50% of the fee if it is a good comment, but if it's a bad comment then 50% of the fee goes to holders of a good vibe token. For more details on commenting follow us on Twitter!</p> <a href="https://twitter.com/__iprs" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-600">Follow @__iprs</a>
        </div>*/}
      </div>
    </div>
  );
};

export default Docs;
