import { useQuery } from "@tanstack/react-query";
import { getVendorProfile } from "../lib/vendor";
export const useVendorAuth = () => {
    const { data: vendor, isLoading, isError } = useQuery({
        queryKey: ["vendorProfile"],
        queryFn: getVendorProfile,
        retry: false,
    });
    return { vendor, isLoading, isError };
};
