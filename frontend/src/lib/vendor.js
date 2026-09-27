import { axiosInstance } from "./axios"; // <-- USE ONLY THIS INSTANCE
// Fetch vendor bookings
export const fetchVendorBookings = async (vendorId) => {
    const { data } = await axiosInstance.get(`/bookings/vendor/${vendorId}`);
    return Array.isArray(data) ? data : data.bookings || [];
};
// Accept booking
export const acceptBooking = (bookingId) => {
    return axiosInstance.post(`/bookings/requests/${bookingId}/accept`);
};
// Reject booking
export const rejectBooking = (bookingId) => {
    return axiosInstance.post(`/bookings/requests/${bookingId}/reject`);
};
// Update profile
export const updateVendorProfile = async (data) => {
    const res = await axiosInstance.put(`/vendors/profile`, data);
    return res.data.vendor;
};
// Change password
export const changeVendorPassword = async (currentPassword, newPassword) => {
    const res = await axiosInstance.post(`/vendors/change-password`, {
        currentPassword,
        newPassword,
    });
    return res.data;
};
// Delete vendor account
export const deleteVendorAccount = async (password) => {
    const res = await axiosInstance.post(`/vendors/delete`, { password });
    return res.data;
};
// Logout
export const logoutVendor = async () => {
    const res = await axiosInstance.post(`/vendors/logout`);
    return res.data;
};
// Fetch vendor profile
export const getVendorProfile = async () => {
    const res = await axiosInstance.get(`/vendors/me`);
    return res.data.vendor;
};
// AI Pair Recommendation for Vendor
export const getAiPairRecommendation = async () => {
    const res = await axiosInstance.post(`/ai/vendor/recommend-pair`);
    return res.data;
};
// Pair two guests at a table
export const pairGuestsAtTable = async ({ bookingId1, bookingId2, tableNumber, note }) => {
    const res = await axiosInstance.post(`/bookings/vendor/pair`, {
        bookingId1,
        bookingId2,
        tableNumber,
        note,
    });
    return res.data;
};
