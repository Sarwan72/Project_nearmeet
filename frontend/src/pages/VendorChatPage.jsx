import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { io } from "socket.io-client";
import ChatUI from "../components/ChatUI";
import VendorNavbar from "../components/VendorNavbar";
import { axiosInstance } from "../lib/axios";
import { Lock, Clock, CreditCard, ArrowLeft, CheckCircle2, } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";
const VendorChatPage = () => {
    const { userId } = useParams();
    const vendor = JSON.parse(localStorage.getItem("vendor") || "{}");
    const vendorId = vendor?.id || vendor?._id;
    const [loading, setLoading] = useState(true);
    const [eligibility, setEligibility] = useState({ canChat: false, status: "loading" });
    const [userInfo, setUserInfo] = useState(null);
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    useEffect(() => {
        if (!userId || !vendorId)
            return;
        const checkEligibility = async () => {
            try {
                setLoading(true);
                // Fetch eligibility
                const res = await axiosInstance.get(`/bookings/vendor-chat-eligibility/${userId}`);
                setEligibility(res.data);
                // If unlocked, fetch message history
                if (res.data?.canChat) {
                    try {
                        const histRes = await axiosInstance.get(`/bookings/vendor-chat-messages/${userId}`);
                        if (histRes.data?.messages) {
                            setMessages(histRes.data.messages);
                        }
                    }
                    catch (histErr) {
                        console.error("Error fetching vendor chat history:", histErr);
                    }
                }
                // Fetch user basic profile if available
                try {
                    const uRes = await axiosInstance.get(`/users/${userId}`);
                    setUserInfo(uRes.data?.user || null);
                }
                catch {
                    // Non-critical
                }
            }
            catch (err) {
                console.error("Error verifying vendor chat eligibility:", err);
                setEligibility({
                    canChat: false,
                    status: "none",
                    message: "Unable to verify guest payment status.",
                });
            }
            finally {
                setLoading(false);
            }
        };
        checkEligibility();
    }, [userId, vendorId]);
    useEffect(() => {
        if (!userId || !vendorId || !eligibility.canChat)
            return;
        const s = io(SOCKET_URL, {
            transports: ["websocket", "polling"],
            reconnection: true,
        });
        s.emit("joinChat", { userId, vendorId });
        s.on("receiveMessage", (msg) => {
            setMessages((prev) => {
                if (msg.id && prev.some((p) => p.id === msg.id)) {
                    return prev;
                }
                return [...prev, msg];
            });
        });
        s.on("chatBlocked", (data) => {
            toast.error(data?.message || "Chat is locked until booking payment is confirmed.");
        });
        setSocket(s);
        return () => {
            s.disconnect();
        };
    }, [userId, vendorId, eligibility.canChat]);
    const sendMessage = (customText) => {
        const textToSend = (customText || text).trim();
        if (!textToSend || !socket)
            return;
        socket.emit("sendMessage", {
            sender: "vendor",
            userId,
            vendorId,
            text: textToSend,
        });
        if (!customText) {
            setText("");
        }
    };
    if (loading) {
        return (<div className="min-h-screen bg-base-200 flex flex-col">
        <VendorNavbar profile={vendor}/>
        <div className="flex-grow flex flex-col items-center justify-center p-4">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-sm text-base-content/70 mt-3 font-medium">Verifying guest payment status...</p>
        </div>
      </div>);
    }
    // If chat is LOCKED (guest has not paid yet)
    if (!eligibility.canChat) {
        const guestName = userInfo?.fullName || userInfo?.full_name || "Guest";
        return (<div className="min-h-screen bg-base-200 flex flex-col">
        <VendorNavbar profile={vendor}/>
        <Toaster position="top-center"/>

        <div className="flex-grow flex items-center justify-center p-4">
          <div className="card bg-base-100 border border-base-300 shadow-xl max-w-lg w-full p-8 text-center rounded-3xl animate-in zoom-in-95 duration-200">
            {eligibility.status === "pending" && (<>
                <div className="w-16 h-16 rounded-full bg-warning/15 text-warning flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8"/>
                </div>
                <h2 className="text-2xl font-black text-base-content tracking-tight">
                  Guest Request Pending Approval
                </h2>
                <p className="text-sm text-base-content/70 mt-2 leading-relaxed">
                  <strong>{guestName}</strong> submitted a booking request. You must accept their booking on the dashboard before they can pay and start chatting.
                </p>
                <div className="divider my-4"></div>
                <Link to="/vendor-home" className="btn btn-primary rounded-xl px-6">
                  Go to Dashboard & Accept Booking
                </Link>
              </>)}

            {eligibility.status === "booked" && (<>
                <div className="w-16 h-16 rounded-full bg-info/15 text-info flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8"/>
                </div>
                <span className="badge badge-info text-xs font-bold uppercase tracking-wider mb-2">
                  Awaiting Guest Payment
                </span>
                <h2 className="text-2xl font-black text-base-content tracking-tight">
                  Payment Not Completed
                </h2>
                <p className="text-sm text-base-content/70 mt-2 leading-relaxed">
                  You accepted <strong>{guestName}</strong>'s booking! Live chat will unlock automatically as soon as the guest completes their table payment.
                </p>
                <div className="divider my-4"></div>
                <Link to="/vendor-home" className="btn btn-primary rounded-xl px-6">
                  Back to Dashboard
                </Link>
              </>)}

            {eligibility.status !== "pending" && eligibility.status !== "booked" && (<>
                <div className="w-16 h-16 rounded-full bg-base-300 text-base-content/60 flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8"/>
                </div>
                <h2 className="text-2xl font-black text-base-content tracking-tight">
                  No Active Booking
                </h2>
                <p className="text-sm text-base-content/70 mt-2 leading-relaxed">
                  Chat is only unlocked for guests who have confirmed and paid bookings at your venue.
                </p>
                <div className="divider my-4"></div>
                <Link to="/vendor-home" className="btn btn-primary rounded-xl px-6">
                  Back to Dashboard
                </Link>
              </>)}
          </div>
        </div>
      </div>);
    }
    // UNLOCKED: Payment Confirmed (status === 'paid')
    const guestName = userInfo?.fullName || userInfo?.full_name || "Guest";
    return (<div className="min-h-screen bg-base-200 flex flex-col">
      <VendorNavbar profile={vendor}/>
      <Toaster position="top-center"/>

      {/* Top Header with Verified Paid Guest Details */}
      <div className="bg-base-100 border-b border-base-300 px-4 py-3 sticky top-16 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/vendor-home" className="btn btn-ghost btn-circle btn-sm">
            <ArrowLeft className="w-5 h-5"/>
          </Link>
          <div className="avatar">
            <div className="w-10 h-10 rounded-xl overflow-hidden ring-1 ring-primary/40 bg-base-300">
              <img src={userInfo?.avatar || userInfo?.profilePic || "https://api.dicebear.com/7.x/adventurer/svg?seed=" + userId} alt={guestName} className="w-full h-full object-cover"/>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-base-content">{guestName}</h3>
              <span className="badge badge-success badge-xs font-semibold gap-1 text-[10px] py-1 px-1.5">
                <CheckCircle2 className="w-2.5 h-2.5"/> Paid & Confirmed
              </span>
            </div>
            <p className="text-[11px] text-base-content/60">Live guest chat</p>
          </div>
        </div>

        <Link to="/vendor-home" className="btn btn-ghost btn-sm text-xs">
          Dashboard
        </Link>
      </div>

      <div className="flex-grow flex flex-col">
        <ChatUI title={`Chat with ${guestName}`} partnerName={guestName} partnerAvatar={userInfo?.avatar ||
            userInfo?.profilePic ||
            `https://api.dicebear.com/7.x/adventurer/svg?seed=${userId}`} partnerRole="Reserved Guest" tableName={eligibility.tableName || "Reserved Table"} messages={messages} text={text} setText={setText} sendMessage={sendMessage} self="vendor" isLoading={loading}/>
      </div>
    </div>);
};
export default VendorChatPage;
