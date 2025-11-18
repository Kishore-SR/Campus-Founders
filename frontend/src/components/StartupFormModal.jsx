import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { upsertStartup, submitStartupForApproval } from "../lib/startup-api";
import toast from "react-hot-toast";
import { X, Plus, Trash2, Upload } from "lucide-react";
import { STARTUP_DOMAINS } from "../constants";

const STORAGE_KEY = "startup_form_draft";

const StartupFormModal = ({ isOpen, onClose, existingStartup = null }) => {
  const queryClient = useQueryClient();
  const logoFileInputRef = useRef(null);
  const screenshotFileInputRef = useRef(null);

  // Load from localStorage or use existing startup data
  const getInitialState = () => {
    if (existingStartup) {
      // If editing existing startup, use its data and clear draft
      localStorage.removeItem(STORAGE_KEY);
      return {
        formData: {
          name: existingStartup.name || "",
          tagline: existingStartup.tagline || "",
          description: existingStartup.description || "",
          category: existingStartup.category || "",
          stage: existingStartup.stage || "idea",
          logo: existingStartup.logo || "",
          websiteUrl: existingStartup.websiteUrl || "",
          demoUrl: existingStartup.demoUrl || "",
          screenshots: existingStartup.screenshots || [],
          team: existingStartup.team || [],
          mobileNumber: existingStartup.mobileNumber || "",
          companyRegisteredLocation: existingStartup.companyRegisteredLocation || "",
          companyType: existingStartup.companyType || "startup",
          fundingRound: existingStartup.fundingRound || "not funded",
          numberOfEmployees: existingStartup.numberOfEmployees || 0,
          companyContactInfo: existingStartup.companyContactInfo || {
            email: "",
            phone: "",
            address: "",
          },
        },
        newScreenshot: "",
        newTeamMember: {
          name: "",
          designation: "",
          linkedinUrl: "",
        },
      };
    }

    // Try to load draft from localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        return {
          formData: draft.formData || {
            name: "",
            tagline: "",
            description: "",
            category: "",
            stage: "idea",
            logo: "",
            websiteUrl: "",
            demoUrl: "",
            screenshots: [],
            team: [],
            mobileNumber: "",
            companyRegisteredLocation: "",
            companyType: "startup",
            fundingRound: "not funded",
            numberOfEmployees: 0,
            companyContactInfo: {
              email: "",
              phone: "",
              address: "",
            },
          },
          newScreenshot: draft.newScreenshot || "",
          newTeamMember: draft.newTeamMember || {
            name: "",
            designation: "",
            linkedinUrl: "",
          },
        };
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    // Default empty form
    return {
      formData: {
        name: "",
        tagline: "",
        description: "",
        category: "",
        stage: "idea",
        logo: "",
        websiteUrl: "",
        demoUrl: "",
        screenshots: [],
        team: [],
        mobileNumber: "",
        companyRegisteredLocation: "",
        companyType: "startup",
        fundingRound: "not funded",
        numberOfEmployees: 0,
        companyContactInfo: {
          email: "",
          phone: "",
          address: "",
        },
      },
      newScreenshot: "",
      newTeamMember: {
        name: "",
        designation: "",
        linkedinUrl: "",
      },
    };
  };

  const initialState = getInitialState();
  const [formData, setFormData] = useState(initialState.formData);
  const [newScreenshot, setNewScreenshot] = useState(initialState.newScreenshot);
  const [newTeamMember, setNewTeamMember] = useState(initialState.newTeamMember);
  const [draftSaved, setDraftSaved] = useState(false);

  // Update form when existingStartup changes (for editing)
  useEffect(() => {
    if (isOpen && existingStartup) {
      // Clear draft when editing
      localStorage.removeItem(STORAGE_KEY);
      setFormData({
        name: existingStartup.name || "",
        tagline: existingStartup.tagline || "",
        description: existingStartup.description || "",
        category: existingStartup.category || "",
        stage: existingStartup.stage || "idea",
        logo: existingStartup.logo || "",
        websiteUrl: existingStartup.websiteUrl || "",
        demoUrl: existingStartup.demoUrl || "",
        screenshots: existingStartup.screenshots || [],
        team: existingStartup.team || [],
        mobileNumber: existingStartup.mobileNumber || "",
        companyRegisteredLocation: existingStartup.companyRegisteredLocation || "",
        companyType: existingStartup.companyType || "startup",
        fundingRound: existingStartup.fundingRound || "not funded",
        numberOfEmployees: existingStartup.numberOfEmployees || 0,
        companyContactInfo: existingStartup.companyContactInfo || {
          email: "",
          phone: "",
          address: "",
        },
      });
      setNewScreenshot("");
      setNewTeamMember({ name: "", designation: "", linkedinUrl: "" });
      // Reset file inputs
      if (logoFileInputRef.current) logoFileInputRef.current.value = "";
      if (screenshotFileInputRef.current) screenshotFileInputRef.current.value = "";
    }
  }, [isOpen, existingStartup]);

  // Load draft when modal opens and there's no existing startup
  useEffect(() => {
    if (isOpen && !existingStartup) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const draft = JSON.parse(saved);
          if (draft.formData) {
            setFormData(draft.formData);
          }
          if (draft.newScreenshot) {
            setNewScreenshot(draft.newScreenshot);
          }
          if (draft.newTeamMember) {
            setNewTeamMember(draft.newTeamMember);
          }
        } catch {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
      // Reset file inputs when opening modal
      if (logoFileInputRef.current) logoFileInputRef.current.value = "";
      if (screenshotFileInputRef.current) screenshotFileInputRef.current.value = "";
    }
  }, [isOpen, existingStartup]);

  // Save to localStorage whenever formData, newScreenshot, or newTeamMember changes (debounced)
  useEffect(() => {
    if (isOpen && !existingStartup) {
      const timer = setTimeout(() => {
        const draft = {
          formData,
          newScreenshot,
          newTeamMember,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
        setDraftSaved(true);
        // Hide the indicator after 2 seconds
        setTimeout(() => setDraftSaved(false), 2000);
      }, 300); // Reduced debounce for better responsiveness

      return () => clearTimeout(timer);
    }
  }, [formData, newScreenshot, newTeamMember, isOpen, existingStartup]);

  const { mutate: saveMutation, isPending: isSaving } = useMutation({
    mutationFn: upsertStartup,
    onSuccess: () => {
      // Clear draft from localStorage on successful save
      localStorage.removeItem(STORAGE_KEY);
      toast.success("Startup saved successfully!");
      queryClient.invalidateQueries(["myStartup"]);
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to save startup");
    },
  });

  const { mutate: submitMutation, isPending: isSubmitting } = useMutation({
    mutationFn: submitStartupForApproval,
    onSuccess: () => {
      // Clear draft from localStorage on successful submission
      localStorage.removeItem(STORAGE_KEY);
      toast.success("Startup submitted for approval!");
      queryClient.invalidateQueries(["myStartup"]);
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to submit startup");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation(formData);
  };

  const handleSubmitForApproval = () => {
    saveMutation(formData, {
      onSuccess: () => {
        setTimeout(() => submitMutation(), 500);
      },
    });
  };

  const removeScreenshot = (index) => {
    setFormData({
      ...formData,
      screenshots: formData.screenshots.filter((_, i) => i !== index),
    });
  };

  const addTeamMember = () => {
    if (newTeamMember.name.trim()) {
      setFormData({
        ...formData,
        team: [...formData.team, newTeamMember],
      });
      setNewTeamMember({ name: "", designation: "", linkedinUrl: "" });
    }
  };

  const removeTeamMember = (index) => {
    setFormData({
      ...formData,
      team: formData.team.filter((_, i) => i !== index),
    });
  };

  // Helper function to compress image
  const compressImage = (file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
              } else {
                reject(new Error("Failed to compress image"));
              }
            },
            file.type,
            quality
          );
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    // Validate file size (max 10MB before compression)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10MB");
      return;
    }

    try {
      // Compress and convert to base64
      const base64String = await compressImage(file, 1920, 1080, 0.8);
      setFormData({ ...formData, logo: base64String });
      toast.success("Logo uploaded and compressed successfully");
    } catch (error) {
      console.error("Error compressing logo:", error);
      toast.error("Failed to process image. Please try again.");
    }
  };

  const handleScreenshotUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    // Validate file size (max 10MB before compression)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10MB");
      return;
    }

    try {
      // Compress and convert to base64
      const base64String = await compressImage(file, 1920, 1080, 0.8);
      // Automatically add to screenshots list
      setFormData({
        ...formData,
        screenshots: [...formData.screenshots, base64String],
      });
      // Clear file input
      if (screenshotFileInputRef.current) {
        screenshotFileInputRef.current.value = "";
      }
      toast.success("Screenshot uploaded and compressed successfully");
    } catch (error) {
      console.error("Error compressing screenshot:", error);
      toast.error("Failed to process image. Please try again.");
    }
  };

  const handleRemoveLogo = () => {
    setFormData({ ...formData, logo: "" });
    if (logoFileInputRef.current) {
      logoFileInputRef.current.value = "";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        >
          <X className="size-5" />
        </button>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            {existingStartup ? "Edit Startup" : "Create Your Startup"}
          </h2>
          {draftSaved && !existingStartup && (
            <div className="text-xs text-success flex items-center gap-1">
              <span className="size-2 rounded-full bg-success inline-block animate-pulse"></span>
              Draft saved
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Startup Name *</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Tagline * (max 100 chars)</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                maxLength={100}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Description *</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-32"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Category *</span>
                </label>
                <select
                  className="select select-bordered"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="">Select Category</option>
                  {STARTUP_DOMAINS.map((domain) => (
                    <option key={domain} value={domain.toLowerCase()}>
                      {domain}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Stage *</span>
                </label>
                <select
                  className="select select-bordered"
                  value={formData.stage}
                  onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                  required
                >
                  <option value="idea">Idea</option>
                  <option value="prototype">Prototype</option>
                  <option value="mvp">MVP</option>
                  <option value="beta">Beta</option>
                  <option value="launched">Launched</option>
                  <option value="growth">Growth</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <Upload className="size-4" />
                    Logo
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  {formData.logo && (
                    <img
                      src={formData.logo}
                      alt="Logo preview"
                      className="w-12 h-12 object-cover rounded border flex-shrink-0"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  )}
                  <input
                    ref={logoFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="file-input file-input-bordered flex-1"
                  />
                  {formData.logo && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="btn btn-sm btn-ghost flex-shrink-0"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Website URL</span>
                </label>
                <input
                  type="url"
                  className="input input-bordered placeholder:opacity-40"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Demo URL</span>
              </label>
              <input
                type="url"
                className="input input-bordered placeholder:opacity-40"
                value={formData.demoUrl}
                onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Company Registration Details */}
          <div className="divider">Company Registration Details</div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Mobile Number</span>
                </label>
                <input
                  type="tel"
                  className="input input-bordered placeholder:opacity-40"
                  value={formData.mobileNumber}
                  onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                  placeholder="+91 9876543210"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Company Registered Location</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered placeholder:opacity-40"
                  value={formData.companyRegisteredLocation}
                  onChange={(e) => setFormData({ ...formData, companyRegisteredLocation: e.target.value })}
                  placeholder="City, State, Country"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Type of Company</span>
                </label>
                <select
                  className="select select-bordered"
                  value={formData.companyType}
                  onChange={(e) => setFormData({ ...formData, companyType: e.target.value })}
                >
                  <option value="startup">Startup</option>
                  <option value="msme">MSME</option>
                  <option value="llp">LLP (Limited Liability Partnership)</option>
                  <option value="private limited">Private Limited</option>
                  <option value="public limited">Public Limited</option>
                  <option value="partnership">Partnership</option>
                  <option value="sole proprietorship">Sole Proprietorship</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Funding Round</span>
                </label>
                <select
                  className="select select-bordered"
                  value={formData.fundingRound}
                  onChange={(e) => setFormData({ ...formData, fundingRound: e.target.value })}
                >
                  <option value="not funded">Not Funded</option>
                  <option value="bootstrapped">Bootstrapped</option>
                  <option value="pre-seed">Pre-Seed</option>
                  <option value="seed">Seed</option>
                  <option value="series a">Series A</option>
                  <option value="series b">Series B</option>
                  <option value="series c">Series C</option>
                  <option value="series d+">Series D+</option>
                </select>
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Number of Employees (Team Size)</span>
              </label>
              <input
                type="number"
                className="input input-bordered placeholder:opacity-40"
                value={formData.numberOfEmployees}
                onChange={(e) => setFormData({ ...formData, numberOfEmployees: parseInt(e.target.value) || 0 })}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="divider text-sm">Company Contact Information</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Company Email</span>
                </label>
                <input
                  type="email"
                  className="input input-bordered placeholder:opacity-40"
                  value={formData.companyContactInfo?.email || ""}
                  onChange={(e) => setFormData({
                    ...formData,
                    companyContactInfo: {
                      ...formData.companyContactInfo,
                      email: e.target.value,
                    },
                  })}
                  placeholder="contact@company.com"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Company Phone</span>
                </label>
                <input
                  type="tel"
                  className="input input-bordered placeholder:opacity-40"
                  value={formData.companyContactInfo?.phone || ""}
                  onChange={(e) => setFormData({
                    ...formData,
                    companyContactInfo: {
                      ...formData.companyContactInfo,
                      phone: e.target.value,
                    },
                  })}
                  placeholder="+91 9876543210"
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Company Address</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-24 placeholder:opacity-40"
                value={formData.companyContactInfo?.address || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  companyContactInfo: {
                    ...formData.companyContactInfo,
                    address: e.target.value,
                  },
                })}
                placeholder="Full company address"
              />
            </div>
          </div>

          {/* Screenshots */}
          <div className="divider">Screenshots</div>
          <div className="space-y-2">
            <input
              ref={screenshotFileInputRef}
              type="file"
              accept="image/*"
              onChange={handleScreenshotUpload}
              className="file-input file-input-bordered w-full"
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {formData.screenshots.map((screenshot, index) => (
                <div key={index} className="relative group bg-base-200 rounded border overflow-hidden">
                  <img
                    src={screenshot}
                    alt={`Screenshot ${index + 1}`}
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeScreenshot(index)}
                    className="absolute top-1 right-1 btn btn-xs btn-error opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Team Members */}
          <div className="divider">Team Members</div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input
                type="text"
                className="input input-bordered placeholder:opacity-40"
                value={newTeamMember.name}
                onChange={(e) =>
                  setNewTeamMember({ ...newTeamMember, name: e.target.value })
                }
                placeholder="Name"
              />
              <input
                type="text"
                className="input input-bordered placeholder:opacity-40"
                value={newTeamMember.designation}
                onChange={(e) =>
                  setNewTeamMember({ ...newTeamMember, designation: e.target.value })
                }
                placeholder="Designation"
              />
              <div className="flex gap-2">
                <input
                  type="url"
                  className="input input-bordered flex-1 placeholder:opacity-40"
                  value={newTeamMember.linkedinUrl}
                  onChange={(e) =>
                    setNewTeamMember({ ...newTeamMember, linkedinUrl: e.target.value })
                  }
                  placeholder="LinkedIn URL"
                />
                <button type="button" onClick={addTeamMember} className="btn btn-primary">
                  <Plus className="size-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {formData.team.map((member, index) => (
                <div key={index} className="flex items-center gap-2 bg-base-200 p-3 rounded border border-base-content/10">
                  <div className="flex-1">
                    <p className="font-semibold">{member.name}</p>
                    <p className="text-sm opacity-70">{member.designation}</p>
                    {member.linkedinUrl && (
                      <a
                        href={member.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary"
                      >
                        LinkedIn
                      </a>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTeamMember(index)}
                    className="btn btn-sm btn-ghost"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end pt-4">
            <button type="button" onClick={onClose} className="btn btn-ghost">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save as Draft"}
            </button>
            <button
              type="button"
              onClick={handleSubmitForApproval}
              className="btn btn-success"
              disabled={isSaving || isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Save & Submit for Approval"}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};

export default StartupFormModal;

