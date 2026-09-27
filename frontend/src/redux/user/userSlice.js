// src/redux/user/userSlice.js
import { createSlice } from "@reduxjs/toolkit";
const userSlice = createSlice({
    name: "user",
    initialState: { currentUser: null },
    reducers: {
        signInSuccess: (state, action) => {
            state.currentUser = action.payload;
        },
        signOut: (state) => {
            state.currentUser = null;
        },
    },
});
export const { signInSuccess, signOut } = userSlice.actions;
export default userSlice.reducer;
