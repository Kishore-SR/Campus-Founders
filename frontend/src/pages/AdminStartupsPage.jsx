import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllStartups, approveStartup, rejectStartup } from "../lib/admin-api";
import { Helmet } from "react-helmet-async";
import { useThemeStore } from "../store/useThemeStore";
import { CheckCircle, XCircle, Clock, ExternalLink, Users } from "lucide-react";
import PageLoader from "../components/PageLoader";
import ConfirmModal from "../components/ConfirmModal";
import toast from "react-hot-toast";

const AdminStartupsPage = () => {
  const { theme } = useThemeStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("pending");
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
    action: null, // function to execute on confirm
    showReasonInput: false,
  });

  const { data: response, isLoading } = useQuery({
    queryKey: ["adminStartups", activeTab],
    queryFn: () => getAllStartups({ status: activeTab === "all" ? undefined : activeTab }),
  });

  const startups = response?.startups || [];
  const counts = response?.counts || {};

  const approveMutation = useMutation({
    mutationFn: approveStartup,
    onSuccess: () => {
      toast.success("Startup approved successfully!");
      queryClient.invalidateQueries(["adminStartups"]);
      setConfirmModal({ ...confirmModal, isOpen: false });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to approve startup");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => rejectStartup(id, reason),
    onSuccess: () => {
      toast.success("Startup rejected");
      queryClient.invalidateQueries(["adminStartups"]);
      setConfirmModal({ ...confirmModal, isOpen: false });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to reject startup");
    },
  });

  const handleApprove = (id) => {
    setConfirmModal({
      isOpen: true,
      type: "success",
      title: "Approve Startup",
      message: "Approve this startup? It will be visible to all users.",
      confirmText: "Approve",
      cancelText: "Cancel",
      showReasonInput: false,
      action: () => approveMutation.mutate(id),
    });
  };

  const handleReject = (id) => {
    setConfirmModal({
      isOpen: true,
      type: "error",
      title: "Reject Startup",
      message: "Reject this startup? Please provide a reason for rejection.",
      confirmText: "Reject",
      cancelText: "Cancel",
      showReasonInput: true,
      reasonPlaceholder: "Enter reason for rejection...",
      reasonRequired: true,
      action: (reason) => rejectMutation.mutate({ id, reason }),
    });
  };

  if (isLoading) return <PageLoader />;

  const tabs = [
    { key: "pending", label: "Pending", icon: Clock, color: "warning" },
    { key: "approved", label: "Approved", icon: CheckCircle, color: "success" },
    { key: "rejected", label: "Rejected", icon: XCircle, color: "error" },
    { key: "all", label: "All", icon: null, color: "primary" },
  ];

  return (
    <div className="min-h-screen bg-base-100 p-4 sm:p-6 lg:p-8" data-theme={theme}>
      <Helmet>
        <title>Manage Startups | Admin</title>
        <meta name="description" content="Manage startup approvals" />
      </Helmet>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Manage Startups</h1>
          <div className="badge badge-primary badge-lg">
            {startups.length || 0} startups
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-boxed">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`tab ${activeTab === tab.key ? "tab-active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.icon && <tab.icon className="size-4 mr-1" />}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Startups List */}
        <div className="grid grid-cols-1 gap-6">
          {startups.length === 0 ? (
            <div className="card bg-base-200">
              <div className="card-body text-center">
                <p className="opacity-70">No startups found</p>
              </div>
            </div>
          ) : (
            startups.map((startup) => (
              <div key={startup._id} className="card bg-base-200 shadow-xl">
                <div className="card-body">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Startup Logo */}
                    <div className="avatar">
                      <div className="w-24 h-24 rounded-lg">
                        {startup.logo && startup.logo.trim() ? (
                          <img src={startup.logo} alt={startup.name} />
                        ) : (
                          <div className="bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-bold text-primary-content">
                            {startup.name?.charAt(0) || "S"}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Startup Details */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-2xl font-bold">{startup.name}</h2>
                          <p className="text-lg opacity-70">{startup.tagline}</p>
                        </div>
                        <div
                          className={`badge ${startup.status === "approved"
                            ? "badge-success"
                            : startup.status === "rejected"
                              ? "badge-error"
                              : "badge-warning"
                            } badge-lg`}
                        >
                          {startup.status.toUpperCase()}
                        </div>
                      </div>

                      <p className="line-clamp-2">{startup.description}</p>

                      <div className="flex flex-wrap gap-2">
                        <div className="badge badge-outline">{startup.category}</div>
                        <div className="badge badge-outline">{startup.stage}</div>
                        <div className="badge badge-outline">
                          {startup.upvotesCount || 0} upvotes
                        </div>
                      </div>

                      {/* Owner Info */}
                      <div className="flex items-center gap-2 text-sm opacity-70">
                        <Users className="size-4" />
                        <span>
                          Founder: {startup.owner?.fullName || startup.owner?.username}
                        </span>
                      </div>

                      {/* Links */}
                      {startup.websiteUrl && (
                        <a
                          href={startup.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link link-primary text-sm"
                        >
                          <ExternalLink className="size-3 inline mr-1" />
                          Visit Website
                        </a>
                      )}

                      {/* Action Buttons */}
                      {startup.status === "pending" && (
                        <div className="card-actions justify-end pt-4">
                          <button
                            onClick={() => handleApprove(startup._id)}
                            className="btn btn-success btn-sm"
                            disabled={approveMutation.isPending}
                          >
                            <CheckCircle className="size-4 mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(startup._id)}
                            className="btn btn-error btn-sm"
                            disabled={rejectMutation.isPending}
                          >
                            <XCircle className="size-4 mr-1" />
                            Reject
                          </button>
                        </div>
                      )}

                      {/* Rejection Reason */}
                      {startup.status === "rejected" && startup.rejectionReason && (
                        <div className="alert alert-error mt-2">
                          <span className="text-sm">
                            <strong>Rejection Reason:</strong> {startup.rejectionReason}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={(reason) => {
          if (confirmModal.action) {
            confirmModal.action(reason);
          }
        }}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText || "Confirm"}
        cancelText={confirmModal.cancelText || "Cancel"}
        type={confirmModal.type}
        showReasonInput={confirmModal.showReasonInput}
        reasonPlaceholder={confirmModal.reasonPlaceholder}
        reasonRequired={confirmModal.reasonRequired}
        isPending={approveMutation.isPending || rejectMutation.isPending}
      />
    </div>
  );
};

export default AdminStartupsPage;

