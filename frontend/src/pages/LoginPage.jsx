import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Heart, Coffee, ShieldCheck, Compass, ArrowRight, Store, } from "lucide-react";
import useLogin from "../hooks/useLogin";
const communityPerks = [
    {
        icon: Coffee,
        title: "Curated Offline Meetups",
        desc: "Local cafes & lounges pair you at reserved tables based on your true interests.",
    },
    {
        icon: Heart,
        title: "Personality-First Connections",
        desc: "Skip superficial swiping. Connect through prompts, lifestyle, and shared values.",
    },
    {
        icon: ShieldCheck,
        title: "Safe & Verified Venues",
        desc: "Meet in comfortable, public hospitality spaces with upfront bookings.",
    },
    {
        icon: Compass,
        title: "Nearby Discovery",
        desc: "Discover real people looking for genuine relationships within your local radius.",
    },
];
const LoginPage = () => {
    const navigate = useNavigate();
    const [loginData, setLoginData] = useState({
        email: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const { isPending, error, loginMutation } = useLogin();
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
    const handleLogin = (e) => {
        e.preventDefault();
        loginMutation({
            email: loginData.email,
            password: loginData.password,
        });
    };
    return (<div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"/>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"/>

      <div className="w-full max-w-5xl bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row relative z-10">
        {/* Left Side: Brand Showcase & Offline Dating Perks */}
        <div className="lg:w-1/2 p-8 sm:p-12 bg-gradient-to-br from-purple-900/40 via-slate-900/60 to-black/60 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col justify-between relative">
          <div>
            {/* Top Badge */}
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-2.5 rounded-2xl shadow-lg shadow-pink-500/20">
                <img className="w-8 h-8 rounded-full object-cover" src="/logo.png" alt="NearMeet Logo"/>
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                  NearMeet{" "}
                  <span className="text-pink-400 text-xs font-semibold uppercase px-2 py-0.5 rounded-full bg-pink-500/10 border border-pink-500/20">
                    Dating & Social
                  </span>
                </span>
                <p className="text-xs text-gray-400">Real Connections in Real Places</p>
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-4">
              Real-world connections start here.
            </h1>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-8">
              Sign in to browse curated local venues, view matched meetups, and connect with
              meaningful people who match your lifestyle.
            </p>

            {/* Perks Grid */}
            <div className="space-y-4">
              {communityPerks.map((perk, i) => {
            const Icon = perk.icon;
            return (<div key={i} className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                    <div className="p-2 rounded-xl bg-pink-500/15 text-pink-400 border border-pink-500/20 shrink-0">
                      <Icon className="w-4 h-4"/>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{perk.title}</h4>
                      <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{perk.desc}</p>
                    </div>
                  </div>);
        })}
            </div>
          </div>

          {/* Bottom Live Metric */}
          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/>
              <span>Offline Meetup Matching Online</span>
            </div>
            <Link to="/vendor-login" className="text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1">
              <Store className="w-3.5 h-3.5"/>
              Venue Partner Portal
            </Link>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">
            {/* Role Selector Tabs */}
            <div className="grid grid-cols-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl mb-6">
              <button type="button" className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-pink-500/20">
                <Heart className="w-3.5 h-3.5"/>
                <span>Dating & Social User</span>
              </button>
              <button type="button" onClick={() => navigate("/vendor-login")} className="py-2.5 px-3 rounded-xl text-gray-400 hover:text-white font-medium text-xs flex items-center justify-center gap-1.5 hover:bg-white/5 transition">
                <Store className="w-3.5 h-3.5 text-amber-400"/>
                <span>Venue Partner Portal</span>
              </button>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h2>
              <p className="text-sm text-gray-400 mt-1">
                Enter your account details to jump back into your connections.
              </p>
            </div>

            {/* Error Message */}
            {error && (<div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-sm">
                {error.response?.data?.message || "Login failed. Please check your credentials."}
              </div>)}

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                  <input type="email" placeholder="you@example.com" value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-400 transition" required/>
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                  <input type={showPassword ? "text" : "password"} placeholder="Enter your password" value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} className="w-full pl-10 pr-11 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-400 transition" required/>
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition">
                    {showPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button type="submit" disabled={isPending} className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-pink-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4">
                {isPending ? (<>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                    Signing in...
                  </>) : (<>
                    Enter NearMeet
                    <ArrowRight className="w-4 h-4"/>
                  </>)}
              </button>
            </form>

            {/* Signup Link */}
            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <p className="text-sm text-gray-400">
                Don't have an account yet?{" "}
                <Link to="/signup" className="text-pink-400 font-semibold hover:text-pink-300 hover:underline transition">
                  Create Account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>);
};
export default LoginPage;
