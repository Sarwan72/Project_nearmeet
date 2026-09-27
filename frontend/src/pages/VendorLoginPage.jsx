import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Building2, ArrowRight, ShieldCheck, Zap, TrendingUp, MessageSquare, Heart, Store, } from "lucide-react";
import { toast } from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
const partnerPerks = [
    {
        icon: Zap,
        title: "Instant Booking Alerts",
        desc: "Get real-time notifications on mobile and desktop as guests request seats.",
    },
    {
        icon: MessageSquare,
        title: "Direct Guest Chat",
        desc: "Coordinate timing, special requests, and seating via real-time messaging.",
    },
    {
        icon: ShieldCheck,
        title: "Secure Digital Payments",
        desc: "Integrated Stripe checkout for reliable upfront payments and zero no-shows.",
    },
    {
        icon: TrendingUp,
        title: "Community Reputation",
        desc: "Build reviews, earn badges, and get featured on NearMeet's trending feed.",
    },
];
const VendorLoginPage = () => {
    const [loginData, setLoginData] = useState({
        ownerEmail: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const navigate = useNavigate();
    const handleLogin = async (e) => {
        e.preventDefault();
        if (!loginData.ownerEmail.trim() || !loginData.password) {
            toast.error("Please enter both email and password.");
            return;
        }
        setIsLoading(true);
        const toastId = toast.loading("Signing into Vendor Dashboard...");
        try {
            const response = await axiosInstance.post("/vendors/login", loginData);
            const vendor = response.data?.vendor;
            if (vendor) {
                localStorage.setItem("vendor", JSON.stringify(vendor));
            }
            if (response.data?.token) {
                localStorage.setItem("vendorToken", response.data.token);
            }
            toast.success("Welcome back!", { id: toastId });
            navigate("/vendor-home", { replace: true });
        }
        catch (err) {
            console.error("Vendor login error:", err);
            const message = err.response?.data?.message ||
                "Login failed. Please verify your email and password.";
            toast.error(message, { id: toastId });
        }
        finally {
            setIsLoading(false);
        }
    };
    return (<div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"/>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"/>

      <div className="w-full max-w-5xl bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row relative z-10">
        {/* Left Side: Brand Showcase & Partner Benefits */}
        <div className="lg:w-1/2 p-8 sm:p-12 bg-gradient-to-br from-purple-900/40 via-slate-900/60 to-black/60 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col justify-between relative">
          <div>
            {/* Top Badge */}
            <div className="flex items-center gap-2 mb-8">
              <div className="bg-gradient-to-r from-amber-500 to-amber-400 p-2.5 rounded-2xl shadow-lg shadow-amber-500/20">
                <Building2 className="w-6 h-6 text-slate-950"/>
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                  NearMeet <span className="text-amber-400 text-xs font-semibold uppercase px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">Partner</span>
                </span>
                <p className="text-xs text-gray-400">Venue Management Portal</p>
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-4">
              Welcome back to your venue command center.
            </h1>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-8">
              Manage booking requests, chat with guests, track revenues, and keep your
              venue thriving with verified offline meetups.
            </p>

            {/* Perks Grid */}
            <div className="space-y-4">
              {partnerPerks.map((perk, i) => {
            const Icon = perk.icon;
            return (<div key={i} className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                    <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/20 shrink-0">
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
              <span>Real-time Socket & Booking Network Active</span>
            </div>
            <Link to="/" className="text-amber-400 hover:text-amber-300 hover:underline">
              Back to Main Site
            </Link>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">
            {/* Role Selector Tabs */}
            <div className="grid grid-cols-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl mb-6">
              <button type="button" onClick={() => navigate("/login")} className="py-2.5 px-3 rounded-xl text-gray-400 hover:text-white font-medium text-xs flex items-center justify-center gap-1.5 hover:bg-white/5 transition">
                <Heart className="w-3.5 h-3.5 text-pink-400"/>
                <span>Dating & Social User</span>
              </button>
              <button type="button" className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20">
                <Store className="w-3.5 h-3.5"/>
                <span>Venue Partner Portal</span>
              </button>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white tracking-tight">Partner Sign In</h2>
              <p className="text-sm text-gray-400 mt-1">
                Enter your registered venue credentials to access your dashboard.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Owner Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                  <input type="email" placeholder="e.g. manager@hotel.com" value={loginData.ownerEmail} onChange={(e) => setLoginData({ ...loginData, ownerEmail: e.target.value })} className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400 transition" required/>
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
                  <input type={showPassword ? "text" : "password"} placeholder="Enter your partner password" value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} className="w-full pl-10 pr-11 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400 transition" required/>
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition">
                    {showPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                  </button>
                </div>
              </div>

              {/* Remember Me & Help */}
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-gray-300">
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="checkbox checkbox-xs checkbox-warning rounded"/>
                  <span>Keep me signed in</span>
                </label>
                <span className="text-gray-400">Need support? Contact admin</span>
              </div>

              {/* Submit Button */}
              <button type="submit" disabled={isLoading} className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2">
                {isLoading ? (<>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"/>
                    Authenticating...
                  </>) : (<>
                    Sign In to Dashboard
                    <ArrowRight className="w-4 h-4"/>
                  </>)}
              </button>
            </form>

            {/* Signup Link */}
            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <p className="text-sm text-gray-400">
                Don't have a venue partner account yet?{" "}
                <Link to="/vendor-signup" className="text-amber-400 font-semibold hover:text-amber-300 hover:underline transition">
                  Register Your Venue
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>);
};
export default VendorLoginPage;
