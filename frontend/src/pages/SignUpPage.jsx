import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff, Heart, Coffee, ShieldCheck, Compass, ArrowRight, Store, } from "lucide-react";
import useSignUp from "../hooks/useSignUp";
const signupHighlights = [
    {
        icon: Coffee,
        title: "1. Create Your Profile",
        desc: "Set up your avatar, dating preferences, lifestyle, and prompts.",
    },
    {
        icon: Compass,
        title: "2. Pick Your Favorite Spots",
        desc: "Browse local partner cafes, lounges, and clubs near you.",
    },
    {
        icon: Heart,
        title: "3. Venues Pair You for Meetups",
        desc: "Venues match compatible guests based on interests for in-person table reservations.",
    },
    {
        icon: ShieldCheck,
        title: "4. Meet Safely in the Real World",
        desc: "Verified public hospitality venues ensure respectful and delightful offline dates.",
    },
];
const SignUpPage = () => {
    const navigate = useNavigate();
    const [signupData, setSignupData] = useState({
        fullName: "",
        email: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(true);
    const { isPending, error, signupMutation } = useSignUp();
    useEffect(() => {
        try {
            const stored = localStorage.getItem("user");
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed?._id || parsed?.email) {
                    navigate(parsed.isOnboarded ? "/" : "/onboarding", { replace: true });
                }
            }
        }
        catch { }
    }, [navigate]);
    const handleSignup = (e) => {
        e.preventDefault();
        signupMutation(signupData);
    };
    return (<div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Decorative Glows */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"/>
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"/>

      <div className="w-full max-w-5xl bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row relative z-10">
        {/* Left Side: Brand & How It Works */}
        <div className="lg:w-1/2 p-8 sm:p-12 bg-gradient-to-br from-purple-900/40 via-slate-900/60 to-black/60 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col justify-between relative">
          <div>
            {/* Top Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-2.5 rounded-2xl shadow-lg shadow-pink-500/20">
                <img className="w-8 h-8 rounded-full object-cover" src="/logo.png" alt="NearMeet Logo"/>
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                  NearMeet{" "}
                  <span className="text-pink-400 text-xs font-semibold uppercase px-2 py-0.5 rounded-full bg-pink-500/10 border border-pink-500/20">
                    Join Now
                  </span>
                </span>
                <p className="text-xs text-gray-400">Offline Meeting & Dating Platform</p>
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-4">
              Real dates at real places. No endless small talk.
            </h1>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-8">
              Create your account to get curated by top local cafes and venues for reserved table
              meetups with verified like-minded people.
            </p>

            {/* Steps / Highlights */}
            <div className="space-y-4">
              {signupHighlights.map((item, idx) => {
            const Icon = item.icon;
            return (<div key={idx} className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                    <div className="p-2 rounded-xl bg-pink-500/15 text-pink-400 border border-pink-500/20 shrink-0">
                      <Icon className="w-4 h-4"/>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                      <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>);
        })}
            </div>
          </div>

          {/* Bottom Link */}
          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
            <span>Own a hospitality venue?</span>
            <Link to="/vendor-signup" className="text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1">
              <Store className="w-3.5 h-3.5"/>
              Register as Venue Partner
            </Link>
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">
            {/* Role Selector Tabs */}
            <div className="grid grid-cols-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl mb-6">
              <button type="button" className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-pink-500/20">
                <Heart className="w-3.5 h-3.5"/>
                <span>Dating & Social User</span>
              </button>
              <button type="button" onClick={() => navigate("/vendor-signup")} className="py-2.5 px-3 rounded-xl text-gray-400 hover:text-white font-medium text-xs flex items-center justify-center gap-1.5 hover:bg-white/5 transition">
                <Store className="w-3.5 h-3.5 text-amber-400"/>
                <span>Venue Partner Portal</span>
              </button>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white tracking-tight">Create Your Account</h2>
              <p className="text-sm text-gray-400 mt-1">
                Start your journey towards genuine in-person connections.
              </p>
            </div>

            {/* Error Banner */}
            {error && (<div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-sm">
                {error.response?.data?.message || "Signup failed. Please try again."}
              </div>)}

            <form onSubmit={handleSignup} className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Your Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                  <input type="text" placeholder="e.g. Alex Morgan" value={signupData.fullName} onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })} className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-400 transition" required/>
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                  <input type="email" placeholder="you@example.com" value={signupData.email} onChange={(e) => setSignupData({ ...signupData, email: e.target.value })} className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-400 transition" required/>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Create Password (min. 6 characters)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                  <input type={showPassword ? "text" : "password"} placeholder="Create strong password" minLength={6} value={signupData.password} onChange={(e) => setSignupData({ ...signupData, password: e.target.value })} className="w-full pl-10 pr-11 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-400 transition" required/>
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition">
                    {showPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                  </button>
                </div>
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-center gap-2.5 text-xs text-gray-300 cursor-pointer pt-1">
                <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} required className="checkbox checkbox-xs checkbox-secondary rounded"/>
                <span>
                  I agree to the{" "}
                  <span className="text-pink-400 hover:underline">Community Guidelines</span> &{" "}
                  <span className="text-pink-400 hover:underline">Privacy Policy</span>
                </span>
              </label>

              {/* Submit Button */}
              <button type="submit" disabled={isPending || !agreeTerms} className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-pink-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4">
                {isPending ? (<>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                    Creating Account...
                  </>) : (<>
                    Continue to Profile Setup
                    <ArrowRight className="w-4 h-4"/>
                  </>)}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <p className="text-sm text-gray-400">
                Already registered?{" "}
                <Link to="/login" className="text-pink-400 font-semibold hover:text-pink-300 hover:underline transition">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>);
};
export default SignUpPage;
