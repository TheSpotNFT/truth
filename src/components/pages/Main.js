import React, { useState } from "react";
import axios from "axios";
import { ethers, Contract } from "ethers";
import { AVAXCOOKS_ABI, AVAXCOOKS_ADDRESS } from "../Contracts/AvaxCooks";
import logo from "../../assets/iprs_spot.png";
import { useNavigate } from "react-router-dom";

const Main = ({ account }) => {
    const { setTxProcessing, txProcessing } = useState();
    const navigate = useNavigate();

    const goToGallery = () => {
        navigate('/gallery');
    };

    const [recipeDetails, setRecipeDetails] = useState({
        recipeName: '',
        category: '',
        ingredients: [{ name: "", quantity: "" }, { name: "", quantity: "" }],
        method: '',
        contributor: '',
        xUsername: '',
        region: '',
        kidFriendly: false,
        allergySafe: [],
        prepTime: '',
        servingSize: '',
        difficultyLevel: '',
        cuisineType: '',
        specialEquipment: '',
        communityTags: []
    });

    const initialRecipeDetails = {
        recipeName: '',
        category: '',
        ingredients: [{ name: "", quantity: "" }, { name: "", quantity: "" }],
        method: '',
        contributor: '',
        xUsername: '',
        region: '',
        kidFriendly: false,
        allergySafe: [],
        prepTime: '',
        servingSize: '',
        difficultyLevel: '',
        cuisineType: '',
        specialEquipment: '',
        communityTags: []
    };

    const [imageFile, setImageFile] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState('');

    const handleIngredientChange = (index, field, value) => {
        const newIngredients = [...recipeDetails.ingredients];
        newIngredients[index][field] = value;
        setRecipeDetails({ ...recipeDetails, ingredients: newIngredients });
    };

    const addIngredientField = () => {
        setRecipeDetails({ ...recipeDetails, ingredients: [...recipeDetails.ingredients, { name: "", quantity: "" }] });
    };

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
            return response.data.IpfsHash;
        } catch (error) {
            console.error("Failed to upload image to IPFS:", error);
            return null;
        }
    };

    async function mintNFT(metadataUrl) {
        try {
            const { ethereum } = window;
            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                if (AVAXCOOKS_ABI && AVAXCOOKS_ADDRESS && signer) {
                    const contract = new Contract(
                        AVAXCOOKS_ADDRESS,
                        AVAXCOOKS_ABI,
                        signer
                    );
                    let options = { value: ethers.utils.parseEther("0.01") };
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
        const { recipeName, method, ingredients } = recipeDetails;
        const filledIngredientsCount = ingredients.filter(ing => ing.name && ing.quantity).length;
        if (!recipeName || !method || filledIngredientsCount < 2) {
            alert("??!! How is that a recipe? You must enter: Recipe Name, Method, and at least 2 Ingredients.");
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
            const filledIngredients = recipeDetails.ingredients
                .filter(ing => ing.name && ing.quantity)
                .map(ing => ({ trait_type: ing.name, value: ing.quantity }));
            const addAttributeIfNotEmpty = (trait_type, value) => {
                if (value === null || value === undefined || value === '' || value === 0) return null;
                return { trait_type, value };
            };
            const otherAttributes = [
                addAttributeIfNotEmpty("Category", recipeDetails.category),
                addAttributeIfNotEmpty("Preparation Time", recipeDetails.prepTime ? `${recipeDetails.prepTime} minutes` : null),
                addAttributeIfNotEmpty("Serving Size", recipeDetails.servingSize),
                addAttributeIfNotEmpty("Difficulty Level", recipeDetails.difficultyLevel),
                addAttributeIfNotEmpty("Region", recipeDetails.region),
                addAttributeIfNotEmpty("Cuisine Type", recipeDetails.cuisineType),
                { trait_type: "Kid-Specific", value: recipeDetails.kidFriendly ? "Yes" : "No" },
                addAttributeIfNotEmpty("Special Equipment", recipeDetails.specialEquipment),
                addAttributeIfNotEmpty("Contributor", recipeDetails.contributor),
                addAttributeIfNotEmpty("X Username", recipeDetails.xUsername)
            ].filter(attr => attr !== null);
            const allergySafeAttributes = recipeDetails.allergySafe.map(allergy => ({
                trait_type: allergy,
                value: "true"
            }));
            const communityTagsAttributes = recipeDetails.communityTags.map((community, index) => ({
                trait_type: `Community Tag`,
                value: community
            }));
            const methodAttribute = { trait_type: "Method", value: recipeDetails.method };
            const attributes = [
                ...otherAttributes,
                ...allergySafeAttributes,
                ...filledIngredients,
                ...communityTagsAttributes,
                methodAttribute
            ];
            const metadata = {
                name: recipeDetails.recipeName,
                description: 'Avax is Cookin',
                image: `ipfs://${imageUrl}`,
                attributes
            };
            const metadataUrl = await uploadMetadataToIPFS(metadata);
            if (metadataUrl) {
                mintNFT(metadataUrl);
            } else {
                alert("Failed to upload metadata. Please try again.");
            }
        } catch (error) {
            console.error("Error during recipe card customization:", error);
        }
    };

    const handleReset = () => {
        setRecipeDetails(initialRecipeDetails);
        setImageFile(null);
        setImagePreviewUrl('');
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

    return (
        <div className="relative min-h-screen">
            <div className="py-8 md:py-0 relative z-10">
                <div className="mx-auto pointer-events-none block md:hidden md:pb-8 relative z-20">
                    {/* SVG logo or image can be here */}
                </div>
            </div>
            <div className="relative text-xl text-avax-white p-8 pt-24 px-4 md:px-36 lg:px-40 xl:px-96 z-20">
                Congrats! You made it. You have browsed the iprs for long enough and finally you want to submit your own recipes. We want to thank you in advance as our submittors make the iprs what it is.
            </div>
            <div className="relative pb-16 justify-center items-center md:pt-12 z-20">
                <button onClick={goToGallery} className="bg-avax-red hover:bg-red-700 text-black rounded-md p-4 font-bold text-xl w-2/4 h-24">
                    iprs database
                </button>
            </div>
           
            <div className="relative text-xl text-avax-white pb-8 px-4 md:px-36 lg:px-40 xl:px-96 pt-4 z-20">
                Make sure you visit the recipes by visiting the iprs database above and see what makes a good entry, the more data the better.
            </div>
            <div className="relative text-xl text-avax-white pb-8 px-4 md:px-36 lg:px-40 xl:px-96 z-20">
                Actually submitting the recipe is easy. Check out <a href="/faq" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-600">getting started</a> to learn how to install a web3 wallet and follow the steps. Once you are all set up just choose an image to upload that will represent your recipe, then enter in as much data as possible about the recipe. Better data = better search results. It costs 0.01 avax to submit your recipe, which at the time of publish was around $0.35USD, this fee is designed to stop spam.
            </div>
            <div className="relative text-xl text-avax-white pb-8 px-4 md:px-36 lg:px-40 xl:px-96 z-20">
                Secure good food for centuries to come. Mint your recipes today..
            </div>
            <div className="relative pb-4 z-20">
                <button onClick={handleReset} className="bg-avax-red hover:bg-red-700 rounded-md p-4 font-bold text-xl">
                    Reset Form
                </button>
            </div>
            <div className="sm:max-w-md md:max-w-xl mx-auto p-4 bg-avax-black text-gray-100 shadow-lg rounded-lg relative z-20 opacity-95">
                <div className="pb-4 font-bold"><h1>Upload an image</h1></div>
                <input type="file" onChange={handleImageChange} />
                {imagePreviewUrl && (
                    <div className="mt-4">
                        <img src={imagePreviewUrl} alt="Uploaded Preview" className="max-w-full h-auto rounded p-4" />
                    </div>
                )}
                <div className="mb-4">
                    <input
                        type="text"
                        className="block w-full mt-4 mb-2 px-3 py-2 bg-zinc-700 border border-zinc-800 rounded-md text-gray-100 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Recipe Name"
                        value={recipeDetails.recipeName}
                        onChange={e => setRecipeDetails({ ...recipeDetails, recipeName: e.target.value })}
                    />
                </div>
                <div className="mb-4">
                    <select
                        className="shadow border rounded w-full py-2 px-3 text-gray-100 bg-zinc-700 border-zinc-800 leading-tight focus:outline-none focus:shadow-outline focus:ring-blue-500 focus:border-blue-500"
                        value={recipeDetails.category}
                        onChange={e => setRecipeDetails({ ...recipeDetails, category: e.target.value })}
                    >
                        <option value="">Select a Category</option>
                        <option value="Breakfast">Breakfast</option>
                        <option value="Lunch">Lunch</option>
                        <option value="Snacks">Snacks</option>
                        <option value="Dinner">Dinner</option>
                        <option value="Desserts">Desserts</option>
                        <option value="Drinks">Drinks</option>
                        <option value="Cleaners">Cleaners</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <input
                    type="number"
                    className="block w-full mt-4 mb-2 px-3 py-2 bg-zinc-700 border border-zinc-800 rounded-md text-gray-100 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Preparation Time (in minutes)"
                    min="0"
                    value={recipeDetails.prepTime}
                    onChange={e => setRecipeDetails({ ...recipeDetails, prepTime: e.target.value })}
                />
                <div className="mb-4">
                    <input
                        type="number"
                        className="block w-full mt-4 mb-2 px-3 py-2 bg-zinc-700 border border-zinc-800 rounded-md text-gray-100 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Serving Size"
                        min="1"
                        value={recipeDetails.servingSize}
                        onChange={e => setRecipeDetails({ ...recipeDetails, servingSize: e.target.value })}
                    />
                </div>
                <div className="mb-4">
                    <select
                        className="shadow border rounded w-full py-2 px-3 text-gray-100 bg-zinc-700 border-zinc-800 leading-tight focus:outline-none focus:shadow-outline focus:ring-blue-500 focus:border-blue-500"
                        value={recipeDetails.difficultyLevel}
                        onChange={e => setRecipeDetails({ ...recipeDetails, difficultyLevel: e.target.value })}
                    >
                        <option value="">Select Difficulty Level</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Difficult">Difficult</option>
                    </select>
                </div>
                <div className="mb-4">
                    <select
                        id="region"
                        className="shadow border rounded w-full py-2 px-3 text-gray-100 bg-zinc-700 border-zinc-800 leading-tight focus:outline-none focus:shadow-outline focus:ring-blue-500 focus:border-blue-500"
                        value={recipeDetails.region}
                        onChange={e => setRecipeDetails({ ...recipeDetails, region: e.target.value })}
                    >
                        <option value="">Select a Region</option>
                        <option value="North America">North America</option>
                        <option value="South America">South America</option>
                        <option value="Europe">Europe</option>
                        <option value="Asia">Asia</option>
                        <option value="Africa">Africa</option>
                        <option value="Australia">Australia</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div className="mb-4">
                    <select
                        id="cuisineType"
                        className="shadow border rounded w-full py-2 px-3 text-gray-100 bg-zinc-700 border-zinc-800 leading-tight focus:outline-none focus:shadow-outline focus:ring-blue-500 focus:border-blue-500"
                        value={recipeDetails.cuisineType}
                        onChange={e => setRecipeDetails({ ...recipeDetails, cuisineType: e.target.value })}
                    >
                        <option value="">Select a Cuisine Type</option>
                        <option value="Italian">Italian</option>
                        <option value="Mexican">Mexican</option>
                        <option value="Indian">Indian</option>
                        <option value="Chinese">Chinese</option>
                        <option value="French">French</option>
                        <option value="Japanese">Japanese</option>
                        <option value="Mediterranean">Mediterranean</option>
                        <option value="Thai">Thai</option>
                        <option value="Greek">Greek</option>
                        <option value="American">American</option>
                        <option value="Middle Eastern">Middle Eastern</option>
                        <option value="African">African</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <input
                    type="text"
                    className="block w-full mt-4 mb-2 px-3 py-2 bg-zinc-700 border border-zinc-800 rounded-md text-gray-100 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Special Equipment (if required)"
                    value={recipeDetails.specialEquipment}
                    onChange={e => setRecipeDetails({ ...recipeDetails, specialEquipment: e.target.value })}
                />
                <div className="mb-4">
                    <input
                        type="checkbox"
                        id="kidFriendly"
                        checked={recipeDetails.kidFriendly}
                        onChange={e => setRecipeDetails({ ...recipeDetails, kidFriendly: e.target.checked })}
                    />
                    <span className="ml-2">Recipe is kid specific</span>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-200 text-sm font-bold mb-2">Is this recipe allergy-safe? If so select below</label>
                    {['Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Shellfish-Free', 'Soy-Free', 'Egg-Free', 'Other'].map((allergy, index) => (
                        <div key={index} className="flex items-center mb-2">
                            <input
                                type="checkbox"
                                id={`allergy-${index}`}
                                className="mr-2 leading-tight focus:outline-none focus:shadow-outline"
                                value={allergy}
                                checked={recipeDetails.allergySafe.includes(allergy)}
                                onChange={e => {
                                    const selectedAllergies = recipeDetails.allergySafe;
                                    if (e.target.checked) {
                                        selectedAllergies.push(allergy);
                                    } else {
                                        const indexToRemove = selectedAllergies.indexOf(allergy);
                                        if (indexToRemove > -1) {
                                            selectedAllergies.splice(indexToRemove, 1);
                                        }
                                    }
                                    setRecipeDetails({ ...recipeDetails, allergySafe: [...selectedAllergies] });
                                }}
                            />
                            <label htmlFor={`allergy-${index}`} className="text-gray-200">{allergy}</label>
                        </div>
                    ))}
                    {recipeDetails.allergySafe.includes('Other') && (
                        <input
                            type="text"
                            placeholder="Please specify other allergies"
                            className="block mt-2 w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                            value={recipeDetails.otherAllergy}
                            onChange={e => setRecipeDetails({ ...recipeDetails, otherAllergy: e.target.value })}
                        />
                    )}
                </div>
                {recipeDetails.ingredients.map((ingredient, index) => (
                    <div key={index} className="grid grid-cols-2 gap-4 mb-2">
                        <input
                            type="text"
                            className="shadow appearance-none border rounded py-2 px-3 text-gray-100 bg-zinc-700 border-zinc-800 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Ingredient Name"
                            value={ingredient.name}
                            onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                        />
                        <input
                            type="text"
                            className="shadow appearance-none border rounded py-2 px-3 text-gray-100 bg-zinc-700 border-zinc-800 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Quantity"
                            value={ingredient.quantity}
                            onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                        />
                    </div>
                ))}
                <button
                    onClick={addIngredientField}
                    className="bg-avax-red hover:bg-red-700 text-black font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    + Add Ingredient
                </button>
                <textarea
                    className="block w-full h-96 mt-4 mb-2 px-3 py-2 bg-zinc-700 border border-zinc-800 rounded-md text-gray-100 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe the method here..."
                    value={recipeDetails.method}
                    onChange={(e) => setRecipeDetails({...recipeDetails, method: e.target.value})}
                />
                <div className="pb-4 pt-4">
                    <label htmlFor="contributor" className="block text-gray-200 text-sm font-bold mb-2">Contributor</label>
                    <input
                        type="text"
                        id="contributor"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-100 bg-zinc-700 border-zinc-800 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Contributor Name"
                        value={recipeDetails.contributor}
                        onChange={e => setRecipeDetails({ ...recipeDetails, contributor: e.target.value })}
                    />
                </div>
                <div className="pb-8">
                    <label htmlFor="xUsername" className="block text-gray-200 text-sm font-bold mb-2">X Username</label>
                    <input
                        type="text"
                        id="xUsername"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-100 bg-zinc-700 border-zinc-800 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Username"
                        value={recipeDetails.xUsername}
                        onChange={e => setRecipeDetails({ ...recipeDetails, xUsername: e.target.value })}
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-100 text-sm font-bold mb-2">
                        Tag up to 3 different NFT communities
                    </label>
                    {['Avax Apes', 'Cuddlefish', 'Kingshit', 'Steady', 'The Spot', 'The Arena', 'No Chill', 'Cozyverse', 'Quirkies', 'Creature World'].map((community, index) => (
                        <div key={index} className="flex items-center mb-2">
                            <input
                                type="checkbox"
                                id={`community-${index}`}
                                className="mr-2 leading-tight focus:outline-none focus:shadow-outline"
                                value={community}
                                checked={recipeDetails.communityTags.includes(community)}
                                onChange={e => {
                                    let selectedTags = recipeDetails.communityTags;
                                    if (e.target.checked) {
                                        if (selectedTags.length < 3) {
                                            selectedTags = [...selectedTags, community];
                                        }
                                    } else {
                                        selectedTags = selectedTags.filter(tag => tag !== community);
                                    }
                                    setRecipeDetails({ ...recipeDetails, communityTags: selectedTags });
                                }}
                            />
                            <label htmlFor={`community-${index}`} className="text-gray-200">{community}</label>
                        </div>
                    ))}
                </div>
                <button onClick={handleSubmit} disabled={txProcessing} className="bg-avax-red hover:bg-red-700 rounded-md p-4 font-bold text-xl">
                    {txProcessing ? "Processing..." : "Mint Your Recipe!"}
                </button>
            </div>
            <div className="fixed bottom-20 left-10 w-96 h-96 pointer-events-none z-0">
                <img src={logo} className="absolute z-0 opacity-60" />
            </div>
        </div>
    );
};

export default Main;
