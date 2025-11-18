import React from "react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-hot-toast";
import { useThemeStore } from "../store/useThemeStore";
import { Helmet } from "react-helmet-async";

const VerifyOTPPage = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedEmail = localStorage.getItem("signup_email");
    if (!storedEmail) {
      toast.error("Unauthorized access to OTP verification page.");
      navigate("/signup");
    } else {
      setEmail(storedEmail);
    }

    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }

    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleInputChange = (index, value) => {
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = () => {
    const enteredOtp = otp.join("");
    const savedOtp = localStorage.getItem("signup_otp");

    if (enteredOtp === savedOtp) {
      localStorage.removeItem("signup_otp");
      localStorage.removeItem("signup_email");
      toast.success("OTP verified successfully.");
      navigate("/onboarding");
    } else {
      toast.error("Invalid OTP. Please try again.");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" + secs : secs}`;
  };

  const { theme } = useThemeStore();
  return (
    <div className="flex h-screen">
      {" "}
      <Helmet>
        <title>Verify Account</title>
        <meta
          name="description"
          content="Verify your account to join the Campus Founders community."
        />
      </Helmet>{" "}
      <div
        className="w-full flex items-center justify-center p-4 sm:p-6 md:p-8"
        data-theme={theme}
      >
        <div className="border border-primary/25 w-full max-w-sm bg-base-100 rounded-xl shadow-lg p-6">
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Verification Code</h2>
            <p className="text-center opacity-70 max-w-sm">
              We've sent a verification code to
              <span className="font-medium text-primary block">{email}</span>
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex justify-center space-x-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-10 h-12 text-center text-lg font-semibold border-2 border-primary/30 bg-base-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm transition"
                />
              ))}
            </div>

            <button
              onClick={handleVerify}
              className="btn btn-primary text-small font-bold font-mono w-4/5 mx-auto block"
            >
              Verify & Proceed
            </button>
          </div>

          <div className="mt-5 text-center">
            <p className="opacity-70 mb-2">
              Time remaining:{" "}
              <span className="font-semibold">{formatTime(timeLeft)}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTPPage;
