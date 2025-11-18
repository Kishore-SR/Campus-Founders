import { useQuery } from "@tanstack/react-query";
import { getAuthUser } from "../lib/api";

const useAuthUser = () => {
  const authUser = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        // Check if token exists in localStorage
        const token = localStorage.getItem("token");
        if (!token) {
          // Return early if no token is found
          return { user: null };
        }

        // Call the API with the token
        return await getAuthUser();
      } catch (error) {
        console.error("Error in getAuthUser:", error);
        // Only clear token on actual authentication failures, not validation errors
        if (error.response?.status === 401) {
          const errorMessage = error.response?.data?.message || "";
          const errorType = error.response?.data?.error || "";

          // Only clear token for actual authentication errors
          const isAuthError =
            errorMessage.includes("Unauthorized") ||
            errorMessage.includes("token") ||
            errorMessage.includes("authentication") ||
            errorMessage.includes("logged in") ||
            errorType === "TOKEN_EXPIRED" ||
            errorType === "INVALID_TOKEN" ||
            errorMessage.includes("User not found");

          // Don't clear token for validation errors
          const isValidationError =
            errorMessage.includes("Invalid") ||
            errorMessage.includes("must be") ||
            errorMessage.includes("format") ||
            errorMessage.includes("required");

          if (isAuthError && !isValidationError) {
            localStorage.removeItem("token");
          }
        }
        // Return null user instead of throwing to prevent error state
        return { user: null };
      }
    },
    retry: false, // auth check only once
    refetchOnWindowFocus: false, // Disable refetch on focus to prevent slowness
    refetchOnMount: true,
    refetchOnReconnect: true,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  return {
    isLoading: authUser.isLoading,
    authUser: authUser.data?.user,
    error: authUser.error,
  };
};

export default useAuthUser;
