import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Building2, Mail, Lock, Phone, FileText, Clock, IndianRupee, Utensils, Coffee, Hotel, PartyPopper, Sparkles, ArrowRight, ArrowLeft, Check, Eye, EyeOff, CheckCircle2, Heart, Store, } from "lucide-react";
import { toast } from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import LocationField from "../components/LocationField";
import ImageUploader from "../components/ImageUploader";
const businessTypes = [
    {
        id: "Restaurant",
        label: "Restaurant",
        icon: Utensils,
        desc: "Dining & culinary experiences",
    },
    {
        id: "Café",
        label: "Café",
        icon: Coffee,
        desc: "Coffee, work & casual talks",
    },
    {
        id: "Hotel",
        label: "Hotel",
        icon: Hotel,
        desc: "Lounge & hospitality suites",
    },
    {
        id: "Club",
        label: "Club",
        icon: PartyPopper,
        desc: "Nightlife, DJ & parties",
    },
];
const amenitiesList = [
    "Dance floor",
    "Live Music Nights",
    "DJ & Karaoke Evenings",
    "Book with ₹0 Payment",
    "Enjoy Happy Hours with 2+1 offer",
    "Outdoor Garden Seating",
    "Rooftop Dining Experience",
    "Pet-Friendly Area",
    "Kids’ Play Zone",
    "Free Wi-Fi",
    "Valet Parking Available",
    "Private Dining Cabins",
    "Wheelchair Accessible",
    "Sports Screening on Big Screen",
    "Buffet & Unlimited Meal Options",
    "Vegan and Gluten-Free Menu",
    "Takeaway & Home Delivery",
    "Event Hosting & Party Bookings",
    "Family-Friendly Environment",
    "Air Conditioned Halls",
];
const pricePresets = [300, 500, 800, 1200, 2000];
const VendorSignupPage = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const navigate = useNavigate();
    const [formState, setFormState] = useState({
        hotelName: "",
        ownerEmail: "",
        password: "",
        phone: "",
        gstNo: "",
        businessType: "Restaurant",
        location: "",
        price: "",
        openingTime: "10:00 AM",
        closingTime: "11:00 PM",
        photos: [],
        amenities: [],
        description: "",
    });
    const handleChange = (e) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };
    const handleBusinessTypeSelect = (type) => {
        setFormState((prev) => ({ ...prev, businessType: type }));
    };
    const toggleAmenity = (amenity) => {
        setFormState((prev) => {
            const exists = prev.amenities.includes(amenity);
            return {
                ...prev,
                amenities: exists
                    ? prev.amenities.filter((a) => a !== amenity)
                    : [...prev.amenities, amenity],
            };
        });
    };
    const validateStep = (step) => {
        if (step === 1) {
            if (!formState.hotelName.trim()) {
                toast.error("Please enter your business / venue name");
                return false;
            }
            if (!formState.ownerEmail.trim()) {
                toast.error("Please enter your business email");
                return false;
            }
            if (!formState.password || formState.password.length < 6) {
                toast.error("Password must be at least 6 characters long");
                return false;
            }
            if (!formState.phone.trim()) {
                toast.error("Please enter your contact phone number");
                return false;
            }
            if (!formState.gstNo.trim()) {
                toast.error("Please enter your GST registration number");
                return false;
            }
        }
        else if (step === 2) {
            if (!formState.location.trim()) {
                toast.error("Please specify your venue city / location");
                return false;
            }
            if (!formState.price || Number(formState.price) <= 0) {
                toast.error("Please enter a valid average price (₹)");
                return false;
            }
            if (!formState.openingTime.trim() || !formState.closingTime.trim()) {
                toast.error("Please provide both opening and closing hours");
                return false;
            }
        }
        return true;
    };
    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep((prev) => Math.min(3, prev + 1));
        }
    };
    const handleBack = () => {
        setCurrentStep((prev) => Math.max(1, prev - 1));
    };
    const handleSignup = async (e) => {
        e.preventDefault();
        if (!validateStep(1) || !validateStep(2))
            return;
        setIsPending(true);
        const toastId = toast.loading("Creating your partner account...");
        try {
            const payload = {
                ...formState,
                price: Number(formState.price),
            };
            const res = await axiosInstance.post("/vendors/signup", payload);
            const newVendor = res.data.vendor;
            if (newVendor) {
                localStorage.setItem("vendor", JSON.stringify(newVendor));
            }
            if (res.data?.token) {
                localStorage.setItem("vendorToken", res.data.token);
            }
            toast.success("Welcome to NearMeet Partner Network!", { id: toastId });
            navigate("/vendor-home", { replace: true });
        }
        catch (err) {
            console.error("Vendor signup error:", err);
            const msg = err.response?.data?.message ||
                (err.response?.status === 409
                    ? "This email is already registered as a vendor"
                    : "Signup failed. Please verify your information.");
            toast.error(msg, { id: toastId });
        }
        finally {
            setIsPending(false);
        }
    };
    return (<div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 flex flex-col justify-between py-8 px-4 sm:px-6 relative overflow-hidden">
      {/* Decorative Glow Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"/>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"/>

      {/* Main Container */}
      <div className="w-full max-w-3xl mx-auto my-auto">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-amber-400/30 transition mb-3">
            <Sparkles className="w-4 h-4 text-amber-400"/>
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-300">
              NearMeet Partner Program
            </span>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            List Your Venue with NearMeet
          </h1>
          <p className="text-sm sm:text-base text-gray-400 mt-2 max-w-lg mx-auto">
            Connect directly with verified local groups, receive table reservations,
            and process instant payouts.
          </p>
        </div>

        {/* Wizard Card */}
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl relative">
          {/* Role Selector Tabs */}
          <div className="grid grid-cols-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl mb-8 max-w-md mx-auto">
            <button type="button" onClick={() => navigate("/signup")} className="py-2.5 px-3 rounded-xl text-gray-400 hover:text-white font-medium text-xs flex items-center justify-center gap-1.5 hover:bg-white/5 transition">
              <Heart className="w-3.5 h-3.5 text-pink-400"/>
              <span>Dating & Social User</span>
            </button>
            <button type="button" className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20">
              <Store className="w-3.5 h-3.5"/>
              <span>Venue Partner Portal</span>
            </button>
          </div>

          {/* Step Progress Tracker */}
          <div className="mb-8">
            <div className="flex items-center justify-between max-w-md mx-auto relative">
              {/* Connecting Line */}
              <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-0.5 bg-white/10 -z-0"/>
              <div className="absolute top-1/2 left-0 -translate-y-1/2 h-0.5 bg-gradient-to-r from-amber-500 to-amber-400 -z-0 transition-all duration-300" style={{
            width: `${((currentStep - 1) / 2) * 100}%`,
        }}/>

              {/* Step 1 */}
              <div className="flex flex-col items-center gap-1.5 relative z-10">
                <button type="button" onClick={() => setCurrentStep(1)} className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${currentStep > 1
            ? "bg-amber-500 text-slate-950 ring-4 ring-amber-500/20"
            : currentStep === 1
                ? "bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 font-extrabold ring-4 ring-amber-500/30 shadow-lg shadow-amber-500/20"
                : "bg-slate-800 text-gray-400 border border-white/10"}`}>
                  {currentStep > 1 ? <Check className="w-4 h-4 stroke-[3]"/> : "1"}
                </button>
                <span className="text-[11px] font-medium text-gray-300">Identity</span>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center gap-1.5 relative z-10">
                <button type="button" onClick={() => {
            if (validateStep(1))
                setCurrentStep(2);
        }} className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${currentStep > 2
            ? "bg-amber-500 text-slate-950 ring-4 ring-amber-500/20"
            : currentStep === 2
                ? "bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 font-extrabold ring-4 ring-amber-500/30 shadow-lg shadow-amber-500/20"
                : "bg-slate-800 text-gray-400 border border-white/10"}`}>
                  {currentStep > 2 ? <Check className="w-4 h-4 stroke-[3]"/> : "2"}
                </button>
                <span className="text-[11px] font-medium text-gray-300">Operations</span>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center gap-1.5 relative z-10">
                <button type="button" onClick={() => {
            if (validateStep(1) && validateStep(2))
                setCurrentStep(3);
        }} className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${currentStep === 3
            ? "bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 font-extrabold ring-4 ring-amber-500/30 shadow-lg shadow-amber-500/20"
            : "bg-slate-800 text-gray-400 border border-white/10"}`}>
                  3
                </button>
                <span className="text-[11px] font-medium text-gray-300">Showcase</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSignup}>
            {/* STEP 1: BUSINESS IDENTITY & CONTACT */}
            {currentStep === 1 && (<div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2.5">
                    Select Venue Category
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {businessTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = formState.businessType === type.id;
                return (<button key={type.id} type="button" onClick={() => handleBusinessTypeSelect(type.id)} className={`flex flex-col items-center text-center p-3.5 rounded-2xl border transition-all ${isSelected
                        ? "bg-gradient-to-b from-amber-500/20 to-amber-500/5 border-amber-400 text-white shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/50"
                        : "bg-white/[0.03] border-white/10 text-gray-400 hover:bg-white/[0.06] hover:text-white"}`}>
                          <div className={`p-2.5 rounded-xl mb-2 ${isSelected
                        ? "bg-amber-500 text-slate-950 font-bold"
                        : "bg-white/5 text-gray-300"}`}>
                            <Icon className="w-5 h-5"/>
                          </div>
                          <span className="text-sm font-semibold text-white">{type.label}</span>
                          <span className="text-[10px] text-gray-400 mt-1 leading-tight line-clamp-1">
                            {type.desc}
                          </span>
                        </button>);
            })}
                  </div>
                </div>

                {/* Business Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Business / Hotel Name *
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                    <input type="text" name="hotelName" value={formState.hotelName} onChange={handleChange} placeholder="e.g. Skyline Rooftop & Lounge" className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400" required/>
                  </div>
                </div>

                {/* Email & Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                      Owner Business Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                      <input type="email" name="ownerEmail" value={formState.ownerEmail} onChange={handleChange} placeholder="owner@venue.com" className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400" required/>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                      Password (min. 6 chars) *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                      <input type={showPassword ? "text" : "password"} name="password" value={formState.password} onChange={handleChange} placeholder="Create strong password" minLength={6} className="w-full pl-10 pr-11 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400" required/>
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                        {showPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Phone & GST */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                      Contact Phone *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                      <input type="tel" name="phone" value={formState.phone} onChange={handleChange} placeholder="+91 98765 43210" className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400" required/>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                      GST Number / Business Registration *
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                      <input type="text" name="gstNo" value={formState.gstNo} onChange={handleChange} placeholder="22AAAAA0000A1Z5" className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400 uppercase" required/>
                    </div>
                  </div>
                </div>

                {/* Next Button */}
                <div className="pt-2">
                  <button type="button" onClick={handleNext} className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition flex items-center justify-center gap-2">
                    Continue to Venue & Operations
                    <ArrowRight className="w-4 h-4"/>
                  </button>
                </div>
              </div>)}

            {/* STEP 2: OPERATIONS, LOCATION & PRICING */}
            {currentStep === 2 && (<div className="space-y-6">
                {/* Location */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Venue City & Location *
                  </label>
                  <LocationField formState={formState} setFormState={setFormState}/>
                  <p className="text-xs text-gray-400 mt-1">
                    Help nearby community members discover your venue easily.
                  </p>
                </div>

                {/* Price & Presets */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Average Spend per Person (₹) *
                    </label>
                    <span className="text-xs text-amber-400 font-medium">INR</span>
                  </div>
                  <div className="relative">
                    <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                    <input type="number" name="price" value={formState.price} onChange={handleChange} placeholder="e.g. 600" min={0} className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400" required/>
                  </div>

                  {/* Preset Price Chips */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[11px] text-gray-400">Quick presets:</span>
                    {pricePresets.map((p) => (<button key={p} type="button" onClick={() => setFormState((prev) => ({ ...prev, price: String(p) }))} className={`text-xs px-2.5 py-1 rounded-lg border transition ${Number(formState.price) === p
                    ? "bg-amber-500/20 border-amber-400 text-amber-300"
                    : "bg-white/5 border-white/10 text-gray-400 hover:text-white"}`}>
                        ₹{p}
                      </button>))}
                  </div>
                </div>

                {/* Opening and Closing Hours */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                      Opening Time *
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                      <input type="text" name="openingTime" value={formState.openingTime} onChange={handleChange} placeholder="10:00 AM" className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400" required/>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                      Closing Time *
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                      <input type="text" name="closingTime" value={formState.closingTime} onChange={handleChange} placeholder="11:00 PM" className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400" required/>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Venue Highlights & Atmosphere
                  </label>
                  <textarea name="description" rows={3} value={formState.description} onChange={handleChange} placeholder="Tell guests about your ambiance, signature drinks, music style, and hospitality experience..." className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400 resize-none"/>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button type="button" onClick={handleBack} className="w-1/3 py-3.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-semibold text-sm transition flex items-center justify-center gap-1.5">
                    <ArrowLeft className="w-4 h-4"/>
                    Back
                  </button>
                  <button type="button" onClick={handleNext} className="w-2/3 py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition flex items-center justify-center gap-2">
                    Continue to Photos & Amenities
                    <ArrowRight className="w-4 h-4"/>
                  </button>
                </div>
              </div>)}

            {/* STEP 3: PHOTOS & AMENITIES */}
            {currentStep === 3 && (<div className="space-y-7">
                {/* Cloudinary Photo Uploader */}
                <div className="bg-white/[0.02] p-5 rounded-2xl border border-white/10">
                  <ImageUploader photos={formState.photos} onChange={(newPhotos) => setFormState((prev) => ({ ...prev, photos: newPhotos }))} maxPhotos={5}/>
                </div>

                {/* Interactive Amenities Selector */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Select Amenities & Features
                    </label>
                    <span className="text-xs text-amber-300">
                      {formState.amenities.length} selected
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-1 pr-2 custom-scrollbar">
                    {amenitiesList.map((amenity) => {
                const isSelected = formState.amenities.includes(amenity);
                return (<button key={amenity} type="button" onClick={() => toggleAmenity(amenity)} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left text-xs transition-all ${isSelected
                        ? "bg-amber-500/20 border-amber-400 text-amber-200 shadow-sm ring-1 ring-amber-400/40"
                        : "bg-white/[0.03] border-white/10 text-gray-400 hover:bg-white/[0.06] hover:text-gray-200"}`}>
                          <div className={`w-4 h-4 rounded-md flex items-center justify-center transition-colors flex-shrink-0 ${isSelected
                        ? "bg-amber-500 text-slate-950 font-bold"
                        : "border border-white/20 bg-white/5"}`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]"/>}
                          </div>
                          <span className="truncate">{amenity}</span>
                        </button>);
            })}
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                  <button type="button" onClick={handleBack} disabled={isPending} className="w-1/3 py-3.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-semibold text-sm transition flex items-center justify-center gap-1.5">
                    <ArrowLeft className="w-4 h-4"/>
                    Back
                  </button>
                  <button type="submit" disabled={isPending} className="w-2/3 py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/30 transition flex items-center justify-center gap-2 disabled:opacity-50">
                    {isPending ? (<>
                        <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"/>
                        Creating Venue Profile...
                      </>) : (<>
                        <CheckCircle2 className="w-5 h-5"/>
                        Complete Partner Registration
                      </>)}
                  </button>
                </div>
              </div>)}
          </form>
        </div>

        {/* Footer Prompt */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-400">
            Already registered as a venue partner?{" "}
            <Link to="/vendor-login" className="text-amber-400 font-semibold hover:text-amber-300 hover:underline transition">
              Sign In to Vendor Dashboard
            </Link>
          </p>
        </div>
      </div>
    </div>);
};
export default VendorSignupPage;
