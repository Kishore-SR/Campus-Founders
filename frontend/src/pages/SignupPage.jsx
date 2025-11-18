import { useState, useEffect } from "react";
import { Atom } from "lucide-react";
import { Link, useNavigate } from "react-router";
import emailjs from "emailjs-com";
import { toast } from "react-hot-toast";
import useSignUp from "../hooks/useSignUp.jsx";
import { useThemeStore } from "../store/useThemeStore";
import { Helmet } from "react-helmet-async";

const SignUpPage = () => {
  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    fullName: "",
    username: "", // Will be auto-generated from fullName
    role: "normal", // Default role
  });

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Function to generate username from full name
  const generateUsernameFromName = (name) => {
    if (!name) return "";
    // Remove spaces, special chars, convert to lowercase, add random 3-digit number
    const cleanName = name.replace(/[^a-zA-Z]/g, "");
    const randomNum = Math.floor(100 + Math.random() * 900); // 3-digit number
    const username = `${cleanName}${randomNum}`.toLowerCase();
    // Truncate to max 20 characters (reasonable limit)
    return username.length > 20 ? username.substring(0, 20) : username;
  };

  // Function to truncate username for display
  const truncateUsername = (username, maxLength = 20) => {
    if (!username) return "";
    return username.length > maxLength
      ? `${username.substring(0, maxLength)}...`
      : username;
  };

  // Auto-generate username when fullName changes
  useEffect(() => {
    if (signupData.fullName) {
      const generatedUsername = generateUsernameFromName(signupData.fullName);
      setSignupData((prev) => ({ ...prev, username: generatedUsername }));
    }
  }, [signupData.fullName]);

  const SERVICE_ID = "service_y948zbh";
  const TEMPLATE_ID = "template_cmwny1k";
  const PUBLIC_KEY = "ZZ8_It-Lgh_UyXn65";

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000);
  };
  const sendOTP = async (email, otp) => {
    const templateParams = {
      to_email: email,
      otp: otp,
      full_name: signupData.username,
    };

    try {
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
      toast.success("OTP sent successfully to your mail.");
    } catch (error) {
      console.error("EmailJS Error:", error);
      throw new Error("Failed to send OTP to your mail.");
    }
  };

  const { isPending, error: _error, signupMutation } = useSignUp();
  const handleSignup = async (e) => {
    e.preventDefault();

    // Validate password length before sending request
    if (signupData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    // Validate username length
    if (signupData.username.length > 20) {
      toast.error("Username is too long. Please use a shorter name.");
      return;
    }

    // Validate full name length
    if (signupData.fullName.length > 50) {
      toast.error("Full name is too long. Please use a shorter name.");
      return;
    }

    setIsLoading(true);

    try {
      await new Promise((resolve, reject) => {
        signupMutation(signupData, {
          onSuccess: () => resolve(),
          onError: (err) => reject(err),
        });
      });

      const otp = generateOTP();
      localStorage.setItem("signup_otp", otp);
      localStorage.setItem("signup_email", signupData.email);

      await sendOTP(signupData.email, otp);
      navigate("/verify-otp");
    } catch (err) {
      // Only show one toast for any error
      const errorMessage =
        err?.response?.data?.message || err.message || "Signup failed";

      // Check for common errors and format message
      if (errorMessage.includes("E11000") && errorMessage.includes("email")) {
        toast.error(
          "Email already exists. Please use a different email address."
        );
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };
  const { theme } = useThemeStore();
  return (
    <div className="flex h-screen">
      {" "}
      <Helmet>
        <title>Signup | Campus Founders</title>
        <meta
          name="description"
          content="Join Campus Founders - Where student founders meet investors and build the next generation of startups."
        />
      </Helmet>
      <div
        className="w-full flex items-center justify-center p-4 sm:p-6 md:p-8"
        data-theme={theme}
      >
        <div className="border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden">
          {/* LEFT - Form */}
          <div className="w-full lg:w-1/2 p-4 sm:p-8 flex flex-col">
            <div className="mb-4 flex items-center justify-start gap-2">
              <Atom className="size-9 text-primary" />
              <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
                Campus Founders
              </span>
            </div>

            <div className="w-full">
              <form onSubmit={handleSignup}>
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-mono">Create an Account</h2>
                    <p className="text-sm opacity-70">
                      Join founders, investors and innovators shaping the future
                    </p>
                  </div>{" "}
                  <div className="space-y-3">
                    {/* I am a... and Full Name in same line for desktop */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-control w-full">
                        <label className="label">
                          <span className="label-text">You are</span>
                        </label>
                        <select
                          className="select select-bordered w-full"
                          value={signupData.role}
                          onChange={(e) =>
                            setSignupData({
                              ...signupData,
                              role: e.target.value,
                            })
                          }
                        >
                          <option value="normal">Normal User</option>
                          <option value="student">Student Founder</option>
                          <option value="investor">Investor</option>
                        </select>
                        <p className="text-xs opacity-70 mt-1">
                          {signupData.role === "student" && "Create and manage your startup"}
                          {signupData.role === "investor" && "Connect with student founders"}
                          {signupData.role === "normal" && "Browse, upvote, and review startups"}
                        </p>
                      </div>

                      <div className="form-control w-full">
                        <label className="label">
                          <span className="label-text">Full Name</span>
                        </label>
                        <input
                          type="text"
                          placeholder="John Doe"
                          className="input input-bordered w-full placeholder:opacity-40"
                          value={signupData.fullName}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Limit full name to 50 characters
                            if (value.length <= 50) {
                              setSignupData({
                                ...signupData,
                                fullName: value,
                              });
                            }
                          }}
                          maxLength={50}
                          required
                        />
                        <p className="text-xs opacity-70 mt-1">
                          Your username will be: @{truncateUsername(signupData.username || "johndoe123", 20)}
                          {signupData.username && signupData.username.length > 20 && (
                            <span className="text-warning ml-1">(truncated)</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="form-control w-full">
                      <label className="label">
                        <span className="label-text">Email</span>
                      </label>
                      <input
                        type="email"
                        placeholder="yourname@gmail.com"
                        className="input input-bordered w-full placeholder:opacity-40"
                        value={signupData.email}
                        onChange={(e) =>
                          setSignupData({
                            ...signupData,
                            email: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="form-control w-full">
                      <label className="label">
                        <span className="label-text">Password</span>
                      </label>
                      <input
                        type="password"
                        placeholder="∗∗∗∗∗∗"
                        className="input input-bordered w-full placeholder:opacity-40"
                        value={signupData.password}
                        onChange={(e) =>
                          setSignupData({
                            ...signupData,
                            password: e.target.value,
                          })
                        }
                        required
                      />
                      <p className="text-xs opacity-70 mt-1">
                        Password must be at least 6 characters long
                      </p>
                    </div>

                    <div className="form-control">
                      <label className="label cursor-pointer justify-start gap-2">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm"
                          required
                        />
                        <span className="text-xs leading-tight">
                          I agree to the{" "}
                          <span className="text-primary hover:underline">
                            terms of service
                          </span>{" "}
                          and{" "}
                          <span className="text-primary hover:underline">
                            privacy policy
                          </span>
                        </span>
                      </label>
                    </div>
                  </div>
                  <button
                    className="btn btn-primary w-full"
                    type="submit"
                    disabled={isLoading || isPending}
                  >
                    {isLoading || isPending ? (
                      <>
                        <span className="loading loading-spinner loading-xs font-mono"></span>
                        Sending OTP...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                  <div className="text-center mt-4">
                    <p className="text-sm">
                      Already have an account?{" "}
                      <Link
                        to="/login"
                        className="text-primary hover:underline"
                      >
                        Sign in
                      </Link>
                    </p>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* RIGHT - Image and info */}
          <div className="hidden lg:flex w-full lg:w-1/2 bg-primary/10 items-center justify-center">
            <div className="max-w-md p-8">
              <div className="relative aspect-square max-w-sm mx-auto">
                <img
                  src="/signup.png"
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
    </div>
  );
};

export default SignUpPage;
