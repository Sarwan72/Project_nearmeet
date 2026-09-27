import { axiosInstance } from "./axios";
export const signup = async (signupData) => {
    const response = await axiosInstance.post("/auth/signup", signupData);
    return response.data;
};
export const login = async (loginData) => {
    const response = await axiosInstance.post("/auth/login", loginData);
    return response.data;
};
export const logout = async () => {
    const response = await axiosInstance.post("/auth/logout");
    return response.data;
};
export const getAuthUser = async () => {
    try {
        const res = await axiosInstance.get("/auth/me");
        if (res.data?.user) {
            localStorage.setItem("user", JSON.stringify(res.data.user));
        }
        return res.data;
    }
    catch (error) {
        if (error.response?.status === 401) {
            localStorage.removeItem("user");
        }
        else {
            console.log("Error in getAuthUser:", error);
        }
        return null;
    }
};
export const completeOnboarding = async (userData) => {
    const res = await axiosInstance.post("/auth/onboarding", userData);
    return res.data;
};
export const updateProfile = async (data) => {
    const response = await axiosInstance.patch("/users/profile", data);
    return response.data;
};
export const deleteAccount = async (password) => {
    const res = await axiosInstance.delete("/users/delete-account", { data: { password } });
    return res.data;
};
export const fetchNotifications = async (userId) => {
    try {
        const res = await axiosInstance.get(userId ? `/notifications/${userId}` : "/notifications");
        if (Array.isArray(res.data))
            return res.data;
        if (Array.isArray(res.data.notifications))
            return res.data.notifications;
        return [];
    }
    catch (err) {
        console.error("fetchNotifications error:", err);
        return [];
    }
};
export const markNotificationRead = async (id) => {
    const { data } = await axiosInstance.put(`/notifications/${id}/read`);
    return data;
};
