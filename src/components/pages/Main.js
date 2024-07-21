import React, { useState } from "react";
import axios from "axios";
import { ethers, Contract } from "ethers";
import { PROVABLETRUTH_ABI, PROVABLETRUTH_ADDRESS } from "../Contracts/PROVABLETRUTH";
import { useNavigate } from "react-router-dom";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const Main = ({ account }) => {
    const [txProcessing, setTxProcessing] = useState(false);
    const navigate = useNavigate();

    const goToGallery = () => {
        navigate('/');
    };

    const [articleDetails, setArticleDetails] = useState({
        articleName: '',
        category: '',
        contributor: '',
        content: '',
    });

    const initialArticleDetails = {
        articleName: '',
        category: '',
        contributor: '',
        content: '',
    };

    const [imageFile, setImageFile] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState('');

    const handleImageChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setImageFile(file);

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadToIPFS = async () => {
        if (!imageFile) {
            alert('No image file selected!');
            return null;
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
            return response.data.IpfsHash;
        } catch (error) {
            console.error("Failed to upload image to IPFS:", error);
            return null;
        }
    };

    const uploadMetadataToIPFS = async (metadata) => {
        const jsonString = JSON.stringify(metadata);
        const formData = new FormData();
        formData.append('file', new Blob([jsonString], { type: 'application/json' }), 'metadata.json');
        try {
            const response = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
                maxBodyLength: "Infinity",
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
                    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIwZmQ5MzgwYy1mYmI2LTQ1OWQtYjkzYy00Mzk3ZjNmMWVlZjYiLCJlbWFpbCI6ImpqemltbWVyQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiTllDMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI5NWQ0NmYxZDA2OWJlYjI0N2I1ZCIsInNjb3BlZEtleVNlY3JldCI6ImQ4NTM5MDMyZjQyZTU0MWQyMzZlOTljM2I4NjJlM2JiZjcxZTRlYWY5NDNkYTllOGI1NDhmMjk2YzM1YWMwYWEiLCJpYXQiOjE3MTYwNDk4NTh9.MiwhFpT1RdiswICA12Dt2IxDFMQqVkFJeSK9A416Afc`
                }
            });
            const ipfsHash = response.data.IpfsHash;
            return `ipfs://${ipfsHash}`;
        } catch (error) {
            console.error("Error uploading metadata to IPFS:", error);
            return null;
        }
    };

    async function mintNFT(metadataUrl) {
        try {
            const { ethereum } = window;
            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                if (PROVABLETRUTH_ABI && PROVABLETRUTH_ADDRESS && signer) {
                    const contract = new Contract(
                        PROVABLETRUTH_ADDRESS,
                        PROVABLETRUTH_ABI,
                        signer
                    );
                    let options = { value: ethers.utils.parseEther("0.25") };
                    let tx = await contract.mint(account, metadataUrl, options);
                    console.log(tx.hash);
                } else {
                    console.log("error with contract abi, address, or signer");
                }
            }
        } catch (error) {
            console.log("Error on mint:", error);
            alert(error.data.message);
        }
    }

    const handleSubmit = async () => {
        const { articleName, category, contributor, content } = articleDetails;
        if (!articleName || !category || !contributor || !content) {
            alert("Please fill in all fields.");
            return;
        }
        if (!account) {
            alert("No account found. Connect your wallet.");
            return;
        }
        try {
            const imageUrl = await uploadToIPFS();
            if (!imageUrl) {
                alert("Failed to upload image. Please try again.");
                return;
            }
            const metadata = {
                name: articleDetails.articleName,
                description: articleDetails.category,
                image: `ipfs://${imageUrl}`,
                attributes: [
                    { trait_type: "Contributor", value: articleDetails.contributor },
                    { trait_type: "Content", value: articleDetails.content }
                ]
            };
            const metadataUrl = await uploadMetadataToIPFS(metadata);
            if (metadataUrl) {
                mintNFT(metadataUrl);
            } else {
                alert("Failed to upload metadata. Please try again.");
            }
        } catch (error) {
            console.error("Error during article submission:", error);
        }
    };

    const handleReset = () => {
        setArticleDetails(initialArticleDetails);
        setImageFile(null);
        setImagePreviewUrl('');
        document.getElementById('fileInput').value = null;
    };

    return (
        <div className="relative min-h-screen bg-neutral-800 p-4 w-full">
            <div className="container mx-auto">
                <div className="pb-8">
                    <button onClick={goToGallery} className="bg-neutral-700 hover:bg-neutral-600 text-white font-bold py-2 px-4 rounded w-full h-24 text-2xl">
                        Back to Articles
                    </button>
                </div>
                <div className="bg-neutral-900 p-6 rounded-lg shadow-md">
                    <h1 className="text-2xl font-bold mb-4 text-neutral-400">Submit an Article</h1>
                  
                    <div className="mb-4">
                        <input
                            type="text"
                            className="block w-full px-3 py-2 bg-neutral-900 border border-gray-700 rounded-lg text-gray-300"
                            placeholder="Article Name"
                            value={articleDetails.articleName}
                            onChange={e => setArticleDetails({ ...articleDetails, articleName: e.target.value })}
                        />
                    </div>
                    <div className="mb-4">
                        <select
                            className="block w-full px-3 py-2 bg-neutral-900 border border-gray-700 rounded-lg text-gray-300 placeholder:text-gray-300"
                            value={articleDetails.category}
                            onChange={e => setArticleDetails({ ...articleDetails, category: e.target.value })}
                        >
                            <option value="">Select a Category</option>
                            <option value="Technology">Technology</option>
                            <option value="Health">Health</option>
                            <option value="Lifestyle">Lifestyle</option>
                            <option value="Finance">Finance</option>
                            <option value="Education">Education</option>
                            <option value="Travel">Travel</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <input
                            type="text"
                            className="block w-full px-3 py-2 bg-neutral-900 border border-gray-700 rounded-lg text-gray-300"
                            placeholder="Contributor Name"
                            value={articleDetails.contributor}
                            onChange={e => setArticleDetails({ ...articleDetails, contributor: e.target.value })}
                        />
                    </div>
                    <div className="mb-4">
                        <input
                            type="file"
                            id="fileInput"
                            onChange={handleImageChange}
                            className="block w-full text-sm text-gray-300 bg-neutral-900 rounded-lg border border-gray-700 cursor-pointer"
                        />
                        {imagePreviewUrl && (
                            <div className="mt-4">
                                <img src={imagePreviewUrl} alt="Uploaded Preview" className="max-w-full h-auto rounded" />
                            </div>
                        )}
                    </div>
                    <div className="mb-4">
                        <div className="pb-6 text-neutral-400 font-bold text-2xl">Your Article</div>
                    <ReactQuill
  theme="snow"
  value={articleDetails.content}
  onChange={(value) => setArticleDetails({ ...articleDetails, content: value })}
  className="bg-gray-800 text-gray-300 border-0 placeholder-gray-500 h-96 pb-12"
  placeholder="Write your article content sadashere..."
/>
                    </div>
                    <div className="flex space-x-4">
                        <button
                            onClick={handleSubmit}
                            disabled={txProcessing}
                            className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
                        >
                            {txProcessing ? "Processing..." : "Submit Article"}
                        </button>
                        <button
                            onClick={handleReset}
                            className="bg-gray-400 hover:bg-gray-300 text-black font-bold py-2 px-4 rounded"
                        >
                            Reset Form
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Main;
