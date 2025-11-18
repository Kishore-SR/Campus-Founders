import { useState } from "react";
import { useNavigate } from "react-router";
import { Helmet } from "react-helmet-async";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { adminLogin } from "../lib/admin-api";
import { useThemeStore } from "../store/useThemeStore";
import { Shield } from "lucide-react";

const AdminLoginPage = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const navigate = useNavigate();
  const { theme } = useThemeStore();

  const { mutate: loginMutation, isPending } = useMutation({
    mutationFn: adminLogin,
    onSuccess: () => {
      toast.success("Admin login successful");
      navigate("/admin/dashboard");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Login failed");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation(credentials);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      data-theme={theme}
    >
      <Helmet>
        <title>Admin Login | Campus Founders</title>
      </Helmet>

      <div className="card bg-base-200 w-full max-w-md shadow-2xl border border-primary/30">
        <div className="card-body">
          <div className="flex flex-col items-center mb-6">
            <Shield className="size-16 text-primary mb-4" />
            <h1 className="text-2xl font-bold">Admin Access</h1>
            <p className="text-sm opacity-70">Campus Founders Dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Username</span>
              </label>
              <input
                type="text"
                placeholder="Enter admin username"
                className="input input-bordered w-full placeholder:opacity-40"
                value={credentials.username}
                onChange={(e) =>
                  setCredentials({ ...credentials, username: e.target.value })
                }
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                placeholder="Enter password"
                className="input input-bordered w-full placeholder:opacity-40"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Authenticating...
                </>
              ) : (
                <>
                  <Shield className="size-5 mr-2" />
                  Access Dashboard
                </>
              )}
            </button>
          </form>

          <div className="divider text-xs opacity-50">Demo Credentials</div>
          <div className="bg-base-100 p-3 rounded-lg text-xs">
            <p className="font-mono">Username: cosmic</p>
            <p className="font-mono">Password: 123456</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
