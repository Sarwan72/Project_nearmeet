import axios from "axios";
const BACKEND = import.meta.env.VITE_BACKEND_URL;
export const api = axios.create({
    baseURL: BACKEND ? `${BACKEND}/api` : "http://localhost:5001/api",
    withCredentials: true,
});
// Response interceptor to handle unauthenticated 401s gracefully
api.interceptors.response.use((response) => response, (error) => {
    if (error.response?.status === 401) {
        // Clean stale storage if logged out
        const path = window.location.pathname;
        if (!path.includes("/login") && !path.includes("/signup") && path !== "/") {
            // Can optionally redirect or clear state
        }
    }
    return Promise.reject(error);
});
export const authApi = {
    signup: async (data) => (await api.post("/auth/signup", data)).data,
    login: async (data) => (await api.post("/auth/login", data)).data,
    logout: async () => (await api.post("/auth/logout")).data,
    getMe: async () => (await api.get("/auth/me")).data,
    completeOnboarding: async (data) => (await api.post("/auth/onboarding", data)).data,
};
export const userApi = {
    getProfile: async () => (await api.get("/users/profile")).data,
    updateProfile: async (data) => (await api.patch("/users/profile", data)).data,
    deleteAccount: async (password) => (await api.delete("/users/delete-account", { data: { password } })).data,
    getOptions: async () => (await api.get("/users/onboarding-options")).data,
    addPhoto: async (imageUrl) => (await api.post("/users/photos", { imageUrl })).data,
    deletePhoto: async (photoId) => (await api.delete(`/users/photos/${photoId}`)).data,
};
export const vendorApi = {
    signup: async (data) => (await api.post("/vendors/signup", data)).data,
    login: async (data) => (await api.post("/vendors/login", data)).data,
    logout: async () => (await api.post("/vendors/logout")).data,
    getMe: async () => (await api.get("/vendors/me")).data,
    getProfile: async () => (await api.get("/vendors/me")).data,
    updateProfile: async (data) => (await api.put("/vendors/profile", data)).data,
    getHotels: async (params) => (await api.get("/vendors/hotels", { params })).data,
    getVendorById: async (id) => (await api.get(`/vendors/${id}`)).data,
    changePassword: async (currentPassword, newPassword) => (await api.post("/vendors/change-password", { currentPassword, newPassword })).data,
    deleteAccount: async (password) => (await api.post("/vendors/delete", { password })).data,
    getDashboardStats: async () => (await api.get("/dashboard/stats")).data,
    getPairableGuests: async (vendorId) => (await api.get(`/bookings/vendor/${vendorId}/pairable`)).data,
    pairGuests: async (payload) => (await api.post("/bookings/vendor/pair", payload)).data,
};
export const discoveryApi = {
    getFeed: async () => (await api.get("/discovery/feed")).data,
    likeUser: async (targetUserId) => (await api.post("/matches/like", { targetUserId })).data,
    passUser: async (targetUserId) => (await api.post("/matches/pass", { targetUserId })).data,
    getMatches: async () => (await api.get("/matches")).data,
    blockUser: async (userId, reason) => (await api.post(`/matches/block/${userId}`, { reason })).data,
    reportUser: async (userId, reason, details) => (await api.post(`/matches/report/${userId}`, { reason, details })).data,
};
export const bookingApi = {
    createBooking: async (payload) => (await api.post("/bookings/book", payload)).data,
    getUserBookings: async (userId) => (await api.get(`/bookings/user/${userId}`)).data,
    getVendorBookings: async (vendorId) => (await api.get(`/bookings/vendor/${vendorId}`)).data,
    updateStatus: async (bookingId, status) => (await api.put(`/bookings/${bookingId}/status`, { status })).data,
    respondPairRequest: async (pairRequestId, action) => (await api.post(`/bookings/pair-requests/${pairRequestId}/respond`, { action })).data,
};
export const notificationApi = {
    getNotifications: async (userId) => {
        const url = userId ? `/notifications/${userId}` : "/notifications";
        return (await api.get(url)).data;
    },
    markRead: async (id) => (await api.put(`/notifications/${id}/read`)).data,
    markAllRead: async () => (await api.put("/notifications/read-all")).data,
};
export const chatApi = {
    getConversations: async () => (await api.get("/chat/conversations")).data,
    getOrCreateDirect: async (otherUserId) => (await api.post("/chat/conversations/direct", { otherUserId })).data,
    getMessages: async (conversationId, limit = 50, offset = 0) => (await api.get(`/chat/conversations/${conversationId}/messages`, { params: { limit, offset } })).data,
    sendMessage: async (conversationId, payload) => (await api.post(`/chat/conversations/${conversationId}/messages`, payload)).data,
};
export const uploadApi = {
    uploadSingle: async (file, folder = "nearmeet/photos") => {
        const formData = new FormData();
        formData.append("photo", file);
        formData.append("folder", folder);
        const res = await api.post("/upload/single", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return res.data;
    },
    uploadPhotos: async (files, folder = "nearmeet/photos") => {
        const formData = new FormData();
        for (const f of files) {
            formData.append("photos", f);
        }
        formData.append("folder", folder);
        const res = await api.post("/upload/photos", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return res.data;
    },
};
