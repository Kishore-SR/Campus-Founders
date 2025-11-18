import { useState, useRef } from "react";
import { Helmet } from "react-helmet-async";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { completeOnboarding } from "../lib/api.js";
import {
  LoaderIcon,
  MapPinIcon,
  ShipWheelIcon,
  Upload,
  X,
} from "lucide-react";
import { STARTUP_DOMAINS } from "../constants";
import { useThemeStore } from "../store/useThemeStore";

// Get initials from name (first letter of first name + first letter of last name)
const getInitials = (name) => {
  if (!name) return "U";
  const parts = name.trim().split(" ").filter(part => part.length > 0);
  if (parts.length >= 2) {
    const firstInitial = parts[0]?.[0]?.toUpperCase() || "";
    const lastInitial = parts[parts.length - 1]?.[0]?.toUpperCase() || "";
    return (firstInitial + lastInitial) || "U";
  }
  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase() || "U";
};

const OnboardingPage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [formState, setFormState] = useState({
    bio: authUser?.bio || "",
    interestedDomain: authUser?.nativeLanguage || "", // Using nativeLanguage field for interestedDomain
    location: authUser?.location || "",
    profilePic: authUser?.profilePic || "",
    role: authUser?.role || "normal", // Role comes from signup, not editable
  });

  const [previewImage, setPreviewImage] = useState(authUser?.profilePic || "");

  const { mutate: onboardingMutation, isPending } = useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      toast.success("Profile onboarded successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },

    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to complete onboarding");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate that profile pic is provided
    if (!formState.profilePic || !formState.profilePic.trim()) {
      toast.error("Please upload a profile picture");
      return;
    }

    onboardingMutation(formState);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setFormState({ ...formState, profilePic: base64String });
      setPreviewImage(base64String);
    };
    reader.onerror = () => {
      toast.error("Failed to read image file");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFormState({ ...formState, profilePic: "" });
    setPreviewImage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const { theme } = useThemeStore();

  return (
    <div className="min-h-screen bg-base-100 p-4 sm:p-6 lg:p-8">
      {" "}
      <Helmet>
        <title>Complete Profile | Campus Founders</title>
        <meta
          name="description"
          content="Complete your profile on Campus Founders to connect with founders, investors and innovators."
        />
      </Helmet>
      <div className="max-w-3xl mx-auto">
        <div
          className="min-h-screen bg-base-100 flex items-center justify-center p-4"
          data-theme={theme}
        >
          <div className="card bg-base-200 w-full max-w-3xl shadow-xl">
            <div className="card-body p-6 sm:p-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">
                Complete Your Profile
              </h1>

              {/* Role Display (read-only from signup) */}
              <div className="mb-4">
                <div className="badge badge-primary badge-lg">
                  {formState.role === "student" && "🎓 Student Founder"}
                  {formState.role === "investor" && "💼 Investor"}
                  {formState.role === "normal" && "👤 Community Member"}
                </div>
                <p className="text-xs opacity-70 mt-2">
                  {formState.role === "student" && "You can create and manage your startup profile"}
                  {formState.role === "investor" && "Connect with student founders and discover startups"}
                  {formState.role === "normal" && "Browse startups, upvote and review"}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* PROFILE PIC CONTAINER */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text flex items-center gap-2">
                      <Upload className="size-4" />
                      Profile Picture <span className="text-error">*</span>
                    </span>
                  </label>
                  <div className="flex flex-col items-center justify-center space-y-4">
                    {/* IMAGE PREVIEW */}
                    <div className="size-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden">
                      {previewImage ? (
                        <img
                          src={previewImage}
                          alt="Profile Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-3xl w-full h-full">
                          <span className="flex items-center justify-center w-full h-full">
                            {getInitials(authUser?.fullName || authUser?.username || "U")}
                          </span>
                        </div>
                      )}
                    </div>
                    {/* File Upload Input */}
                    <div className="w-full max-w-md">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="file-input file-input-bordered w-full"
                        disabled={isPending}
                        required
                      />
                      <label className="label">
                        <span className="label-text-alt opacity-70">
                          Supported: JPG, PNG, GIF (Max 5MB)
                        </span>
                      </label>
                      {previewImage && (
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="btn btn-sm btn-ghost mt-2"
                          disabled={isPending}
                        >
                          <X className="size-4 mr-1" />
                          Remove Image
                        </button>
                      )}
                    </div>
                  </div>
                  {!previewImage && (
                    <label className="label">
                      <span className="label-text-alt text-error">
                        Profile picture is required
                      </span>
                    </label>
                  )}
                </div>

                {/* USERNAME DISPLAY */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Username</span>
                  </label>
                  <div className="bg-base-100 p-3 rounded-lg border border-base-300">
                    <p className="font-mono font-semibold">
                      @{authUser?.username}
                    </p>
                    <p className="text-xs opacity-70 mt-1">
                      Your unique username cannot be changed
                    </p>
                  </div>
                </div>

                {/* BIO */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Bio</span>
                  </label>
                  <textarea
                    name="bio"
                    value={formState.bio}
                    onChange={(e) =>
                      setFormState({ ...formState, bio: e.target.value })
                    }
                    className="textarea textarea-bordered h-24 placeholder:opacity-40"
                    placeholder={
                      formState.role === "student"
                        ? "Tell us about yourself and your startup vision..."
                        : formState.role === "investor"
                          ? "Share your investment focus and background..."
                          : "Tell us about yourself and your interests..."
                    }
                  />
                </div>

                {/* INTERESTED DOMAIN */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Interested Domain</span>
                  </label>
                  <select
                    name="interestedDomain"
                    value={formState.interestedDomain}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        interestedDomain: e.target.value,
                      })
                    }
                    className="select select-bordered w-full"
                  >
                    <option value="">Select your interested domain</option>
                    {STARTUP_DOMAINS.map((domain) => (
                      <option
                        key={`domain-${domain}`}
                        value={domain.toLowerCase()}
                      >
                        {domain}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs opacity-70 mt-1">
                    {formState.role === "student" && "The domain your startup focuses on"}
                    {formState.role === "investor" && "The domains you're interested in investing"}
                    {formState.role === "normal" && "The startup domains you're interested in"}
                  </p>
                </div>

                {/* LOCATION */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Location</span>
                  </label>
                  <div className="relative">
                    <MapPinIcon className="absolute top-1/2 transform -translate-y-1/2 left-3 size-5 text-base-content opacity-70" />
                    <input
                      type="text"
                      name="location"
                      value={formState.location}
                      onChange={(e) =>
                        setFormState({ ...formState, location: e.target.value })
                      }
                      className="input input-bordered w-full pl-10 placeholder:opacity-40"
                      placeholder={formState.role === "student" ? "City, State (Your University Location)" : "City, State"}
                    />
                  </div>
                </div>

                {/* SUBMIT BUTTON */}

                <button
                  className="btn btn-primary w-full"
                  disabled={isPending}
                  type="submit"
                >
                  {!isPending ? (
                    <>
                      <ShipWheelIcon className="size-5 mr-2" />
                      Complete Onboarding
                    </>
                  ) : (
                    <>
                      <LoaderIcon className="animate-spin size-5 mr-2" />
                      Onboarding...
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default OnboardingPage;
