import React, { useState } from "react";
import axios from "axios";
import { ethers, Contract } from "ethers";
import { AVAXCOOKS_ABI, AVAXCOOKS_ADDRESS } from "../Contracts/AvaxCooks";

const Main = ({account}) => {
    const { setTxProcessing, txProcessing } = useState();
    const [recipeDetails, setRecipeDetails] = useState({
        recipeName: '',
        category: '',
        ingredients: [
            { name: "", quantity: "" }, // Start with two fields initially
            { name: "", quantity: "" }
        ],
        method: '',
        contributor: '',
        region: '',
        kidFriendly: false,  // New field for kid-friendly
        allergySafe: [],      // New field for allergy-safe options
        prepTime: '',
        servingSize: '',
        difficultyLevel: '',
        cuisineType: '',
        specialEquipment: '',
        communityTags: [] 
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState('');

    

    const handleIngredientChange = (index, field, value) => {
        const newIngredients = [...recipeDetails.ingredients];
        newIngredients[index][field] = value;
        setRecipeDetails({ ...recipeDetails, ingredients: newIngredients });
    };
  // Function to add more ingredient fields
  const addIngredientField = () => {
    setRecipeDetails({ ...recipeDetails, ingredients: [...recipeDetails.ingredients, { name: "", quantity: "" }] });
};

    const handleImageChange = (event) => {
      if (event.target.files && event.target.files[0]) {
          const file = event.target.files[0];
          setImageFile(file); // Store the file in state for uploading
  
          const reader = new FileReader();
          reader.onloadend = () => {
              setImagePreviewUrl(reader.result); // Set local preview URL
          };
          reader.readAsDataURL(file); // Read the file to generate a data URL for preview
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
                    'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIwZmQ5MzgwYy1mYmI2LTQ1OWQtYjkzYy00Mzk3ZjNmMWVlZjYiLCJlbWFpbCI6ImpqemltbWVyQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiTllDMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiIzMmY5YWY0YzIwNTE2NTMxOWYyYyIsInNjb3BlZEtleVNlY3JldCI6Ijg3MWYwODVmMGEyM2FiZmU3YjMzOWNkODBiMzNmNGMwOTM5NGMzMTNjODRlYmViNDNkZGY0ZDYwMGFjNjgzYjkiLCJpYXQiOjE2NjY1NjcyMzB9.6GHJUEgK0W_Cc-z9ZxGBGbETjvSUKo8h6yh7u4__t_k`
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
        //setTxProcessing(true);
         // Retrieve the actual account address string
   
    console.log("Address:", account)
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
        console.log("account", account);
               // Price calculation (adjust as needed)
              let options = {
                  value: ethers.utils.parseEther("0.05"), // Adjust the value as per your pricing
              };
      
            // Call the contract's mint function
            let tx = await contract.mint(account, metadataUrl, options);
                console.log(tx.hash);
                //setTxProcessing(false);
                /*alert(
                  "Minted Successfully! View your NFT on Campfire, Kalao or Joepegs!"
                );*/
              } else {
                console.log("error with contract abi, address, or signer");
              }
            }
          } catch (error) {
            console.log("Error on mint");
            console.log(error);
            alert(error.data.message);
          } finally {
            //setTxProcessing(false);
          }
      }

    const handleSubmit = async () => {
        // Retrieve the mandatory fields from the form data
    const { recipeName, method, ingredients } = recipeDetails;

    // Check that at least two ingredients are filled out (both name and quantity)
    const filledIngredientsCount = ingredients.filter(ing => ing.name && ing.quantity).length;

    // Perform the validation check for mandatory fields
    if (!recipeName || !method || filledIngredientsCount < 2) {
        alert("??!! How is that a recipe? You must enter: Recipe Name, Method, and at least 2 Ingredients.");
        return;
    }

     // Check if the account is available
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
          .filter(ing => ing.name && ing.quantity) // Ensure both fields are filled
          .map(ing => ({
              trait_type: ing.name, // Ingredient name as trait type
              value: ing.quantity   // Quantity as value
          }));
  
            // Utility function to add attributes only if they are not empty
        const addAttributeIfNotEmpty = (trait_type, value) => {
            // Check for empty, null, undefined, and zero values specifically
            if (value === null || value === undefined || value === '' || value === 0) {
                return null;
            }
            return { trait_type, value };
        };

            
        // Conditionally include non-empty fields
        const otherAttributes = [
            addAttributeIfNotEmpty("Category", recipeDetails.category),
            addAttributeIfNotEmpty("Preparation Time", recipeDetails.prepTime ? `${recipeDetails.prepTime} minutes` : null),
            addAttributeIfNotEmpty("Serving Size", recipeDetails.servingSize),
            addAttributeIfNotEmpty("Difficulty Level", recipeDetails.difficultyLevel),
            addAttributeIfNotEmpty("Region", recipeDetails.region),
            addAttributeIfNotEmpty("Cuisine Type", recipeDetails.cuisineType),
            { trait_type: "Kid-Specific", value: recipeDetails.kidFriendly ? "Yes" : "No" },
            addAttributeIfNotEmpty("Special Equipment", recipeDetails.specialEquipment),
            addAttributeIfNotEmpty("Contributor", recipeDetails.contributor)
        ].filter(attr => attr !== null); // Remove any null values

           // Conditionally add "Special Equipment" only if there's a value
        if (recipeDetails.specialEquipment) {
            otherAttributes.push({
                trait_type: "Special Equipment",
                value: recipeDetails.specialEquipment
            });
        }
  
        // Map through allergy-safe options to include only checked ones with value "true"
        const allergySafeAttributes = recipeDetails.allergySafe.map(allergy => ({
            trait_type: allergy,  // The allergy name itself as trait type
            value: "true"         // Hard-coded true for checked
        }));
  
          // Construct community tag attributes
          const communityTagsAttributes = recipeDetails.communityTags.map((community, index) => ({
            trait_type: `Community Tag`,
            value: community
        }));

          // Combine all attributes
          const attributes = [
              ...otherAttributes,
              ...allergySafeAttributes,
              ...filledIngredients,
              ...communityTagsAttributes
             
          ];
  
          // Create the final metadata object
          const metadata = {
              name: recipeDetails.recipeName,
              description: 'Avax is Cookin',
              image: `ipfs://${imageUrl}`,
              attributes
          };

  
          console.log("Recipe metadata prepared for minting:", metadata);
        // Upload metadata to IPFS
        const metadataUrl = await uploadMetadataToIPFS(metadata);

        if (metadataUrl) {
            console.log("Metadata uploaded to IPFS at:", metadataUrl);
            mintNFT(metadataUrl);
        } else {
            alert("Failed to upload metadata. Please try again.");
        }
        
          
      } catch (error) {
          console.error("Error during recipe card customization:", error);
      } finally {
         
      }
  };

  // Function to upload metadata to IPFS
