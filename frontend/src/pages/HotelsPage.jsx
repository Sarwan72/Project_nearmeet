import React, { useState, useEffect } from "react";
import { Star, StarHalf, StarOff } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import { io } from "socket.io-client";
import { Link } from "react-router";
import toast from "react-hot-toast";
const SOCKET_URL = `${import.meta.env.VITE_BACKEND_URL}`;
const HotelsPage = () => {
    const [vendors, setVendors] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedPhoto, setSelectedPhoto] = useState({});
    const [bookingStatus, setBookingStatus] = useState({});
    const [userBookings, setUserBookings] = useState([]);
    // ⭐ Review States
    const [openReviewModal, setOpenReviewModal] = useState(false);
    const [selectedVendorForReview, setSelectedVendorForReview] = useState(null);
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewComment, setReviewComment] = useState("");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user?.id || user?._id;
    // when user changes, reset all booking-related state
    useEffect(() => {
        setBookingStatus({});
        setUserBookings([]);
    }, [userId]);
    useEffect(() => {
        (async () => {
            try {
                const res = await axiosInstance.get("/vendors/hotels");
                setVendors(res.data || []);
            }
            catch (err) {
                console.error("Error fetching vendors:", err);
            }
        })();
    }, []);
    // ------------------------------
    // SOCKET SETUP
    // ------------------------------
    useEffect(() => {
        if (!userId)
            return;
        const socket = io(SOCKET_URL, {
            transports: ["websocket"],
            reconnection: true,
        });
        socket.on("connect", () => {
            socket.emit("registerUser", userId);
        });
        socket.on("bookingNotification", (data) => {
            const vendorId = data.vendorId;
            const key = `${vendorId}_${userId}`;
            setBookingStatus((prev) => ({
                ...prev,
                [key]: {
                    status: data.type,
                    bookingId: data.bookingId || prev[key]?.bookingId,
                },
            }));
        });
        return () => {
            socket.disconnect();
        };
    }, [userId]);
    // ------------------------------
    // LOAD USER BOOKINGS
    // ------------------------------
    useEffect(() => {
        if (!userId)
            return;
        (async () => {
            try {
                const res = await axiosInstance.get(`/bookings/user/${userId}`);
                const bookings = res.data || [];
                setUserBookings(bookings);
                const map = {};
                bookings.forEach((b) => {
                    const vendorId = b.vendor?._id || b.vendor?.id || b.vendorId || b.vendor_id;
                    const key = `${vendorId}_${userId}`;
                    map[key] = { status: b.status, bookingId: b._id || b.id };
                });
                setBookingStatus(map);
            }
            catch (err) {
                console.error("User bookings fetch failed:", err);
            }
        })();
    }, [userId]);
    // ------------------------------
    // BOOK / PAY HANDLER
    // ------------------------------
    const handleAction = async (vendor) => {
        const vId = vendor?._id || vendor?.id;
        if (!userId) {
            toast.error("Please login first to book a table!");
            return;
        }
        const key = `${vId}_${userId}`;
        const current = bookingStatus[key];
        // Stage 2: Vendor confirmed -> User pays
        if (current?.status === "booked") {
            const toastId = toast.loading("Preparing secure payment...");
            try {
                const res = await axiosInstance.post("/payments/checkout", {
                    bookingId: current.bookingId,
                    vendorId: vId,
                    amount: vendor.price || 500,
                    hotelName: vendor.hotelName || "Table Reservation",
                });
                if (res.data?.url) {
                    window.location.href = res.data.url;
                }
            }
            catch (err) {
                console.error("Payment redirect failed:", err);
                toast.error("Payment redirect failed. Please try again.", { id: toastId });
            }
            return;
        }
        // Stage 1: Book Table (creates pending request)
        if (!current) {
            const toastId = toast.loading("Sending reservation request to venue...");
            try {
                const res = await axiosInstance.post("/bookings/book", {
                    userId: userId,
                    vendorId: vId,
                    tableName: "Offline Meetup Table",
                });
                const bookingId = res.data?.booking?._id || res.data?.booking?.id;
                setBookingStatus((prev) => ({
                    ...prev,
                    [key]: { status: "pending", bookingId },
                }));
                toast.success("Booking request sent! Waiting for venue confirmation.", { id: toastId });
            }
            catch (err) {
                console.error("Booking error:", err);
                toast.error(err.response?.data?.message || "Booking request failed", { id: toastId });
            }
        }
    };
    // ------------------------------
    // OPEN REVIEW POPUP
    // ------------------------------
    const openReview = (vendor) => {
        setSelectedVendorForReview(vendor);
        setOpenReviewModal(true);
        setReviewRating(0);
        setReviewComment("");
    };
    // ------------------------------
    // SUBMIT REVIEW
    // ------------------------------
    const submitReview = async () => {
        if (!reviewRating)
            return alert("Please give a rating");
        const vId = selectedVendorForReview?._id || selectedVendorForReview?.id;
        try {
            await axiosInstance.post(`/review/vendor/${vId}`, {
                userId: userId,
                rating: reviewRating,
                comment: reviewComment,
            });
            alert("Review submitted!");
            const res = await axiosInstance.get("/vendors/hotels");
            setVendors(res.data || []);
            setOpenReviewModal(false);
        }
        catch (err) {
            alert("Failed to submit review");
        }
    };
    const filteredVendors = vendors.filter((v) => v.location?.toLowerCase().includes(search.toLowerCase()) ||
        v.hotelName?.toLowerCase().includes(search.toLowerCase()));
    return (<div className="min-h-screen flex flex-col items-center bg-base-100 text-base-content p-4 sm:p-6 lg:p-8">
      {/* Search Header */}
      <div className="w-full max-w-4xl mb-8">
        <h1 className="text-3xl font-extrabold mb-3 text-base-content tracking-tight">Available Hotels & Venues</h1>
        <input type="text" placeholder="Search by location or venue name..." value={search} onChange={(e) => setSearch(e.target.value)} className="input input-bordered w-full bg-base-200/60 border-base-300 text-base-content focus:border-primary shadow-sm"/>
      </div>

      {/* HOTEL LIST */}
      <div className="flex-1 w-full max-w-4xl flex flex-col gap-6">
        {filteredVendors.map((vendor) => {
            const vId = vendor._id || vendor.id;
            const currentPhoto = selectedPhoto[vId] || vendor.photos?.[0] || "";
            const key = `${vId}_${userId}`;
            const status = bookingStatus[key]?.status || "none";
            const userReviewed = vendor.reviews?.some((rev) => (rev.userId || rev.user_id) === userId);
            return (<div key={vId} className="bg-base-100 border border-base-300 rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 p-5 sm:p-6 flex flex-col sm:flex-row gap-6">
              {/* LEFT IMAGE */}
              <div className="w-full sm:w-1/2">
                <img src={currentPhoto} className="h-64 w-full object-cover rounded-xl" alt={vendor.hotelName || "Hotel photo"}/>

                {/* Thumbnails */}
                <div className="flex gap-2 mt-2">
                  {vendor.photos?.map((photo, i) => (<img key={i} src={photo} onClick={() => setSelectedPhoto((prev) => ({
                        ...prev,
                        [vId]: photo,
                    }))} className={`w-16 h-16 rounded-lg cursor-pointer border-2 object-cover ${currentPhoto === photo
                        ? "border-blue-500"
                        : "border-transparent"}`} alt={`Thumbnail ${i + 1}`}/>))}
                </div>
              </div>

              {/* RIGHT DETAILS */}
              <div className="flex flex-col justify-between w-full sm:w-1/2">
                <div>
                  <h3 className="text-xl font-bold text-base-content">
                    {vendor.hotelName}
                  </h3>

                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                    const rating = Number(vendor.averageRating) || 0;
                    if (rating >= star) {
                        return (<Star key={star} size={20} className="text-yellow-500 fill-yellow-500"/>);
                    }
                    else if (rating >= star - 0.5) {
                        return (<StarHalf key={star} size={20} className="text-yellow-500 fill-yellow-500"/>);
                    }
                    else {
                        return (<StarOff key={star} size={20} className="text-gray-300"/>);
                    }
                })}

                    <span className="font-semibold ml-1">
                      {(Number(vendor.averageRating) || 0).toFixed(1)}
                    </span>

                    <span className="text-sm text-base-content/60 ml-1">
                      ({Number(vendor.totalReviews) || 0} reviews)
                    </span>
                    <Link to={`/vendor/${vId}/reviews`} className="text-primary hover:underline text-sm ml-2 font-medium">
                      View Reviews →
                    </Link>
                  </div>

                  {/* LOCATION */}
                  <p className="text-sm text-primary font-medium mt-1">{vendor.location}</p>

                  {/* AMENITIES */}
                  <div className="mt-3 text-base-content/80 text-sm space-y-1">
                    {vendor.amenities?.map((a, i) => (<div key={i} className="flex items-center gap-2">
                        <span className="text-success font-bold">✔</span>
                        <span>{a}</span>
                      </div>))}
                  </div>

                  {/* DESCRIPTION */}
                  <p className="text-sm mt-4 text-base-content/70 leading-relaxed">
                    {vendor.description}
                  </p>
                </div>

                {/* PRICE + ACTION */}
                <div className="text-right mt-4 pt-4 border-t border-base-200 sm:border-0 sm:pt-0">
                  <p className="text-2xl font-black text-base-content">
                    ₹ {vendor.price}
                  </p>
                  <p className="text-xs text-base-content/60 font-medium">Per Session / Booking</p>

                  <button onClick={() => handleAction(vendor)} disabled={status === "pending" || status === "paid"} className={`mt-3 px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 ml-auto ${status === "pending"
                    ? "btn btn-warning btn-sm opacity-90 cursor-not-allowed"
                    : status === "booked"
                        ? "btn btn-success btn-sm font-extrabold shadow-md animate-pulse"
                        : status === "paid"
                            ? "btn btn-outline btn-success btn-sm cursor-default"
                            : status === "rejected"
                                ? "btn btn-error btn-sm opacity-80 cursor-not-allowed"
                                : "btn btn-primary btn-sm shadow-md"}`}>
                    {status === "pending"
                    ? "⏳ Awaiting Venue Approval"
                    : status === "booked"
                        ? `💳 Confirmed! Pay ₹${vendor.price}`
                        : status === "paid"
                            ? "✅ Table Paid"
                            : status === "rejected"
                                ? "❌ Request Declined"
                                : "Book Table Now"}
                  </button>

                  {status === "paid" && (<div className="flex flex-wrap justify-end gap-2 mt-3 animate-in fade-in-50 duration-200">
                      {/* CHAT BUTTON - UNLOCKED AFTER PAYMENT */}
                      <Link to={`/chat/${vId}`} className="btn btn-primary btn-sm rounded-xl font-bold text-xs gap-1.5 shadow-sm">
                        💬 Chat with Vendor
                      </Link>

                      {/* REVIEW BUTTON */}
                      {!userReviewed ? (<button onClick={() => openReview(vendor)} className="btn btn-outline btn-sm rounded-xl text-xs">
                          ⭐ Write Review
                        </button>) : (<Link to={`/vendor/${vId}/reviews`} className="text-xs text-primary font-semibold underline self-center ml-1">
                          Reviewed ✓
                        </Link>)}
                    </div>)}
                </div>
              </div>
            </div>);
        })}
      </div>

      {/* ⭐ REVIEW POPUP MODAL ⭐ */}
      {openReviewModal && (<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-base-100 border border-base-300 w-full max-w-md p-6 rounded-3xl shadow-2xl text-base-content">
            <h2 className="text-xl font-bold mb-4 text-base-content">
              Review: {selectedVendorForReview?.hotelName}
            </h2>

            {/* Stars */}
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((s) => (<Star key={s} className={`w-8 h-8 cursor-pointer transition ${reviewRating >= s
                    ? "fill-yellow-500 text-yellow-500"
                    : "text-base-300"}`} onClick={() => setReviewRating(s)}/>))}
            </div>

            {/* Comment */}
            <textarea rows={3} className="textarea textarea-bordered w-full bg-base-200/50 text-base-content" placeholder="Write your experience..." value={reviewComment} onChange={(e) => setReviewComment(e.target.value)}></textarea>

            {/* Buttons */}
            <div className="flex justify-end mt-4 gap-2">
              <button onClick={() => setOpenReviewModal(false)} className="btn btn-sm btn-ghost">
                Cancel
              </button>

              <button onClick={submitReview} className="btn btn-sm btn-primary">
                Submit Review
              </button>
            </div>
          </div>
        </div>)}
    </div>);
};
export default HotelsPage;
