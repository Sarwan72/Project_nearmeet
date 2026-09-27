import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { app } from "../firebase";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { signInSuccess } from "../redux/user/userSlice";
import { loginWithGoogle } from "../lib/api"; // ✅ using your api.js service
import { useState } from "react";
export default function OAuth() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    //   const handleGoogleClick = async () => {
    //     try {
    //       const provider = new GoogleAuthProvider();
    //       const auth = getAuth(app);
    //       const result = await signInWithPopup(auth, provider);
    //       // Send user info to backend via api.js
    //       const data = await loginWithGoogle({
    //         name: result.user.displayName,
    //         email: result.user.email,
    //         profilePic: result.user.photoURL,
    //       });
    //       dispatch(signInSuccess(data));
    //       navigate("/");
    //     } catch (error) {
    //       console.error("Google OAuth error:", error);
    //     }
    //   };
    const [loading, setLoading] = useState(false);
    const handleGoogleClick = async () => {
        if (loading)
            return;
        setLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            const auth = getAuth(app);
            const result = await signInWithPopup(auth, provider);
            const data = await loginWithGoogle({
                name: result.user.displayName,
                email: result.user.email,
                profilePic: result.user.photoURL,
            });
            dispatch(signInSuccess(data));
            navigate("/");
        }
        catch (err) {
            console.error("Google OAuth error:", err);
        }
        finally {
            setLoading(false);
        }
    };
    return (<button onClick={handleGoogleClick} type="button" className="bg-red-700 text-white p-3 rounded-lg uppercase hover:opacity-95">
      Continue with Google
    </button>);
}
