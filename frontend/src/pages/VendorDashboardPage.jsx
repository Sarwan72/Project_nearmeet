import React, { useState, useEffect, useCallback } from "react";
import { X, Check, IndianRupee, Loader2, Users, Sparkles, Heart, MessageSquare, Calendar, MapPin, Star, Flame, Lightbulb, ShieldCheck, RefreshCw, UtensilsCrossed, } from "lucide-react";
import VendorNavbar from "../components/VendorNavbar";
import VendorFooter from "../components/VendorFooter";
import { axiosInstance } from "../lib/axios";
import { getAiPairRecommendation, pairGuestsAtTable } from "../lib/vendor";
import { io } from "socket.io-client";
import toast, { Toaster } from "react-hot-toast";
import { Link } from "react-router-dom";
const StatusBadge = ({ status, pairStatus }) => {
    if (pairStatus === "paired") {
        return (<span className="badge badge-secondary font-semibold text-xs gap-1 py-3 px-3 shadow-sm">
        <Heart className="w-3.5 h-3.5 fill-current"/> Paired Table
      </span>);
    }
    switch (status) {
        case "booked":
            return <span className="badge badge-success font-semibold text-xs py-3 px-3">✅ Confirmed</span>;
        case "paid":
            return <span className="badge badge-info font-semibold text-xs py-3 px-3">💰 Paid & Ready</span>;
        case "rejected":
            return <span className="badge badge-error font-semibold text-xs py-3 px-3">❌ Rejected</span>;
        default:
            return <span className="badge badge-warning font-semibold text-xs py-3 px-3">⏳ Pending</span>;
    }
};
const VendorDashboardPage = () => {
    const [activeTab, setActiveTab] = useState("matchmaking");
    const [filterStatus, setFilterStatus] = useState("all");
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    // Manual guest selection
    const [selectedGuest1, setSelectedGuest1] = useState(null);
    const [selectedGuest2, setSelectedGuest2] = useState(null);
    const [selectedTable, setSelectedTable] = useState("Table #1 (Window Alcove)");
    const [isPairing, setIsPairing] = useState(false);
    // AI Match Recommendation State
    const [aiRecommendation, setAiRecommendation] = useState(null);
    const [isAiLoading, setIsAiLoading] = useState(false);
    // Vendor Profile State
    const storedVendor = (() => {
        try {
            return JSON.parse(localStorage.getItem("vendor") || "{}");
        }
        catch {
            return {};
        }
    })();
    const [vendor, setVendor] = useState(storedVendor);
    const vendorId = vendor?._id || vendor?.id;
    // Load fresh vendor profile
    useEffect(() => {
        async function loadProfile() {
            try {
                const { data } = await axiosInstance.get("/vendors/me");
                if (data?.vendor) {
                    setVendor(data.vendor);
                    localStorage.setItem("vendor", JSON.stringify(data.vendor));
                }
            }
            catch (err) {
                console.warn("Could not refresh vendor profile:", err);
            }
        }
        loadProfile();
    }, []);
    // Load vendor bookings
    const loadBookings = useCallback(async () => {
        if (!vendorId)
            return;
        try {
            setLoading(true);
            const { data } = await axiosInstance.get(`/bookings/vendor/${vendorId}`);
            const list = Array.isArray(data) ? data : data?.bookings || [];
            setBookings(list);
        }
        catch (err) {
            console.error("Error fetching vendor bookings:", err);
            toast.error("Failed to load bookings");
        }
        finally {
            setLoading(false);
        }
    }, [vendorId]);
    useEffect(() => {
        loadBookings();
    }, [loadBookings]);
    // Real-time socket setup
    useEffect(() => {
        if (!vendorId)
            return;
        const socket = io(`${import.meta.env.VITE_BACKEND_URL}`, {
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionAttempts: 5,
        });
        socket.emit("registerVendor", vendorId);
        socket.on("bookingNotification", (data) => {
            if (data?.type === "newBooking") {
                toast.success("🔔 New guest booking request received!");
                loadBookings();
            }
            else if (data?.type === "paid") {
                toast.success("💳 Guest completed table payment!");
                loadBookings();
            }
        });
        return () => {
            socket.disconnect();
        };
    }, [vendorId, loadBookings]);
    // Accept Booking
    const handleAccept = async (id) => {
        try {
            await axiosInstance.post(`/bookings/requests/${id}/accept`);
            toast.success("Booking confirmed! Guest has been notified.");
            setBookings((prev) => prev.map((b) => (b._id === id || b.id === id ? { ...b, status: "booked" } : b)));
        }
        catch (err) {
            console.error("Accept failed:", err);
            toast.error(err.response?.data?.message || "Failed to accept booking");
        }
    };
    // Reject Booking
    const handleReject = async (id) => {
        try {
            await axiosInstance.post(`/bookings/requests/${id}/reject`);
            toast("Booking declined", { icon: "🚫" });
            setBookings((prev) => prev.map((b) => (b._id === id || b.id === id ? { ...b, status: "rejected" } : b)));
        }
        catch (err) {
            console.error("Reject failed:", err);
            toast.error(err.response?.data?.message || "Failed to reject booking");
        }
    };
    // Run AI Recommendation
    const handleRunAiMatchmaker = async () => {
        setIsAiLoading(true);
        const toastId = toast.loading("🤖 Analyzing guest profiles, interests, and vibes with AI...");
        try {
            const res = await getAiPairRecommendation();
            if (res?.recommendation) {
                setAiRecommendation(res.recommendation);
                toast.success("AI found a high-compatibility guest pair!", { id: toastId });
            }
            else {
                toast(res?.message || "Need at least 2 unpaired guests with bookings to generate AI pairings.", {
                    id: toastId,
                    icon: "💡",
                });
            }
        }
        catch (err) {
            console.error("AI recommendation error:", err);
            toast.error(err.response?.data?.message || "Failed to generate AI pair recommendation", {
                id: toastId,
            });
        }
        finally {
            setIsAiLoading(false);
        }
    };
    // Confirm Pairing (for either AI or manual)
    const handleExecutePair = async (guest1BookingId, guest2BookingId, tableName, note) => {
        if (!guest1BookingId || !guest2BookingId) {
            toast.error("Two guests must be selected for table pairing.");
            return;
        }
        if (guest1BookingId === guest2BookingId) {
            toast.error("Please select two distinct guests.");
            return;
        }
        setIsPairing(true);
        const toastId = toast.loading("Pairing guests and reserving offline meetup table...");
        try {
            const res = await pairGuestsAtTable({
                bookingId1: guest1BookingId,
                bookingId2: guest2BookingId,
                tableNumber: tableName || selectedTable,
                note: note || "Curated Offline Meetup Table",
            });
            toast.success(res?.message || "Guests paired successfully! Offline table reserved. 🎉", {
                id: toastId,
            });
            setSelectedGuest1(null);
            setSelectedGuest2(null);
            setAiRecommendation(null);
            await loadBookings();
        }
        catch (err) {
            console.error("Pairing error:", err);
            toast.error(err.response?.data?.message || "Failed to pair guests.", {
                id: toastId,
            });
        }
        finally {
            setIsPairing(false);
        }
    };
    // Filtered bookings
    const filteredBookings = bookings.filter((b) => {
        if (filterStatus === "all")
            return true;
        if (filterStatus === "pending")
            return b.status === "pending";
        if (filterStatus === "booked")
            return b.status === "booked";
        if (filterStatus === "paid")
            return b.status === "paid";
        if (filterStatus === "paired")
            return b.pairStatus === "paired";
        return true;
    });
    // Derived stats
    const totalBookings = bookings.length;
    const confirmedCount = bookings.filter((b) => b.status === "booked" || b.status === "paid").length;
    const pairedCount = bookings.filter((b) => b.pairStatus === "paired").length;
    const pendingCount = bookings.filter((b) => b.status === "pending").length;
    const estimatedRevenue = bookings.filter((b) => b.status === "paid").length * (Number(vendor?.price) || 500);
    const booking1Obj = bookings.find((b) => (b._id || b.id) === selectedGuest1);
    const booking2Obj = bookings.find((b) => (b._id || b.id) === selectedGuest2);
    const sharedInterests = booking1Obj?.user?.interests?.filter((i) => booking2Obj?.user?.interests?.includes(i)) || [];
    const hotelPhoto = vendor?.photos?.[0] ||
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=compress&cs=tinysrgb&w=800";
    return (<div className="min-h-screen bg-base-200 text-base-content flex flex-col transition-colors">
      <VendorNavbar profile={vendor}/>
      <Toaster position="top-center"/>

      <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl w-full">
        {/* Venue Profile Header Banner */}
        <div className="card bg-base-100 border border-base-300 shadow-md rounded-3xl overflow-hidden mb-8">
          <div className="relative h-40 sm:h-52 w-full">
            <img src={hotelPhoto} alt={vendor?.hotelName || "Venue"} className="w-full h-full object-cover brightness-[0.7]"/>
            <div className="absolute inset-0 bg-gradient-to-t from-base-100 via-transparent to-transparent"></div>
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <Link to="/vendor-profile" className="btn btn-sm btn-ghost bg-base-100/80 backdrop-blur-md hover:bg-base-100 border border-base-300 text-xs font-semibold rounded-xl">
                Edit Venue Profile
              </Link>
            </div>
          </div>

          <div className="px-6 pb-6 pt-2 flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-16 sm:-mt-20 relative z-10">
            <div className="flex items-end gap-4">
              <div className="avatar ring-4 ring-base-100 rounded-2xl shadow-xl overflow-hidden bg-base-200 w-24 h-24 sm:w-28 sm:h-28 shrink-0">
                <img src={hotelPhoto} alt={vendor?.hotelName || "Venue"} className="w-full h-full object-cover"/>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="badge badge-primary font-bold text-xs uppercase tracking-wide">
                    {vendor?.businessType || vendor?.business_type || "Venue"}
                  </span>
                  <span className="badge badge-success text-xs font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5"/> Verified Partner
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content tracking-tight">
                  {vendor?.hotelName || vendor?.hotel_name || "Partner Venue Console"}
                </h1>
                <p className="text-xs sm:text-sm text-base-content/70 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-primary"/>
                  {vendor?.location || "Location not set"} • ₹{vendor?.price || 0} / person
                </p>
              </div>
            </div>

            {/* Quick Ratings & Reviews */}
            <div className="flex items-center gap-4 bg-base-200/80 backdrop-blur-md p-3 px-4 rounded-2xl border border-base-300 self-start md:self-auto">
              <div className="text-center">
                <div className="flex items-center gap-1 font-bold text-base text-amber-500">
                  <Star className="w-4 h-4 fill-amber-500"/>
                  {(Number(vendor?.averageRating || vendor?.average_rating || 0) || 0).toFixed(1)}
                </div>
                <div className="text-[10px] text-base-content/60 uppercase tracking-wider">
                  Rating
                </div>
              </div>
              <div className="h-7 w-[1px] bg-base-300"></div>
              <Link to={vendorId ? `/vendor/${vendorId}/reviews` : "#"} className="text-center hover:opacity-80 transition">
                <div className="font-bold text-base text-primary">
                  {vendor?.totalReviews || vendor?.total_reviews || 0}
                </div>
                <div className="text-[10px] text-base-content/60 uppercase tracking-wider underline">
                  Reviews
                </div>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-base-300 bg-base-200/40 text-center divide-x divide-base-300">
            <div className="p-4">
              <div className="text-xs text-base-content/60 uppercase font-semibold">Total Bookings</div>
              <div className="text-xl sm:text-2xl font-black text-base-content mt-0.5">{totalBookings}</div>
            </div>
            <div className="p-4">
              <div className="text-xs text-base-content/60 uppercase font-semibold">Confirmed</div>
              <div className="text-xl sm:text-2xl font-black text-success mt-0.5">{confirmedCount}</div>
            </div>
            <div className="p-4">
              <div className="text-xs text-base-content/60 uppercase font-semibold">Paired Tables</div>
              <div className="text-xl sm:text-2xl font-black text-secondary mt-0.5">{pairedCount}</div>
            </div>
            <div className="p-4">
              <div className="text-xs text-base-content/60 uppercase font-semibold">Est. Revenue</div>
              <div className="text-xl sm:text-2xl font-black text-primary mt-0.5">₹{estimatedRevenue}</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="tabs tabs-boxed bg-base-100 p-1.5 rounded-2xl border border-base-300 shadow-sm w-full sm:w-auto flex">
            <button type="button" onClick={() => setActiveTab("matchmaking")} className={`tab flex-1 sm:flex-initial gap-2 text-sm font-bold rounded-xl transition-all ${activeTab === "matchmaking"
            ? "tab-active bg-primary text-primary-content shadow-sm"
            : "text-base-content/70 hover:text-base-content"}`}>
              <Sparkles className="w-4 h-4"/>
              AI Table Matchmaker & Pairing
            </button>
            <button type="button" onClick={() => setActiveTab("bookings")} className={`tab flex-1 sm:flex-initial gap-2 text-sm font-bold rounded-xl transition-all ${activeTab === "bookings"
            ? "tab-active bg-primary text-primary-content shadow-sm"
            : "text-base-content/70 hover:text-base-content"}`}>
              <Calendar className="w-4 h-4"/>
              All Bookings ({bookings.length})
              {pendingCount > 0 && (<span className="badge badge-warning badge-sm">{pendingCount}</span>)}
            </button>
          </div>

          <button onClick={loadBookings} disabled={loading} className="btn btn-ghost btn-sm gap-1.5 text-base-content/70 self-end sm:self-auto" title="Refresh bookings list">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}/>
            Refresh
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: AI TABLE MATCHMAKER & GUEST PAIRING              */}
        {/* ======================================================== */}
        {activeTab === "matchmaking" && (<div className="space-y-8">
            {/* AI Recommendation Banner & Trigger */}
            <div className="card bg-gradient-to-r from-primary/10 via-base-100 to-secondary/10 border border-primary/20 shadow-lg p-6 sm:p-8 rounded-3xl">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="p-3.5 rounded-2xl bg-primary text-primary-content shadow-md shadow-primary/30 shrink-0">
                    <Sparkles className="w-7 h-7"/>
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/20 text-primary font-bold text-xs mb-1">
                      <Flame className="w-3.5 h-3.5 fill-current"/> AI Matching Engine
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-base-content tracking-tight">
                      Curate High-Compatibility Tables
                    </h2>
                    <p className="text-xs sm:text-sm text-base-content/70 mt-1 max-w-xl leading-relaxed">
                      NearMeet AI analyzes your checked-in guests' age preferences, mutual interests, dating intentions, and vibes to recommend the ideal offline table meetup.
                    </p>
                  </div>
                </div>

                <button type="button" onClick={handleRunAiMatchmaker} disabled={isAiLoading} className="btn btn-primary px-7 py-3 rounded-2xl shadow-lg shadow-primary/25 text-sm font-bold gap-2 whitespace-nowrap w-full lg:w-auto">
                  {isAiLoading ? (<>
                      <Loader2 className="w-4 h-4 animate-spin"/>
                      Analyzing Guests...
                    </>) : (<>
                      <Sparkles className="w-4 h-4"/>
                      Run AI Smart Matchmaker
                    </>)}
                </button>
              </div>

              {/* Display AI Recommended Match (if available) */}
              {aiRecommendation && (<div className="mt-8 pt-6 border-t border-base-300 animate-in fade-in-50 duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="badge badge-secondary font-bold text-xs uppercase tracking-wider py-3 px-3">
                        AI Recommended Pair
                      </span>
                      <span className="badge badge-success font-semibold text-xs py-3 px-3">
                        {aiRecommendation.compatibilityScore || 94}% Compatibility Score
                      </span>
                    </div>

                    <button onClick={() => setAiRecommendation(null)} className="btn btn-circle btn-ghost btn-xs text-base-content/60" title="Dismiss recommendation">
                      <X className="w-4 h-4"/>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-base-100/90 p-5 rounded-3xl border border-primary/30 shadow-md">
                    {/* Guest 1 Profile */}
                    <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-base-200/60 border border-base-300">
                      <img src={aiRecommendation.guest1?.avatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=G1"} alt={aiRecommendation.guest1?.name} className="w-14 h-14 rounded-2xl object-cover ring-2 ring-primary shrink-0"/>
                      <div className="min-w-0">
                        <h4 className="font-bold text-base-content text-sm truncate">
                          {aiRecommendation.guest1?.name}
                        </h4>
                        <p className="text-xs text-base-content/70">
                          {aiRecommendation.guest1?.age ? `${aiRecommendation.guest1?.age} yrs` : "Age N/A"} •{" "}
                          {aiRecommendation.guest1?.occupation || "Guest"}
                        </p>
                        {aiRecommendation.guest1?.datingIntention && (<span className="badge badge-xs badge-outline mt-1 font-medium">
                            {aiRecommendation.guest1?.datingIntention}
                          </span>)}
                      </div>
                    </div>

                    {/* Guest 2 Profile */}
                    <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-base-200/60 border border-base-300">
                      <img src={aiRecommendation.guest2?.avatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=G2"} alt={aiRecommendation.guest2?.name} className="w-14 h-14 rounded-2xl object-cover ring-2 ring-secondary shrink-0"/>
                      <div className="min-w-0">
                        <h4 className="font-bold text-base-content text-sm truncate">
                          {aiRecommendation.guest2?.name}
                        </h4>
                        <p className="text-xs text-base-content/70">
                          {aiRecommendation.guest2?.age ? `${aiRecommendation.guest2?.age} yrs` : "Age N/A"} •{" "}
                          {aiRecommendation.guest2?.occupation || "Guest"}
                        </p>
                        {aiRecommendation.guest2?.datingIntention && (<span className="badge badge-xs badge-outline mt-1 font-medium">
                            {aiRecommendation.guest2?.datingIntention}
                          </span>)}
                      </div>
                    </div>

                    {/* AI Insights & Match Reason */}
                    <div className="md:col-span-2 space-y-3 pt-2">
                      <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/15 text-xs text-base-content/90 leading-relaxed">
                        <strong className="text-primary font-bold flex items-center gap-1.5 mb-1">
                          <Lightbulb className="w-3.5 h-3.5"/> Why AI Paired Them:
                        </strong>
                        {aiRecommendation.matchReason}
                      </div>

                      {aiRecommendation.icebreaker && (<div className="p-3.5 rounded-2xl bg-secondary/5 border border-secondary/15 text-xs text-base-content/90 leading-relaxed">
                          <strong className="text-secondary font-bold flex items-center gap-1.5 mb-1">
                            💬 Recommended Table Icebreaker:
                          </strong>
                          {aiRecommendation.icebreaker}
                        </div>)}

                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                        <span className="text-xs text-base-content/70 font-medium flex items-center gap-1">
                          <UtensilsCrossed className="w-3.5 h-3.5 text-primary"/>
                          Suggested Seating: <strong className="text-base-content">{aiRecommendation.tableSuggestion || "Table #4"}</strong>
                        </span>

                        <button type="button" onClick={() => handleExecutePair(aiRecommendation.guest1?.bookingId, aiRecommendation.guest2?.bookingId, aiRecommendation.tableSuggestion, aiRecommendation.matchReason)} disabled={isPairing} className="btn btn-secondary btn-sm px-6 rounded-xl font-bold shadow-md shadow-secondary/20 w-full sm:w-auto gap-2">
                          {isPairing ? (<Loader2 className="w-4 h-4 animate-spin"/>) : (<Heart className="w-4 h-4 fill-current"/>)}
                          Approve AI Pair & Reserve Table
                        </button>
                      </div>
                    </div>
                  </div>
                </div>)}
            </div>

            {/* Manual Table Pairing Console */}
            <div className="card bg-base-100 border border-base-300 shadow-md p-6 sm:p-8 rounded-3xl">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-4 border-b border-base-200">
                <div>
                  <h3 className="text-lg font-bold text-base-content flex items-center gap-2">
                    <Heart className="w-5 h-5 text-secondary fill-secondary"/>
                    Manual Guest Pairing Workbench
                  </h3>
                  <p className="text-xs text-base-content/60">
                    Pick any two guests from the grid below, assign their table, and reserve their meetup.
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <select value={selectedTable} onChange={(e) => setSelectedTable(e.target.value)} className="select select-bordered select-sm rounded-xl text-xs w-full md:w-auto">
                    <option value="Table #1 (Window Alcove)">Table #1 (Window Alcove)</option>
                    <option value="Table #2 (Garden Terrace)">Table #2 (Garden Terrace)</option>
                    <option value="Table #3 (Candlelight Corner)">Table #3 (Candlelight Corner)</option>
                    <option value="Table #4 (Central Lounge)">Table #4 (Central Lounge)</option>
                    <option value="VIP Booth #1 (Private)">VIP Booth #1 (Private)</option>
                  </select>

                  <button type="button" onClick={() => handleExecutePair(selectedGuest1, selectedGuest2, selectedTable)} disabled={!selectedGuest1 || !selectedGuest2 || isPairing} className="btn btn-primary btn-sm px-5 rounded-xl font-bold shadow-sm whitespace-nowrap">
                    {isPairing ? <Loader2 className="w-4 h-4 animate-spin"/> : "Confirm Table Pair"}
                  </button>
                </div>
              </div>

              {/* Selected Slots Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {/* Guest 1 Slot */}
                <div className={`p-4 rounded-2xl border transition-all ${booking1Obj
                ? "bg-primary/5 border-primary shadow-sm"
                : "bg-base-200/50 border-dashed border-base-300 text-center py-6"}`}>
                  {booking1Obj ? (<div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img src={booking1Obj.user?.avatar || booking1Obj.user?.profilePic} alt="Guest 1" className="w-12 h-12 rounded-xl object-cover ring-2 ring-primary shrink-0"/>
                        <div className="truncate">
                          <span className="badge badge-primary badge-xs mb-1">Guest 1</span>
                          <h4 className="font-bold text-sm text-base-content truncate">
                            {booking1Obj.user?.fullName}
                          </h4>
                          <p className="text-xs text-base-content/60">
                            {booking1Obj.user?.age ? `${booking1Obj.user?.age} yrs` : ""} •{" "}
                            {booking1Obj.user?.gender || "Guest"}
                          </p>
                        </div>
                      </div>
                      <button type="button" onClick={() => setSelectedGuest1(null)} className="btn btn-ghost btn-circle btn-xs text-base-content/60 hover:text-error">
                        <X className="w-4 h-4"/>
                      </button>
                    </div>) : (<p className="text-xs text-base-content/50">
                      👈 Select <strong>Guest 1</strong> from the guest cards below
                    </p>)}
                </div>

                {/* Guest 2 Slot */}
                <div className={`p-4 rounded-2xl border transition-all ${booking2Obj
                ? "bg-secondary/5 border-secondary shadow-sm"
                : "bg-base-200/50 border-dashed border-base-300 text-center py-6"}`}>
                  {booking2Obj ? (<div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img src={booking2Obj.user?.avatar || booking2Obj.user?.profilePic} alt="Guest 2" className="w-12 h-12 rounded-2xl object-cover ring-2 ring-secondary shrink-0"/>
                        <div className="truncate">
                          <span className="badge badge-secondary badge-xs mb-1">Guest 2</span>
                          <h4 className="font-bold text-sm text-base-content truncate">
                            {booking2Obj.user?.fullName}
                          </h4>
                          <p className="text-xs text-base-content/60">
                            {booking2Obj.user?.age ? `${booking2Obj.user?.age} yrs` : ""} •{" "}
                            {booking2Obj.user?.gender || "Guest"}
                          </p>
                        </div>
                      </div>
                      <button type="button" onClick={() => setSelectedGuest2(null)} className="btn btn-ghost btn-circle btn-xs text-base-content/60 hover:text-error">
                        <X className="w-4 h-4"/>
                      </button>
                    </div>) : (<p className="text-xs text-base-content/50">
                      👉 Select <strong>Guest 2</strong> from the guest cards below
                    </p>)}
                </div>
              </div>

              {/* Shared Interests Pill */}
              {booking1Obj && booking2Obj && (<div className="p-3.5 rounded-2xl bg-base-200 border border-base-300 flex items-center justify-between gap-3 text-xs mb-6">
                  <span className="font-semibold text-base-content flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-primary"/>
                    Mutual Interests ({sharedInterests.length}):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {sharedInterests.length > 0 ? (sharedInterests.map((interest) => (<span key={interest} className="badge badge-sm badge-primary">
                          {interest}
                        </span>))) : (<span className="text-base-content/60">Complementary backgrounds</span>)}
                  </div>
                </div>)}

              {/* Guest Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bookings
                .filter((b) => b.user && b.status !== "rejected")
                .map((b) => {
                const bId = b._id || b.id;
                const isSelected1 = selectedGuest1 === bId;
                const isSelected2 = selectedGuest2 === bId;
                const isPaired = b.pairStatus === "paired";
                return (<div key={bId} className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${isSelected1
                        ? "bg-primary/10 border-primary ring-2 ring-primary/40 shadow-md"
                        : isSelected2
                            ? "bg-secondary/10 border-secondary ring-2 ring-secondary/40 shadow-md"
                            : isPaired
                                ? "bg-base-200/50 border-base-300 opacity-80"
                                : "bg-base-100 border-base-300 hover:border-primary/50 shadow-sm"}`}>
                        <div>
                          {/* Top Guest Info */}
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3">
                              <img src={b.user?.avatar || b.user?.profilePic} alt={b.user?.fullName} className="w-12 h-12 rounded-2xl object-cover ring-1 ring-base-300 bg-base-300" onError={(e) => {
                        e.currentTarget.src = "https://api.dicebear.com/7.x/adventurer/svg?seed=" + b.user?.id;
                    }}/>
                              <div>
                                <h4 className="font-bold text-base-content text-sm">
                                  {b.user?.fullName}
                                </h4>
                                <p className="text-xs text-base-content/60">
                                  {b.user?.age ? `${b.user.age} yrs` : "Age N/A"} •{" "}
                                  {b.user?.gender || "Guest"} •{" "}
                                  <span className="font-medium text-primary">
                                    {b.user?.occupation || "Professional"}
                                  </span>
                                </p>
                              </div>
                            </div>

                            <StatusBadge status={b.status} pairStatus={b.pairStatus}/>
                          </div>

                          {/* Dating Intention */}
                          {b.user?.datingIntention && (<div className="mb-2">
                              <span className="badge badge-sm badge-secondary badge-outline text-[11px] font-semibold">
                                🎯 {b.user.datingIntention}
                              </span>
                            </div>)}

                          {/* User Bio */}
                          {b.user?.bio && (<p className="text-xs text-base-content/75 italic line-clamp-2 mb-3 bg-base-200/60 p-2 rounded-xl">
                              "{b.user.bio}"
                            </p>)}

                          {/* User Interests */}
                          {b.user?.interests?.length > 0 && (<div className="flex flex-wrap gap-1 mb-3">
                              {b.user.interests.slice(0, 4).map((interest) => (<span key={interest} className="badge badge-ghost badge-xs text-[10px]">
                                  {interest}
                                </span>))}
                            </div>)}

                          {/* Paired Table Info */}
                          {isPaired && (<div className="p-2.5 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center gap-2 mb-3 text-xs text-secondary font-medium">
                              <Heart className="w-3.5 h-3.5 fill-current"/>
                              Reserved at {b.tableName || "Offline Table"}
                            </div>)}
                        </div>

                        {/* Pairing Action Buttons */}
                        {!isPaired && (<div className="pt-3 border-t border-base-200 flex items-center gap-2">
                            <button type="button" onClick={() => setSelectedGuest1(isSelected1 ? null : bId)} className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold border transition ${isSelected1
                            ? "bg-primary text-primary-content border-primary font-bold shadow-sm"
                            : "bg-base-200 border-base-300 text-base-content/80 hover:bg-base-300"}`}>
                              {isSelected1 ? "✓ Selected as Guest 1" : "Select Guest 1"}
                            </button>

                            <button type="button" onClick={() => setSelectedGuest2(isSelected2 ? null : bId)} className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold border transition ${isSelected2
                            ? "bg-secondary text-secondary-content border-secondary font-bold shadow-sm"
                            : "bg-base-200 border-base-300 text-base-content/80 hover:bg-base-300"}`}>
                              {isSelected2 ? "✓ Selected as Guest 2" : "Select Guest 2"}
                            </button>
                          </div>)}
                      </div>);
            })}
              </div>
            </div>
          </div>)}

        {/* ======================================================== */}
        {/* TAB 2: ALL GUEST BOOKINGS LIST                           */}
        {/* ======================================================== */}
        {activeTab === "bookings" && (<div className="space-y-6">
            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: "all", label: "All Bookings" },
                { key: "pending", label: "Pending Approval" },
                { key: "booked", label: "Confirmed" },
                { key: "paired", label: "Paired Tables" },
                { key: "paid", label: "Paid" },
            ].map(({ key, label }) => (<button key={key} onClick={() => setFilterStatus(key)} className={`btn btn-sm rounded-xl text-xs font-semibold transition ${filterStatus === key
                    ? "btn-primary shadow-sm"
                    : "btn-ghost bg-base-100 border border-base-300 text-base-content/70"}`}>
                  {label}
                </button>))}
            </div>

            {/* Bookings List */}
            {loading ? (<div className="space-y-3">
                {[...Array(3)].map((_, i) => (<div key={i} className="animate-pulse bg-base-100 h-24 rounded-2xl border border-base-300"/>))}
              </div>) : filteredBookings.length === 0 ? (<div className="card bg-base-100 border border-base-300 shadow-sm p-12 text-center rounded-3xl">
                <Users className="w-12 h-12 text-base-content/30 mx-auto mb-3"/>
                <h3 className="text-lg font-bold text-base-content">No bookings in this category</h3>
                <p className="text-xs text-base-content/60 mt-1">
                  When users book a table or pair up at your venue, their reservations appear here.
                </p>
              </div>) : (<div className="space-y-3">
                {filteredBookings.map((b) => {
                    const bId = b._id || b.id;
                    const userId = b.user?.id || b.user?._id || b.userId;
                    return (<div key={bId} className="card bg-base-100 border border-base-300 shadow-sm p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/40 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="avatar">
                          <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-primary/30">
                            <img src={b.user?.avatar || b.user?.profilePic} alt={b.user?.fullName} className="w-full h-full object-cover" onError={(e) => {
                            e.currentTarget.src = "https://api.dicebear.com/7.x/adventurer/svg?seed=" + userId;
                        }}/>
                          </div>
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-bold text-base-content text-base">
                              {b.user?.fullName}
                            </h4>
                            <StatusBadge status={b.status} pairStatus={b.pairStatus}/>
                          </div>
                          <p className="text-xs text-base-content/60 mt-0.5">
                            {b.user?.age ? `${b.user.age} yrs` : "Age N/A"} •{" "}
                            {b.user?.gender || "Guest"} •{" "}
                            {b.user?.occupation || "Guest"} •{" "}
                            📍 {b.user?.location || "Nearby"}
                          </p>
                          {b.user?.bio && (<p className="text-xs text-base-content/70 mt-1 line-clamp-1 italic">
                              "{b.user.bio}"
                            </p>)}
                        </div>
                      </div>

                      {/* Action Controls */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {b.status === "pending" && (<>
                            <button type="button" onClick={() => handleAccept(bId)} className="btn btn-success btn-sm rounded-xl text-xs gap-1 shadow-sm">
                              <Check className="w-3.5 h-3.5"/> Accept
                            </button>
                            <button type="button" onClick={() => handleReject(bId)} className="btn btn-error btn-outline btn-sm rounded-xl text-xs gap-1">
                              <X className="w-3.5 h-3.5"/> Decline
                            </button>
                          </>)}

                        {b.status === "booked" && (<span className="badge badge-warning font-semibold text-xs py-2 px-3">
                            Awaiting User Payment
                          </span>)}

                        {b.status === "paid" && (<div className="flex items-center gap-2">
                            <span className="badge badge-success font-semibold text-xs py-2 px-3 flex items-center gap-1">
                              <IndianRupee className="w-3 h-3"/> Paid
                            </span>
                            {userId && (<Link to={`/vendor/chat/${userId}`} className="btn btn-primary btn-sm rounded-xl text-xs gap-1.5 shadow-sm">
                                <MessageSquare className="w-3.5 h-3.5"/> Chat
                              </Link>)}
                          </div>)}
                      </div>
                    </div>);
                })}
              </div>)}
          </div>)}
      </main>

      <VendorFooter />
    </div>);
};
export default VendorDashboardPage;
