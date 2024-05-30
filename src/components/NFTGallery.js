import React, { useEffect, useState } from "react";

const NFTGallery = ({ contract }) => {
    const [tokens, setTokens] = useState([]);

    useEffect(() => {
        if (contract) {
            // Fetch the token data and set state
        }
    }, [contract]);

    return (
        <div className="carousel">
            {tokens.map(token => (
                <div className="card" key={token.id}>
                    <img src={token.image} alt={token.metadata.name} />
                    <div>{token.metadata.name}</div>
                    <div>{token.metadata.arenaUsername}</div>
                    <div>{token.metadata.communityName}</div>
                    <div>{token.metadata.creatorComment}</div>
                </div>
            ))}
        </div>
    );
};

export default NFTGallery;
