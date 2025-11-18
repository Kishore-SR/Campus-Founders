import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfile } from "../lib/api";
import toast from "react-hot-toast";
import { X, Upload, User, FileText, Building2, Briefcase, DollarSign, Tag, Linkedin, Link as LinkIcon } from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";

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

const EditProfileModal = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const { authUser } = useAuthUser();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: "",
    bio: "",
    profilePic: "",
    // Investor-specific fields
    firm: "",
    investorRole: "",
    ticketSize: "",
    investmentDomains: [],
    linkedinUrl: "",
    previousInvestments: "",
  });

  const [previewImage, setPreviewImage] = useState("");
  const [domainInput, setDomainInput] = useState("");

  // Common investment domains
  const commonDomains = [
    "SaaS", "FinTech", "EdTech", "HealthTech", "E-commerce",
    "AI/ML", "Blockchain", "IoT", "Biotech", "CleanTech",
    "Real Estate", "Food & Beverage", "Travel", "Media", "Other"
  ];

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen && authUser) {
      setFormData({
        fullName: authUser.fullName || "",
        bio: authUser.bio || "",
        profilePic: authUser.profilePic || "",
        // Investor-specific fields
        firm: authUser.firm || "",
        investorRole: authUser.investorRole || "",
        ticketSize: authUser.ticketSize || "",
        investmentDomains: authUser.investmentDomains || [],
        linkedinUrl: authUser.linkedinUrl || "",
        previousInvestments: authUser.previousInvestments || "",
      });
      setPreviewImage(authUser.profilePic || "");
    }
  }, [isOpen, authUser]);

  const { mutate: updateMutation, isPending } = useMutation({
    mutationFn: (profileData) => updateProfile(profileData),
    onSuccess: (data) => {
      try {
        // Update the query cache immediately with the new user data
        if (data && data.user) {
          queryClient.setQueryData(["authUser"], { user: data.user });
        }
        // Invalidate queries to ensure all dependent queries are refetched
        queryClient.invalidateQueries({ queryKey: ["authUser"] });

        toast.success("Profile updated successfully!");
        // Close modal immediately after success
        onClose();
      } catch (error) {
        console.error("Error updating cache:", error);
        // Even if cache update fails, show success and close
        toast.success("Profile updated successfully!");
        queryClient.invalidateQueries({ queryKey: ["authUser"] });
        onClose();
      }
    },
    onError: (error) => {
      console.error("Update profile error:", error);

      // Don't clear token on validation errors - handle them gracefully
      const status = error.response?.status;
      const errorMessage = error.response?.data?.message || error.message || "Failed to update profile";

      // Only show error toast - don't let axios interceptor clear token unnecessarily
      if (status === 401) {
        // Check if it's actually an auth error or just a validation error
        const isValidationError =
          errorMessage.includes("Invalid") ||
          errorMessage.includes("must be") ||
          errorMessage.includes("format") ||
          errorMessage.includes("required");

        if (isValidationError) {
          // It's a validation error, show the message without clearing token
          toast.error(errorMessage);
          return;
        }
      }

      // Show error message for other errors
      toast.error(errorMessage);
    },
  });

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
      setFormData({ ...formData, profilePic: base64String });
      setPreviewImage(base64String);
    };
    reader.onerror = () => {
      toast.error("Failed to read image file");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, profilePic: "" });
    setPreviewImage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAddDomain = () => {
    const domain = domainInput.trim();
    if (domain && !formData.investmentDomains.includes(domain)) {
      setFormData({
        ...formData,
        investmentDomains: [...formData.investmentDomains, domain],
      });
      setDomainInput("");
    }
  };

  const handleRemoveDomain = (domainToRemove) => {
    setFormData({
      ...formData,
      investmentDomains: formData.investmentDomains.filter(
        (domain) => domain !== domainToRemove
      ),
    });
  };

  const handleDomainKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddDomain();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate fullName if provided
    if (formData.fullName && formData.fullName.trim().length < 2) {
      toast.error("Full name must be at least 2 characters");
      return;
    }

    updateMutation(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          disabled={isPending}
        >
          <X className="size-5" />
        </button>

        <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture Upload */}
          <div className="form-control">
            <label className="label">
              <span className="label-text flex items-center gap-2">
                <Upload className="size-4" />
                Profile Picture
              </span>
            </label>
            <div className="flex items-center gap-4">
              <div className="avatar">
                <div className="w-20 h-20 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-2xl w-full h-full">
                      <span className="flex items-center justify-center w-full h-full">
                        {getInitials(formData.fullName || authUser?.fullName || authUser?.username || "U")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file-input file-input-bordered w-full"
                  disabled={isPending}
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
                    Remove Image
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div className="form-control">
            <label className="label">
              <span className="label-text flex items-center gap-2">
                <User className="size-4" />
                Full Name
              </span>
            </label>
            <input
              type="text"
              className="input input-bordered placeholder:opacity-40"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              disabled={isPending}
              maxLength={100}
            />
            <label className="label">
              <span className="label-text-alt opacity-70">
                {formData.fullName.length}/100 characters
              </span>
            </label>
          </div>

          {/* Bio */}
          <div className="form-control">
            <label className="label">
              <span className="label-text flex items-center gap-2">
                <FileText className="size-4" />
                Bio
              </span>
            </label>
            <textarea
              className="textarea textarea-bordered h-32 placeholder:opacity-40"
              placeholder="Tell us about yourself..."
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              disabled={isPending}
              maxLength={500}
            />
            <label className="label">
              <span className="label-text-alt opacity-70">
                {formData.bio.length}/500 characters
              </span>
            </label>
          </div>

          {/* Investor-specific fields */}
          {authUser?.role === "investor" && (
            <>
              <div className="divider">Investor Details</div>

              {/* Firm */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <Building2 className="size-4" />
                    Firm / Company Name
                  </span>
                </label>
                <input
                  type="text"
                  className="input input-bordered placeholder:opacity-40"
                  placeholder="Enter your firm or company name"
                  value={formData.firm}
                  onChange={(e) =>
                    setFormData({ ...formData, firm: e.target.value })
                  }
                  disabled={isPending}
                  maxLength={100}
                />
              </div>

              {/* Investor Role */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <Briefcase className="size-4" />
                    Your Role
                  </span>
                </label>
                <input
                  type="text"
                  className="input input-bordered placeholder:opacity-40"
                  placeholder="e.g., Partner, Principal, Angel Investor"
                  value={formData.investorRole}
                  onChange={(e) =>
                    setFormData({ ...formData, investorRole: e.target.value })
                  }
                  disabled={isPending}
                  maxLength={100}
                />
              </div>

              {/* Ticket Size */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <DollarSign className="size-4" />
                    Ticket Size
                  </span>
                </label>
                <input
                  type="text"
                  className="input input-bordered placeholder:opacity-40"
                  placeholder="e.g., ₹10L - ₹50L, ₹1Cr - ₹5Cr"
                  value={formData.ticketSize}
                  onChange={(e) =>
                    setFormData({ ...formData, ticketSize: e.target.value })
                  }
                  disabled={isPending}
                  maxLength={50}
                />
              </div>

              {/* Investment Domains */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <Tag className="size-4" />
                    Investment Domains
                  </span>
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    className="input input-bordered flex-1 placeholder:opacity-40"
                    placeholder="Add investment domain (e.g., SaaS, FinTech)"
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    onKeyPress={handleDomainKeyPress}
                    disabled={isPending}
                  />
                  <button
                    type="button"
                    onClick={handleAddDomain}
                    className="btn btn-primary"
                    disabled={isPending || !domainInput.trim()}
                  >
                    Add
                  </button>
                </div>
                {/* Quick add buttons */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {commonDomains.map((domain) => (
                    <button
                      key={domain}
                      type="button"
                      onClick={() => {
                        if (!formData.investmentDomains.includes(domain)) {
                          setFormData({
                            ...formData,
                            investmentDomains: [...formData.investmentDomains, domain],
                          });
                        }
                      }}
                      className={`btn btn-xs ${formData.investmentDomains.includes(domain)
                        ? "btn-disabled"
                        : "btn-outline"
                        }`}
                      disabled={
                        isPending || formData.investmentDomains.includes(domain)
                      }
                    >
                      + {domain}
                    </button>
                  ))}
                </div>
                {/* Selected domains */}
                {formData.investmentDomains.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.investmentDomains.map((domain) => (
                      <span
                        key={domain}
                        className="badge badge-primary badge-lg gap-2"
                      >
                        {domain}
                        <button
                          type="button"
                          onClick={() => handleRemoveDomain(domain)}
                          className="btn btn-xs btn-circle btn-ghost"
                          disabled={isPending}
                        >
                          <X className="size-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* LinkedIn URL */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <Linkedin className="size-4" />
                    LinkedIn Profile URL
                  </span>
                </label>
                <input
                  type="url"
                  className="input input-bordered placeholder:opacity-40"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={formData.linkedinUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, linkedinUrl: e.target.value })
                  }
                  disabled={isPending}
                />
              </div>

              {/* Previous Investments */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <LinkIcon className="size-4" />
                    Previous Investments (Drive URL)
                  </span>
                </label>
                <input
                  type="url"
                  className="input input-bordered placeholder:opacity-40"
                  placeholder="https://drive.google.com/... (for analysis)"
                  value={formData.previousInvestments}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      previousInvestments: e.target.value,
                    })
                  }
                  disabled={isPending}
                />
                <label className="label">
                  <span className="label-text-alt opacity-70">
                    Share a Google Drive link with your previous investment portfolio for analysis
                  </span>
                </label>
              </div>
            </>
          )}

          {/* Read-only fields */}
          <div className="alert alert-info">
            <div className="text-sm">
              <strong>Note:</strong> Username and profile type cannot be changed.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};

export default EditProfileModal;

