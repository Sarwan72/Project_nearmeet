import Navbar from "./Navbar";
// import Sidebar from "./Sidebar";
import Footer from "./Footer";
const Layout = ({ children, showSidebar = false, showFooter = true }) => {
    //  const [sidebarOpen, setSidebarOpen] = useState(false);
    return (<div className="min-h-screen flex flex-col">
      <div className="flex flex-1">
        {/* {showSidebar && <Sidebar />} */}
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 overflow-hidden">{children}</main>
        </div>
      </div>
      {showFooter && <Footer />}
    </div>);
};
export default Layout;
