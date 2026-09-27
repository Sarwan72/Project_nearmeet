import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
const AIAgentPage = () => {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);
    const sendMessage = async () => {
        if (!input.trim())
            return;
        const userMsg = { sender: "user", text: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        try {
            // const res = await axios.post("http://localhost:5001/api/ai/ask", {
            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/ai/ask`, {
                message: input,
            });
            const botMsg = { sender: "bot", text: res.data.reply };
            setMessages((prev) => [...prev, botMsg]);
        }
        catch (err) {
            console.log("ERROR:", err);
            alert(err.message);
            setMessages((prev) => [
                ...prev,
                { sender: "bot", text: "Error: AI is not responding." },
            ]);
        }
    };
    return (<div className="max-w-2xl mx-auto mt-10 p-4">
       <Link to="/vendor-home" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="logo" className="h-10 w-10 rounded-2xl"/>
          <span className="text-xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wide">
            NearMeet
          </span>
        </Link>
      <h1 className="text-3xl font-bold text-center mb-5">🤖 NearMeet AI Assistant</h1>

      {/* Chat Box */}
      <div className="h-[450px] overflow-y-auto border border-gray-300 bg-gray-50 p-4 rounded-xl shadow-sm">
        {messages.map((m, idx) => (<div key={idx} className={`my-3 flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] p-3 rounded-lg shadow text-sm ${m.sender === "user"
                ? "bg-blue-200 text-right"
                : "bg-green-200 text-left"}`}>
              <strong>{m.sender === "user" ? "You: " : "AI: "}</strong>
              {m.text}
            </div>
          </div>))}
      </div>

      {/* Input Section */}
      <div className="mt-4 flex gap-3">
        <input className="flex-1 p-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask something..."/>
        <button className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>);
};
export default AIAgentPage;
