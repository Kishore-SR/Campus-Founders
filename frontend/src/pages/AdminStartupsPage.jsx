import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllStartups, approveStartup, rejectStartup } from "../lib/admin-api";
import { Helmet } from "react-helmet-async";
import { useThemeStore } from "../store/useThemeStore";
import { CheckCircle, XCircle, Clock, ExternalLink, Users, Eye, X } from "lucide-react";
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
  const [viewModal, setViewModal] = useState({
    isOpen: false,
    startup: null,
  });

  const { data: response, isLoading } = useQuery({
    queryKey: ["adminStartups", activeTab],
    queryFn: () => getAllStartups({ status: activeTab === "all" ? undefined : activeTab }),
  });

  const startups = response?.startups || [];
  const _counts = response?.counts || {};

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {startups.length === 0 ? (
            <div className="card bg-base-200 md:col-span-2">
              <div className="card-body text-center">
                <p className="opacity-70">No startups found</p>
              </div>
            </div>
          ) : (
            startups.map((startup) => (
              <div key={startup._id} className="card bg-base-200 shadow-xl">
                <div className="card-body p-4">
                  <div className="flex flex-col gap-4">
                    {/* Startup Logo and Header */}
                    <div className="flex items-start gap-4">
                      <div className="avatar">
                        <div className="w-16 h-16 rounded-lg">
                          {startup.logo && startup.logo.trim() ? (
                            <img src={startup.logo} alt={startup.name} />
                          ) : (
                            <div className="bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xl font-bold text-primary-content">
                              {startup.name?.charAt(0) || "S"}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <h2 className="text-lg font-bold line-clamp-1">{startup.name}</h2>
                          <div
                            className={`badge ${startup.status === "approved"
                              ? "badge-success"
                              : startup.status === "rejected"
                                ? "badge-error"
                                : "badge-warning"
                              } badge-sm`}
                          >
                            {startup.status.toUpperCase()}
                          </div>
                        </div>
                        <p className="text-sm opacity-70 line-clamp-1">{startup.tagline}</p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm line-clamp-2">{startup.description}</p>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                      <div className="badge badge-outline badge-sm">{startup.category}</div>
                      <div className="badge badge-outline badge-sm">{startup.stage}</div>
                      <div className="badge badge-outline badge-sm">
                        {startup.upvotesCount || 0} upvotes
                      </div>
                    </div>

                    {/* Owner Info */}
                    <div className="flex items-center gap-2 text-xs opacity-70">
                      <Users className="size-3" />
                      <span className="truncate">
                        {startup.owner?.fullName || startup.owner?.username}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewModal({ isOpen: true, startup })}
                        className="btn btn-outline btn-sm flex-1"
                      >
                        <Eye className="size-4 mr-1" />
                        View More
                      </button>
                      {startup.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(startup._id)}
                            className="btn btn-success btn-sm"
                            disabled={approveMutation.isPending}
                          >
                            <CheckCircle className="size-4" />
                          </button>
                          <button
                            onClick={() => handleReject(startup._id)}
                            className="btn btn-error btn-sm"
                            disabled={rejectMutation.isPending}
                          >
                            <XCircle className="size-4" />
                          </button>
                        </>
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

      {/* View More Modal */}
      {viewModal.isOpen && viewModal.startup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="modal modal-open">
            <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-2xl">Startup Details</h3>
                <button
                  onClick={() => setViewModal({ isOpen: false, startup: null })}
                  className="btn btn-sm btn-circle btn-ghost"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start gap-4">
                  <div className="avatar">
                    <div className="w-24 h-24 rounded-lg">
                      {viewModal.startup.logo && viewModal.startup.logo.trim() ? (
                        <img src={viewModal.startup.logo} alt={viewModal.startup.name} />
                      ) : (
                        <div className="bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-3xl font-bold text-primary-content">
                          {viewModal.startup.name?.charAt(0) || "S"}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">{viewModal.startup.name}</h2>
                    <p className="text-lg opacity-70">{viewModal.startup.tagline}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <div
                        className={`badge ${viewModal.startup.status === "approved"
                          ? "badge-success"
                          : viewModal.startup.status === "rejected"
                            ? "badge-error"
                            : "badge-warning"
                          }`}
                      >
                        {viewModal.startup.status.toUpperCase()}
                      </div>
                      <div className="badge badge-outline">{viewModal.startup.category}</div>
                      <div className="badge badge-outline">{viewModal.startup.stage}</div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm">{viewModal.startup.description}</p>
                </div>

                {/* Owner Info */}
                <div>
                  <h4 className="font-semibold mb-2">Founder</h4>
                  <div className="flex items-center gap-2">
                    <Users className="size-4" />
                    <span>{viewModal.startup.owner?.fullName || viewModal.startup.owner?.username}</span>
                    {viewModal.startup.owner?.email && (
                      <span className="text-sm opacity-70">({viewModal.startup.owner.email})</span>
                    )}
                  </div>
                </div>

                {/* Website */}
                {viewModal.startup.websiteUrl && (
                  <div>
                    <h4 className="font-semibold mb-2">Website</h4>
                    <a
                      href={viewModal.startup.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link link-primary"
                    >
                      <ExternalLink className="size-4 inline mr-1" />
                      {viewModal.startup.websiteUrl}
                    </a>
                  </div>
                )}

                {/* Metrics */}
                {(viewModal.startup.revenue || viewModal.startup.users || viewModal.startup.upvotesCount) && (
                  <div>
                    <h4 className="font-semibold mb-2">Metrics</h4>
                    <div className="grid grid-cols-3 gap-4">
                      {viewModal.startup.revenue && (
                        <div>
                          <div className="text-xs opacity-70">Revenue</div>
                          <div className="font-bold">₹{viewModal.startup.revenue.toLocaleString()}</div>
                        </div>
                      )}
                      {viewModal.startup.users && (
                        <div>
                          <div className="text-xs opacity-70">Users</div>
                          <div className="font-bold">{viewModal.startup.users.toLocaleString()}</div>
                        </div>
                      )}
                      {viewModal.startup.upvotesCount && (
                        <div>
                          <div className="text-xs opacity-70">Upvotes</div>
                          <div className="font-bold">{viewModal.startup.upvotesCount}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Rejection Reason */}
                {viewModal.startup.status === "rejected" && viewModal.startup.rejectionReason && (
                  <div className="alert alert-error">
                    <span>
                      <strong>Rejection Reason:</strong> {viewModal.startup.rejectionReason}
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                {viewModal.startup.status === "pending" && (
                  <div className="flex gap-2 justify-end pt-4 border-t">
                    <button
                      onClick={() => {
                        setViewModal({ isOpen: false, startup: null });
                        handleApprove(viewModal.startup._id);
                      }}
                      className="btn btn-success"
                      disabled={approveMutation.isPending}
                    >
                      <CheckCircle className="size-4 mr-1" />
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setViewModal({ isOpen: false, startup: null });
                        handleReject(viewModal.startup._id);
                      }}
                      className="btn btn-error"
                      disabled={rejectMutation.isPending}
                    >
                      <XCircle className="size-4 mr-1" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStartupsPage;

