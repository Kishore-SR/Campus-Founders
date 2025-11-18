import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signup } from "../lib/api";

const useSignUp = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error } = useMutation({
    mutationFn: signup,
    onSuccess: (data) => {
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error) => {
      console.error("Signup error:", error);
    },
  });

  return { isPending, error, signupMutation: mutate };
};
export default useSignUp;
