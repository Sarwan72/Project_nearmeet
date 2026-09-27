// import { Link, useLocation } from "react-router";
// import useAuthUser from "../hooks/useAuthUser";
// import {BellIcon,
//   HomeIcon,
//   Building2Icon,
//   InfoIcon,
//   SparklesIcon,
//   ShieldIcon,
//   PhoneIcon,
//   MenuIcon, } from "lucide-react";
// // import useFriendRequests from "../hooks/useFriendRequests";
// const Sidebar = () => {
//   const { authUser } = useAuthUser();
//   const location = useLocation();
//   const currentPath = location.pathname;
//   // const { incomingRequests } = useFriendRequests();
//   return (
//     <aside className="w-64 bg-base-200 border-r border-base-300 hidden lg:flex flex-col h-screen sticky top-0">
//       <div className="p-5 border-b border-base-300">
//         <Link to="/" className="flex items-center gap-2.5">
//           <img src="/logo.png" alt="" className="h-12 w-12 rounded-3xl" />
//           <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary  tracking-wider">
//             NearMeet
//           </span>
//         </Link>
//       </div>
//       <nav className="flex-1 p-4 space-y-1">
//         <Link
//           to="/"
//           className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
//             currentPath === "/" ? "btn-active" : ""
//           }`}
//         >
//           <HomeIcon className="size-5 text-base-content opacity-70" />
//           <span>Home</span>
//         </Link>
//         <div className="relative">
//           <Link
//             to="/friends"
//             className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
//               currentPath === "/friends" ? "btn-active" : ""
//             }`}
//           >
//             <Building2Icon className="size-5 text-base-content opacity-70" />
//             <span>Hotels</span>
//             {incomingRequests.length > 0 && (
//               <span className="absolute right-3 top-1/2 -translate-y-1/2 badge badge-primary border-0 w-5 h-5 min-h-0 flex items-center justify-center p-0 text-xs">
//                 {incomingRequests.length}
//               </span>
//             )}
//           </Link>
//           <Link
//             to="/about"
//             className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
//               currentPath === "/about" ? "btn-active" : ""
//             }`}
//           >
//             <InfoIcon className="size-5 text-base-content opacity-70" />
//             <span>About</span>
//             {incomingRequests.length > 0 && (
//               <span className="absolute right-3 top-1/2 -translate-y-1/2 badge badge-primary border-0 w-5 h-5 min-h-0 flex items-center justify-center p-0 text-xs">
//                 {incomingRequests.length}
//               </span>
//             )}
//           </Link>
//           <Link
//             to="/features"
//             className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
//               currentPath === "/features" ? "btn-active" : ""
//             }`}
//           >
//             <SparklesIcon className="size-5 text-base-content opacity-70" />
//             <span>Features</span>
//             {incomingRequests.length > 0 && (
//               <span className="absolute right-3 top-1/2 -translate-y-1/2 badge badge-primary border-0 w-5 h-5 min-h-0 flex items-center justify-center p-0 text-xs">
//                 {incomingRequests.length}
//               </span>
//             )}
//           </Link>
//           <Link
//             to="/privacy"
//             className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
//               currentPath === "/privacy" ? "btn-active" : ""
//             }`}
//           >
//             <ShieldIcon className="size-5 text-base-content opacity-70" />
//             <span>Privacy</span>
//             {incomingRequests.length > 0 && (
//               <span className="absolute right-3 top-1/2 -translate-y-1/2 badge badge-primary border-0 w-5 h-5 min-h-0 flex items-center justify-center p-0 text-xs">
//                 {incomingRequests.length}
//               </span>
//             )}
//           </Link>
//           <Link
//             to="/contact"
//             className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
//               currentPath === "/contact" ? "btn-active" : ""
//             }`}
//           >
//             <PhoneIcon className="size-5 text-base-content opacity-70" />
//             <span>Contact</span>
//             {incomingRequests.length > 0 && (
//               <span className="absolute right-3 top-1/2 -translate-y-1/2 badge badge-primary border-0 w-5 h-5 min-h-0 flex items-center justify-center p-0 text-xs">
//                 {incomingRequests.length}
//               </span>
//             )}
//           </Link>
//         </div>
//         <Link
//           to="/notifications"
//           className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
//             currentPath === "/notifications" ? "btn-active" : ""
//           }`}
//         >
//           <BellIcon className="size-5 text-base-content opacity-70" />
//           <span>Notifications</span>
//         </Link>
//       </nav>
//       {/* USER PROFILE SECTION */}
//       <div className="p-4 border-t border-base-300 mt-auto">
//         <Link to="/profile" className="block hover:bg-base-300 rounded-lg p-2 -m-2 transition-colors">
//           <div className="flex items-center gap-3">
//             <div className="avatar">
//               <div className="w-10 rounded-full">
//                 <img src={authUser?.profilePic} alt="User Avatar" />
//               </div>
//             </div>
//             <div className="flex-1">
//               <p className="font-semibold text-sm">{authUser?.fullName}</p>
//               <p className="text-xs text-success flex items-center gap-1">
//                 <span className="size-2 rounded-full bg-success inline-block" />
//                 Online
//               </p>
//             </div>
//           </div>
//         </Link>
//       </div>
//     </aside>
//   );
// };
// export default Sidebar;
