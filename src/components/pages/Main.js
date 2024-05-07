import React, { useState } from "react";
import axios from "axios";

const Main = () => {
    const { setTxProcessing, txProcessing } = useState();
    const [recipeDetails, setRecipeDetails] = useState({
        recipeName: '',
        category: '',
        ingredients: Array.from({ length: 15 }, () => ({ name: '', quantity: '' })),
        method: '',
        contributor: '',
        region: '',
        kidFriendly: false,  // New field for kid-friendly
        allergySafe: [],      // New field for allergy-safe options
        prepTime: '',
        servingSize: '',
        difficultyLevel: '',
        cuisineType: '',
        specialEquipment: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState('');


    const handleIngredientChange = (index, field, value) => {
        const newIngredients = recipeDetails.ingredients.map((ingredient, i) => {
            if (i === index) {
                return { ...ingredient, [field]: value };
            }
            return ingredient;
        });
        setRecipeDetails({ ...recipeDetails, ingredients: newIngredients });
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

    const handleSubmit = async () => {
    
      try {
          const imageUrl = await uploadToIPFS();
          if (!imageUrl) {
              alert("Failed to upload image. Please try again.");
           
              return;
          }
  
          // Construct ingredients attributes
          const filledIngredients = recipeDetails.ingredients
              .filter(ing => ing.name && ing.quantity)
              .map((ing, index) => ({
                  trait_type: `Ingredient ${index + 1}`,
                  value: `${ing.name} (${ing.quantity})`
              }));
  
          // Construct other recipe attributes
          const otherAttributes = [
              { trait_type: "Category", value: recipeDetails.category },
              { trait_type: "Region", value: recipeDetails.region },
              { trait_type: "Kid-Friendly", value: recipeDetails.kidFriendly ? "Yes" : "No" },
              { trait_type: "Preparation Time", value: `${recipeDetails.prepTime} minutes` },
              { trait_type: "Serving Size", value: recipeDetails.servingSize },
              { trait_type: "Difficulty Level", value: recipeDetails.difficultyLevel },
              { trait_type: "Cuisine Type", value: recipeDetails.cuisineType },
              { trait_type: "Special Equipment", value: recipeDetails.specialEquipment },
              { trait_type: "Contributor", value: recipeDetails.contributor }
          ];
  
          // Construct allergy-safe attributes dynamically
          const allergySafeAttributes = recipeDetails.allergySafe.map((allergy, index) => ({
              trait_type: `Allergy-Safe ${index + 1}`,
              value: allergy
          }));
  
          // Combine all attributes
          const attributes = [
              ...filledIngredients,
              ...otherAttributes,
              ...allergySafeAttributes
          ];
  
          // Create the final metadata object
          const metadata = {
              name: recipeDetails.recipeName,
              description: 'Avax is Cookin',
              image: imageUrl,
              attributes
          };
  
          console.log("Recipe metadata prepared for minting:", metadata);
      } catch (error) {
          console.error("Error during recipe card customization:", error);
      } finally {
         
      }
  };
  
  
    return (
        <div className="bg-transparent pt-6"><div className="text-3xl font-bond text-white pb-8"><h1>Avax Cooks</h1></div> 
        <div className="text-xl text-white p-8 px-96">Welcome to Avax Cooks, where you can mint your signature BBQ cookout recipe, or any other recipe you may have sitting around ready to be created and enjoyed. If nothing else this bull run we will eat like kings... Share your favourites and view the collection. 0.1 avax to mint to avoid spamming, which will be adjusted according to the USD value of Avax.</div>
        <div className="text-xl text-white pb-8 px-96">It's easy. First choose an image for your recipe, second input the ingredients and quantity of that ingredient, and last enter the cooking method. Then hit Mint Recipe and your culinary taste will be forver minted on the Avax blockchain.</div>
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
    <span className="ml-2">Is this recipe kid-friendly?</span>
</div>

         {/* Ingredients */}
                {recipeDetails.ingredients.map((ingredient, index) => (
                    <div key={index} className="grid grid-cols-2 gap-4 mb-2">
                        <input
                            type="text"
                            className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Ingredient Name"
                            value={ingredient.name}
                            onChange={e => handleIngredientChange(index, 'name', e.target.value)}
                        />
                        <input
                            type="text"
                            className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="Quantity"
                            value={ingredient.quantity}
                            onChange={e => handleIngredientChange(index, 'quantity', e.target.value)}
                        />
                        
                    </div>
                ))}
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
                       <button onClick={handleSubmit} disabled={txProcessing} className="bg-red-500 rounded-md p-4 font-bold text-xl">
                    {txProcessing ? "Processing..." : "Mint Recipe"}
                </button>
            </div>
            
        </div>
    );
};

export default Main;
