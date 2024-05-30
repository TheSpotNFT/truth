import React, { useState, useEffect } from "react";
import axios from "axios";
import { ethers } from "ethers";
import firebase from "../../firebase2";
import NFTGallery from "../NFTGallery";
import ChatRoom from "../ChatRoom";

const App = () => {
    const [account, setAccount] = useState(null);
    const [metadata, setMetadata] = useState({
        name: '',
        arenaUsername: '',
        communityName: '',
        creatorComment: '',
        image: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [contract, setContract] = useState(null);

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.request({ method: 'eth_requestAccounts' }).then(accounts => {
                setAccount(accounts[0]);
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const contractAddress = "yourContractAddress";
                const abi = [/* your contract ABI */];
                const contractInstance = new ethers.Contract(contractAddress, abi, signer);
                setContract(contractInstance);
            });
        }
    }, []);

    const uploadToIPFS = async () => {
        if (!imageFile) {
            alert('No image file selected!');
            return;
        }

        const formData = new FormData();
        formData.append('file', imageFile);

        try {
            const response = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
                headers: {
                    'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIwZmQ5MzgwYy1mYmI2LTQ1OWQtYjkzYy00Mzk3ZjNmMWVlZjYiLCJlbWFpbCI6ImpqemltbWVyQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiTllDMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI5NWQ0NmYxZDA2OWJlYjI0N2I1ZCIsInNjb3BlZEtleVNlY3JldCI6ImQ4NTM5MDMyZjQyZTU0MWQyMzZlOTljM2I4NjJlM2JiZjcxZTRlYWY5NDNkYTllOGI1NDhmMjk2YzM1YWMwYWEiLCJpYXQiOjE3MTYwNDk4NTh9.MiwhFpT1RdiswICA12Dt2IxDFMQqVkFJeSK9A416Afc`
                }
            });
            console.log("Image uploaded to IPFS:", response.data);
            return `ipfs://${response.data.IpfsHash}`;
        } catch (error) {
            console.error("Failed to upload image to IPFS:", error);
            return null;
        }
    };

    const handleMint = async () => {
        if (!contract || !account) return;

        const ipfsHash = await uploadToIPFS();
        if (!ipfsHash) {
            alert("Failed to upload image. Please try again.");
            return;
        }

        const metadataURI = `ipfs://${ipfsHash}`;
        try {
            await contract.mint(account, metadataURI);
            alert("Token minted successfully!");
        } catch (error) {
            console.error("Failed to mint token:", error);
            alert("Failed to mint token. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-800 text-white">
            <header className="p-4 bg-gray-900 text-center">
                <h1 className="text-2xl">Mint Your Unique ERC-1155 Token</h1>
            </header>
            <main className="p-4">
                <form className="space-y-4">
                    <div>
                        <label>Name</label>
                        <input type="text" value={metadata.name} onChange={e => setMetadata({ ...metadata, name: e.target.value })} />
                    </div>
                    <div>
                        <label>X/Arena Username</label>
                        <input type="text" value={metadata.arenaUsername} onChange={e => setMetadata({ ...metadata, arenaUsername: e.target.value })} />
                    </div>
                    <div>
                        <label>Community Name</label>
                        <input type="text" value={metadata.communityName} onChange={e => setMetadata({ ...metadata, communityName: e.target.value })} />
                    </div>
                    <div>
                        <label>Creator Comment</label>
                        <input type="text" value={metadata.creatorComment} onChange={e => setMetadata({ ...metadata, creatorComment: e.target.value })} />
                    </div>
                    <div>
                        <label>Image</label>
                        <input type="file" onChange={e => setImageFile(e.target.files[0])} />
                    </div>
                    <button type="button" onClick={handleMint}>Mint Token</button>
                </form>
                <NFTGallery contract={contract} />
                <ChatRoom account={account} />
            </main>
        </div>
    );
};

export default App;
