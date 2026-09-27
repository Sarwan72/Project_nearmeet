// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { logout } from "../lib/api";
// const useLogout = () => {
//   const queryClient = useQueryClient();
//   const {
//     mutate: logoutMutation,
//     isPending,
//     error,
//   } = useMutation({
//     mutationFn: logout,
//     onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
//   });
//   return { logoutMutation, isPending, error };
// };
// export default useLogout;
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "../lib/api";
const useLogout = () => {
    const queryClient = useQueryClient();
    const { mutate: logoutMutation, isPending, error, } = useMutation({
        mutationFn: logout,
        onSuccess: () => {
            // Clear all cached auth data
            queryClient.invalidateQueries({ queryKey: ["authUser"] });
            // ❗ MOST IMPORTANT — remove user from localStorage
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            // Optional: remove vendor if using vendor login also
            localStorage.removeItem("vendor");
            localStorage.removeItem("vendorToken");
            // Force reload UI so no stale state remains
            window.location.href = "/login";
        },
    });
    return { logoutMutation, isPending, error };
};
export default useLogout;
