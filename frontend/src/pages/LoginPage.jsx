import { useState } from "react";
import { Atom } from "lucide-react";
import { Link } from "react-router";
import { Helmet } from "react-helmet-async";
import useLogin from "../hooks/useLogin";
import { useThemeStore } from "../store/useThemeStore";

const LoginPage = () => {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // This is custom login hook - optimized version
  const { isPending, error: _error, loginMutation } = useLogin();
  const handleLogin = (e) => {
    e.preventDefault();
    loginMutation(loginData);
  };
  const { theme } = useThemeStore();

  return (
    <div
      className="h-screen flex items-center justify-center p-4 sm:p-6 md:p-8"
      data-theme={theme}
    >
      <Helmet>
        <title>Login | Campus Founders</title>
        <meta
          name="description"
          content="Log in to Campus Founders - Where student founders meet investors and build the next generation of startups."
        />
      </Helmet>
      <div className="border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden">
        {/* LOGIN FORM SECTION */}
        <div className="w-full lg:w-1/2 p-4 sm:p-8 flex flex-col">
          {/* LOGO */}
          <div className="mb-4 flex items-center justify-start gap-2">
            <Atom className="size-9 text-primary" />
            <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary  tracking-wider">
              Campus Founders
            </span>
          </div>

          <div className="w-full m-auto">
            <form onSubmit={handleLogin}>
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold">Welcome Back</h2>
                  <p className="text-sm opacity-70">
                    Sign in and connect with founders, investors and innovators
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="form-control w-full space-y-2">
                    <label className="label">
                      <span className="label-text">Email</span>
                    </label>
                    <input
                      type="email"
                      placeholder="yourname@gmail.com"
                      className="input input-bordered w-full placeholder:opacity-40"
                      value={loginData.email}
                      onChange={(e) =>
                        setLoginData({ ...loginData, email: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form-control w-full space-y-2">
                    <label className="label">
                      <span className="label-text">Password</span>
                    </label>
                    <input
                      type="password"
                      placeholder="∗∗∗∗∗∗"
                      className="input input-bordered w-full placeholder:opacity-40"
                      value={loginData.password}
                      onChange={(e) =>
                        setLoginData({ ...loginData, password: e.target.value })
                      }
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-full font-mono mt-8"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <span className="loading loading-spinner loading-xs"></span>
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </button>

                  <div className="text-center mt-4">
                    <p className="text-sm">
                      Don't have an account?{" "}
                      <Link
                        to="/signup"
                        className="text-primary hover:underline"
                      >
                        Create here
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* IMAGE SECTION */}
        <div className="hidden lg:flex w-full lg:w-1/2 bg-primary/10 items-center justify-center">
          <div className="max-w-md p-8">
            {/* Illustration */}
            <div className="relative aspect-square max-w-sm mx-auto">
              <img
                src="/login.png"
                alt="Campus Founders community"
                className="w-full h-full"
              />
            </div>

            <div className="text-center space-y-3 mt-6">
              <h2 className="text-xl font-semibold">
                Where Student Ideas Meet Investor Vision
              </h2>{" "}
              <p className="opacity-70">
                Connect with founders building tomorrow, investors backing
                innovation, and a community celebrating startup culture
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
