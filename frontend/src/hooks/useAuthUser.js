import { useQuery } from "@tanstack/react-query";
import { getAuthUser } from "../lib/api";
const useAuthUser = () => {
    const getInitialUser = () => {
        try {
            const stored = localStorage.getItem("user");
            if (!stored)
                return null;
            const parsed = JSON.parse(stored);
            return {
                ...parsed,
                isOnboarded: Boolean(parsed.isOnboarded ?? parsed.is_onboarded),
                fullName: parsed.fullName || parsed.full_name || "",
            };
        }
        catch {
            return null;
        }
    };
    const initialUser = getInitialUser();
    const { data, isLoading } = useQuery({
        queryKey: ["authUser"],
        queryFn: getAuthUser,
        retry: false,
        staleTime: 5 * 60 * 1000, // 5 minutes cache validity
        gcTime: 10 * 60 * 1000,
        initialData: initialUser ? { success: true, user: initialUser } : undefined,
    });
    const rawUser = data?.user || null;
    const authUser = rawUser
        ? {
            ...rawUser,
            isOnboarded: Boolean(rawUser.isOnboarded ?? rawUser.is_onboarded),
            fullName: rawUser.fullName || rawUser.full_name || "",
        }
        : null;
    return {
        isLoading: isLoading && !initialUser,
        authUser,
    };
};
export default useAuthUser;
