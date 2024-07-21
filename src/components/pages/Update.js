import React, { useState } from "react";
import axios from "axios";
import { ethers, Contract } from "ethers";
import { PROVABLETRUTH_ABI, PROVABLETRUTH_ADDRESS } from "../Contracts/PROVABLETRUTH";
import logo from "../../assets/iprs_spot.png";

const UpdateNFTImage = ({ account }) => {
    const [tokenId, setTokenId] = useState("");
    const [metadata, setMetadata] = useState(null);
    const [newImageFile, setNewImageFile] = useState(null);
    const [newImagePreviewUrl, setNewImagePreviewUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);

    const fetchMetadata = async () => {
        if (!tokenId) {
            alert("Please enter a valid token ID");
            return;
        }

        const options = {
            method: 'GET',
            url: `https://glacier-api.avax.network/v1/chains/43114/nfts/collections/0x8f58F10fD2Ec58e04a26F0A178E727BC60224ddA/tokens/${tokenId}`,
            headers: { accept: 'application/json' }
        };

        try {
            const response = await axios.request(options);
            console.log("API Response:", response.data);
            if (response.data && response.data.metadata) {
                const metadata = {
                    name: response.data.metadata.name,
                    description: response.data.metadata.description,
                    image: response.data.metadata.imageUri,
                    attributes: JSON.parse(response.data.metadata.attributes)
                };
                setMetadata(metadata);
            } else {
                setMetadata(null);
                alert("Metadata not found for this token ID");
            }
        } catch (error) {
            console.error("Error fetching metadata:", error);
            setMetadata(null);
            alert("Error fetching metadata for this token ID");
        }
    };

    const handleImageChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setNewImageFile(file);

            const reader = new FileReader();
            reader.onloadend = () => {
                setNewImagePreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (e, field) => {
        setMetadata({
            ...metadata,
            [field]: e.target.value
        });
    };

    const handleAttributeChange = (index, field, value) => {
        const newAttributes = [...metadata.attributes];
        newAttributes[index][field] = value;
        setMetadata({ ...metadata, attributes: newAttributes });
    };

    const uploadToIPFS = async () => {
        if (!newImageFile) {
            alert('No image file selected!');
            return;
        }

        const formData = new FormData();
        formData.append('file', newImageFile);

        try {
            const response = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
                headers: {
                   'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIwZmQ5MzgwYy1mYmI2LTQ1OWQtYjkzYy00Mzk3ZjNmMWVlZjYiLCJlbWFpbCI6ImpqemltbWVyQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiTllDMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI5NWQ0NmYxZDA2OWJlYjI0N2I1ZCIsInNjb3BlZEtleVNlY3JldCI6ImQ4NTM5MDMyZjQyZTU0MWQyMzZlOTljM2I4NjJlM2JiZjcxZTRlYWY5NDNkYTllOGI1NDhmMjk2YzM1YWMwYWEiLCJpYXQiOjE3MTYwNDk4NTh9.MiwhFpT1RdiswICA12Dt2IxDFMQqVkFJeSK9A416Afc`
                }
            });
            return response.data.IpfsHash;
        } catch (error) {
            console.error("Failed to upload image to IPFS:", error);
            return null;
        }
    };

    const handleUpdateImage = async () => {
        if (!metadata) {
            alert("No metadata found to update");
            return;
        }

        setLoading(true);

        try {
            const newImageHash = await uploadToIPFS();
            if (!newImageHash) {
                alert("Failed to upload new image. Please try again.");
                setLoading(false);
                return;
            }

            const updatedMetadata = {
                ...metadata,
                image: `ipfs://${newImageHash}`
            };

            const metadataUri = await uploadMetadataToIPFS(updatedMetadata);
            if (!metadataUri) {
                alert("Failed to upload updated metadata. Please try again.");
                setLoading(false);
                return;
            }

            await changeURI(tokenId, metadataUri);
            alert("NFT image updated successfully!");

        } catch (error) {
            console.error("Error updating NFT image:", error);
        } finally {
            setLoading(false);
        }
    };

    const uploadMetadataToIPFS = async (metadata) => {
        const jsonString = JSON.stringify(metadata);
        const formData = new FormData();
        formData.append('file', new Blob([jsonString], { type: 'application/json' }), 'metadata.json');

        try {
            const response = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
                headers: {
                    'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIwZmQ5MzgwYy1mYmI2LTQ1OWQtYjkzYy00Mzk3ZjNmMWVlZjYiLCJlbWFpbCI6ImpqemltbWVyQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiTllDMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI5NWQ0NmYxZDA2OWJlYjI0N2I1ZCIsInNjb3BlZEtleVNlY3JldCI6ImQ4NTM5MDMyZjQyZTU0MWQyMzZlOTljM2I4NjJlM2JiZjcxZTRlYWY5NDNkYTllOGI1NDhmMjk2YzM1YWMwYWEiLCJpYXQiOjE3MTYwNDk4NTh9.MiwhFpT1RdiswICA12Dt2IxDFMQqVkFJeSK9A416Afc`
                }
            });
            return `ipfs://${response.data.IpfsHash}`;
        } catch (error) {
            console.error("Error uploading metadata to IPFS:", error);
            return null;
        }
    };

    const changeURI = async (tokenId, metadataUri) => {
        try {
            const { ethereum } = window;
            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const contract = new Contract(
                    PROVABLETRUTH_ADDRESS,
                    PROVABLETRUTH_ABI,
                    signer
                );

                const tx = await contract.changeURI(tokenId, metadataUri);
                await tx.wait();
            }
        } catch (error) {
            console.error("Error calling changeURI:", error);
            alert(error.message);
        }
    };

    const toggleEditMode = () => {
        setEditMode(!editMode);
    };

    return (
        <div className="container mx-auto p-4 pt-8 md:pt-16 px-4 md:px-36 lg:px-40 xl:px-96">
            <div className="text-center pb-8">
                <h1 className="text-4xl font-bold text-neutral-800">Update NFT Image</h1>
                <p className="text-neutral-600">Update the image file of an NFT by uploading a new image.</p>
            </div>
            <div className="bg-neutral-800 p-8 rounded-lg shadow-md">
                <div className="mb-4">
                    <label className="block text-gray-200 text-sm font-bold mb-2" htmlFor="tokenId">Token ID</label>
                    <input
                        type="text"
                        id="tokenId"
                        placeholder="Enter Token ID"
                        value={tokenId}
                        onChange={(e) => setTokenId(e.target.value)}
                        className="shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                    <button
                        onClick={fetchMetadata}
                        className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Fetch Metadata
                    </button>
                </div>

                {metadata && (
                    <div className="mb-4">
                        <h3 className="font-bold text-lg text-gray-200">Current Metadata</h3>
                        <div className="bg-neutral-700 p-4 rounded mt-2 text-gray-200">
                            <img src={`https://gateway.pinata.cloud/ipfs/${metadata.image.split("ipfs://")[1]}`} alt={metadata.name} className="w-1/2 h-auto rounded mb-4" />
                            <div className="mb-4">
                                <label className="block text-gray-200 text-sm font-bold mb-2" htmlFor="name">Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    value={metadata.name}
                                    onChange={(e) => handleInputChange(e, "name")}
                                    disabled={!editMode}
                                    className={`shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${editMode ? "" : "bg-gray-500 cursor-not-allowed"}`}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-200 text-sm font-bold mb-2" htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    value={metadata.description}
                                    onChange={(e) => handleInputChange(e, "description")}
                                    disabled={!editMode}
                                    className={`shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${editMode ? "" : "bg-gray-500 cursor-not-allowed"}`}
                                />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-gray-200 mb-2">Attributes</h4>
                                {metadata.attributes.map((attribute, index) => (
                                    <div key={index} className="mb-4">
                                        <div className="flex justify-between mb-2">
                                            <label className="block text-gray-200 text-sm font-bold mb-2" htmlFor={`trait_type_${index}`}>Trait Type</label>
                                            <input
                                                type="text"
                                                id={`trait_type_${index}`}
                                                value={attribute.trait_type}
                                                onChange={(e) => handleAttributeChange(index, "trait_type", e.target.value)}
                                                disabled={!editMode}
                                                className={`shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${editMode ? "" : "bg-gray-500 cursor-not-allowed"}`}
                                            />
                                        </div>
                                        <div className="flex justify-between mb-2">
                                            <label className="block text-gray-200 text-sm font-bold mb-2" htmlFor={`value_${index}`}>Value</label>
                                            <input
                                                type="text"
                                                id={`value_${index}`}
                                                value={attribute.value}
                                                onChange={(e) => handleAttributeChange(index, "value", e.target.value)}
                                                disabled={!editMode}
                                                className={`shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${editMode ? "" : "bg-gray-500 cursor-not-allowed"}`}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={toggleEditMode}
                                className="mt-4 bg-yellow-200 hover:bg-green-200 text-black font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            >
                                {editMode ? "Disable Edit Text Mode" : "Enable Edit Text Mode"}
                            </button>
                        </div>
                    </div>
                )}

                <div className="mt-4">
                    <h3 className="font-bold text-lg text-gray-200">Upload New Image</h3>
                    <input
                        type="file"
                        onChange={handleImageChange}
                        className="shadow appearance-none border rounded w-1/2 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mt-2"
                    />
                    {newImagePreviewUrl && (
                        <div className="mt-4">
                            <img src={newImagePreviewUrl} alt="New Upload Preview" className="max-w-full h-auto rounded" />
                        </div>
                    )}
                </div>

                <button
                    onClick={handleUpdateImage}
                    className="mt-4 bg-neutral-200 hover:bg-neutral-400 text-black font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    disabled={loading}
                >
                    {loading ? "Updating..." : "Update NFT Image"}
                </button>
            </div>
            
        </div>
    );
};

export default UpdateNFTImage;
