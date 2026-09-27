import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfile, deleteAccount } from "../lib/api";
import { toast } from "react-hot-toast";
import { Shuffle, KeyRound, AlertTriangle, Heart, MapPin, Sparkles, Wine, Plus, Trash2, Edit3, Eye, } from "lucide-react";
import { useAuth } from "../context/AuthContext";
const avatarPresets = [
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Bella",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Leo",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Zoe",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Maya",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Sam",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Oliver",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Luna",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Alex",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Mia",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Aiden",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Chloe",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Liam",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Sophie",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Lucas",
];
const interestList = [
    "Travel",
    "Music",
    "Movies",
    "Gaming",
    "Fitness",
    "Food",
    "Reading",
    "Photography",
    "Coding",
    "Sports",
    "Cooking",
    "Art",
    "Hiking",
    "Coffee",
    "Tech",
    "Nightlife",
    "Board Games",
    "Fashion",
    "Yoga",
    "Podcasts",
];
const lifestyleOptions = {
    drinking: ["Frequently", "Socially", "Rarely", "Never", "Prefer not to say"],
    smoking: ["Regularly", "Socially", "Trying to quit", "Never", "Prefer not to say"],
    exercise: ["Daily", "Often", "Sometimes", "Rarely", "Never"],
    pets: ["Dog lover", "Cat lover", "Have both", "Allergic", "No pets", "Prefer not to say"],
};
const datingIntentionOptions = [
    "Long-term relationship",
    "Short-term dating",
    "Casual dating",
    "Friendship",
    "Still figuring it out",
];
const promptQuestions = [
    "My ideal Sunday is…",
    "Two truths and a lie…",
    "The quickest way to my heart is…",
    "A perfect first date would be…",
    "Something I’m passionate about…",
    "Together, we could…",
    "A random fact I love…",
    "Best travel story I have…",
];
const ProfilePage = () => {
    const { authUser } = useAuthUser();
    const { logout } = useAuth();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("preview"); // "preview" or "edit"
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [password, setPassword] = useState("");
    const [formData, setFormData] = useState({
        fullName: "",
        age: 24,
        gender: "Man",
        genderCustom: "",
        interestedIn: ["Everyone"],
        avatar: "",
        location: "",
        datingRadius: 25,
        bio: "",
        occupation: "",
        education: "",
        knowingLanguages: [],
        height: "",
        lifestyle: {
            drinking: "Socially",
            smoking: "Never",
            exercise: "Sometimes",
            pets: "Dog lover",
        },
        datingIntention: "Long-term relationship",
        preferredAgeRange: { min: 21, max: 35 },
        preferredDistance: 30,
        interests: [],
        weekendActivity: "",
        personalityType: "Ambivert",
        relationshipValues: [],
        prompts: [],
    });
    useEffect(() => {
        if (authUser) {
            const rawInterests = Array.isArray(authUser.interests) ? authUser.interests : [];
            const normalizedInterests = rawInterests.map((i) => typeof i === "string" ? i : i?.name || "").filter(Boolean);
            const rawPrompts = Array.isArray(authUser.prompts) ? authUser.prompts : [];
            const normalizedPrompts = rawPrompts.map((p) => ({
                question: p.question || "",
                answer: p.answer || "",
            }));
            setFormData({
                fullName: authUser.fullName || authUser.full_name || "",
                age: authUser.age || 24,
                gender: authUser.gender || "Man",
                genderCustom: authUser.genderCustom || "",
                interestedIn: Array.isArray(authUser.interestedIn) ? authUser.interestedIn : ["Everyone"],
                avatar: authUser.avatar || authUser.profilePic || avatarPresets[0],
                location: authUser.location || "",
                datingRadius: authUser.datingRadius || 25,
                bio: authUser.bio || "",
                occupation: authUser.occupation || "",
                education: authUser.education || "",
                knowingLanguages: Array.isArray(authUser.knowingLanguages) ? authUser.knowingLanguages : ["English"],
                height: authUser.height || "",
                lifestyle: authUser.lifestyle && typeof authUser.lifestyle === "object" ? {
                    drinking: authUser.lifestyle.drinking || "Socially",
                    smoking: authUser.lifestyle.smoking || "Never",
                    exercise: authUser.lifestyle.exercise || "Sometimes",
                    pets: authUser.lifestyle.pets || "Dog lover",
                } : {
                    drinking: "Socially",
                    smoking: "Never",
                    exercise: "Sometimes",
                    pets: "Dog lover",
                },
                datingIntention: authUser.datingIntention || "Long-term relationship",
                preferredAgeRange: authUser.preferredAgeRange || { min: 21, max: 35 },
                preferredDistance: authUser.preferredDistance || 30,
                interests: normalizedInterests.length > 0 ? normalizedInterests : ["Music", "Coffee", "Travel"],
                weekendActivity: authUser.weekendActivity || "",
                personalityType: authUser.personalityType || "Ambivert",
                relationshipValues: Array.isArray(authUser.relationshipValues) ? authUser.relationshipValues : ["Honesty", "Communication"],
                prompts: normalizedPrompts,
            });
        }
    }, [authUser]);
    const { mutate: updateProfileMutation, isPending: isUpdating } = useMutation({
        mutationFn: updateProfile,
        onSuccess: (data) => {
            const updatedUser = data?.user || data;
            if (updatedUser) {
                localStorage.setItem("user", JSON.stringify(updatedUser));
                queryClient.setQueryData(["authUser"], { success: true, user: updatedUser });
            }
            queryClient.invalidateQueries({ queryKey: ["authUser"] });
            toast.success("Dating profile updated successfully! 🎉");
            setActiveTab("preview");
        },
        onError: (error) => {
            console.error("Profile update error:", error);
            toast.error(error.response?.data?.message || error.message || "Failed to update profile.");
        },
    });
    const { mutate: deleteAccountMutation, isLoading: isDeleting } = useMutation({
        mutationFn: deleteAccount,
        onSuccess: () => {
            toast.success("Account deleted successfully");
            logout();
            navigate("/login");
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to delete account");
        },
    });
    const handleRandomAvatar = () => {
        const randomSeed = Math.random().toString(36).substring(2, 9);
        const randomAvatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${randomSeed}`;
        setFormData((prev) => ({ ...prev, avatar: randomAvatar }));
        toast.success("Random avatar generated!");
    };
    const toggleInterest = (interest) => {
        setFormData((prev) => {
            const exists = prev.interests.includes(interest);
            if (exists) {
                return { ...prev, interests: prev.interests.filter((i) => i !== interest) };
            }
            else {
                if (prev.interests.length >= 10) {
                    toast.error("Maximum 10 interests allowed.");
                    return prev;
                }
                return { ...prev, interests: [...prev.interests, interest] };
            }
        });
    };
    const handleAddPrompt = () => {
        if (formData.prompts.length >= 3) {
            toast.error("Maximum 3 prompts allowed.");
            return;
        }
        const unusedQuestion = promptQuestions.find((q) => !formData.prompts.some((p) => p.question === q)) ||
            promptQuestions[0];
        setFormData((prev) => ({
            ...prev,
            prompts: [...prev.prompts, { question: unusedQuestion, answer: "" }],
        }));
    };
    const handleRemovePrompt = (idx) => {
        setFormData((prev) => ({
            ...prev,
            prompts: prev.prompts.filter((_, i) => i !== idx),
        }));
    };
    const handlePromptChange = (idx, field, val) => {
        const updated = [...formData.prompts];
        updated[idx][field] = val;
        setFormData((prev) => ({ ...prev, prompts: updated }));
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        updateProfileMutation({
            ...formData,
            profilePic: formData.avatar,
        });
    };
    const handleDeleteAccount = () => {
        if (!password) {
            toast.error("Please enter your password");
            return;
        }
        deleteAccountMutation(password);
    };
    if (!authUser) {
        navigate("/login");
        return null;
    }
    return (<div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Dating Profile</h1>
          <p className="text-sm opacity-70 mt-1">
            Manage your offline meetup profile, lifestyle, and preferences.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-base-200 p-1.5 rounded-2xl border border-base-300">
          <button type="button" onClick={() => setActiveTab("preview")} className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${activeTab === "preview"
            ? "bg-primary text-primary-content shadow"
            : "opacity-70 hover:opacity-100"}`}>
            <Eye className="w-3.5 h-3.5"/>
            View Dating Card
          </button>
          <button type="button" onClick={() => setActiveTab("edit")} className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${activeTab === "edit"
            ? "bg-primary text-primary-content shadow"
            : "opacity-70 hover:opacity-100"}`}>
            <Edit3 className="w-3.5 h-3.5"/>
            Edit Profile
          </button>
        </div>
      </div>

      {/* TAB 1: VIEW DATING CARD PREVIEW */}
      {activeTab === "preview" && (<div className="space-y-6">
          {/* Main Card Hero */}
          <div className="bg-base-100 border border-base-200 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="relative">
                <img src={formData.avatar || authUser.profilePic} alt={formData.fullName} className="w-28 h-28 rounded-full border-4 border-primary shadow-lg object-cover bg-base-200"/>
                <span className="absolute bottom-1 right-1 p-1 bg-primary text-primary-content rounded-full shadow">
                  <Sparkles className="w-3.5 h-3.5"/>
                </span>
              </div>

              <div className="flex-1 text-center sm:text-left space-y-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <h2 className="text-2xl font-black">{formData.fullName}</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/20 text-primary">
                    {formData.age} yrs
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-base-200">
                    {formData.gender}
                  </span>
                </div>

                <p className="text-sm opacity-70 flex items-center justify-center sm:justify-start gap-1">
                  <MapPin className="w-4 h-4 text-primary"/>
                  {formData.location || "City not set"} • Within {formData.datingRadius} km
                </p>

                {/* Dating Intention Badge */}
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-secondary/15 text-secondary border border-secondary/30">
                    <Heart className="w-3 h-3 fill-current"/>
                    Looking for: {formData.datingIntention}
                  </span>
                </div>

                {formData.bio && (<p className="text-sm opacity-90 pt-2 leading-relaxed italic">
                    "{formData.bio}"
                  </p>)}
              </div>
            </div>

            {/* Quick Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-base-200">
              <div className="p-3 rounded-2xl bg-base-200/50">
                <span className="text-[10px] uppercase font-bold opacity-60 block">Occupation</span>
                <span className="text-xs font-semibold truncate block mt-0.5">
                  {formData.occupation || "Not specified"}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-base-200/50">
                <span className="text-[10px] uppercase font-bold opacity-60 block">Education</span>
                <span className="text-xs font-semibold truncate block mt-0.5">
                  {formData.education || "Not specified"}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-base-200/50">
                <span className="text-[10px] uppercase font-bold opacity-60 block">Personality</span>
                <span className="text-xs font-semibold truncate block mt-0.5">
                  {formData.personalityType || "Ambivert"}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-base-200/50">
                <span className="text-[10px] uppercase font-bold opacity-60 block">Height</span>
                <span className="text-xs font-semibold truncate block mt-0.5">
                  {formData.height || "Optional"}
                </span>
              </div>
            </div>
          </div>

          {/* Lifestyle & Values */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Lifestyle */}
            <div className="bg-base-100 border border-base-200 rounded-3xl p-6 shadow-md space-y-4">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Wine className="w-4 h-4 text-primary"/>
                Lifestyle & Habits
              </h3>
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-base-200/40">
                  <span className="opacity-60 block text-[10px]">Drinking</span>
                  <span className="font-semibold">{formData.lifestyle.drinking}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-base-200/40">
                  <span className="opacity-60 block text-[10px]">Smoking</span>
                  <span className="font-semibold">{formData.lifestyle.smoking}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-base-200/40">
                  <span className="opacity-60 block text-[10px]">Exercise</span>
                  <span className="font-semibold">{formData.lifestyle.exercise}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-base-200/40">
                  <span className="opacity-60 block text-[10px]">Pets</span>
                  <span className="font-semibold">{formData.lifestyle.pets}</span>
                </div>
              </div>
            </div>

            {/* Interests & Values */}
            <div className="bg-base-100 border border-base-200 rounded-3xl p-6 shadow-md space-y-4">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-secondary"/>
                Interests & Values
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {formData.interests.map((item) => (<span key={item} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                    {item}
                  </span>))}
              </div>
              {formData.relationshipValues.length > 0 && (<div className="pt-2">
                  <span className="text-[11px] opacity-60 block mb-1">Relationship Values:</span>
                  <div className="flex flex-wrap gap-1">
                    {formData.relationshipValues.map((v) => (<span key={v} className="px-2 py-0.5 rounded-md bg-base-200 text-[11px]">
                        {v}
                      </span>))}
                  </div>
                </div>)}
            </div>
          </div>

          {/* Profile Prompts Display */}
          {formData.prompts.length > 0 && (<div className="space-y-3">
              <h3 className="text-base font-bold">Profile Prompts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.prompts.map((p, idx) => (<div key={idx} className="bg-base-100 border border-base-200 rounded-3xl p-5 shadow-sm space-y-2">
                    <p className="text-xs font-bold text-primary">{p.question}</p>
                    <p className="text-sm opacity-90 leading-relaxed font-serif">"{p.answer}"</p>
                  </div>))}
              </div>
            </div>)}
        </div>)}

      {/* TAB 2: EDIT PROFILE FORM */}
      {activeTab === "edit" && (<form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Selector Section */}
          <div className="bg-base-100 border border-base-200 rounded-3xl p-6 shadow-md space-y-4">
            <h3 className="text-base font-bold">Choose Profile Avatar</h3>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                <img src={formData.avatar} alt="Avatar" className="w-20 h-20 rounded-full border-4 border-primary shadow object-cover bg-base-200"/>
                <button type="button" onClick={handleRandomAvatar} className="absolute bottom-0 right-0 p-1.5 bg-primary text-primary-content rounded-full shadow" title="Random avatar">
                  <Shuffle className="w-3.5 h-3.5"/>
                </button>
              </div>

              <div className="flex-1">
                <span className="text-xs opacity-70 mb-2 block">Quick preset selection:</span>
                <div className="flex flex-wrap gap-2">
                  {avatarPresets.slice(0, 10).map((av, idx) => (<button key={idx} type="button" onClick={() => setFormData((prev) => ({ ...prev, avatar: av }))} className={`w-10 h-10 rounded-full overflow-hidden border-2 transition ${formData.avatar === av
                    ? "border-primary ring-2 ring-primary/40 scale-105"
                    : "border-base-300 opacity-60 hover:opacity-100"}`}>
                      <img src={av} alt="Preset" className="w-full h-full object-cover"/>
                    </button>))}
                </div>
              </div>
            </div>
          </div>

          {/* Basic Details */}
          <div className="bg-base-100 border border-base-200 rounded-3xl p-6 shadow-md space-y-4">
            <h3 className="text-base font-bold">Basic Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold opacity-70 block mb-1">Full Name</label>
                <input type="text" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="input input-bordered w-full text-sm" required/>
              </div>

              <div>
                <label className="text-xs font-semibold opacity-70 block mb-1">Age</label>
                <input type="number" min={18} max={99} value={formData.age} onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })} className="input input-bordered w-full text-sm" required/>
              </div>

              <div>
                <label className="text-xs font-semibold opacity-70 block mb-1">Gender</label>
                <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="select select-bordered w-full text-sm">
                  <option value="Man">Man</option>
                  <option value="Woman">Woman</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer to self-describe">Prefer to self-describe</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold opacity-70 block mb-1">City / Location</label>
                <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="input input-bordered w-full text-sm" required/>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold opacity-70 block mb-1">Bio</label>
              <textarea rows={3} value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} className="textarea textarea-bordered w-full text-sm"/>
            </div>
          </div>

          {/* Dating Intentions & Radius */}
          <div className="bg-base-100 border border-base-200 rounded-3xl p-6 shadow-md space-y-4">
            <h3 className="text-base font-bold">Dating Intentions & Search Radius</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold opacity-70 block mb-1">Dating Intention</label>
                <select value={formData.datingIntention} onChange={(e) => setFormData({ ...formData, datingIntention: e.target.value })} className="select select-bordered w-full text-sm">
                  {datingIntentionOptions.map((opt) => (<option key={opt} value={opt}>
                      {opt}
                    </option>))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold opacity-70">Dating Radius</label>
                  <span className="text-xs font-bold text-primary">{formData.datingRadius} km</span>
                </div>
                <input type="range" min={5} max={100} step={5} value={formData.datingRadius} onChange={(e) => setFormData({ ...formData, datingRadius: Number(e.target.value) })} className="range range-primary range-sm"/>
              </div>
            </div>
          </div>

          {/* Lifestyle Options */}
          <div className="bg-base-100 border border-base-200 rounded-3xl p-6 shadow-md space-y-4">
            <h3 className="text-base font-bold">Lifestyle</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="opacity-70 block mb-1">Drinking</label>
                <select value={formData.lifestyle.drinking} onChange={(e) => setFormData({
                ...formData,
                lifestyle: { ...formData.lifestyle, drinking: e.target.value },
            })} className="select select-bordered select-sm w-full">
                  {lifestyleOptions.drinking.map((d) => (<option key={d} value={d}>
                      {d}
                    </option>))}
                </select>
              </div>
              <div>
                <label className="opacity-70 block mb-1">Smoking</label>
                <select value={formData.lifestyle.smoking} onChange={(e) => setFormData({
                ...formData,
                lifestyle: { ...formData.lifestyle, smoking: e.target.value },
            })} className="select select-bordered select-sm w-full">
                  {lifestyleOptions.smoking.map((s) => (<option key={s} value={s}>
                      {s}
                    </option>))}
                </select>
              </div>
              <div>
                <label className="opacity-70 block mb-1">Exercise</label>
                <select value={formData.lifestyle.exercise} onChange={(e) => setFormData({
                ...formData,
                lifestyle: { ...formData.lifestyle, exercise: e.target.value },
            })} className="select select-bordered select-sm w-full">
                  {lifestyleOptions.exercise.map((ex) => (<option key={ex} value={ex}>
                      {ex}
                    </option>))}
                </select>
              </div>
              <div>
                <label className="opacity-70 block mb-1">Pets</label>
                <select value={formData.lifestyle.pets} onChange={(e) => setFormData({
                ...formData,
                lifestyle: { ...formData.lifestyle, pets: e.target.value },
            })} className="select select-bordered select-sm w-full">
                  {lifestyleOptions.pets.map((p) => (<option key={p} value={p}>
                      {p}
                    </option>))}
                </select>
              </div>
            </div>
          </div>

          {/* Interests Picker */}
          <div className="bg-base-100 border border-base-200 rounded-3xl p-6 shadow-md space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold">Interests ({formData.interests.length} selected)</h3>
              <span className="text-xs opacity-60">Pick 5 to 10 interests</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {interestList.map((interest) => {
                const isSelected = formData.interests.includes(interest);
                return (<button key={interest} type="button" onClick={() => toggleInterest(interest)} className={`px-3 py-1.5 rounded-xl text-xs border transition ${isSelected
                        ? "bg-primary text-primary-content font-bold border-primary"
                        : "bg-base-200 border-base-300 opacity-70 hover:opacity-100"}`}>
                    {interest}
                  </button>);
            })}
            </div>
          </div>

          {/* Profile Prompts Editing */}
          <div className="bg-base-100 border border-base-200 rounded-3xl p-6 shadow-md space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold">Profile Prompts</h3>
              {formData.prompts.length < 3 && (<button type="button" onClick={handleAddPrompt} className="btn btn-outline btn-primary btn-xs">
                  <Plus className="w-3 h-3"/> Add Prompt
                </button>)}
            </div>

            <div className="space-y-3">
              {formData.prompts.map((item, idx) => (<div key={idx} className="p-4 rounded-2xl bg-base-200/50 border border-base-300 space-y-2">
                  <div className="flex justify-between items-center">
                    <select value={item.question} onChange={(e) => handlePromptChange(idx, "question", e.target.value)} className="select select-bordered select-sm w-10/12 text-xs font-bold">
                      {promptQuestions.map((q) => (<option key={q} value={q}>
                          {q}
                        </option>))}
                    </select>

                    <button type="button" onClick={() => handleRemovePrompt(idx)} className="btn btn-ghost btn-xs text-error">
                      <Trash2 className="w-3.5 h-3.5"/>
                    </button>
                  </div>
                  <textarea rows={2} value={item.answer} onChange={(e) => handlePromptChange(idx, "answer", e.target.value)} className="textarea textarea-bordered w-full text-xs" placeholder="Your answer..."/>
                </div>))}
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-between pt-4">
            <button type="button" onClick={() => navigate("/change-password")} className="btn btn-ghost gap-2 text-xs">
              <KeyRound size={16}/>
              Change Password
            </button>

            <button type="submit" disabled={isUpdating} className="btn btn-primary px-8 rounded-xl font-bold">
              {isUpdating ? "Saving Changes..." : "Save All Changes"}
            </button>
          </div>

          {/* Danger Zone */}
          <div className="mt-12 border-t border-error/20 pt-6">
            <h2 className="text-xl font-semibold text-error mb-4">Danger Zone</h2>
            <button type="button" onClick={() => setIsDeleteModalOpen(true)} className="btn btn-error btn-outline">
              <AlertTriangle className="size-4 mr-2"/>
              Delete Account
            </button>
          </div>
        </form>)}

      {/* Delete Account Modal */}
      {isDeleteModalOpen && (<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-3xl p-6 max-w-md w-full border border-base-300 shadow-2xl">
            <h3 className="font-bold text-lg flex items-center text-error mb-2">
              <AlertTriangle className="mr-2"/>
              Delete Account
            </h3>
            <p className="text-xs opacity-70 mb-4">
              This action cannot be undone. All your profile data and meetup history will be removed.
            </p>
            <input type="password" placeholder="Confirm your password" className="input input-bordered w-full text-sm mb-4" value={password} onChange={(e) => setPassword(e.target.value)}/>
            <div className="flex justify-end gap-2">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-error btn-sm" onClick={handleDeleteAccount} disabled={isDeleting || !password}>
                {isDeleting ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>)}
    </div>);
};
export default ProfilePage;
