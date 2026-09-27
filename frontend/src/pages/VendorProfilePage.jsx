import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getVendorProfile, updateVendorProfile, deleteVendorAccount, } from "../lib/vendor";
import amenitiesList from "../constants/amenitiesList";
import { toast } from "react-hot-toast";
import DeleteAccountModal from "../components/DeleteAccountModal";
import ImageUploader from "../components/ImageUploader";
import { useNavigate, Link } from "react-router-dom";
import VendorNavbar from "../components/VendorNavbar";
import { Building2, Phone, Mail, FileText, Clock, IndianRupee, MapPin, Sparkles, Save, Trash2, Star, CheckCircle2, AlertTriangle, ArrowLeft, ShieldCheck, } from "lucide-react";
const VendorProfilePage = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [password, setPassword] = useState("");
    // Fetch vendor profile
    const { data: vendorData, isLoading: isProfileLoading, error, } = useQuery({
        queryKey: ["vendorProfile"],
        queryFn: getVendorProfile,
    });
    const { register, handleSubmit, setValue, watch, formState: { errors, isDirty }, reset, } = useForm({
        defaultValues: {
            hotelName: "",
            phone: "",
            gstNo: "",
            businessType: "Restaurant",
            location: "",
            price: "",
            openingTime: "",
            closingTime: "",
            description: "",
            photos: [],
            amenities: [],
        },
    });
    useEffect(() => {
        if (vendorData) {
            reset({
                hotelName: vendorData.hotelName || vendorData.hotel_name || "",
                phone: vendorData.phone || "",
                gstNo: vendorData.gstNo || vendorData.gst_no || "",
                businessType: vendorData.businessType || vendorData.business_type || "Restaurant",
                location: vendorData.location || "",
                price: vendorData.price !== undefined ? String(vendorData.price) : "",
                openingTime: vendorData.openingTime || vendorData.opening_time || "",
                closingTime: vendorData.closingTime || vendorData.closing_time || "",
                description: vendorData.description || "",
                photos: vendorData.photos || [],
                amenities: vendorData.amenities || [],
            });
        }
    }, [vendorData, reset]);
    // Update profile mutation (React Query v5 uses isPending)
    const { mutate: updateProfileMutation, isPending: isUpdateLoading } = useMutation({
        mutationFn: updateVendorProfile,
        onSuccess: (updatedVendor) => {
            queryClient.invalidateQueries({ queryKey: ["vendorProfile"] });
            toast.success("Venue profile updated successfully! 🎉");
            if (updatedVendor) {
                // Sync with local storage for instant navbar and dashboard updates
                const currentStored = (() => {
                    try {
                        return JSON.parse(localStorage.getItem("vendor") || "{}");
                    }
                    catch {
                        return {};
                    }
                })();
                localStorage.setItem("vendor", JSON.stringify({ ...currentStored, ...updatedVendor }));
            }
        },
        onError: (err) => {
            console.error("Profile update error:", err);
            toast.error(err.response?.data?.message || err.message || "Failed to update profile.");
        },
    });
    // Delete account mutation
    const { mutate: deleteMutation, isPending: isDeleting } = useMutation({
        mutationFn: deleteVendorAccount,
        onSuccess: () => {
            toast.success("Vendor account deleted successfully.");
            localStorage.removeItem("vendor");
            localStorage.removeItem("vendorToken");
            navigate("/vendor-login");
        },
        onError: (err) => {
            console.error("Account delete error:", err);
            toast.error(err.response?.data?.message || "Incorrect password or failed to delete account.");
        },
    });
    const onSubmit = (formData) => {
        const payload = {
            ...formData,
            price: formData.price ? Number(formData.price) : 0,
            amenities: Array.isArray(formData.amenities)
                ? formData.amenities.filter(Boolean)
                : [formData.amenities].filter(Boolean),
        };
        updateProfileMutation(payload);
    };
    const handleDeleteAccount = () => {
        if (!password.trim()) {
            toast.error("Please enter your account password to confirm deletion.");
            return;
        }
        deleteMutation(password);
    };
    const selectedAmenities = watch("amenities") || [];
    const currentPhotos = watch("photos") || [];
    const toggleAmenity = (item) => {
        const list = Array.isArray(selectedAmenities) ? [...selectedAmenities] : [];
        const index = list.indexOf(item);
        if (index > -1) {
            list.splice(index, 1);
        }
        else {
            list.push(item);
        }
        setValue("amenities", list, { shouldDirty: true });
    };
    if (isProfileLoading) {
        return (<div className="min-h-screen bg-base-200 flex flex-col">
        <VendorNavbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <p className="text-base-content/70 font-medium">Loading venue profile...</p>
          </div>
        </div>
      </div>);
    }
    if (error) {
        return (<div className="min-h-screen bg-base-200 flex flex-col">
        <VendorNavbar />
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="card bg-base-100 shadow-xl border border-error/20 p-8 max-w-md text-center">
            <AlertTriangle className="w-12 h-12 text-error mx-auto mb-3"/>
            <h2 className="text-xl font-bold text-base-content mb-2">Failed to load profile</h2>
            <p className="text-sm text-base-content/70 mb-4">
              We couldn't retrieve your vendor profile details. Please verify your connection or session.
            </p>
            <button onClick={() => queryClient.invalidateQueries({ queryKey: ["vendorProfile"] })} className="btn btn-primary">
              Retry
            </button>
          </div>
        </div>
      </div>);
    }
    const vendor = vendorData || {};
    const hotelName = watch("hotelName") || vendor.hotelName || vendor.hotel_name || "Your Venue";
    const heroImage = currentPhotos[0] ||
        vendor.photos?.[0] ||
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=compress&cs=tinysrgb&w=800";
    return (<div className="min-h-screen bg-base-200 flex flex-col">
      <VendorNavbar profile={vendor}/>

      <main className="flex-grow container mx-auto px-4 py-8 max-w-5xl">
        {/* Top Breadcrumb & Action Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Link to="/vendor-home" className="btn btn-circle btn-ghost btn-sm text-base-content/70 hover:bg-base-300">
              <ArrowLeft className="w-5 h-5"/>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content tracking-tight">
                Venue Profile & Settings
              </h1>
              <p className="text-sm text-base-content/60">
                Manage your public listing, table details, pricing, and amenities.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Link to="/vendor-home" className="btn btn-ghost btn-sm">
              Dashboard
            </Link>
            <button type="button" onClick={handleSubmit(onSubmit)} disabled={isUpdateLoading} className="btn btn-primary btn-sm gap-2 shadow-sm">
              {isUpdateLoading ? (<>
                  <span className="loading loading-spinner loading-xs"></span>
                  Saving...
                </>) : (<>
                  <Save className="w-4 h-4"/>
                  Save Changes
                </>)}
            </button>
          </div>
        </div>

        {/* Hero Preview Card */}
        <div className="relative overflow-hidden rounded-3xl bg-base-100 border border-base-300 shadow-md mb-8">
          <div className="h-44 sm:h-56 w-full relative">
            <img src={heroImage} alt="Venue cover" className="w-full h-full object-cover brightness-[0.75]"/>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div className="absolute bottom-4 left-6 right-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 text-white">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge badge-primary font-bold text-xs uppercase tracking-wide">
                    {watch("businessType") || "Venue"}
                  </span>
                  <span className="badge badge-success font-semibold text-xs flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3"/> Verified Partner
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {hotelName}
                </h2>
                <p className="text-xs sm:text-sm text-gray-300 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-primary"/>
                  {watch("location") || "Location not set"}
                </p>
              </div>

              <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                <div className="text-center">
                  <div className="flex items-center gap-1 text-amber-400 font-bold text-lg">
                    <Star className="w-4 h-4 fill-amber-400"/>
                    {(Number(vendor.averageRating || vendor.average_rating || 0) || 0).toFixed(1)}
                  </div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider">
                    {vendor.totalReviews || vendor.total_reviews || 0} Reviews
                  </div>
                </div>
                <div className="h-8 w-[1px] bg-white/20"></div>
                <div className="text-center">
                  <div className="font-bold text-lg text-emerald-400">
                    ₹{watch("price") || 0}
                  </div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider">
                    Per Person
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Section 1: Basic Information */}
          <div className="card bg-base-100 border border-base-300 shadow-sm p-6 sm:p-8 rounded-3xl">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-base-200">
              <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                <Building2 className="w-6 h-6"/>
              </div>
              <div>
                <h3 className="text-lg font-bold text-base-content">Venue Identity & Contact</h3>
                <p className="text-xs text-base-content/60">
                  Primary details shown to guests searching for offline meeting tables.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Hotel Name */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold flex items-center gap-1.5">
                    Venue / Hotel Name <span className="text-error">*</span>
                  </span>
                </label>
                <input type="text" placeholder="e.g. The Amber Lounge & Bistro" {...register("hotelName", { required: "Venue name is required" })} className={`input input-bordered w-full rounded-xl focus:border-primary ${errors.hotelName ? "input-error" : ""}`}/>
                {errors.hotelName && (<label className="label">
                    <span className="label-text-alt text-error">{errors.hotelName.message}</span>
                  </label>)}
              </div>

              {/* Business Type */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Business Category</span>
                </label>
                <select {...register("businessType", { required: true })} className="select select-bordered w-full rounded-xl focus:border-primary">
                  <option value="Restaurant">Restaurant</option>
                  <option value="Café">Café & Coffee Shop</option>
                  <option value="Hotel">Hotel & Fine Dine</option>
                  <option value="Lounge">Lounge & Bar</option>
                  <option value="Club">Nightclub / Dance Club</option>
                  <option value="Rooftop">Rooftop Sky Dining</option>
                  <option value="Bistro">Bistro / Casual Eatery</option>
                </select>
              </div>

              {/* Owner Email (Read Only) */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-base-content/60"/> Owner Account Email
                  </span>
                </label>
                <input type="email" value={vendor.ownerEmail || vendor.owner_email || ""} disabled className="input input-bordered w-full rounded-xl bg-base-200/80 cursor-not-allowed opacity-80"/>
                <label className="label">
                  <span className="label-text-alt text-base-content/50">
                    Primary login credential (contact support to modify)
                  </span>
                </label>
              </div>

              {/* Phone */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-base-content/60"/> Contact Phone
                  </span>
                </label>
                <input type="tel" placeholder="+91 98765 43210" {...register("phone")} className="input input-bordered w-full rounded-xl focus:border-primary"/>
              </div>

              {/* GST Number */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-base-content/60"/> GST / Registration No.
                  </span>
                </label>
                <input type="text" placeholder="22AAAAA0000A1Z5" {...register("gstNo")} className="input input-bordered w-full rounded-xl uppercase focus:border-primary"/>
              </div>

              {/* Location */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-base-content/60"/> Address / City Area
                  </span>
                </label>
                <input type="text" placeholder="e.g. Connaught Place, New Delhi" {...register("location")} className="input input-bordered w-full rounded-xl focus:border-primary"/>
              </div>
            </div>
          </div>

          {/* Section 2: Pricing & Timings */}
          <div className="card bg-base-100 border border-base-300 shadow-sm p-6 sm:p-8 rounded-3xl">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-base-200">
              <div className="p-2.5 rounded-2xl bg-secondary/10 text-secondary">
                <Clock className="w-6 h-6"/>
              </div>
              <div>
                <h3 className="text-lg font-bold text-base-content">Pricing & Operational Hours</h3>
                <p className="text-xs text-base-content/60">
                  Set your average spend per person and meeting opening/closing times.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Price */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold flex items-center gap-1.5">
                    <IndianRupee className="w-3.5 h-3.5 text-primary"/> Approx Price per Person (₹)
                  </span>
                </label>
                <input type="number" placeholder="650" min="0" {...register("price")} className="input input-bordered w-full rounded-xl focus:border-primary"/>
              </div>

              {/* Opening Time */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Opening Time</span>
                </label>
                <input type="text" placeholder="11:00 AM" {...register("openingTime")} className="input input-bordered w-full rounded-xl focus:border-primary"/>
              </div>

              {/* Closing Time */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Closing Time</span>
                </label>
                <input type="text" placeholder="11:30 PM" {...register("closingTime")} className="input input-bordered w-full rounded-xl focus:border-primary"/>
              </div>
            </div>
          </div>

          {/* Section 3: Photos Showcase */}
          <div className="card bg-base-100 border border-base-300 shadow-sm p-6 sm:p-8 rounded-3xl">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-base-200">
              <div className="p-2.5 rounded-2xl bg-accent/10 text-accent">
                <Sparkles className="w-6 h-6"/>
              </div>
              <div>
                <h3 className="text-lg font-bold text-base-content">Venue Showcase & Photos</h3>
                <p className="text-xs text-base-content/60">
                  Upload up to 5 high quality photos of your interior, seating, and ambiance.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-base-200/50 border border-base-300">
              <ImageUploader photos={currentPhotos} onChange={(newPhotos) => setValue("photos", newPhotos, { shouldDirty: true })} maxPhotos={5}/>
            </div>
          </div>

          {/* Section 4: Amenities Checklist */}
          <div className="card bg-base-100 border border-base-300 shadow-sm p-6 sm:p-8 rounded-3xl">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-base-200">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-success/10 text-success">
                  <CheckCircle2 className="w-6 h-6"/>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-base-content">Amenities & Atmosphere</h3>
                  <p className="text-xs text-base-content/60">
                    Click to toggle venue features guests look for when booking meetups.
                  </p>
                </div>
              </div>
              <span className="badge badge-primary badge-outline text-xs">
                {selectedAmenities.length} Selected
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {amenitiesList.map((amenity) => {
            const isSelected = selectedAmenities.includes(amenity);
            return (<button key={amenity} type="button" onClick={() => toggleAmenity(amenity)} className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all border flex items-center justify-between gap-1.5 ${isSelected
                    ? "bg-primary text-primary-content border-primary shadow-sm"
                    : "bg-base-200/80 hover:bg-base-300 border-base-300 text-base-content/80"}`}>
                    <span className="truncate">{amenity}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 shrink-0"/>}
                  </button>);
        })}
            </div>
          </div>

          {/* Section 5: Description & Story */}
          <div className="card bg-base-100 border border-base-300 shadow-sm p-6 sm:p-8 rounded-3xl">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-base-200">
              <div className="p-2.5 rounded-2xl bg-info/10 text-info">
                <FileText className="w-6 h-6"/>
              </div>
              <div>
                <h3 className="text-lg font-bold text-base-content">Venue Story & Guest Vibe</h3>
                <p className="text-xs text-base-content/60">
                  Describe the lighting, music, food specialties, and what makes your venue perfect for 1-on-1 offline meetups.
                </p>
              </div>
            </div>

            <div className="form-control">
              <textarea rows={4} placeholder="Share what guests will experience: romantic candlelit dining, curated acoustic music on weekends, artisanal roast coffee, and quiet alcove tables..." {...register("description")} className="textarea textarea-bordered w-full rounded-2xl focus:border-primary text-sm leading-relaxed"></textarea>
            </div>
          </div>

          {/* Bottom Save Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-3xl bg-base-100 border border-base-300 shadow-md">
            <div className="text-sm text-base-content/70 text-center sm:text-left">
              Make sure to save changes so your updated profile is immediately visible to guests.
            </div>
            <button type="submit" disabled={isUpdateLoading} className="btn btn-primary px-8 rounded-xl shadow-md w-full sm:w-auto">
              {isUpdateLoading ? (<>
                  <span className="loading loading-spinner loading-sm"></span>
                  Updating Venue...
                </>) : (<>
                  <Save className="w-4 h-4 mr-1.5"/>
                  Save Changes
                </>)}
            </button>
          </div>
        </form>

        {/* Danger Zone: Delete Account */}
        <div className="mt-12 card bg-error/5 border border-error/20 p-6 sm:p-8 rounded-3xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-error/15 text-error">
                <Trash2 className="w-6 h-6"/>
              </div>
              <div>
                <h3 className="text-lg font-bold text-error">Danger Zone: Delete Vendor Account</h3>
                <p className="text-xs text-base-content/70">
                  Permanently remove this venue listing, all booking histories, and review records. This action cannot be reversed.
                </p>
              </div>
            </div>

            <button type="button" onClick={() => setIsDeleteModalOpen(true)} className="btn btn-error btn-outline btn-sm rounded-xl">
              Delete Vendor Account
            </button>
          </div>
        </div>

        {/* Modal for Deleting Account */}
        <DeleteAccountModal isOpen={isDeleteModalOpen} onClose={() => {
            setIsDeleteModalOpen(false);
            setPassword("");
        }} onConfirm={handleDeleteAccount} isLoading={isDeleting} password={password} setPassword={setPassword}/>
      </main>
    </div>);
};
export default VendorProfilePage;
