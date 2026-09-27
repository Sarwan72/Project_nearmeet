import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { io } from "socket.io-client";
import ChatUI from "../components/ChatUI";
import { axiosInstance } from "../lib/axios";
import { Lock, Clock, CheckCircle2, CreditCard, ArrowLeft, } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";
const UserChatPage = () => {
    const { vendorId } = useParams();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user?.id || user?._id;
    const [loading, setLoading] = useState(true);
    const [eligibility, setEligibility] = useState({ canChat: false, status: "loading" });
    const [vendorInfo, setVendorInfo] = useState(null);
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [isPaying, setIsPaying] = useState(false);
    // Check eligibility and fetch vendor details
    useEffect(() => {
        if (!userId || !vendorId)
            return;
        const checkEligibility = async () => {
            try {
                setLoading(true);
                // 1. Fetch vendor basic info
                try {
                    const vRes = await axiosInstance.get(`/vendors/${vendorId}`);
                    setVendorInfo(vRes.data?.vendor || null);
                }
                catch {
                    // Non-critical
                }
                // 2. Check chat eligibility
                const res = await axiosInstance.get(`/bookings/chat-eligibility/${vendorId}`);
                setEligibility(res.data);
                // 3. If canChat, fetch historical messages
                if (res.data?.canChat) {
                    try {
                        const historyRes = await axiosInstance.get(`/bookings/user-chat-messages/${vendorId}`);
                        if (historyRes.data?.messages) {
                            setMessages(historyRes.data.messages);
                        }
                    }
                    catch (histErr) {
                        console.error("Error fetching chat history:", histErr);
                    }
                }
            }
            catch (err) {
                console.error("Error verifying chat eligibility:", err);
                setEligibility({
                    canChat: false,
                    status: "none",
                    message: "Unable to verify booking status.",
                });
            }
            finally {
                setLoading(false);
            }
        };
        checkEligibility();
    }, [userId, vendorId]);
    // Connect socket ONLY if chat is unlocked (status === 'paid')
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
                // Prevent duplicate appending if id matches
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
    }, [vendorId, userId, eligibility.canChat]);
    const sendMessage = (customText) => {
        const textToSend = (customText || text).trim();
        if (!textToSend || !socket)
            return;
        socket.emit("sendMessage", {
            sender: "user",
            userId,
            vendorId,
            text: textToSend,
        });
        if (!customText) {
            setText("");
        }
    };
    // Trigger Payment
    const handleProceedPayment = async () => {
        if (!eligibility.bookingId)
            return;
        setIsPaying(true);
        try {
            const res = await axiosInstance.post("/payments/checkout", {
                bookingId: eligibility.bookingId,
                vendorId,
                amount: vendorInfo?.price || 500,
                hotelName: vendorInfo?.hotelName || "Table Reservation",
            });
            if (res.data?.url) {
                window.location.href = res.data.url;
            }
        }
        catch (err) {
            console.error("Payment error:", err);
            toast.error(err.response?.data?.message || "Payment redirect failed. Please try again.");
        }
        finally {
            setIsPaying(false);
        }
    };
    if (loading) {
        return (<div className="min-h-screen bg-base-200 flex flex-col items-center justify-center p-4">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="text-sm text-base-content/70 mt-3 font-medium">Verifying booking & payment status...</p>
      </div>);
    }
    // If chat is LOCKED (user pending, vendor confirmed/awaiting payment, or no booking)
    if (!eligibility.canChat) {
        const hotelName = vendorInfo?.hotelName || vendorInfo?.hotel_name || "Partner Venue";
        return (<div className="min-h-screen bg-base-200 text-base-content flex flex-col items-center justify-center p-4">
        <Toaster position="top-center"/>
        <div className="card bg-base-100 border border-base-300 shadow-xl max-w-lg w-full p-8 text-center rounded-3xl animate-in zoom-in-95 duration-200">
          {/* Stage 1: Pending vendor confirmation */}
          {eligibility.status === "pending" && (<>
              <div className="w-16 h-16 rounded-full bg-warning/15 text-warning flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8"/>
              </div>
              <span className="badge badge-warning text-xs font-bold uppercase tracking-wider mb-2">
                Step 1: Awaiting Confirmation
              </span>
              <h2 className="text-2xl font-black text-base-content tracking-tight">
                Booking Pending Approval
              </h2>
              <p className="text-sm text-base-content/70 mt-2 leading-relaxed">
                Your table request at <strong>{hotelName}</strong> is waiting for venue confirmation.
                Once the manager confirms your booking, you can complete payment and chat directly!
              </p>
              <div className="divider my-4"></div>
              <div className="flex gap-2 justify-center">
                <Link to="/hotels" className="btn btn-primary rounded-xl px-6">
                  Back to Hotels
                </Link>
              </div>
            </>)}

          {/* Stage 2: Vendor accepted / Waiting for Payment */}
          {eligibility.status === "booked" && (<>
              <div className="w-16 h-16 rounded-full bg-primary/15 text-primary flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8"/>
              </div>
              <span className="badge badge-success text-xs font-bold uppercase tracking-wider mb-2">
                Step 2: Venue Confirmed!
              </span>
              <h2 className="text-2xl font-black text-base-content tracking-tight">
                Complete Payment to Chat
              </h2>
              <p className="text-sm text-base-content/70 mt-2 leading-relaxed">
                <strong>{hotelName}</strong> has confirmed your booking! To unlock live chat with the venue manager and secure your table, please complete the reservation payment.
              </p>

              <div className="p-4 rounded-2xl bg-base-200 border border-base-300 my-5 flex items-center justify-between">
                <div className="text-left">
                  <span className="text-xs text-base-content/60 block">Table Amount</span>
                  <span className="text-lg font-black text-base-content">
                    ₹{vendorInfo?.price || 500}
                  </span>
                </div>
                <button type="button" onClick={handleProceedPayment} disabled={isPaying} className="btn btn-primary rounded-xl px-6 font-bold shadow-md shadow-primary/20">
                  {isPaying ? (<span className="loading loading-spinner loading-xs"></span>) : (<>
                      <CreditCard className="w-4 h-4 mr-1.5"/>
                      Pay Now
                    </>)}
                </button>
              </div>

              <div className="flex gap-2 justify-center">
                <Link to="/hotels" className="btn btn-ghost btn-sm text-base-content/70">
                  Later
                </Link>
              </div>
            </>)}

          {/* Stage 0 / Other: No booking */}
          {eligibility.status !== "pending" && eligibility.status !== "booked" && (<>
              <div className="w-16 h-16 rounded-full bg-base-300 text-base-content/60 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8"/>
              </div>
              <h2 className="text-2xl font-black text-base-content tracking-tight">
                Chat Locked
              </h2>
              <p className="text-sm text-base-content/70 mt-2 leading-relaxed">
                Direct chat with <strong>{hotelName}</strong> is available after you book and complete payment for a table meetup.
              </p>
              <div className="divider my-4"></div>
              <Link to="/hotels" className="btn btn-primary rounded-xl px-8 shadow-sm">
                Explore & Book Venue
              </Link>
            </>)}
        </div>
      </div>);
    }
    // UNLOCKED: Payment Confirmed (status === 'paid')
    const hotelName = vendorInfo?.hotelName || vendorInfo?.hotel_name || "Venue Team";
    return (<div className="min-h-screen bg-base-200 flex flex-col">
      <Toaster position="top-center"/>
      {/* Top Bar with Venue Info and Verified Paid Badge */}
      <div className="bg-base-100 border-b border-base-300 px-4 py-3 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/hotels" className="btn btn-ghost btn-circle btn-sm">
            <ArrowLeft className="w-5 h-5"/>
          </Link>
          <div className="avatar">
            <div className="w-10 h-10 rounded-xl overflow-hidden ring-1 ring-primary/40 bg-base-300">
              <img src={vendorInfo?.photos?.[0] || "/logo.png"} alt={hotelName} className="w-full h-full object-cover" onError={(e) => {
            e.currentTarget.src = "/logo.png";
        }}/>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-base-content">{hotelName}</h3>
              <span className="badge badge-success badge-xs font-semibold gap-1 text-[10px] py-1 px-1.5">
                <CheckCircle2 className="w-2.5 h-2.5"/> Paid & Confirmed
              </span>
            </div>
            <p className="text-[11px] text-base-content/60">Live direct concierge</p>
          </div>
        </div>

        <Link to="/hotels" className="btn btn-ghost btn-sm text-xs">
          View Hotels
        </Link>
      </div>

      <div className="flex-grow flex flex-col">
        <ChatUI title={`Chat with ${hotelName}`} partnerName={hotelName} partnerAvatar={vendorInfo?.photos?.[0]} partnerRole="Venue Concierge" tableName={vendorInfo?.businessType || "Table Reservation"} messages={messages} text={text} setText={setText} sendMessage={sendMessage} self="user" isLoading={loading}/>
      </div>
    </div>);
};
export default UserChatPage;
