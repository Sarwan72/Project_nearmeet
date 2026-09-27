import { Link } from "react-router";
import { axiosInstance } from "../lib/axios";
import { useEffect, useState } from "react";
import { GlobeIcon, UsersIcon, MapPinIcon, Heart, Star, StarHalf, StarOff, X, } from "lucide-react";
function StaticCounter({ value, icon: Icon, text }) {
    return (<div className="flex flex-col items-center justify-center text-center p-5 bg-base-100 border border-base-300 rounded-2xl shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-300 group">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-primary/20 transition-all">
        <Icon className="w-6 h-6 text-primary"/>
      </div>
      <span className="text-3xl sm:text-4xl font-extrabold text-base-content tracking-tight">
        {value?.toLocaleString()}
      </span>
      <p className="text-xs sm:text-sm font-medium text-base-content/70 mt-1">{text}</p>
    </div>);
}
function LocationPin({ top, left, city, spots, }) {
    return (<div className="absolute group/pin cursor-pointer transform -translate-x-1/2 -translate-y-1/2 z-10" style={{ top: `${top}%`, left: `${left}%` }}>
      <div className="relative flex items-center justify-center">
        <div className="absolute w-7 h-7 bg-primary/40 rounded-full animate-ping pointer-events-none"/>
        <div className="relative w-5 h-5 rounded-full bg-primary border-2 border-white shadow-md flex items-center justify-center text-white text-[9px] font-bold">
          📍
        </div>
      </div>
      {/* Tooltip badge */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-95 group-hover/pin:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap">
        <div className="px-2.5 py-1 bg-base-100/95 backdrop-blur-md text-base-content text-[11px] font-semibold rounded-lg shadow-xl border border-base-300 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>
          <span>{city}</span>
          <span className="text-base-content/60">• {spots}</span>
        </div>
      </div>
    </div>);
}
const HomePage = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        users: 0,
        vendors: 0,
        cities: 0,
    });
    const [trendingUsers, setTrendingUsers] = useState([]);
    const [featuredHotels, setFeaturedHotels] = useState([]);
    const [cities, setCities] = useState([]);
    const [visibleCities, setVisibleCities] = useState(4);
    const [visibleHotels, setVisibleHotels] = useState(6);
    const [selectedUserProfile, setSelectedUserProfile] = useState(null);
    useEffect(() => {
        fetchHomeData();
    }, []);
    const fetchHomeData = async () => {
        try {
            const res = await axiosInstance.get("/review/userdashboard/stats");
            if (res.data) {
                setStats({
                    users: res.data.totalUsers || 0,
                    vendors: res.data.totalVendors || 0,
                    cities: res.data.totalCities || 0,
                });
                setTrendingUsers(Array.isArray(res.data.trendingUsers) ? res.data.trendingUsers : []);
                const rawHotels = Array.isArray(res.data.featuredHotels) ? res.data.featuredHotels : [];
                const sortedHotels = [...rawHotels].sort((a, b) => (Number(b.averageRating) || 0) - (Number(a.averageRating) || 0));
                setFeaturedHotels(sortedHotels);
                setCities(Array.isArray(res.data.cities) ? res.data.cities : []);
            }
        }
        catch (err) {
            console.log("Home page fetch error:", err);
        }
        finally {
            setLoading(false);
        }
    };
    if (loading)
        return (<div className="flex justify-center items-center h-screen text-2xl">
        Loading...
      </div>);
    return (<div className="min-h-screen bg-base-100">
      {/* HERO */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-br from-primary/10 via-pink-100/20 to-secondary/10">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee')] bg-cover bg-center"></div>

        <div className="container mx-auto px-6 relative text-center max-w-5xl">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight drop-shadow-lg">
            Meet Amazing People Near You
          </h1>
          <p className="text-xl md:text-2xl text-base-content/80 mb-10">
            Connect with real people locally. Build friendships and
            relationships.
          </p>

          <Link to="/hotels" className="btn btn-primary btn-lg px-10">
            Get Started
          </Link>
        </div>
      </section>

      <div className="container mx-auto px-6 md:px-10 py-20 space-y-20">
        {/* ⭐ FEATURED HOTELS */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Featured Hotels</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredHotels.slice(0, visibleHotels).map((vendor) => {
            //  console.log('hotle data', vendor);
            const hotelImage = vendor.photos?.[0] || vendor.image || "/no-hotel.png";
            // const rating = vendor.averageRating || 0;
            return (<div key={vendor._id} className="rounded-2xl overflow-hidden shadow-md hover:shadow-2xl bg-base-100 border border-base-200 hover:border-primary/40 transition duration-300 flex flex-col justify-between">
                  <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${hotelImage})` }}></div>

                  <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-base-content">{vendor.hotelName}</h3>
                      <p className="text-base-content/70 text-sm mt-0.5">{vendor.location}</p>
                    </div>

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

                      <span className="text-sm text-gray-500 ml-1">
                        ({Number(vendor.totalReviews) || 0} reviews)
                      </span>
                    </div>

                    {/* ➜ View Reviews */}
                    <Link to={`/vendor/${vendor._id}/reviews`} className="text-blue-600 underline text-sm mt-2 block">
                      View Reviews →
                    </Link>
                  </div>
                </div>);
        })}
          </div>

          {visibleHotels < featuredHotels.length && (<div className="text-center mt-6">
              <button onClick={() => setVisibleHotels((prev) => prev + 6)} className="btn btn-outline btn-primary px-10">
                Show More
              </button>
            </div>)}
        </section>

        {/* USERS / DATING DISCOVERY */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="text-3xl font-bold">Trending People Near You</h2>
              <p className="text-sm opacity-60 mt-0.5">
                Connect with local personalities looking for curated offline meetups.
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 self-start sm:self-auto">
              Avatar & Personality Verified
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {trendingUsers.map((user) => (<div key={user._id} onClick={() => setSelectedUserProfile(user)} className="group p-5 rounded-3xl bg-base-100 border border-base-200 shadow-md hover:shadow-xl hover:border-primary/40 transition-all cursor-pointer flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3.5 mb-3">
                    <img src={user.avatar || user.profilePic || "/default-user.png"} alt={user.fullName} className="w-14 h-14 rounded-full border-2 border-primary object-cover bg-base-200 group-hover:scale-105 transition-transform"/>
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-base truncate">{user.fullName}</h3>
                        {user.age && (<span className="text-xs font-bold opacity-60">
                            {user.age}
                          </span>)}
                      </div>
                      <p className="text-xs opacity-60 truncate">
                        📍 {user.location || user.city || "Nearby"}
                      </p>
                    </div>
                  </div>

                  {/* Dating Intention */}
                  {user.datingIntention && (<div className="mb-2.5">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-secondary/10 text-secondary border border-secondary/20">
                        {user.datingIntention}
                      </span>
                    </div>)}

                  {/* Bio */}
                  {user.bio && (<p className="text-xs opacity-80 line-clamp-2 italic mb-3">
                      "{user.bio}"
                    </p>)}

                  {/* Top Interests */}
                  {user.interests?.length > 0 && (<div className="flex flex-wrap gap-1 mb-3">
                      {user.interests.slice(0, 3).map((item) => (<span key={item} className="px-2 py-0.5 rounded-md bg-base-200 text-[10px] opacity-80">
                          {item}
                        </span>))}
                      {user.interests.length > 3 && (<span className="text-[10px] opacity-50 self-center">
                          +{user.interests.length - 3}
                        </span>)}
                    </div>)}
                </div>

                <div className="pt-3 border-t border-base-200 flex items-center justify-between text-xs text-primary font-semibold">
                  <span>View Full Profile</span>
                  <span>→</span>
                </div>
              </div>))}
          </div>
        </section>

        {/* CITIES */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Popular Cities</h2>

          <div className="grid md:grid-cols-4 gap-6">
            {cities.slice(0, visibleCities).map((city, i) => (<div key={i} className="p-6 bg-base-200 rounded-2xl shadow hover:bg-base-300 transition">
                <h3 className="text-xl font-semibold">{city}</h3>
              </div>))}
          </div>

          {visibleCities < cities.length && (<div className="text-center mt-6">
              <button onClick={() => setVisibleCities((prev) => prev + 4)} className="btn btn-outline btn-primary px-10">
                Show More
              </button>
            </div>)}
        </section>

        {/* STATS & LOCATION MAP */}
        <section className="grid grid-cols-1 md:grid-cols-5 gap-6 lg:gap-8 items-stretch">
          <div className="md:col-span-3 min-h-[340px] sm:min-h-[380px] md:min-h-[420px] rounded-3xl overflow-hidden relative border border-base-300 shadow-xl group flex flex-col justify-between bg-base-200">
            {/* Clean Realistic Map Background */}
            <img src="/location-map.jpg" alt="NearMeet City Location Map" className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"/>
            {/* Subtle Contrast Overlay */}
            <div className="absolute inset-0 bg-base-300/10 pointer-events-none"/>

            {/* Top Bar on Map */}
            <div className="relative z-10 p-4 sm:p-5 flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-base-100/90 backdrop-blur-md border border-base-300 text-base-content text-xs font-semibold shadow-md">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/>
                <span>NearMeet Live Map</span>
              </div>
              <span className="text-[11px] font-medium text-base-content/80 bg-base-100/90 backdrop-blur-md px-3 py-1 rounded-full border border-base-300 shadow-sm">
                Delhi NCR Hub
              </span>
            </div>

            {/* Interactive Real Location Pins on Clean Street Map */}
            <LocationPin top={50} left={50} city="Connaught Place" spots="12 Partner Cafés"/>
            <LocationPin top={68} left={28} city="Hauz Khas Village" spots="8 Lounges"/>
            <LocationPin top={32} left={74} city="Noida Hub" spots="Verified Spots"/>
            <LocationPin top={26} left={36} city="North Campus" spots="Bistros"/>

            {/* Bottom Info Bar on Map */}
            <div className="relative z-10 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-base-100/90 backdrop-blur-md border-t border-base-300/70 text-base-content">
              <div>
                <h4 className="text-base-content text-sm sm:text-base font-bold flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4 text-primary"/>
                  Active Venues Across {stats.cities || 3}+ Cities
                </h4>
                <p className="text-base-content/70 text-xs mt-0.5">
                  Safe cafés, bistros, and hotels verified for offline pair meetups.
                </p>
              </div>
              <Link to="/hotels" className="btn btn-sm btn-primary text-primary-content shadow-md hover:scale-105 transition shrink-0">
                Browse Venues
              </Link>
            </div>
          </div>

          <div className="md:col-span-2 grid grid-cols-2 gap-4 h-full">
            <StaticCounter value={stats.cities} icon={GlobeIcon} text="Active Cities"/>
            <StaticCounter value={stats.users} icon={UsersIcon} text="Users"/>
            <StaticCounter value={stats.vendors} icon={MapPinIcon} text="Hotels"/>
            <StaticCounter value={300} icon={Heart} text="Matches Today"/>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center bg-primary text-primary-content py-16 rounded-3xl shadow-xl px-6">
          <h2 className="text-4xl font-bold mb-6">
            Plan Your Next Meetup Today
          </h2>
          <Link to="/hotels" className="btn btn-secondary btn-lg shadow-md hover:scale-105 transition">
            Browse Hotels
          </Link>
        </section>
      </div>

      {/* User Dating Profile Detail Modal */}
      {selectedUserProfile && (<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-base-200 shadow-2xl p-6 relative">
            <button type="button" onClick={() => setSelectedUserProfile(null)} className="btn btn-circle btn-sm btn-ghost absolute top-4 right-4">
              <X className="w-4 h-4"/>
            </button>

            {/* Profile Header */}
            <div className="flex items-center gap-4 mb-4">
              <img src={selectedUserProfile.avatar ||
                selectedUserProfile.profilePic ||
                "/default-user.png"} alt={selectedUserProfile.fullName} className="w-20 h-20 rounded-full border-4 border-primary object-cover bg-base-200"/>
              <div>
                <h3 className="text-xl font-bold">{selectedUserProfile.fullName}</h3>
                <p className="text-xs opacity-70">
                  {selectedUserProfile.age ? `${selectedUserProfile.age} yrs` : "Age N/A"} •{" "}
                  {selectedUserProfile.gender || "Gender unspecified"}
                </p>
                <p className="text-xs opacity-60">
                  📍 {selectedUserProfile.location || selectedUserProfile.city || "Nearby"}
                </p>
                {selectedUserProfile.datingIntention && (<span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-secondary/15 text-secondary border border-secondary/20">
                    Looking for: {selectedUserProfile.datingIntention}
                  </span>)}
              </div>
            </div>

            {/* Bio */}
            {selectedUserProfile.bio && (<div className="p-3.5 rounded-2xl bg-base-200/50 mb-4 text-xs italic leading-relaxed">
                "{selectedUserProfile.bio}"
              </div>)}

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs mb-4">
              {selectedUserProfile.occupation && (<div className="p-2 rounded-xl bg-base-200/40">
                  <span className="opacity-50 block text-[10px]">Occupation</span>
                  <span className="font-semibold">{selectedUserProfile.occupation}</span>
                </div>)}
              {selectedUserProfile.education && (<div className="p-2 rounded-xl bg-base-200/40">
                  <span className="opacity-50 block text-[10px]">Education</span>
                  <span className="font-semibold">{selectedUserProfile.education}</span>
                </div>)}
              {selectedUserProfile.personalityType && (<div className="p-2 rounded-xl bg-base-200/40">
                  <span className="opacity-50 block text-[10px]">Personality</span>
                  <span className="font-semibold">{selectedUserProfile.personalityType}</span>
                </div>)}
              {selectedUserProfile.lifestyle?.drinking && (<div className="p-2 rounded-xl bg-base-200/40">
                  <span className="opacity-50 block text-[10px]">Drinking</span>
                  <span className="font-semibold">{selectedUserProfile.lifestyle.drinking}</span>
                </div>)}
            </div>

            {/* Interests */}
            {selectedUserProfile.interests?.length > 0 && (<div className="mb-4">
                <span className="text-xs font-bold block mb-1.5">Interests</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedUserProfile.interests.map((interest) => (<span key={interest} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                      {interest}
                    </span>))}
                </div>
              </div>)}

            {/* Prompts */}
            {selectedUserProfile.prompts?.length > 0 && (<div className="space-y-2 mb-4">
                <span className="text-xs font-bold block">Profile Prompts</span>
                {selectedUserProfile.prompts.map((p, idx) => (<div key={idx} className="p-3 rounded-2xl bg-base-200/40 border border-base-200">
                    <p className="text-[11px] font-bold text-primary">{p.question}</p>
                    <p className="text-xs opacity-90 mt-0.5 italic">"{p.answer}"</p>
                  </div>))}
              </div>)}

            <div className="pt-2 text-center">
              <Link to="/hotels" onClick={() => setSelectedUserProfile(null)} className="btn btn-primary btn-sm w-full rounded-xl">
                Book a Venue Table to Meet
              </Link>
            </div>
          </div>
        </div>)}
    </div>);
};
export default HomePage;
