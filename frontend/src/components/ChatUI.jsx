import React, { useRef, useEffect } from "react";
import { Send, Sparkles, Smile, ShieldCheck, CheckCheck, Coffee, } from "lucide-react";
const USER_SUGGESTIONS = [
    "👋 Hi! Looking forward to our table meetup",
    "⏱️ Running ~10 minutes late",
    "🍷 Can we get a quiet corner or window seat?",
    "🚗 Is parking / valet available at the venue?",
    "🍽️ Could we see today's special menu?",
];
const VENDOR_SUGGESTIONS = [
    "👋 Welcome! Your reserved table is ready & waiting.",
    "🥂 We've prepared a prime quiet corner for your party.",
    "✨ Any dietary preferences or requests we should know?",
    "📍 Please share your reservation name with our host desk on arrival.",
];
const QUICK_EMOJIS = ["👍", "❤️", "🥂", "☕", "🎉", "✨", "🍕", "🙏"];
const formatMessageTime = (dateStr) => {
    if (!dateStr)
        return "";
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime()))
            return "";
        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    catch {
        return "";
    }
};
const ChatUI = ({ title, subtitle, partnerName, partnerAvatar, partnerRole, tableName, messages, text, setText, sendMessage, self, isLoading = false, }) => {
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    // Auto-scroll on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (text.trim()) {
                sendMessage();
            }
        }
    };
    const handleQuickSuggestion = (suggestionText) => {
        sendMessage(suggestionText);
    };
    const handleEmojiClick = (emoji) => {
        setText(text + emoji);
        inputRef.current?.focus();
    };
    const suggestions = self === "user" ? USER_SUGGESTIONS : VENDOR_SUGGESTIONS;
    return (<div className="flex-1 flex flex-col h-[calc(100vh-65px)] max-w-5xl w-full mx-auto p-2 sm:p-4">
      {/* Interactive Chat Card Container */}
      <div className="flex-1 flex flex-col bg-base-100 rounded-3xl shadow-xl border border-base-300 overflow-hidden">
        {/* Top Active Bar */}
        <div className="px-5 py-3.5 bg-base-100/90 backdrop-blur-md border-b border-base-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl overflow-hidden ring-2 ring-primary/30 bg-base-200">
                <img src={partnerAvatar ||
            `https://api.dicebear.com/7.x/identicon/svg?seed=${partnerName || title}`} alt={partnerName || title} className="w-full h-full object-cover" onError={(e) => {
            e.currentTarget.src = "/logo.png";
        }}/>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-base-100 rounded-full animate-pulse"/>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-base-content truncate">
                  {partnerName || title}
                </h2>
                <span className="badge badge-primary badge-xs uppercase text-[9px] font-bold tracking-wider px-2 py-1">
                  {partnerRole || (self === "user" ? "Venue" : "Guest")}
                </span>
              </div>
              <p className="text-xs text-base-content/60 flex items-center gap-1.5 truncate">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Active Connection</span>
                {tableName && (<>
                    <span>•</span>
                    <span className="text-primary font-medium">{tableName}</span>
                  </>)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-success/10 text-success text-xs font-semibold border border-success/20">
              <ShieldCheck className="w-4 h-4"/>
              <span>Verified Paid Reservation</span>
            </div>
          </div>
        </div>

        {/* Message Feed Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gradient-to-b from-base-200/50 to-base-100/50">
          {/* Welcome & Info Card */}
          <div className="mx-auto max-w-md my-2 p-3.5 rounded-2xl bg-base-200/70 border border-base-300 text-center shadow-sm">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-primary mb-1">
              <Sparkles className="w-3.5 h-3.5"/>
              <span>Table Reservation Confirmed</span>
            </div>
            <p className="text-[12px] text-base-content/70 leading-relaxed">
              {self === "user"
            ? "Your table payment is confirmed! You can discuss seating, arrival time, or special dietary requirements directly with the venue team."
            : "The guest has completed their table reservation payment. You can coordinate their arrival, reserved booth, and welcome drinks."}
            </p>
          </div>

          {/* Empty Conversation State */}
          {messages.length === 0 && !isLoading && (<div className="flex flex-col items-center justify-center py-10 text-center text-base-content/60">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                <Coffee className="w-7 h-7"/>
              </div>
              <h3 className="font-bold text-base text-base-content mb-1">
                Say hello! Start the conversation
              </h3>
              <p className="text-xs max-w-sm">
                Choose one of the quick suggestions below or type your custom message to
                coordinate your meeting.
              </p>
            </div>)}

          {/* Messages List */}
          {messages.map((m, index) => {
            const isMe = m.sender === self;
            const timeStr = formatMessageTime(m.createdAt || m.created_at);
            return (<div key={m.id || index} className={`chat ${isMe ? "chat-end" : "chat-start"} animate-in fade-in-50 duration-200`}>
                <div className="chat-image avatar">
                  <div className="w-8 h-8 rounded-xl ring-1 ring-base-300 overflow-hidden bg-base-300">
                    <img src={isMe
                    ? self === "user"
                        ? `https://api.dicebear.com/7.x/adventurer/svg?seed=me`
                        : "/logo.png"
                    : partnerAvatar ||
                        `https://api.dicebear.com/7.x/identicon/svg?seed=${partnerName || "partner"}`} alt="avatar" className="w-full h-full object-cover" onError={(e) => {
                    e.currentTarget.src = "/logo.png";
                }}/>
                  </div>
                </div>

                <div className="chat-header text-[11px] text-base-content/60 mb-1 flex items-center gap-1.5">
                  <span className="font-semibold">
                    {isMe ? "You" : partnerName || (self === "user" ? "Venue" : "Guest")}
                  </span>
                  {timeStr && <time className="text-[10px] opacity-75">{timeStr}</time>}
                </div>

                <div className={`chat-bubble text-sm font-medium leading-relaxed shadow-sm ${isMe
                    ? "chat-bubble-primary text-primary-content shadow-primary/20"
                    : "bg-base-200 text-base-content border border-base-300"}`}>
                  {m.text}
                </div>

                <div className="chat-footer opacity-60 text-[10px] mt-1 flex items-center gap-1">
                  {isMe ? (<span className="flex items-center gap-0.5 text-primary">
                      <CheckCheck className="w-3 h-3"/> Sent
                    </span>) : (<span>Delivered</span>)}
                </div>
              </div>);
        })}

          <div ref={messagesEndRef}/>
        </div>

        {/* Quick Suggestion Chips Bar */}
        <div className="px-4 py-2 bg-base-100 border-t border-base-300/80">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <span className="text-[11px] font-bold text-base-content/50 uppercase tracking-wider flex items-center gap-1 shrink-0">
              <Sparkles className="w-3 h-3 text-warning"/> Quick:
            </span>
            {suggestions.map((suggestion, idx) => (<button key={idx} type="button" onClick={() => handleQuickSuggestion(suggestion)} className="btn btn-xs rounded-xl bg-base-200 hover:bg-primary hover:text-primary-content border-base-300 font-normal text-xs whitespace-nowrap transition-colors">
                {suggestion}
              </button>))}
          </div>
        </div>

        {/* Bottom Input & Emoji Bar */}
        <div className="p-3 sm:p-4 bg-base-100 border-t border-base-300 flex flex-col gap-2">
          {/* Quick Reaction Emojis */}
          <div className="flex items-center gap-1.5 px-1 overflow-x-auto no-scrollbar">
            <span className="text-[11px] text-base-content/40 font-medium mr-1">Reactions:</span>
            {QUICK_EMOJIS.map((emoji, idx) => (<button key={idx} type="button" onClick={() => handleEmojiClick(emoji)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-base-200 text-sm transition-transform active:scale-95" title={`Insert ${emoji}`}>
                {emoji}
              </button>))}
          </div>

          {/* Input field + Send button */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input ref={inputRef} type="text" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={handleKeyDown} placeholder={self === "user"
            ? "Type a message to the venue team..."
            : "Type a reply to the guest..."} className="input input-bordered w-full rounded-2xl pr-10 bg-base-200/50 focus:bg-base-100 text-sm focus:outline-primary transition-all"/>
              <button type="button" onClick={() => handleEmojiClick(" 😊")} className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content/80 transition-colors">
                <Smile className="w-5 h-5"/>
              </button>
            </div>

            <button type="button" onClick={() => sendMessage()} disabled={!text.trim()} className="btn btn-primary rounded-2xl px-5 font-bold shadow-md shadow-primary/20 transition-transform active:scale-95 disabled:opacity-40">
              <Send className="w-4 h-4 mr-1 sm:mr-1.5"/>
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>);
};
export default ChatUI;
