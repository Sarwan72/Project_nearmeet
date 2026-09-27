import { useMutation, useQueryClient } from '@tanstack/react-query';
import { signup } from '../lib/api';
import { useNavigate } from 'react-router-dom';
const useSignUp = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { mutate, isPending, error, } = useMutation({
        mutationFn: signup,
        onSuccess: (data) => {
            if (data?.user) {
                localStorage.setItem("user", JSON.stringify(data.user));
                if (data?.token) {
                    localStorage.setItem("token", data.token);
                }
                queryClient.setQueryData(["authUser"], { success: true, user: data.user });
            }
            queryClient.invalidateQueries({ queryKey: ["authUser"] });
            const targetPath = data?.user?.isOnboarded ? "/" : "/onboarding";
            navigate(targetPath, { replace: true });
        },
    });
    return { error, isPending, signupMutation: mutate };
};
export default useSignUp;
