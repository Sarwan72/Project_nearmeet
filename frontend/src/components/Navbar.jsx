import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
// import useFriendRequests from "../hooks/useFriendRequests";
import useLogout from "../hooks/useLogout";
import ThemeSelector from "./ThemeSelector";
import { useState } from "react";
import { BellIcon, LogOutIcon, HomeIcon, Building2Icon, InfoIcon, SparklesIcon, ShieldIcon, PhoneIcon, MenuIcon, } from "lucide-react";
const navLinks = [
    { to: "/", label: "Home", icon: HomeIcon },
    { to: "/hotels", label: "Hotels", icon: Building2Icon },
    { to: "/about", label: "About", icon: InfoIcon },
    { to: "/features", label: "Features", icon: SparklesIcon },
    { to: "/privacy", label: "Privacy", icon: ShieldIcon },
    { to: "/contact", label: "Contact", icon: PhoneIcon },
    { to: "/notifications", label: "Notifications", icon: BellIcon },
];
const Navbar = () => {
    const { authUser } = useAuthUser();
    const location = useLocation();
    // const { incomingRequests } = useFriendRequests();
    const { logoutMutation } = useLogout();
    const [menuOpen, setMenuOpen] = useState(false);
    return (<nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="logo" className="h-10 w-10 rounded-2xl"/>
          <span className="text-xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wide">
            NearMeet
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex gap-2 items-center ml-8">
          {navLinks.map(({ to, label, icon: Icon }) => (<Link key={to} to={to} className={`flex items-center gap-1 px-3 py-2 rounded hover:bg-base-300 transition ${location.pathname === to ? "bg-base-300 font-bold" : ""} relative`}>
              <Icon className="w-5 h-5"/>
              <span>{label}</span>
              {/* {to === "/friends" && incomingRequests.length > 0 && (
              <span className="absolute -top-2 -right-2 badge badge-primary border-0 w-5 h-5 min-h-0 flex items-center justify-center p-0 text-xs">
                {incomingRequests.length}
              </span>
            )} */}
            </Link>))}
        </div>

        {/* Right Side: Profile, Theme, Logout */}
        <div className="flex items-center gap-2">
          <ThemeSelector />
          <Link to="/profile" className="tooltip tooltip-bottom" data-tip={authUser?.fullName}>
            <div className="avatar">
              <div className="w-9 rounded-full">
                <img src={authUser?.profilePic} alt="User Avatar"/>
              </div>
            </div>
          </Link>
          <button className="btn btn-ghost btn-circle" onClick={logoutMutation}>
            <LogOutIcon className="h-6 w-6 text-base-content opacity-70"/>
          </button>
        </div>

        {/* Hamburger for mobile */}
        <button className="lg:hidden ml-2" onClick={() => setMenuOpen(!menuOpen)} aria-label="Open menu">
          <MenuIcon className="h-7 w-7 text-base-content"/>
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (<div className="lg:hidden absolute top-16 left-0 w-full bg-base-200 border-t border-base-300 shadow z-40">
          <div className="flex flex-col gap-1 px-4 py-2">
            {navLinks.map(({ to, label, icon: Icon }) => (<Link key={to} to={to} className={`flex items-center gap-2 px-3 py-2 rounded hover:bg-base-300 transition ${location.pathname === to ? "bg-base-300 font-bold" : ""} relative`} onClick={() => setMenuOpen(false)}>
                <Icon className="w-5 h-5"/>
                <span>{label}</span>
                {/* {to === "/friends" && incomingRequests.length > 0 && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 badge badge-primary border-0 w-5 h-5 min-h-0 flex items-center justify-center p-0 text-xs">
                    {incomingRequests.length}
                  </span>
                )} */}
              </Link>))}
            <div className="flex items-center gap-2 mt-2">
              <ThemeSelector />
              <Link to="/profile" className="avatar">
                <div className="w-9 rounded-full">
                  <img src={authUser?.profilePic} alt="User Avatar"/>
                </div>
              </Link>
              <button className="btn btn-ghost btn-circle" onClick={logoutMutation}>
                <LogOutIcon className="h-6 w-6 text-base-content opacity-70"/>
              </button>
            </div>
          </div>
        </div>)}
    </nav>);
};
export default Navbar;
