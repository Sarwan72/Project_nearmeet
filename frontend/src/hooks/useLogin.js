import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "../lib/api";
import { useNavigate } from "react-router-dom";
const useLogin = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { mutate, isPending, error, } = useMutation({
        mutationFn: login,
        onSuccess: (data) => {
            if (data?.user) {
                // 1. Save user in localStorage
                localStorage.setItem("user", JSON.stringify(data.user));
                if (data?.token) {
                    localStorage.setItem("token", data.token);
                }
                // 2. Synchronously set query cache so UI immediately knows authUser
                queryClient.setQueryData(["authUser"], { success: true, user: data.user });
            }
            // 3. Invalidate to ensure background sync with server
            queryClient.invalidateQueries({ queryKey: ["authUser"] });
            // 4. Redirect with replace: true so /login is never pushed in the browser history stack
            const targetPath = data.user?.isOnboarded ? "/" : "/onboarding";
            navigate(targetPath, { replace: true });
        },
    });
    return { isPending, error, loginMutation: mutate };
};
export default useLogin;
