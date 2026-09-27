import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOutIcon, HomeIcon, Star, MenuIcon, X, Building2, } from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import { logoutVendor } from "../lib/vendor";
import { toast } from "react-hot-toast";
const VendorNavbar = ({ onNavigate, profile }) => {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();
    const storedVendor = (() => {
        try {
            return JSON.parse(localStorage.getItem("vendor") || "{}");
        }
        catch {
            return {};
        }
    })();
    const vendor = profile || storedVendor;
    const vendorId = vendor?._id || vendor?.id;
    const hotelName = vendor?.hotelName || vendor?.hotel_name || "Partner Venue";
    const hotelPhoto = vendor?.photos?.[0] ||
        vendor?.profilePic ||
        "/logo.png";
    const navLinks = [
        {
            to: "/vendor-home",
            page: "dashboard",
            label: "Dashboard",
            icon: HomeIcon,
            active: location.pathname === "/vendor-home",
        },
        {
            to: vendorId ? `/vendor/${vendorId}/reviews` : "/vendor-home",
            page: "reviews",
            label: "Customer Reviews",
            icon: Star,
            active: location.pathname.includes("reviews"),
        },
        {
            to: "/vendor-profile",
            page: "profile",
            label: "Venue Profile",
            icon: Building2,
            active: location.pathname === "/vendor-profile",
        },
    ];
    const handleLogout = async () => {
        const confirmLogout = window.confirm("Are you sure you want to log out of your vendor account?");
        if (!confirmLogout)
            return;
        try {
            await logoutVendor();
        }
        catch (err) {
            console.warn("Backend logout notification warning:", err);
        }
        finally {
            localStorage.removeItem("vendor");
            localStorage.removeItem("vendorToken");
            toast.success("Vendor logged out successfully");
            navigate("/vendor-login");
        }
    };
    return (<nav className="bg-base-200/90 backdrop-blur-md border-b border-base-300 sticky top-0 z-40 transition-colors">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo & Brand */}
        <Link to="/vendor-home" onClick={() => onNavigate?.("dashboard")} className="flex items-center gap-3 group">
          <div className="relative">
            <img src="/logo.png" alt="NearMeet Logo" className="h-9 w-9 rounded-xl object-contain shadow-sm group-hover:scale-105 transition-transform" onError={(e) => {
            // Fallback icon if logo image fails
            e.currentTarget.style.display = "none";
        }}/>
            <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full ring-2 ring-base-200"></span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold font-mono tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary leading-none">
              NearMeet
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-base-content/60">
              Vendor Portal
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1.5 ml-6">
          {navLinks.map(({ to, label, icon: Icon, active, page }) => (<Link key={page} to={to} onClick={() => onNavigate?.(page)} className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${active
                ? "bg-primary text-primary-content shadow-sm font-semibold"
                : "text-base-content/80 hover:bg-base-300 hover:text-base-content"}`}>
              <Icon className="w-4 h-4"/>
              <span>{label}</span>
            </Link>))}
        </div>

        {/* Right Section: Theme Selector, Profile Avatar & Logout */}
        <div className="flex items-center gap-3">
          <ThemeSelector />

          {/* Venue Profile Pill */}
          <Link to="/vendor-profile" className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-base-300/60 hover:bg-base-300 border border-base-300 transition-all text-xs" title="Edit Venue Profile">
            <div className="avatar">
              <div className="w-7 h-7 rounded-full overflow-hidden ring-1 ring-primary/40">
                <img src={hotelPhoto} alt={hotelName} className="w-full h-full object-cover" onError={(e) => {
            e.currentTarget.src = "/logo.png";
        }}/>
              </div>
            </div>
            <span className="font-semibold max-w-[120px] truncate text-base-content">
              {hotelName}
            </span>
          </Link>

          {/* Quick Logout Button */}
          <button onClick={handleLogout} className="btn btn-ghost btn-circle btn-sm text-base-content/70 hover:text-error hover:bg-error/10 transition-colors" title="Sign Out">
            <LogOutIcon className="w-4 h-4"/>
          </button>

          {/* Mobile Hamburger Toggle */}
          <button className="md:hidden btn btn-ghost btn-circle btn-sm" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle Navigation Menu">
            {menuOpen ? <X className="w-5 h-5"/> : <MenuIcon className="w-5 h-5"/>}
          </button>
        </div>
      </div>

      {/* Mobile Drawer / Dropdown */}
      {menuOpen && (<div className="md:hidden bg-base-200 border-t border-base-300 px-4 py-3 space-y-2 shadow-xl animate-in slide-in-from-top duration-200">
          {/* Vendor Quick Info Banner */}
          <Link to="/vendor-profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 p-2.5 rounded-2xl bg-base-300/70 border border-base-300">
            <div className="avatar">
              <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-primary">
                <img src={hotelPhoto} alt={hotelName} className="w-full h-full object-cover" onError={(e) => {
                e.currentTarget.src = "/logo.png";
            }}/>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-base-content">{hotelName}</span>
              <span className="text-xs text-primary font-medium flex items-center gap-1">
                <Building2 className="w-3 h-3"/> Manage Profile & Settings
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="pt-2 flex flex-col gap-1">
            {navLinks.map(({ to, label, icon: Icon, active, page }) => (<Link key={page} to={to} onClick={() => {
                    onNavigate?.(page);
                    setMenuOpen(false);
                }} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${active
                    ? "bg-primary text-primary-content font-bold"
                    : "text-base-content/80 hover:bg-base-300"}`}>
                <Icon className="w-4 h-4"/>
                <span>{label}</span>
              </Link>))}

            <button onClick={() => {
                setMenuOpen(false);
                handleLogout();
            }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-error hover:bg-error/10 transition mt-2 text-left">
              <LogOutIcon className="w-4 h-4"/>
              <span>Sign Out</span>
            </button>
          </div>
        </div>)}
    </nav>);
};
export default VendorNavbar;
