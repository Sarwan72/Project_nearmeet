// import axios from "axios";
// const BASE_URL =
//   import.meta.env.MODE === "development" ? `${import.meta.env.VITE_BACKEND_URL}/api` : "/api";
// export const axiosInstance = axios.create({
//   baseURL: BASE_URL,
//   withCredentials: true, // send cookies with the request
// });
import axios from "axios";
const BACKEND = import.meta.env.VITE_BACKEND_URL;
// Example: VITE_BACKEND_URL = https://nearmeet2.onrender.com
export const axiosInstance = axios.create({
    baseURL: BACKEND
        ? `${BACKEND}/api` // → https://nearmeet2.onrender.com/api
        : "http://localhost:5001/api",
    withCredentials: true,
});
axiosInstance.interceptors.request.use((reqConfig) => {
    const vendorToken = localStorage.getItem("vendorToken");
    const userToken = localStorage.getItem("token");
    // Determine if this request is from the vendor portal context or for a vendor endpoint
    const isVendorContext = reqConfig.url?.includes("/vendors/") ||
        reqConfig.url?.includes("/vendors") ||
        reqConfig.url?.includes("/bookings/vendor") ||
        reqConfig.url?.includes("/bookings/requests") ||
        reqConfig.url?.includes("/bookings/pair") ||
        reqConfig.url?.includes("/ai/vendor") ||
        (typeof window !== "undefined" && window.location.pathname.startsWith("/vendor"));
    const token = (isVendorContext && vendorToken) ? vendorToken : (userToken || vendorToken);
    if (token && reqConfig.headers && !reqConfig.headers.Authorization) {
        reqConfig.headers.Authorization = `Bearer ${token}`;
    }
    return reqConfig;
});
// Response interceptor to clean up poisoned/expired tokens
axiosInstance.interceptors.response.use((response) => response, (error) => {
    if (error.response?.status === 401) {
        const isVendorEndpoint = error.config?.url?.includes("/vendors/") ||
            error.config?.url?.includes("/vendors") ||
            error.config?.url?.includes("/bookings/vendor");
        if (isVendorEndpoint) {
            localStorage.removeItem("vendorToken");
            localStorage.removeItem("vendor");
        }
    }
    return Promise.reject(error);
});
