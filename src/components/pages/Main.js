import React, { useState } from "react";
import axios from "axios";
import { ethers, Contract } from "ethers";
import { AVAXCOOKS_ABI, AVAXCOOKS_ADDRESS } from "../Contracts/AvaxCooks";
import avaxcooks from '../../assets/avaxcook_trans.png';

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

    const initialRecipeDetails = {
        recipeName: '',
        category: '',
        ingredients: [
            { name: "", quantity: "" },
            { name: "", quantity: "" }
        ],
        method: '',
        contributor: '',
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
                  value: ethers.utils.parseEther("0.01"), // Adjust the value as per your pricing
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
        // Add method as a separate trait
        const methodAttribute = { trait_type: "Method", value: recipeDetails.method };

          // Combine all attributes
          const attributes = [
              ...otherAttributes,
              ...allergySafeAttributes,
              ...filledIngredients,
              ...communityTagsAttributes,
              methodAttribute
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
  const handleReset = () => {
    setRecipeDetails(initialRecipeDetails);
    setImageFile(null);
    setImagePreviewUrl('');
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
        <div className="relative min-h-screen">
             <div className="py-8 md:py-0"><div className="mx-auto w-96 h-96 pointer-events-none block md:hidden pb-8">
                <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 419.18 474.09">
                    <defs>
                        <style>
                            {`.cls-1 { fill: #e84142; fill-rule: evenodd; }
                            .cls-1, .cls-2, .cls-3, .cls-4 { stroke-width: 0px; }
                            .cls-2, .cls-4 { fill: #000; }
                            .cls-5, .cls-4 { opacity: .39; }
                            .cls-6 { fill: none; stroke-linecap: round; }
                            .cls-6, .cls-7 { stroke: #000; stroke-miterlimit: 10; stroke-width: 18px; }
                            .cls-3 { fill: #f3f2f2; }
                            .cls-7 { fill: #fff; }`}
                        </style>
                    </defs>
                    <circle className="cls-7" cx="214.84" cy="345.61" r="97.32"/>
                    <g>
    <path class="cls-1" d="M334.71,345.61c0,66.2-53.67,119.87-119.87,119.87s-119.87-53.67-119.87-119.87,53.67-119.87,119.87-119.87,119.87,53.67,119.87,119.87ZM180.87,393.32h-23.26c-4.89,0-7.3,0-8.77-.94-1.59-1.03-2.56-2.74-2.68-4.62-.09-1.74,1.12-3.86,3.53-8.1l57.44-101.24c2.44-4.3,3.68-6.45,5.24-7.24,1.68-.85,3.68-.85,5.36,0,1.56.8,2.8,2.94,5.24,7.24l11.81,20.61.06.11c2.64,4.61,3.98,6.95,4.56,9.41.65,2.68.65,5.51,0,8.19-.59,2.47-1.91,4.83-4.59,9.51l-30.17,53.33-.08.14c-2.66,4.65-4,7.01-5.87,8.79-2.03,1.94-4.48,3.36-7.16,4.15-2.44.68-5.18.68-10.66.68ZM239.62,393.32h33.33c4.92,0,7.39,0,8.86-.97,1.59-1.03,2.59-2.77,2.68-4.65.08-1.68-1.1-3.72-3.41-7.71-.08-.14-.16-.27-.24-.42l-16.7-28.56-.19-.32c-2.35-3.97-3.53-5.97-5.05-6.75-1.68-.85-3.65-.85-5.33,0-1.53.8-2.77,2.89-5.21,7.1l-16.64,28.56-.06.1c-2.44,4.2-3.65,6.31-3.56,8.03.12,1.88,1.09,3.62,2.68,4.65,1.44.94,3.92.94,8.83.94Z"/>
    <path class="cls-2" d="M214.84,474.09c-70.84,0-128.48-57.64-128.48-128.48s57.64-128.48,128.48-128.48,128.48,57.64,128.48,128.48-57.64,128.48-128.48,128.48ZM214.84,234.36c-61.35,0-111.25,49.91-111.25,111.25s49.91,111.25,111.25,111.25,111.25-49.91,111.25-111.25-49.91-111.25-111.25-111.25ZM272.95,401.93h-33.33c-6.21,0-9.95,0-13.54-2.34-3.82-2.48-6.28-6.72-6.57-11.33v-.11c-.22-4.27,1.63-7.47,4.71-12.78l.06-.11,16.64-28.57c2.95-5.08,4.9-8.44,8.68-10.4,4.18-2.13,9.09-2.13,13.21-.03,3.75,1.91,5.66,5.14,8.55,10.04l.19.32,16.97,29.03c2.88,4.98,4.78,8.25,4.57,12.48-.22,4.62-2.68,8.91-6.6,11.44-3.58,2.36-7.33,2.36-13.55,2.36ZM276.05,388.72h0s0,0,0,0ZM238.72,384.7h35.14c-.08-.13-.16-.27-.23-.4l-.25-.44-16.84-28.8c-.09-.16-.19-.32-.28-.48-.15.26-.3.52-.45.77l-16.7,28.66c-.13.22-.26.45-.4.68ZM234.17,384.56h0ZM278.37,384.56h0ZM180.87,401.93h-23.26c-6.12,0-9.82,0-13.41-2.3-3.89-2.52-6.35-6.75-6.64-11.34v-.1c-.22-4.25,1.61-7.47,4.65-12.8l57.43-101.23c2.98-5.23,4.94-8.69,8.82-10.67,4.13-2.1,9.06-2.1,13.18,0,3.89,1.98,5.85,5.44,8.82,10.66l11.86,20.7c2.86,5,4.59,8.02,5.46,11.68.96,3.97.96,8.2,0,12.2-.89,3.72-2.62,6.75-5.49,11.77l-30.25,53.47c-2.89,5.05-4.63,8.1-7.41,10.75-2.98,2.85-6.67,4.99-10.64,6.17l-.16.04c-3.57.99-6.91.99-12.96.99ZM156.73,384.7h24.15c4.32,0,6.95,0,8.29-.35,1.35-.42,2.55-1.12,3.57-2.09.97-.92,2.24-3.15,4.35-6.83l.08-.14,30.15-53.3c2.24-3.91,3.41-5.99,3.71-7.27.33-1.38.33-2.81,0-4.17-.3-1.28-1.57-3.49-3.67-7.15l-11.87-20.72c-.14-.26-.3-.52-.45-.79-.15.26-.29.51-.43.76l-57.43,101.24c-.15.26-.3.53-.45.8Z"/>
  </g>
  <path class="cls-2" d="M112.36,273.44c-3.97,0-7.85-1.3-11.11-3.79-4.58-3.5-7.21-8.82-7.21-14.58,0-6.91,3.81-13.16,9.95-16.32l8.6-4.43c.38-.2.61-.58.61-1.01v-39.75c0-4.76,3.86-8.61,8.61-8.61s8.61,3.86,8.61,8.61v39.75c0,6.9-3.81,13.16-9.95,16.32l-8.61,4.44c-.38.2-.61.58-.61,1.01,0,.37.15.67.44.9.29.23.63.29.98.19l6.5-1.76c28.79-10.61,61.85-16.22,95.64-16.22s66.38,5.53,95.03,15.99l1.56.36c.57.13.99-.08,1.25-.28.25-.2.56-.56.56-1.15,0-.5-.25-.96-.67-1.23l-5.23-3.38c-5.35-3.46-8.54-9.33-8.54-15.7v-39.51c0-4.76,3.86-8.61,8.61-8.61s8.61,3.86,8.61,8.61v39.51c0,.5.25.96.67,1.23l5.23,3.38c5.35,3.46,8.54,9.33,8.54,15.7,0,5.74-2.58,11.08-7.08,14.65-4.5,3.57-10.28,4.87-15.88,3.56l-2.59-.6-.5-.18c-26.88-9.89-57.85-15.12-89.58-15.12s-63.04,5.28-90.02,15.28l-.74.24-6.87,1.86c-1.61.44-3.24.65-4.86.65Z"/>
  <path class="cls-4" d="M301.81,261.53c-26.68-8.66-56.53-13.23-86.97-13.23-33.05,0-65.39,5.38-93.73,15.54-4.39,6.02-8.16,12.64-11.16,19.54.8.11,1.6.17,2.41.17,1.62,0,3.25-.21,4.86-.65l6.87-1.86.74-.24c26.98-10,58.11-15.28,90.02-15.28s62.7,5.23,89.58,15.12l.5.18,2.59.6c3.05.71,6.15.65,9.07-.13-4.51-6.82-9.74-13.24-14.76-19.77Z"/>
  <path class="cls-2" d="M326.41,204.22c-18.94,0-36.81-6.84-54.18-13.49l-3.83-1.46c-20.06-7.63-40.04-8.76-57.79-3.26-4.55,1.4-9.37-1.14-10.78-5.68-1.41-4.54,1.14-9.37,5.68-10.78,21.46-6.65,45.32-5.4,69.01,3.61l3.86,1.47c18.15,6.95,36.91,14.13,55,11.94,13.93-1.69,28.3-9.08,42.72-21.96,11.31-10.1,18.7-19.98,22.6-30.21,7.9-20.7.68-46.6-16.79-60.23s-44.34-14.34-62.51-1.65c-3.9,2.72-9.27,1.77-11.99-2.13-2.72-3.9-1.77-9.27,2.13-11.99,24.51-17.12,59.4-16.2,82.97,2.19,23.57,18.39,32.94,52.02,22.29,79.95-4.9,12.86-13.81,24.94-27.22,36.91-17.1,15.27-34.63,24.09-52.13,26.21-3.05.37-6.06.54-9.06.54Z"/>
  <path class="cls-2" d="M300.56,124.26c-2.06,0-4.13-.74-5.78-2.23-3.52-3.2-3.79-8.64-.6-12.17,11.07-12.22,14-31.81,7.29-48.75-6.29-15.88-20.31-29.24-38.46-36.65-15.98-6.53-34.92-8.65-56.3-6.31-21.89,2.4-39.48,8.9-52.27,19.33-14.69,11.98-22.61,30.01-20.16,45.95.72,4.7-2.51,9.1-7.21,9.82-4.71.72-9.1-2.51-9.82-7.21-3.35-21.85,6.98-46.15,26.31-61.91,15.41-12.56,36.03-20.33,61.28-23.1,24.26-2.66,46.03-.14,64.7,7.49,22.46,9.18,39.94,26.04,47.95,46.25,9.08,22.91,4.84,49.7-10.54,66.67-1.7,1.88-4.04,2.83-6.38,2.83Z"/>
  <path class="cls-2" d="M77.63,212.31c-26.89,0-53.31-14.28-67.04-36.7-15.31-25-13.9-58.41,3.42-81.24,16.65-21.94,46.97-33.27,77.24-28.86,19.57,2.85,38.32,11.83,52.79,25.3,3.48,3.24,3.68,8.69.44,12.17-3.24,3.48-8.69,3.68-12.17.44-11.94-11.11-27.4-18.52-43.54-20.87-24.16-3.52-48.12,5.2-61.04,22.22-12.93,17.04-13.96,43.04-2.45,61.83,11.4,18.62,34.16,29.99,56.66,28.31,13.2-.99,26.95-5.92,44.56-16,5.04-2.88,10.13-6.01,15.05-9.03,9.64-5.92,19.61-12.05,30.24-17.03,29.7-13.92,63.82-18.28,96.08-12.29,4.68.87,7.76,5.37,6.89,10.04-.87,4.68-5.36,7.76-10.04,6.89-28.74-5.34-59.15-1.46-85.62,10.95-9.75,4.57-18.87,10.17-28.53,16.11-5.04,3.09-10.24,6.29-15.51,9.31-13.43,7.68-31.46,16.7-51.83,18.22-1.86.14-3.73.21-5.6.21Z"/>
  <path class="cls-3" d="M381.93,74.18c-16.77-13.08-42.19-14.26-60.27-3.11,2.35,18.44-2.88,37.31-14.71,50.36-1.7,1.88-4.04,2.83-6.38,2.83-2.06,0-4.13-.74-5.78-2.23-3.52-3.2-3.79-8.64-.6-12.17,11.07-12.22,14-31.81,7.29-48.75-6.29-15.88-20.31-29.24-38.46-36.65-15.98-6.53-34.92-8.65-56.3-6.31-21.89,2.4-39.48,8.9-52.27,19.33-14.5,11.82-22.39,29.55-20.24,45.33,3.45,2.45,6.76,5.12,9.85,8,3.48,3.24,3.68,8.69.44,12.17-3.24,3.48-8.69,3.68-12.17.44-11.94-11.11-27.4-18.52-43.54-20.87-24.16-3.52-48.12,5.2-61.04,22.22-12.93,17.04-13.96,43.04-2.45,61.83,11.4,18.62,34.16,29.99,56.66,28.31,13.2-.99,26.95-5.92,44.56-16,5.04-2.88,10.13-6.01,15.05-9.03,9.64-5.92,19.61-12.05,30.24-17.03,29.7-13.92,63.82-18.28,96.08-12.29,4.68.87,7.76,5.37,6.89,10.04-.87,4.68-5.36,7.76-10.04,6.89-28.74-5.34-59.15-1.46-85.62,10.95-9.75,4.57-18.87,10.17-28.53,16.11-5.04,3.09-10.24,6.29-15.51,9.31-1.48.85-3.03,1.71-4.62,2.58v36.85c0,6.9-3.81,13.16-9.95,16.32l-8.61,4.44c-.38.2-.61.58-.61,1.01,0,.37.15.67.44.9.29.23.63.29.98.19l6.5-1.76c28.79-10.61,61.85-16.22,95.64-16.22s66.38,5.53,95.03,15.99l1.56.36c.57.13.99-.08,1.25-.28.25-.2.56-.56.56-1.15,0-.5-.25-.96-.67-1.23l-5.23-3.38c-5.35-3.46-8.54-9.33-8.54-15.7v-32.8c-9.02-2.54-17.85-5.92-26.55-9.25l-3.83-1.46c-20.06-7.63-40.04-8.76-57.79-3.26-4.55,1.4-9.37-1.14-10.78-5.68-1.41-4.54,1.14-9.37,5.68-10.78,21.46-6.65,45.32-5.4,69.01,3.61l3.86,1.47c18.15,6.95,36.91,14.13,55,11.94,13.93-1.69,28.3-9.08,42.72-21.96,11.31-10.1,18.7-19.98,22.6-30.21,7.9-20.7.68-46.6-16.79-60.23Z"/>
  <g class="cls-5">
    <path class="cls-2" d="M368.69,163.24c-12.44,7.65-26.48,10.77-40.94,11.67-16.37,1.02-33.94-1.39-50.89-.85l1.53.58c18.15,6.95,36.91,14.13,55,11.94,13.93-1.69,28.3-9.08,42.72-21.96,9.16-8.18,15.74-16.21,19.99-24.41-7.54,9.3-17.28,16.79-27.42,23.02Z"/>
  </g>
  <g class="cls-5">
    <path class="cls-2" d="M137.38,85.18c1.12-8.23,3.93-16.54,7.08-23.76,4.39-10.08,10.6-19.42,19.22-26.36,5.71-4.59,11.9-8.45,18.34-11.89-10.79,3.38-20.03,8.16-27.58,14.31-14.5,11.82-22.39,29.55-20.24,45.33,1.08.77,2.14,1.56,3.18,2.37Z"/>
    <path class="cls-2" d="M142.43,164.74c-10.01,5.85-20.04,12.02-31.34,15.06-11.77,3.17-24.27,3.83-36.36,2.43-20.44-2.37-38.82-13.91-46.05-33.88-3.4-9.37-4.41-20.11-2.16-29.85,2.34-10.07,8.48-18.59,15.56-25.92.64-.66,1.29-1.3,1.94-1.94-6.39,3.69-11.96,8.45-16.28,14.15-12.93,17.04-13.96,43.04-2.45,61.83,11.4,18.62,34.16,29.99,56.66,28.31,13.2-.99,26.95-5.92,44.56-16,5.04-2.88,10.13-6.01,15.05-9.03,9.64-5.92,19.61-12.05,30.24-17.03,1.74-.82,3.5-1.6,5.27-2.35-12.36,2.86-23.64,7.79-34.63,14.22Z"/>
    <path class="cls-2" d="M155.19,227.32c-8.33-8.01-12.81-17.37-10.43-28.94,0-.04.01-.07.02-.11,1.36-6.52,5.52-12.11,11.22-15.56,8.57-5.19,17.67-9.59,26.91-13.34,17.04-6.92,34.96-11.22,53.13-14.15-19.62.44-39.16,4.9-56.93,13.23-9.75,4.57-18.87,10.17-28.53,16.11-.61.38-1.23.76-1.85,1.13h0c-2.11,1.3-4.26,2.61-6.42,3.91-.26.15-.51.31-.77.46-2.14,1.29-4.31,2.57-6.48,3.81-1.48.85-3.03,1.71-4.62,2.58v36.85c0,6.9-3.81,13.16-9.95,16.32l-8.61,4.44c-.38.2-.61.58-.61,1.01,0,.37.15.67.44.9.29.23.63.29.98.19l6.5-1.76c22.52-8.3,47.66-13.52,73.71-15.41-2.61-.37-5.27-.53-8.01-.68-11.42-.62-21.25-2.86-29.71-10.99Z"/>
    <path class="cls-2" d="M268.41,189.27c-19.21-7.31-38.35-8.63-55.53-3.9,3.43,2.52,7.86,3.79,12.18,4.53,9.53,1.65,19.26,1.67,28.84,2.94,15.35,2.02,30.65,7.59,44.88,14.33v-7.18c-9.02-2.54-17.85-5.92-26.55-9.25l-3.83-1.46Z"/>
  </g>
                </svg>
            </div></div>
        <div className="relative text-xl text-avax-white p-8 px-4 md:px-36 lg:px-40 xl:px-96">Welcome to Avax Cooks! The first world-wide, crowd sourced, on chain cook book! Submit your recipe to the soon to be largest recipe database worldwide! Stake your claim and mint your recipes!</div>
       
        
        <div className="text-xl text-avax-white pb-8 px-4 md:px-36 lg:px-40 xl:px-96">It's easy. Just choose an image to upload that will represent your recipe, then enter in as much data as possible about the recipe. Better data = better search results. It costs 0.05 avax to submit your recipe, which at the time is around $1USD and this fee should discourage spammers.</div>
        <div className="text-xl text-avax-white pb-8 px-4 md:px-36 lg:px-40 xl:px-96">Have fun, Rep your Communities and lets build..</div>
        <div className="pb-4"> <button onClick={handleReset} className="bg-avax-red hover:bg-red-700 rounded-md p-4 font-bold text-xl">
            Reset Form
        </button></div>
            <div className="sm:max-w-md md:max-w-xl mx-auto p-4 bg-avax-black text-gray-100 shadow-lg rounded-lg relative z-10 opacity-95">
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
                /></div>
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
                </select></div>

                {/* Preparation Time */}
                <input
                    type="number"
                    className="block w-full mt-4 mb-2 px-3 py-2 bg-zinc-700 border border-zinc-800 rounded-md text-gray-100 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Preparation Time (in minutes)"
                    min="0"
                    value={recipeDetails.prepTime}
                    onChange={e => setRecipeDetails({ ...recipeDetails, prepTime: e.target.value })}
                />

                {/* Serving Size */}
                <div className="mb-4"><input
                    type="number"
                    className="block w-full mt-4 mb-2 px-3 py-2 bg-zinc-700 border border-zinc-800 rounded-md text-gray-100 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Serving Size"
                    min="1"
                    value={recipeDetails.servingSize}
                    onChange={e => setRecipeDetails({ ...recipeDetails, servingSize: e.target.value })}
                /></div>

                {/* Difficulty Level */}
               <div className="mb-4"><select
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
                 {/* Region Dropdown */}
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

{/* Cuisine Type */}
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
                    {/* Special Equipment */}
                    <input
                    type="text"
                    className="block w-full mt-4 mb-2 px-3 py-2 bg-zinc-700 border border-zinc-800 rounded-md text-gray-100 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
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

                {/* Add Ingredient Button */}
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



                     <div className="pb-8"><label htmlFor="contributor" className="block text-gray-200 text-sm font-bold mb-2">Contributor</label>
    <input
        type="text"
        id="contributor"
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-100 bg-zinc-700 border-zinc-800 leading-tight focus:outline-none focus:shadow-outline"
        placeholder="Contributor Name"
        value={recipeDetails.contributor}
        onChange={e => setRecipeDetails({ ...recipeDetails, contributor: e.target.value })}
    /></div>
   
<div className="mb-4">
    <label className="block text-gray-100 text-sm font-bold mb-2">
        Tag up to 3 different Avax NFT communities
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
                 {/* Bottom-left Fixed Image */}
                 <div className="fixed bottom-20 left-10 w-96 h-96 pointer-events-none z-0 hidden md:block">
                <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 419.18 474.09">
                    <defs>
                        <style>
                            {`.cls-1 { fill: #e84142; fill-rule: evenodd; }
                            .cls-1, .cls-2, .cls-3, .cls-4 { stroke-width: 0px; }
                            .cls-2, .cls-4 { fill: #000; }
                            .cls-5, .cls-4 { opacity: .39; }
                            .cls-6 { fill: none; stroke-linecap: round; }
                            .cls-6, .cls-7 { stroke: #000; stroke-miterlimit: 10; stroke-width: 18px; }
                            .cls-3 { fill: #f3f2f2; }
                            .cls-7 { fill: #fff; }`}
                        </style>
                    </defs>
                    <circle className="cls-7" cx="214.84" cy="345.61" r="97.32"/>
                    <g>
    <path class="cls-1" d="M334.71,345.61c0,66.2-53.67,119.87-119.87,119.87s-119.87-53.67-119.87-119.87,53.67-119.87,119.87-119.87,119.87,53.67,119.87,119.87ZM180.87,393.32h-23.26c-4.89,0-7.3,0-8.77-.94-1.59-1.03-2.56-2.74-2.68-4.62-.09-1.74,1.12-3.86,3.53-8.1l57.44-101.24c2.44-4.3,3.68-6.45,5.24-7.24,1.68-.85,3.68-.85,5.36,0,1.56.8,2.8,2.94,5.24,7.24l11.81,20.61.06.11c2.64,4.61,3.98,6.95,4.56,9.41.65,2.68.65,5.51,0,8.19-.59,2.47-1.91,4.83-4.59,9.51l-30.17,53.33-.08.14c-2.66,4.65-4,7.01-5.87,8.79-2.03,1.94-4.48,3.36-7.16,4.15-2.44.68-5.18.68-10.66.68ZM239.62,393.32h33.33c4.92,0,7.39,0,8.86-.97,1.59-1.03,2.59-2.77,2.68-4.65.08-1.68-1.1-3.72-3.41-7.71-.08-.14-.16-.27-.24-.42l-16.7-28.56-.19-.32c-2.35-3.97-3.53-5.97-5.05-6.75-1.68-.85-3.65-.85-5.33,0-1.53.8-2.77,2.89-5.21,7.1l-16.64,28.56-.06.1c-2.44,4.2-3.65,6.31-3.56,8.03.12,1.88,1.09,3.62,2.68,4.65,1.44.94,3.92.94,8.83.94Z"/>
    <path class="cls-2" d="M214.84,474.09c-70.84,0-128.48-57.64-128.48-128.48s57.64-128.48,128.48-128.48,128.48,57.64,128.48,128.48-57.64,128.48-128.48,128.48ZM214.84,234.36c-61.35,0-111.25,49.91-111.25,111.25s49.91,111.25,111.25,111.25,111.25-49.91,111.25-111.25-49.91-111.25-111.25-111.25ZM272.95,401.93h-33.33c-6.21,0-9.95,0-13.54-2.34-3.82-2.48-6.28-6.72-6.57-11.33v-.11c-.22-4.27,1.63-7.47,4.71-12.78l.06-.11,16.64-28.57c2.95-5.08,4.9-8.44,8.68-10.4,4.18-2.13,9.09-2.13,13.21-.03,3.75,1.91,5.66,5.14,8.55,10.04l.19.32,16.97,29.03c2.88,4.98,4.78,8.25,4.57,12.48-.22,4.62-2.68,8.91-6.6,11.44-3.58,2.36-7.33,2.36-13.55,2.36ZM276.05,388.72h0s0,0,0,0ZM238.72,384.7h35.14c-.08-.13-.16-.27-.23-.4l-.25-.44-16.84-28.8c-.09-.16-.19-.32-.28-.48-.15.26-.3.52-.45.77l-16.7,28.66c-.13.22-.26.45-.4.68ZM234.17,384.56h0ZM278.37,384.56h0ZM180.87,401.93h-23.26c-6.12,0-9.82,0-13.41-2.3-3.89-2.52-6.35-6.75-6.64-11.34v-.1c-.22-4.25,1.61-7.47,4.65-12.8l57.43-101.23c2.98-5.23,4.94-8.69,8.82-10.67,4.13-2.1,9.06-2.1,13.18,0,3.89,1.98,5.85,5.44,8.82,10.66l11.86,20.7c2.86,5,4.59,8.02,5.46,11.68.96,3.97.96,8.2,0,12.2-.89,3.72-2.62,6.75-5.49,11.77l-30.25,53.47c-2.89,5.05-4.63,8.1-7.41,10.75-2.98,2.85-6.67,4.99-10.64,6.17l-.16.04c-3.57.99-6.91.99-12.96.99ZM156.73,384.7h24.15c4.32,0,6.95,0,8.29-.35,1.35-.42,2.55-1.12,3.57-2.09.97-.92,2.24-3.15,4.35-6.83l.08-.14,30.15-53.3c2.24-3.91,3.41-5.99,3.71-7.27.33-1.38.33-2.81,0-4.17-.3-1.28-1.57-3.49-3.67-7.15l-11.87-20.72c-.14-.26-.3-.52-.45-.79-.15.26-.29.51-.43.76l-57.43,101.24c-.15.26-.3.53-.45.8Z"/>
  </g>
  <path class="cls-2" d="M112.36,273.44c-3.97,0-7.85-1.3-11.11-3.79-4.58-3.5-7.21-8.82-7.21-14.58,0-6.91,3.81-13.16,9.95-16.32l8.6-4.43c.38-.2.61-.58.61-1.01v-39.75c0-4.76,3.86-8.61,8.61-8.61s8.61,3.86,8.61,8.61v39.75c0,6.9-3.81,13.16-9.95,16.32l-8.61,4.44c-.38.2-.61.58-.61,1.01,0,.37.15.67.44.9.29.23.63.29.98.19l6.5-1.76c28.79-10.61,61.85-16.22,95.64-16.22s66.38,5.53,95.03,15.99l1.56.36c.57.13.99-.08,1.25-.28.25-.2.56-.56.56-1.15,0-.5-.25-.96-.67-1.23l-5.23-3.38c-5.35-3.46-8.54-9.33-8.54-15.7v-39.51c0-4.76,3.86-8.61,8.61-8.61s8.61,3.86,8.61,8.61v39.51c0,.5.25.96.67,1.23l5.23,3.38c5.35,3.46,8.54,9.33,8.54,15.7,0,5.74-2.58,11.08-7.08,14.65-4.5,3.57-10.28,4.87-15.88,3.56l-2.59-.6-.5-.18c-26.88-9.89-57.85-15.12-89.58-15.12s-63.04,5.28-90.02,15.28l-.74.24-6.87,1.86c-1.61.44-3.24.65-4.86.65Z"/>
  <path class="cls-4" d="M301.81,261.53c-26.68-8.66-56.53-13.23-86.97-13.23-33.05,0-65.39,5.38-93.73,15.54-4.39,6.02-8.16,12.64-11.16,19.54.8.11,1.6.17,2.41.17,1.62,0,3.25-.21,4.86-.65l6.87-1.86.74-.24c26.98-10,58.11-15.28,90.02-15.28s62.7,5.23,89.58,15.12l.5.18,2.59.6c3.05.71,6.15.65,9.07-.13-4.51-6.82-9.74-13.24-14.76-19.77Z"/>
  <path class="cls-2" d="M326.41,204.22c-18.94,0-36.81-6.84-54.18-13.49l-3.83-1.46c-20.06-7.63-40.04-8.76-57.79-3.26-4.55,1.4-9.37-1.14-10.78-5.68-1.41-4.54,1.14-9.37,5.68-10.78,21.46-6.65,45.32-5.4,69.01,3.61l3.86,1.47c18.15,6.95,36.91,14.13,55,11.94,13.93-1.69,28.3-9.08,42.72-21.96,11.31-10.1,18.7-19.98,22.6-30.21,7.9-20.7.68-46.6-16.79-60.23s-44.34-14.34-62.51-1.65c-3.9,2.72-9.27,1.77-11.99-2.13-2.72-3.9-1.77-9.27,2.13-11.99,24.51-17.12,59.4-16.2,82.97,2.19,23.57,18.39,32.94,52.02,22.29,79.95-4.9,12.86-13.81,24.94-27.22,36.91-17.1,15.27-34.63,24.09-52.13,26.21-3.05.37-6.06.54-9.06.54Z"/>
  <path class="cls-2" d="M300.56,124.26c-2.06,0-4.13-.74-5.78-2.23-3.52-3.2-3.79-8.64-.6-12.17,11.07-12.22,14-31.81,7.29-48.75-6.29-15.88-20.31-29.24-38.46-36.65-15.98-6.53-34.92-8.65-56.3-6.31-21.89,2.4-39.48,8.9-52.27,19.33-14.69,11.98-22.61,30.01-20.16,45.95.72,4.7-2.51,9.1-7.21,9.82-4.71.72-9.1-2.51-9.82-7.21-3.35-21.85,6.98-46.15,26.31-61.91,15.41-12.56,36.03-20.33,61.28-23.1,24.26-2.66,46.03-.14,64.7,7.49,22.46,9.18,39.94,26.04,47.95,46.25,9.08,22.91,4.84,49.7-10.54,66.67-1.7,1.88-4.04,2.83-6.38,2.83Z"/>
  <path class="cls-2" d="M77.63,212.31c-26.89,0-53.31-14.28-67.04-36.7-15.31-25-13.9-58.41,3.42-81.24,16.65-21.94,46.97-33.27,77.24-28.86,19.57,2.85,38.32,11.83,52.79,25.3,3.48,3.24,3.68,8.69.44,12.17-3.24,3.48-8.69,3.68-12.17.44-11.94-11.11-27.4-18.52-43.54-20.87-24.16-3.52-48.12,5.2-61.04,22.22-12.93,17.04-13.96,43.04-2.45,61.83,11.4,18.62,34.16,29.99,56.66,28.31,13.2-.99,26.95-5.92,44.56-16,5.04-2.88,10.13-6.01,15.05-9.03,9.64-5.92,19.61-12.05,30.24-17.03,29.7-13.92,63.82-18.28,96.08-12.29,4.68.87,7.76,5.37,6.89,10.04-.87,4.68-5.36,7.76-10.04,6.89-28.74-5.34-59.15-1.46-85.62,10.95-9.75,4.57-18.87,10.17-28.53,16.11-5.04,3.09-10.24,6.29-15.51,9.31-13.43,7.68-31.46,16.7-51.83,18.22-1.86.14-3.73.21-5.6.21Z"/>
  <path class="cls-3" d="M381.93,74.18c-16.77-13.08-42.19-14.26-60.27-3.11,2.35,18.44-2.88,37.31-14.71,50.36-1.7,1.88-4.04,2.83-6.38,2.83-2.06,0-4.13-.74-5.78-2.23-3.52-3.2-3.79-8.64-.6-12.17,11.07-12.22,14-31.81,7.29-48.75-6.29-15.88-20.31-29.24-38.46-36.65-15.98-6.53-34.92-8.65-56.3-6.31-21.89,2.4-39.48,8.9-52.27,19.33-14.5,11.82-22.39,29.55-20.24,45.33,3.45,2.45,6.76,5.12,9.85,8,3.48,3.24,3.68,8.69.44,12.17-3.24,3.48-8.69,3.68-12.17.44-11.94-11.11-27.4-18.52-43.54-20.87-24.16-3.52-48.12,5.2-61.04,22.22-12.93,17.04-13.96,43.04-2.45,61.83,11.4,18.62,34.16,29.99,56.66,28.31,13.2-.99,26.95-5.92,44.56-16,5.04-2.88,10.13-6.01,15.05-9.03,9.64-5.92,19.61-12.05,30.24-17.03,29.7-13.92,63.82-18.28,96.08-12.29,4.68.87,7.76,5.37,6.89,10.04-.87,4.68-5.36,7.76-10.04,6.89-28.74-5.34-59.15-1.46-85.62,10.95-9.75,4.57-18.87,10.17-28.53,16.11-5.04,3.09-10.24,6.29-15.51,9.31-1.48.85-3.03,1.71-4.62,2.58v36.85c0,6.9-3.81,13.16-9.95,16.32l-8.61,4.44c-.38.2-.61.58-.61,1.01,0,.37.15.67.44.9.29.23.63.29.98.19l6.5-1.76c28.79-10.61,61.85-16.22,95.64-16.22s66.38,5.53,95.03,15.99l1.56.36c.57.13.99-.08,1.25-.28.25-.2.56-.56.56-1.15,0-.5-.25-.96-.67-1.23l-5.23-3.38c-5.35-3.46-8.54-9.33-8.54-15.7v-32.8c-9.02-2.54-17.85-5.92-26.55-9.25l-3.83-1.46c-20.06-7.63-40.04-8.76-57.79-3.26-4.55,1.4-9.37-1.14-10.78-5.68-1.41-4.54,1.14-9.37,5.68-10.78,21.46-6.65,45.32-5.4,69.01,3.61l3.86,1.47c18.15,6.95,36.91,14.13,55,11.94,13.93-1.69,28.3-9.08,42.72-21.96,11.31-10.1,18.7-19.98,22.6-30.21,7.9-20.7.68-46.6-16.79-60.23Z"/>
  <g class="cls-5">
    <path class="cls-2" d="M368.69,163.24c-12.44,7.65-26.48,10.77-40.94,11.67-16.37,1.02-33.94-1.39-50.89-.85l1.53.58c18.15,6.95,36.91,14.13,55,11.94,13.93-1.69,28.3-9.08,42.72-21.96,9.16-8.18,15.74-16.21,19.99-24.41-7.54,9.3-17.28,16.79-27.42,23.02Z"/>
  </g>
  <g class="cls-5">
    <path class="cls-2" d="M137.38,85.18c1.12-8.23,3.93-16.54,7.08-23.76,4.39-10.08,10.6-19.42,19.22-26.36,5.71-4.59,11.9-8.45,18.34-11.89-10.79,3.38-20.03,8.16-27.58,14.31-14.5,11.82-22.39,29.55-20.24,45.33,1.08.77,2.14,1.56,3.18,2.37Z"/>
    <path class="cls-2" d="M142.43,164.74c-10.01,5.85-20.04,12.02-31.34,15.06-11.77,3.17-24.27,3.83-36.36,2.43-20.44-2.37-38.82-13.91-46.05-33.88-3.4-9.37-4.41-20.11-2.16-29.85,2.34-10.07,8.48-18.59,15.56-25.92.64-.66,1.29-1.3,1.94-1.94-6.39,3.69-11.96,8.45-16.28,14.15-12.93,17.04-13.96,43.04-2.45,61.83,11.4,18.62,34.16,29.99,56.66,28.31,13.2-.99,26.95-5.92,44.56-16,5.04-2.88,10.13-6.01,15.05-9.03,9.64-5.92,19.61-12.05,30.24-17.03,1.74-.82,3.5-1.6,5.27-2.35-12.36,2.86-23.64,7.79-34.63,14.22Z"/>
    <path class="cls-2" d="M155.19,227.32c-8.33-8.01-12.81-17.37-10.43-28.94,0-.04.01-.07.02-.11,1.36-6.52,5.52-12.11,11.22-15.56,8.57-5.19,17.67-9.59,26.91-13.34,17.04-6.92,34.96-11.22,53.13-14.15-19.62.44-39.16,4.9-56.93,13.23-9.75,4.57-18.87,10.17-28.53,16.11-.61.38-1.23.76-1.85,1.13h0c-2.11,1.3-4.26,2.61-6.42,3.91-.26.15-.51.31-.77.46-2.14,1.29-4.31,2.57-6.48,3.81-1.48.85-3.03,1.71-4.62,2.58v36.85c0,6.9-3.81,13.16-9.95,16.32l-8.61,4.44c-.38.2-.61.58-.61,1.01,0,.37.15.67.44.9.29.23.63.29.98.19l6.5-1.76c22.52-8.3,47.66-13.52,73.71-15.41-2.61-.37-5.27-.53-8.01-.68-11.42-.62-21.25-2.86-29.71-10.99Z"/>
    <path class="cls-2" d="M268.41,189.27c-19.21-7.31-38.35-8.63-55.53-3.9,3.43,2.52,7.86,3.79,12.18,4.53,9.53,1.65,19.26,1.67,28.84,2.94,15.35,2.02,30.65,7.59,44.88,14.33v-7.18c-9.02-2.54-17.85-5.92-26.55-9.25l-3.83-1.46Z"/>
  </g>
                </svg>
            </div>
     
        </div>
        
    );
};

export default Main;
