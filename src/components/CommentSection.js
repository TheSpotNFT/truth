import React, { useState, useEffect } from "react";
import { ethers, Contract } from "ethers";
import { IPRSCOMMENTS_ABI, IPRSCOMMENTS_ADDRESS } from "./Contracts/IprsComments";

const CommentSection = ({ tokenId, account }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tipAmount, setTipAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState("USDC"); // Example token
  const [whitelistedTokens, setWhitelistedTokens] = useState([]);

  useEffect(() => {
    if (showComments) {
      fetchComments();
      fetchWhitelistedTokens();
    }
  }, [showComments]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new Contract(IPRSCOMMENTS_ADDRESS, IPRSCOMMENTS_ABI, provider);
      const comments = await contract.getComments(tokenId);
      setComments(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWhitelistedTokens = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new Contract(IPRSCOMMENTS_ADDRESS, IPRSCOMMENTS_ABI, provider);
      const tokens = await contract.getWhitelistedTokens();
      setWhitelistedTokens(tokens);
    } catch (error) {
      console.error("Error fetching whitelisted tokens:", error);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new Contract(IPRSCOMMENTS_ADDRESS, IPRSCOMMENTS_ABI, signer);
      const tx = await contract.addComment(tokenId, newComment);
      await tx.wait();
      setNewComment("");
      fetchComments();
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const tipCommenter = async (commentId) => {
    if (!tipAmount || tipAmount <= 0) return;
    
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new Contract(IPRSCOMMENTS_ADDRESS, IPRSCOMMENTS_ABI, signer);
      const tx = await contract.tip(commentId, selectedToken, ethers.utils.parseUnits(tipAmount, 18)); // Assuming 18 decimals
      await tx.wait();
      setTipAmount("");
    } catch (error) {
      console.error("Error tipping commenter:", error);
    }
  };

  return (
    <div className="w-full">
      <button onClick={() => setShowComments(!showComments)} className="bg-neutral-800 text-white px-3 py-1 rounded w-full">
        {showComments ? `Hide Comments (${comments.length})` : `Show Comments (${comments.length})`}
      </button>
      {showComments && (
        <div>
          {loading ? (
            <p>Loading comments...</p>
          ) : (
            <div>
              {comments.map((comment, index) => (
                <div key={index} className="bg-neutral-800 text-gray-100 p-2 rounded mb-2">
                  <div className="text-xs text-gray-400">
                    {comment.commenter} - {new Date(comment.timestamp * 1000).toLocaleString()}
                  </div>
                  <div>{comment.content}</div>
                  <div className="flex mt-2">
                    <input
                      type="number"
                      placeholder="Tip Amount"
                      value={tipAmount}
                      onChange={(e) => setTipAmount(e.target.value)}
                      className="shadow appearance-none border rounded py-2 px-3 bg-neutral-800 border-neutral-700 text-gray-100 leading-tight focus:outline-none focus:shadow-outline w-full mr-2"
                    />
                    <button onClick={() => tipCommenter(comment.id)} className="bg-avax-red text-white px-3 py-1 rounded hover:bg-red-600 duration-300">
                      Tip
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center mt-4">
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="shadow appearance-none border rounded py-2 px-3 bg-neutral-800 border-neutral-700 text-gray-100 leading-tight focus:outline-none focus:shadow-outline w-full"
            />
            <button onClick={addComment} className="bg-avax-red text-white ml-2 px-3 py-1 rounded hover:bg-red-600 duration-300">
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
