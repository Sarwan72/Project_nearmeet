import { Routes, Route, Navigate } from "react-router";
import { useEffect } from "react";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import NotificationPage from "./pages/NotificationsPage";
// import CallPage from "./pages/CallPage";
// import ChatPage from "./pages/ChatPage";
import OnboardingPage from "./pages/OnboardingPage";
import { Toaster } from "react-hot-toast";
import PageLoader from "./components/PageLoader";
import useAuthUser from "./hooks/useAuthUser";
import Layout from "./components/Layout";
import { useThemeStore } from "./store/useThemeStore";
// import FriendsPage from "./pages/FriendsPage";
import HotelsPage from "./pages/HotelsPage";
import ProfilePage from "./pages/ProfilePage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import AboutPage from "./pages/AboutPage";
import FeaturesPage from "./pages/FeaturesPage";
import ContactsPage from "./pages/ContactsPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import VendorSignupPage from "./pages/VendorSignupPage";
import VendorLoginPage from "./pages/VendorLoginPage";
import VendorDashboardPage from "./pages/VendorDashboardPage";
import PaymentPage from "./pages/PaymentPage";
import { AuthProvider } from "./context/AuthContext";
import VendorProfilePage from "./pages/VendorProfilePage";
import AiAgentPage from "./pages/AiAgentPage";
import VendorSideReview from "./pages/vendorSideReview";
import UserChatPage from "./pages/UserChatPage";
import VendorChatPage from "./pages/VendorChatPage";
const VendorProtectedRoute = ({ children }) => {
    const vendor = localStorage.getItem("vendor");
    if (!vendor) {
        return <Navigate to="/vendor-login" replace/>;
    }
    return children;
};
const VendorPublicRoute = ({ children }) => {
    const vendor = localStorage.getItem("vendor");
    if (vendor) {
        return <Navigate to="/vendor-home" replace/>;
    }
    return children;
};
const App = () => {
    const { isLoading, authUser } = useAuthUser();
    const { theme } = useThemeStore();
    useEffect(() => {
        const activeTheme = (theme || "lemonade").toLowerCase();
        document.documentElement.setAttribute("data-theme", activeTheme);
    }, [theme]);
    const isAuthenticated = Boolean(authUser);
    const isOnboarded = Boolean(authUser?.isOnboarded || authUser?.is_onboarded);
    if (isLoading)
        return <PageLoader />;
    return (<AuthProvider>
      <div className="min-h-screen" data-theme={theme}>
        <Routes>
          <Route path="/" element={isAuthenticated && isOnboarded ? (<Layout>
                  <HomePage />
                </Layout>) : (<Navigate to={!isAuthenticated ? "/login" : "/onboarding"} replace/>)}/>
          <Route path="/signup" element={!isAuthenticated ? (<SignUpPage />) : (<Navigate to={isOnboarded ? "/" : "/onboarding"} replace/>)}/>
          <Route path="/login" element={!isAuthenticated ? (<LoginPage />) : (<Navigate to={isOnboarded ? "/" : "/onboarding"} replace/>)}/>
          <Route path="/notifications" element={isAuthenticated && isOnboarded ? (<Layout>
                  <NotificationPage />
                </Layout>) : (<Navigate to={!isAuthenticated ? "/login" : "/onboarding"} replace/>)}/>

          <Route path="/onboarding" element={isAuthenticated ? (!isOnboarded ? (<OnboardingPage />) : (<Navigate to="/" replace/>)) : (<Navigate to="/login" replace/>)}/>

          <Route path="/hotels" element={isAuthenticated && isOnboarded ? (<Layout>
                  <HotelsPage />
                </Layout>) : (<Navigate to={!isAuthenticated ? "/login" : "/onboarding"} replace/>)}/>
          <Route path="/profile" element={isAuthenticated && isOnboarded ? (<Layout>
                  <ProfilePage />
                </Layout>) : (<Navigate to={!isAuthenticated ? "/login" : "/onboarding"} replace/>)}/>
          <Route path="/change-password" element={isAuthenticated && isOnboarded ? (<Layout>
                  <ChangePasswordPage />
                </Layout>) : (<Navigate to={!isAuthenticated ? "/login" : "/onboarding"} replace/>)}/>
          <Route path="/about" element={isAuthenticated && isOnboarded ? (<Layout>
                  <AboutPage />
                </Layout>) : (<Navigate to={!isAuthenticated ? "/login" : "/onboarding"} replace/>)}/>
          <Route path="/features" element={isAuthenticated && isOnboarded ? (<Layout>
                  <FeaturesPage />
                </Layout>) : (<Navigate to={!isAuthenticated ? "/login" : "/onboarding"} replace/>)}/>
          <Route path="/contact" element={isAuthenticated && isOnboarded ? (<Layout>
                  <ContactsPage />
                </Layout>) : (<Navigate to={!isAuthenticated ? "/login" : "/onboarding"} replace/>)}/>
          <Route path="/privacy" element={isAuthenticated && isOnboarded ? (<Layout>
                  <PrivacyPolicyPage />
                </Layout>) : (<Navigate to={!isAuthenticated ? "/login" : "/onboarding"} replace/>)}/>
          <Route path="/vendor-signup" element={<VendorPublicRoute>
                <VendorSignupPage />
              </VendorPublicRoute>}/>
          <Route path="/vendor-login" element={<VendorPublicRoute>
                <VendorLoginPage />
              </VendorPublicRoute>}/>
          <Route path="/vendor-home" element={<VendorProtectedRoute>
                <VendorDashboardPage />
              </VendorProtectedRoute>}/>
          <Route path="/vendor-profile" element={<VendorProtectedRoute>
                <VendorProfilePage />
              </VendorProtectedRoute>}/>
          <Route path="/payment" element={<PaymentPage />}/>
          <Route path="/ai" element={<AiAgentPage />}/>
          <Route path="/vendor/:vendorId/reviews" element={<VendorSideReview />}/>
          <Route path="/chat/:vendorId" element={<UserChatPage />}/>
          <Route path="/vendor/chat/:userId" element={<VendorChatPage />}/>
        </Routes>

        <Toaster position="top-center"/>
      </div>
    </AuthProvider>);
};
export default App;
