import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { upsertStartup, submitStartupForApproval } from "../lib/startup-api";
import toast from "react-hot-toast";
import { X, Plus, Trash2 } from "lucide-react";
import { STARTUP_DOMAINS } from "../constants";

const STORAGE_KEY = "startup_form_draft";

const StartupFormModal = ({ isOpen, onClose, existingStartup = null }) => {
  const queryClient = useQueryClient();

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
          },
          newScreenshot: draft.newScreenshot || "",
          newTeamMember: draft.newTeamMember || {
            name: "",
            designation: "",
            linkedinUrl: "",
          },
        };
      } catch (e) {
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
      });
      setNewScreenshot("");
      setNewTeamMember({ name: "", designation: "", linkedinUrl: "" });
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
        } catch (e) {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
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

  const addScreenshot = () => {
    if (newScreenshot.trim()) {
      setFormData({
        ...formData,
        screenshots: [...formData.screenshots, newScreenshot],
      });
      setNewScreenshot("");
    }
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
                  <span className="label-text">Logo URL</span>
                </label>
                <input
                  type="url"
                  className="input input-bordered placeholder:opacity-40"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  placeholder="https://..."
                />
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

          {/* Screenshots */}
          <div className="divider">Screenshots</div>
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="url"
                className="input input-bordered flex-1 placeholder:opacity-40"
                value={newScreenshot}
                onChange={(e) => setNewScreenshot(e.target.value)}
                placeholder="Screenshot URL"
              />
              <button type="button" onClick={addScreenshot} className="btn btn-primary">
                <Plus className="size-5" />
              </button>
            </div>
            {formData.screenshots.map((screenshot, index) => (
              <div key={index} className="flex items-center gap-2 bg-base-200 p-2 rounded">
                <span className="flex-1 truncate text-sm">{screenshot}</span>
                <button
                  type="button"
                  onClick={() => removeScreenshot(index)}
                  className="btn btn-sm btn-ghost"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
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

