import React, { useState, useEffect } from "react";
import { collection, addDoc, query, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase2"; // Ensure this points to your firebase.js file

const ChatRoom = ({ account }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    useEffect(() => {
        const q = query(collection(db, "messages"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMessages(msgs);
        });
        return () => unsubscribe();
    }, []);

    const sendMessage = async () => {
        if (input.trim()) {
            try {
                await addDoc(collection(db, "messages"), {
                    text: input,
                    sender: account,
                    timestamp: serverTimestamp()
                });
                setInput("");
            } catch (error) {
                console.error("Error adding document: ", error);
            }
        }
    };

    return (
        <div className="chatroom">
            <div className="messages">
                {messages.map((msg) => (
                    <div key={msg.id}>
                        <strong>{msg.sender}</strong>: {msg.text}
                    </div>
                ))}
            </div>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            />
        </div>
    );
};

export default ChatRoom;