const uploadMetadataToIPFS = async (metadata) => {
    const jsonString = JSON.stringify(metadata);

    const formData = new FormData();
    formData.append('file', new Blob([jsonString], { type: 'application/json' }), 'metadata.json');

    try {
        const response = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
            maxBodyLength: "Infinity",
            headers: {
                'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
                Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIwZmQ5MzgwYy1mYmI2LTQ1OWQtYjkzYy00Mzk3ZjNmMWVlZjYiLCJlbWFpbCI6ImpqemltbWVyQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiTllDMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiIzMmY5YWY0YzIwNTE2NTMxOWYyYyIsInNjb3BlZEtleVNlY3JldCI6Ijg3MWYwODVmMGEyM2FiZmU3YjMzOWNkODBiMzNmNGMwOTM5NGMzMTNjODRlYmViNDNkZGY0ZDYwMGFjNjgzYjkiLCJpYXQiOjE2NjY1NjcyMzB9.6GHJUEgK0W_Cc-z9ZxGBGbETjvSUKo8h6yh7u4__t_k` // Replace with your Pinata JWT
            }
        });

        const ipfsHash = response.data.IpfsHash;
        console.log(ipfsHash);
        return `ipfs://${ipfsHash}`;
        
    } catch (error) {
        console.error("Error uploading metadata to IPFS:", error);
        return null;
    }
};
  
  
    return (
        <div className="bg-transparent pt-6">
        <div className="text-xl text-white p-8 px-4 md:px-36 lg:px-40 xl:px-96">Welcome to Avax Cooks, where you can mint your signature BBQ cookout recipe, or any other recipe you may have sitting around ready to be created and enjoyed. If nothing else this bull run we will eat like kings... Share your favourites and view the collection. 0.05 avax to mint.</div>
        <div className="text-xl text-white pb-8 px-4 md:px-36 lg:px-40 xl:px-96">It's easy. First choose an image for your recipe, then go through the form and fill that shit out. Then hit Mint Recipe MFER and your culinary taste will be forver minted on the Avax blockchain.</div>
            <div className="max-w-md mx-auto p-4 bg-white shadow-lg rounded">
            <div className="pb-4 font-bold"><h1>Upload an image</h1></div>
            <input type="file" onChange={handleImageChange} />
            {imagePreviewUrl && (
                <div className="mt-4">
                    <img src={imagePreviewUrl} alt="Uploaded Preview" className="max-w-full h-auto rounded p-4" />
                </div>
            )}
            <input
                    type="text"
                    className="block w-full mt-4 mb-2 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Recipe Name"
                    value={recipeDetails.recipeName}
                    onChange={e => setRecipeDetails({ ...recipeDetails, recipeName: e.target.value })}
                />
            <select
                    className="block w-full mt-4 mb-2 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                    value={recipeDetails.category}
                    onChange={e => setRecipeDetails({ ...recipeDetails, category: e.target.value })}
                >
                    <option value="">Select a Category</option>
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Dinner">Dinner</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Other">Other</option>
                </select>

                {/* Preparation Time */}
                <input
                    type="number"
                    className="block w-full mt-4 mb-2 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Preparation Time (in minutes)"
                    min="0"
                    value={recipeDetails.prepTime}
                    onChange={e => setRecipeDetails({ ...recipeDetails, prepTime: e.target.value })}
                />

                {/* Serving Size */}
                <input
                    type="number"
                    className="block w-full mt-4 mb-2 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Serving Size"
                    min="1"
                    value={recipeDetails.servingSize}
                    onChange={e => setRecipeDetails({ ...recipeDetails, servingSize: e.target.value })}
                />

                {/* Difficulty Level */}
                <select
                    className="block w-full mt-4 mb-2 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                    value={recipeDetails.difficultyLevel}
                    onChange={e => setRecipeDetails({ ...recipeDetails, difficultyLevel: e.target.value })}
                >
                    <option value="">Select Difficulty Level</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Difficult">Difficult</option>
                </select>

                 {/* Region Dropdown */}
<div className="mb-4">
    
    <select
        id="region"
        className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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

{/* Cuisine Type */}
<div className="mb-4">
  
    <select
        id="cuisineType"
        className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
                    {/* Special Equipment */}
                    <input
                    type="text"
                    className="block w-full mt-4 mb-2 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Special Equipment (if required)"
                    value={recipeDetails.specialEquipment}
                    onChange={e => setRecipeDetails({ ...recipeDetails, specialEquipment: e.target.value })}
                />
         
{/* Kid-Friendly Checkbox */}
<div className="mb-4">

    <input
        type="checkbox"
        id="kidFriendly"
        checked={recipeDetails.kidFriendly}
        onChange={e => setRecipeDetails({ ...recipeDetails, kidFriendly: e.target.checked })}
    />
    <span className="ml-2">Recipe is kid specific</span>
</div>

{/* Allergy-Safe Checkboxes with "Other" Textbox*/}
<div className="mb-4">
    <label className="block text-gray-700 text-sm font-bold mb-2">Is this recipe allergy-safe? If so select below</label>
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
            <label htmlFor={`allergy-${index}`} className="text-gray-700">{allergy}</label>
        </div>
    ))}

    {/* Display the 'Other' text input if the 'Other' checkbox is selected */}
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



            {/* Ingredient Inputs */}
            {recipeDetails.ingredients.map((ingredient, index) => (
                    <div key={index} className="grid grid-cols-2 gap-4 mb-2">
                        <input
                            type="text"
                            className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Ingredient Name"
                            value={ingredient.name}
                            onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                        />
                        <input
                            type="text"
                            className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Quantity"
                            value={ingredient.quantity}
                            onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                        />
                    </div>
                ))}

                {/* Add Ingredient Button */}
                <button
                    onClick={addIngredientField}
                    className="bg-red-500 hover:bg-red-700 text-black font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    + Add Ingredient
                </button>
                  <textarea
                        className="block w-full mt-4 mb-2 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Describe the method here..."
                        value={recipeDetails.method}
                        onChange={(e) => setRecipeDetails({...recipeDetails, method: e.target.value})}
                    />



                     <div className="pb-8"><label htmlFor="contributor" className="block text-gray-700 text-sm font-bold mb-2">Contributor</label>
    <input
        type="text"
        id="contributor"
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        placeholder="Contributor Name"
        value={recipeDetails.contributor}
        onChange={e => setRecipeDetails({ ...recipeDetails, contributor: e.target.value })}
    /></div>
   
<div className="mb-4">
    <label className="block text-gray-700 text-sm font-bold mb-2">
        Tag up to 3 different Avax NFT communities
    </label>
    {['Avax Apes', 'Cuddlefish', 'Kingshit', 'Steady', 'The Spot', 'The Arena', 'No Chill'].map((community, index) => (
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
            <label htmlFor={`community-${index}`} className="text-gray-700">{community}</label>
        </div>
    ))}
</div>
                       <button onClick={handleSubmit} disabled={txProcessing} className="bg-red-500 hover:bg-red-700 rounded-md p-4 font-bold text-xl">
                    {txProcessing ? "Processing..." : "Mint Recipe MFER!"}
                </button>
            </div>
            
        </div>
    );
};

export default Main;
