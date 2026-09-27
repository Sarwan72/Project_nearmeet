import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import useLogout from "../hooks/useLogout";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { completeOnboarding } from "../lib/api";
import { User, Sparkles, ArrowRight, ArrowLeft, Check, CheckCircle2, Briefcase, GraduationCap, Wine, Cigarette, Dumbbell, Dog, Plus, Trash2, Shuffle, ShieldCheck, Store, LogOut, } from "lucide-react";
import LocationField from "../components/LocationField";
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
const genderOptions = [
    { id: "Man", label: "Man" },
    { id: "Woman", label: "Woman" },
    { id: "Non-binary", label: "Non-binary" },
    { id: "Prefer to self-describe", label: "Self-describe" },
];
const interestedInOptions = [
    { id: "Women", label: "Women" },
    { id: "Men", label: "Men" },
    { id: "Everyone", label: "Everyone" },
];
const datingIntentionOptions = [
    {
        id: "Long-term relationship",
        title: "Long-term relationship",
        desc: "Looking for a lasting, meaningful bond",
    },
    {
        id: "Short-term dating",
        title: "Short-term dating",
        desc: "Open to dates, romance and see where it goes",
    },
    {
        id: "Casual dating",
        title: "Casual dating",
        desc: "Fun, no-pressure offline meetup dates",
    },
    {
        id: "Friendship",
        title: "Friendship",
        desc: "Meet awesome new friends nearby",
    },
    {
        id: "Still figuring it out",
        title: "Still figuring it out",
        desc: "Open to chemistry and shared experiences",
    },
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
const relationshipValueList = [
    "Honesty",
    "Communication",
    "Loyalty",
    "Empathy",
    "Humor",
    "Independence",
    "Family",
    "Ambition",
    "Kindness",
    "Curiosity",
];
const OnboardingPage = () => {
    const { authUser } = useAuthUser();
    const { logoutMutation } = useLogout();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const cleanInitialAvatar = authUser?.avatar && !authUser.avatar.includes("iran.liara.run")
        ? authUser.avatar
        : avatarPresets[0];
    const [formState, setFormState] = useState({
        fullName: authUser?.fullName || "",
        dateOfBirth: "",
        age: authUser?.age || 24,
        gender: authUser?.gender || "Man",
        genderCustom: "",
        interestedIn: authUser?.interestedIn || ["Everyone"],
        avatar: cleanInitialAvatar,
        // 2. Location
        location: authUser?.location || "",
        hasLocationPermission: false,
        datingRadius: authUser?.datingRadius || 25,
        // 3. About Me & Lifestyle
        bio: authUser?.bio || "",
        occupation: authUser?.occupation || "",
        education: authUser?.education || "",
        knowingLanguages: authUser?.knowingLanguages || ["English"],
        height: authUser?.height || "",
        lifestyle: authUser?.lifestyle || {
            drinking: "Socially",
            smoking: "Never",
            exercise: "Sometimes",
            pets: "Dog lover",
        },
        // 4. Dating Preferences
        datingIntention: authUser?.datingIntention || "Long-term relationship",
        preferredAgeRange: authUser?.preferredAgeRange || { min: 21, max: 35 },
        preferredDistance: authUser?.preferredDistance || 30,
        genderPreference: authUser?.genderPreference || ["Everyone"],
        // 5. Interests & Personality
        interests: authUser?.interests || ["Music", "Coffee", "Travel", "Movies", "Food"],
        weekendActivity: authUser?.weekendActivity || "Exploring a cozy cafe and listening to live music",
        personalityType: authUser?.personalityType || "Ambivert",
        relationshipValues: authUser?.relationshipValues || ["Honesty", "Communication", "Humor"],
        // 6. Profile Prompts
        prompts: authUser?.prompts?.length > 0 ? authUser.prompts : [
            {
                question: "My ideal Sunday is…",
                answer: "Grabbing a warm cappuccino at a local cafe and relaxing with friends.",
            },
        ],
    });
    const { mutate: onboardingMutation, isPending } = useMutation({
        mutationFn: completeOnboarding,
        onSuccess: (data) => {
            toast.success("Profile setup complete! Welcome to NearMeet! 🎉");
            const normalizedUser = data?.user
                ? {
                    ...data.user,
                    isOnboarded: true,
                    is_onboarded: true,
                    fullName: data.user.fullName || data.user.full_name || formState.fullName,
                }
                : null;
            if (normalizedUser) {
                localStorage.setItem("user", JSON.stringify(normalizedUser));
                queryClient.setQueryData(["authUser"], { success: true, user: normalizedUser });
            }
            queryClient.invalidateQueries({ queryKey: ["authUser"] });
            navigate("/", { replace: true });
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Onboarding failed. Please review fields.");
        },
    });
    // Calculate age from DOB if entered
    const handleDobChange = (e) => {
        const dob = e.target.value;
        setFormState((prev) => {
            const birth = new Date(dob);
            const diff = Date.now() - birth.getTime();
            const ageDate = new Date(diff);
            const calculatedAge = Math.abs(ageDate.getUTCFullYear() - 1970);
            return {
                ...prev,
                dateOfBirth: dob,
                age: calculatedAge >= 18 ? calculatedAge : prev.age,
            };
        });
    };
    const toggleInterest = (interest) => {
        setFormState((prev) => {
            const exists = prev.interests.includes(interest);
            if (exists) {
                return {
                    ...prev,
                    interests: prev.interests.filter((i) => i !== interest),
                };
            }
            else {
                if (prev.interests.length >= 10) {
                    toast.error("You can choose up to 10 interests.");
                    return prev;
                }
                return {
                    ...prev,
                    interests: [...prev.interests, interest],
                };
            }
        });
    };
    const toggleLanguage = (lang) => {
        setFormState((prev) => {
            const exists = prev.knowingLanguages.includes(lang);
            return {
                ...prev,
                knowingLanguages: exists
                    ? prev.knowingLanguages.filter((l) => l !== lang)
                    : [...prev.knowingLanguages, lang],
            };
        });
    };
    const toggleRelationshipValue = (val) => {
        setFormState((prev) => {
            const exists = prev.relationshipValues.includes(val);
            return {
                ...prev,
                relationshipValues: exists
                    ? prev.relationshipValues.filter((v) => v !== val)
                    : [...prev.relationshipValues, val],
            };
        });
    };
    const handleRandomizeAvatar = () => {
        const randomSeed = Math.random().toString(36).substring(2, 9);
        const newAvatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${randomSeed}`;
        setFormState((prev) => ({ ...prev, avatar: newAvatar }));
        toast.success("New avatar generated!");
    };
    const handleExitToLogin = () => {
        const confirmExit = window.confirm("Do you want to exit onboarding and return to the Login page?");
        if (!confirmExit)
            return;
        logoutMutation();
    };
    const handleSwitchToVendor = () => {
        const confirmSwitch = window.confirm("Are you a venue partner? We will log you out of this user session and take you to the Venue Partner Portal.");
        if (!confirmSwitch)
            return;
        logoutMutation();
        navigate("/vendor-login");
    };
    const handleAddPrompt = () => {
        if (formState.prompts.length >= 3) {
            toast.error("Maximum 3 prompts allowed.");
            return;
        }
        const unusedQuestion = promptQuestions.find((q) => !formState.prompts.some((p) => p.question === q)) || promptQuestions[0];
        setFormState((prev) => ({
            ...prev,
            prompts: [...prev.prompts, { question: unusedQuestion, answer: "" }],
        }));
    };
    const handleUpdatePrompt = (index, field, value) => {
        const updated = [...formState.prompts];
        updated[index][field] = value;
        setFormState((prev) => ({ ...prev, prompts: updated }));
    };
    const handleRemovePrompt = (index) => {
        if (formState.prompts.length <= 1) {
            toast.error("Please keep at least 1 prompt answered.");
            return;
        }
        setFormState((prev) => ({
            ...prev,
            prompts: prev.prompts.filter((_, i) => i !== index),
        }));
    };
    // Validation before advancing
    const validateStep = (step) => {
        if (step === 1) {
            if (!formState.fullName.trim()) {
                toast.error("Please enter your name.");
                return false;
            }
            if (!formState.age || Number(formState.age) < 18) {
                toast.error("You must be at least 18 years old.");
                return false;
            }
            if (!formState.avatar) {
                toast.error("Please select an avatar.");
                return false;
            }
        }
        else if (step === 2) {
            if (!formState.location.trim()) {
                toast.error("Please select your city / area.");
                return false;
            }
        }
        else if (step === 3) {
            if (!formState.bio.trim()) {
                toast.error("Please write a short bio to introduce yourself.");
                return false;
            }
            if (formState.knowingLanguages.length === 0) {
                toast.error("Please select at least one language.");
                return false;
            }
        }
        else if (step === 4) {
            if (!formState.datingIntention) {
                toast.error("Please choose what you are looking for.");
                return false;
            }
        }
        else if (step === 5) {
            if (formState.interests.length < 5) {
                toast.error(`Please select at least 5 interests (${formState.interests.length}/5 selected).`);
                return false;
            }
        }
        else if (step === 6) {
            const emptyPrompt = formState.prompts.some((p) => !p.answer.trim());
            if (emptyPrompt) {
                toast.error("Please provide an answer to your profile prompt(s).");
                return false;
            }
        }
        return true;
    };
    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep((prev) => Math.min(6, prev + 1));
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };
    const handleBack = () => {
        setCurrentStep((prev) => Math.max(1, prev - 1));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateStep(currentStep))
            return;
        onboardingMutation({
            ...formState,
            profilePic: formState.avatar,
        });
    };
    return (<div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 py-8 px-4 sm:px-6 flex flex-col justify-between relative overflow-hidden">
      {/* Decorative Glows */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl pointer-events-none"/>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"/>

      <div className="w-full max-w-3xl mx-auto my-auto">
        {/* Top Navigation Bar: Exit to Login & Switch Role */}
        <div className="flex items-center justify-between mb-5 px-1">
          <button type="button" onClick={handleExitToLogin} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-gray-300 hover:text-white transition shadow-sm">
            <LogOut className="w-3.5 h-3.5 text-pink-400"/>
            <span>← Exit / Back to Login</span>
          </button>

          <button type="button" onClick={handleSwitchToVendor} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-xs font-semibold text-amber-300 hover:text-amber-200 transition shadow-sm">
            <Store className="w-3.5 h-3.5"/>
            <span>Venue Partner Portal →</span>
          </button>
        </div>

        {/* Step Progress Header */}
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5"/>
            Step {currentStep} of 6
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {currentStep === 1 && "Basic Information & Avatar"}
            {currentStep === 2 && "Location & Dating Radius"}
            {currentStep === 3 && "About Me & Lifestyle"}
            {currentStep === 4 && "Dating Intentions"}
            {currentStep === 5 && "Interests & Personality"}
            {currentStep === 6 && "Profile Prompts"}
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-md mx-auto">
            {currentStep === 1 && "No photos needed! Pick a fun avatar. Matching is based on personality."}
            {currentStep === 2 && "Find partners near you without revealing your exact private address."}
            {currentStep === 3 && "Share your daily rhythm, education, and lifestyle vibes."}
            {currentStep === 4 && "Set clear intentions so venues pair you with like-minded dates."}
            {currentStep === 5 && "Select 5–10 interests to discover shared conversation topics."}
            {currentStep === 6 && "Answer thought-provoking prompts to spark effortless first chats."}
          </p>

          {/* Animated Progress Bar */}
          <div className="w-full max-w-md mx-auto h-2 bg-white/10 rounded-full mt-4 overflow-hidden p-0.5">
            <div className="h-full bg-gradient-to-r from-pink-500 to-purple-600 rounded-full transition-all duration-300" style={{ width: `${(currentStep / 6) * 100}%` }}/>
          </div>
        </div>

        {/* Wizard Main Card */}
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl relative">
          <form onSubmit={handleSubmit}>
            {/* STEP 1: BASIC INFORMATION & AVATAR */}
            {currentStep === 1 && (<div className="space-y-6">
                {/* Avatar Showcase & Selector */}
                <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                  <div className="relative mb-3">
                    <img src={formState.avatar} alt="Selected Avatar" onError={(e) => {
                e.target.src = avatarPresets[0];
            }} className="w-24 h-24 rounded-full border-4 border-pink-500 shadow-xl bg-slate-800 object-cover"/>
                    <button type="button" onClick={handleRandomizeAvatar} title="Randomize avatar" className="absolute bottom-0 right-0 p-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 text-white rounded-full shadow-lg transition">
                      <Shuffle className="w-3.5 h-3.5"/>
                    </button>
                  </div>
                  <p className="text-xs font-semibold text-gray-300 mb-2.5">
                    Pick your profile avatar (no photo upload needed)
                  </p>

                  <div className="flex flex-wrap gap-2.5 justify-center max-h-32 overflow-y-auto p-1">
                    {avatarPresets.map((avUrl, idx) => (<button key={idx} type="button" onClick={() => setFormState((prev) => ({ ...prev, avatar: avUrl }))} className={`w-11 h-11 rounded-full overflow-hidden border-2 transition-transform hover:scale-105 ${formState.avatar === avUrl
                    ? "border-pink-500 ring-2 ring-pink-500/40 scale-110"
                    : "border-white/20 opacity-70 hover:opacity-100"}`}>
                        <img src={avUrl} alt={`Avatar ${idx + 1}`} onError={(e) => {
                    e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${idx}`;
                }} className="w-full h-full object-cover"/>
                      </button>))}
                  </div>
                </div>

                {/* Name and Age */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                      First Name / Display Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                      <input type="text" value={formState.fullName} onChange={(e) => setFormState({ ...formState, fullName: e.target.value })} placeholder="e.g. Maya Sharma" className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50" required/>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                      Age (18+) *
                    </label>
                    <input type="number" min={18} max={99} value={formState.age} onChange={(e) => setFormState({ ...formState, age: Number(e.target.value) })} placeholder="e.g. 24" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50" required/>
                  </div>
                </div>

                {/* Gender Options */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    I am a *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {genderOptions.map((g) => {
                const isSelected = formState.gender === g.id;
                return (<button key={g.id} type="button" onClick={() => setFormState((prev) => ({ ...prev, gender: g.id }))} className={`py-2.5 px-3 rounded-xl text-xs font-medium border transition-all ${isSelected
                        ? "bg-pink-500/20 border-pink-400 text-pink-300 shadow-md ring-1 ring-pink-400/40 font-bold"
                        : "bg-white/5 border-white/10 text-gray-400 hover:text-white"}`}>
                          {g.label}
                        </button>);
            })}
                  </div>

                  {formState.gender === "Prefer to self-describe" && (<input type="text" placeholder="Describe your gender identity" value={formState.genderCustom} onChange={(e) => setFormState({ ...formState, genderCustom: e.target.value })} className="w-full mt-3 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm"/>)}
                </div>

                {/* Interested In */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Interested In meeting *
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {interestedInOptions.map((opt) => {
                const isSelected = formState.interestedIn?.includes(opt.id);
                return (<button key={opt.id} type="button" onClick={() => setFormState((prev) => ({ ...prev, interestedIn: [opt.id] }))} className={`py-2.5 px-3 rounded-xl text-xs font-medium border transition-all ${isSelected
                        ? "bg-purple-500/20 border-purple-400 text-purple-300 shadow-md ring-1 ring-purple-400/40 font-bold"
                        : "bg-white/5 border-white/10 text-gray-400 hover:text-white"}`}>
                          {opt.label}
                        </button>);
            })}
                  </div>
                </div>
              </div>)}

            {/* STEP 2: LOCATION & DATING RADIUS */}
            {currentStep === 2 && (<div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Your City / Area *
                  </label>
                  <LocationField formState={formState} setFormState={setFormState}/>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-2">
                    <ShieldCheck className="w-4 h-4"/>
                    <span>Your exact address is never stored or shown. Only city/neighborhood.</span>
                  </div>
                </div>

                {/* Dating Radius */}
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Preferred Dating Radius
                    </label>
                    <span className="text-sm font-bold text-pink-400 px-3 py-1 bg-pink-500/10 rounded-full border border-pink-500/20">
                      Within {formState.datingRadius} km
                    </span>
                  </div>

                  <input type="range" min={5} max={100} step={5} value={formState.datingRadius} onChange={(e) => setFormState({ ...formState, datingRadius: Number(e.target.value) })} className="w-full accent-pink-500 cursor-pointer"/>
                  <div className="flex justify-between text-[11px] text-gray-400 mt-2">
                    <span>5 km (Walkable / Cozy)</span>
                    <span>50 km (Across Metro)</span>
                    <span>100 km (Greater Area)</span>
                  </div>
                </div>
              </div>)}

            {/* STEP 3: ABOUT ME & LIFESTYLE */}
            {currentStep === 3 && (<div className="space-y-6">
                {/* Short Bio */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      About Me (Bio) *
                    </label>
                    <span className="text-xs text-gray-400">{formState.bio.length} / 250</span>
                  </div>
                  <textarea rows={3} maxLength={250} value={formState.bio} onChange={(e) => setFormState({ ...formState, bio: e.target.value })} placeholder="Coffee lover, UX designer, and weekend board gamer. Looking to connect over good conversations..." className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50 resize-none" required/>
                </div>

                {/* Occupation & Education */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                      Occupation
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                      <input type="text" value={formState.occupation} onChange={(e) => setFormState({ ...formState, occupation: e.target.value })} placeholder="e.g. Software Engineer" className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50"/>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                      Education
                    </label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                      <input type="text" value={formState.education} onChange={(e) => setFormState({ ...formState, education: e.target.value })} placeholder="e.g. Masters in Design" className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50"/>
                    </div>
                  </div>
                </div>

                {/* Languages Known */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Languages You Speak *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["English", "Hindi", "Spanish", "French", "German", "Japanese", "Punjabi", "Bengali"].map((lang) => {
                const isSelected = formState.knowingLanguages.includes(lang);
                return (<button key={lang} type="button" onClick={() => toggleLanguage(lang)} className={`px-3 py-1.5 rounded-lg text-xs border transition ${isSelected
                        ? "bg-pink-500/20 border-pink-400 text-pink-300 font-semibold"
                        : "bg-white/5 border-white/10 text-gray-400 hover:text-white"}`}>
                            {lang}
                          </button>);
            })}
                  </div>
                </div>

                {/* Lifestyle Chips */}
                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Lifestyle Preferences
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Drinking */}
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
                      <div className="flex items-center gap-2 mb-2 text-xs font-medium text-gray-300">
                        <Wine className="w-3.5 h-3.5 text-pink-400"/>
                        <span>Drinking</span>
                      </div>
                      <select value={formState.lifestyle.drinking} onChange={(e) => setFormState({
                ...formState,
                lifestyle: { ...formState.lifestyle, drinking: e.target.value },
            })} className="w-full py-2 px-3 bg-slate-800 border border-white/10 rounded-lg text-xs text-white">
                        {lifestyleOptions.drinking.map((opt) => (<option key={opt} value={opt}>
                            {opt}
                          </option>))}
                      </select>
                    </div>

                    {/* Smoking */}
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
                      <div className="flex items-center gap-2 mb-2 text-xs font-medium text-gray-300">
                        <Cigarette className="w-3.5 h-3.5 text-purple-400"/>
                        <span>Smoking</span>
                      </div>
                      <select value={formState.lifestyle.smoking} onChange={(e) => setFormState({
                ...formState,
                lifestyle: { ...formState.lifestyle, smoking: e.target.value },
            })} className="w-full py-2 px-3 bg-slate-800 border border-white/10 rounded-lg text-xs text-white">
                        {lifestyleOptions.smoking.map((opt) => (<option key={opt} value={opt}>
                            {opt}
                          </option>))}
                      </select>
                    </div>

                    {/* Exercise */}
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
                      <div className="flex items-center gap-2 mb-2 text-xs font-medium text-gray-300">
                        <Dumbbell className="w-3.5 h-3.5 text-emerald-400"/>
                        <span>Exercise</span>
                      </div>
                      <select value={formState.lifestyle.exercise} onChange={(e) => setFormState({
                ...formState,
                lifestyle: { ...formState.lifestyle, exercise: e.target.value },
            })} className="w-full py-2 px-3 bg-slate-800 border border-white/10 rounded-lg text-xs text-white">
                        {lifestyleOptions.exercise.map((opt) => (<option key={opt} value={opt}>
                            {opt}
                          </option>))}
                      </select>
                    </div>

                    {/* Pets */}
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
                      <div className="flex items-center gap-2 mb-2 text-xs font-medium text-gray-300">
                        <Dog className="w-3.5 h-3.5 text-amber-400"/>
                        <span>Pets</span>
                      </div>
                      <select value={formState.lifestyle.pets} onChange={(e) => setFormState({
                ...formState,
                lifestyle: { ...formState.lifestyle, pets: e.target.value },
            })} className="w-full py-2 px-3 bg-slate-800 border border-white/10 rounded-lg text-xs text-white">
                        {lifestyleOptions.pets.map((opt) => (<option key={opt} value={opt}>
                            {opt}
                          </option>))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>)}

            {/* STEP 4: DATING PREFERENCES */}
            {currentStep === 4 && (<div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2.5">
                    What are you looking for? *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {datingIntentionOptions.map((intent) => {
                const isSelected = formState.datingIntention === intent.id;
                return (<button key={intent.id} type="button" onClick={() => setFormState((prev) => ({ ...prev, datingIntention: intent.id }))} className={`p-3.5 rounded-2xl border text-left transition-all ${isSelected
                        ? "bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-400 text-white shadow-lg ring-1 ring-pink-400/40"
                        : "bg-white/[0.03] border-white/10 text-gray-400 hover:bg-white/[0.06] hover:text-white"}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold text-white">{intent.title}</span>
                            {isSelected && <Check className="w-4 h-4 text-pink-400 stroke-[3]"/>}
                          </div>
                          <p className="text-xs text-gray-400">{intent.desc}</p>
                        </button>);
            })}
                  </div>
                </div>

                {/* Preferred Age Range */}
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Preferred Age Range
                    </label>
                    <span className="text-xs text-purple-400 font-bold px-3 py-1 bg-purple-500/10 rounded-full border border-purple-500/20">
                      {formState.preferredAgeRange.min} - {formState.preferredAgeRange.max} years old
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <span className="text-[11px] text-gray-400 mb-1 block">Min Age</span>
                      <input type="number" min={18} max={formState.preferredAgeRange.max} value={formState.preferredAgeRange.min} onChange={(e) => setFormState({
                ...formState,
                preferredAgeRange: {
                    ...formState.preferredAgeRange,
                    min: Number(e.target.value),
                },
            })} className="w-full py-2 px-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white"/>
                    </div>
                    <span className="text-gray-500 font-bold pt-4">to</span>
                    <div className="flex-1">
                      <span className="text-[11px] text-gray-400 mb-1 block">Max Age</span>
                      <input type="number" min={formState.preferredAgeRange.min} max={70} value={formState.preferredAgeRange.max} onChange={(e) => setFormState({
                ...formState,
                preferredAgeRange: {
                    ...formState.preferredAgeRange,
                    max: Number(e.target.value),
                },
            })} className="w-full py-2 px-3 bg-white/5 border border-white/10 rounded-lg text-sm text-white"/>
                    </div>
                  </div>
                </div>
              </div>)}

            {/* STEP 5: INTERESTS & PERSONALITY */}
            {currentStep === 5 && (<div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Pick 5 to 10 Interests *
                    </label>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${formState.interests.length >= 5 && formState.interests.length <= 10
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                : "bg-pink-500/20 text-pink-300 border-pink-500/30"}`}>
                      {formState.interests.length} / 10 selected
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto p-1 pr-2">
                    {interestList.map((interest) => {
                const isSelected = formState.interests.includes(interest);
                return (<button key={interest} type="button" onClick={() => toggleInterest(interest)} className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all ${isSelected
                        ? "bg-pink-500 text-white font-bold border-pink-400 shadow-md shadow-pink-500/20"
                        : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"}`}>
                          {interest}
                        </button>);
            })}
                  </div>
                </div>

                {/* Weekend Activity */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                    Favorite Weekend Activity
                  </label>
                  <input type="text" value={formState.weekendActivity} onChange={(e) => setFormState({ ...formState, weekendActivity: e.target.value })} placeholder="e.g. Trying new matcha lattes, bouldering, or cozy movie nights" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50"/>
                </div>

                {/* Personality & Relationship Values */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                      Personality Type
                    </label>
                    <select value={formState.personalityType} onChange={(e) => setFormState({ ...formState, personalityType: e.target.value })} className="w-full py-3 px-4 bg-slate-800 border border-white/10 rounded-xl text-sm text-white">
                      <option value="Introvert">Introvert</option>
                      <option value="Extrovert">Extrovert</option>
                      <option value="Ambivert">Ambivert</option>
                      <option value="Creative Dreamer">Creative Dreamer</option>
                      <option value="Analytical Thinker">Analytical Thinker</option>
                      <option value="Adventurous Spontaneous">Adventurous & Spontaneous</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                      Top Relationship Values
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {relationshipValueList.slice(0, 6).map((val) => {
                const isSelected = formState.relationshipValues.includes(val);
                return (<button key={val} type="button" onClick={() => toggleRelationshipValue(val)} className={`px-2.5 py-1 rounded-lg text-[11px] border transition ${isSelected
                        ? "bg-purple-500/20 border-purple-400 text-purple-300 font-semibold"
                        : "bg-white/5 border-white/10 text-gray-400 hover:text-white"}`}>
                            {val}
                          </button>);
            })}
                    </div>
                  </div>
                </div>
              </div>)}

            {/* STEP 6: PROFILE PROMPTS */}
            {currentStep === 6 && (<div className="space-y-6">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Answer Profile Prompts (1 to 3) *
                  </label>
                  {formState.prompts.length < 3 && (<button type="button" onClick={handleAddPrompt} className="text-xs text-pink-400 hover:text-pink-300 flex items-center gap-1 font-semibold">
                      <Plus className="w-3.5 h-3.5"/>
                      Add Another Prompt
                    </button>)}
                </div>

                <div className="space-y-4">
                  {formState.prompts.map((item, idx) => (<div key={idx} className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3 relative group">
                      <div className="flex items-center justify-between">
                        <select value={item.question} onChange={(e) => handleUpdatePrompt(idx, "question", e.target.value)} className="bg-slate-800 border border-white/15 rounded-xl py-2 px-3 text-xs text-pink-300 font-semibold w-11/12 focus:outline-none">
                          {promptQuestions.map((q) => (<option key={q} value={q}>
                              {q}
                            </option>))}
                        </select>

                        {formState.prompts.length > 1 && (<button type="button" onClick={() => handleRemovePrompt(idx)} className="text-gray-500 hover:text-red-400 p-1 transition" title="Remove prompt">
                            <Trash2 className="w-4 h-4"/>
                          </button>)}
                      </div>

                      <textarea rows={2} value={item.answer} onChange={(e) => handleUpdatePrompt(idx, "answer", e.target.value)} placeholder="Type your witty, genuine answer here..." className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50 resize-none" required/>
                    </div>))}
                </div>
              </div>)}

            {/* Navigation Footer */}
            <div className="flex items-center gap-3 pt-6 mt-6 border-t border-white/10">
              {currentStep === 1 ? (<button type="button" onClick={handleExitToLogin} disabled={isPending} className="w-1/3 py-3.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-semibold text-sm transition flex items-center justify-center gap-1.5">
                  <ArrowLeft className="w-4 h-4"/>
                  Exit to Login
                </button>) : (<button type="button" onClick={handleBack} disabled={isPending} className="w-1/3 py-3.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-semibold text-sm transition flex items-center justify-center gap-1.5">
                  <ArrowLeft className="w-4 h-4"/>
                  Back
                </button>)}

              {currentStep < 6 ? (<button type="button" onClick={handleNext} className="w-2/3 py-3.5 px-6 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-pink-500/25 transition flex items-center justify-center gap-2">
                  Next Step
                  <ArrowRight className="w-4 h-4"/>
                </button>) : (<button type="submit" disabled={isPending} className="w-2/3 py-3.5 px-6 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-pink-500/30 transition flex items-center justify-center gap-2 disabled:opacity-50">
                  {isPending ? (<>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                      Saving Your Profile...
                    </>) : (<>
                      <CheckCircle2 className="w-5 h-5"/>
                      Complete Profile & Meet People
                    </>)}
                </button>)}
            </div>
          </form>
        </div>
      </div>
    </div>);
};
export default OnboardingPage;
