import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllInvestors, approveInvestor, rejectInvestor } from "../lib/admin-api";
import { Helmet } from "react-helmet-async";
import { useThemeStore } from "../store/useThemeStore";
import {
  Shield,
  ShieldCheck,
  ShieldX,
  Clock,
  Briefcase,
  DollarSign,
  Link as LinkIcon,
  CheckCircle,
  XCircle,
} from "lucide-react";
import PageLoader from "../components/PageLoader";
import ConfirmModal from "../components/ConfirmModal";
import toast from "react-hot-toast";

const AdminInvestorsPage = () => {
  const { theme } = useThemeStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("pending");
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
    action: null,
    showReasonInput: false,
  });

  const { data: response, isLoading } = useQuery({
    queryKey: ["adminInvestors", activeTab],
    queryFn: () =>
      getAllInvestors({
        approvalStatus: activeTab === "all" ? undefined : activeTab,
      }),
  });

  const investors = response?.investors || [];
  const counts = response?.counts || {};

  const approveMutation = useMutation({
    mutationFn: approveInvestor,
    onSuccess: () => {
      toast.success("Investor verified successfully!");
      queryClient.invalidateQueries(["adminInvestors"]);
      setConfirmModal({ ...confirmModal, isOpen: false });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to verify investor");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => rejectInvestor(id, reason),
    onSuccess: () => {
      toast.success("Investor rejected");
      queryClient.invalidateQueries(["adminInvestors"]);
      setConfirmModal({ ...confirmModal, isOpen: false });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to reject investor");
    },
  });

  const handleApprove = (id) => {
    setConfirmModal({
      isOpen: true,
      type: "success",
      title: "Verify Investor",
      message: "Verify this investor? They will be marked as trusted.",
      confirmText: "Verify",
      cancelText: "Cancel",
      showReasonInput: false,
      action: () => approveMutation.mutate(id),
    });
  };

  const handleReject = (id) => {
    setConfirmModal({
      isOpen: true,
      type: "error",
      title: "Reject Investor",
      message: "Reject this investor? They won't be able to connect with founders. Please provide a reason.",
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
    { key: "approved", label: "Verified", icon: ShieldCheck, color: "success" },
    { key: "rejected", label: "Rejected", icon: ShieldX, color: "error" },
    { key: "all", label: "All", icon: Shield, color: "primary" },
  ];

  return (
    <div className="min-h-screen bg-base-100 p-4 sm:p-6 lg:p-8" data-theme={theme}>
      <Helmet>
        <title>Verify Investors | Admin</title>
        <meta name="description" content="Verify investor profiles" />
      </Helmet>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Blockchain-style Header */}
        <div className="card bg-gradient-to-r from-primary to-secondary text-primary-content">
          <div className="card-body">
            <div className="flex items-center gap-4">
              <Shield className="size-12" />
              <div>
                <h1 className="text-3xl font-bold">Investor Verification Portal</h1>
                <p className="opacity-90">Blockchain-verified identity management</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card bg-base-200">
            <div className="card-body">
              <div className="flex items-center gap-3">
                <Clock className="size-8 text-warning flex-shrink-0" />
                <div>
                  <div className="text-2xl font-bold">
                    {counts.pending || investors.filter((i) => i.investorApprovalStatus === "pending").length || 0}
                  </div>
                  <div className="text-sm opacity-70">Awaiting Verification</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-base-200">
            <div className="card-body">
              <div className="flex items-center gap-3">
                <ShieldCheck className="size-8 text-success flex-shrink-0" />
                <div>
                  <div className="text-2xl font-bold">
                    {counts.approved || investors.filter((i) => i.investorApprovalStatus === "approved").length || 0}
                  </div>
                  <div className="text-sm opacity-70">Verified Investors</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-base-200">
            <div className="card-body">
              <div className="flex items-center gap-3">
                <ShieldX className="size-8 text-error flex-shrink-0" />
                <div>
                  <div className="text-2xl font-bold">
                    {counts.rejected || investors.filter((i) => i.investorApprovalStatus === "rejected").length || 0}
                  </div>
                  <div className="text-sm opacity-70">Rejected</div>
                </div>
              </div>
            </div>
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

        {/* Investors List */}
        <div className="grid grid-cols-1 gap-6">
          {investors.length === 0 ? (
            <div className="card bg-base-200">
              <div className="card-body text-center">
                <p className="opacity-70">No investors found</p>
              </div>
            </div>
          ) : (
            investors.map((investor) => (
              <div
                key={investor._id}
                className="card bg-base-200 shadow-xl border-2 border-transparent hover:border-primary transition-all"
              >
                <div className="card-body">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Profile Picture */}
                    <div className="avatar">
                      <div className="w-24 h-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                        {investor.profilePic && investor.profilePic.trim() ? (
                          <img src={investor.profilePic} alt={investor.fullName} />
                        ) : (
                          <div className="bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-bold text-primary-content w-full h-full">
                            {investor.fullName?.charAt(0) || investor.username?.charAt(0) || "I"}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Investor Details */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-2xl font-bold">{investor.fullName}</h2>
                          <p className="text-sm opacity-70">@{investor.username}</p>
                        </div>
                        <div
                          className={`badge ${investor.investorApprovalStatus === "approved"
                            ? "badge-success"
                            : investor.investorApprovalStatus === "rejected"
                              ? "badge-error"
                              : "badge-warning"
                            } badge-lg gap-2`}
                        >
                          {investor.investorApprovalStatus === "approved" ? (
                            <ShieldCheck className="size-4" />
                          ) : investor.investorApprovalStatus === "rejected" ? (
                            <ShieldX className="size-4" />
                          ) : (
                            <Clock className="size-4" />
                          )}
                          {investor.investorApprovalStatus.toUpperCase()}
                        </div>
                      </div>

                      {/* Bio */}
                      {investor.bio && <p className="text-sm">{investor.bio}</p>}

                      {/* Blockchain-style Verification Chain */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-base-300 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Briefcase className="size-5 text-primary" />
                          <div>
                            <div className="text-xs opacity-70">Firm</div>
                            <div className="font-semibold">
                              {investor.firm || "Not provided"}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Shield className="size-5 text-primary" />
                          <div>
                            <div className="text-xs opacity-70">Role</div>
                            <div className="font-semibold">
                              {investor.investorRole || "Not provided"}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <DollarSign className="size-5 text-primary" />
                          <div>
                            <div className="text-xs opacity-70">Ticket Size</div>
                            <div className="font-semibold">
                              {investor.ticketSize || "Not provided"}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <LinkIcon className="size-5 text-primary" />
                          <div>
                            <div className="text-xs opacity-70">LinkedIn</div>
                            {investor.linkedinUrl ? (
                              <a
                                href={investor.linkedinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link link-primary text-sm"
                              >
                                View Profile
                              </a>
                            ) : (
                              <div className="text-sm opacity-50">Not provided</div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Investment Domains */}
                      {investor.investmentDomains?.length > 0 && (
                        <div>
                          <div className="text-sm opacity-70 mb-2">Investment Domains:</div>
                          <div className="flex flex-wrap gap-2">
                            {investor.investmentDomains.map((domain, index) => (
                              <div key={index} className="badge badge-primary">
                                {domain}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Location */}
                      {investor.location && (
                        <div className="text-sm opacity-70">📍 {investor.location}</div>
                      )}

                      {/* Action Buttons */}
                      {investor.investorApprovalStatus === "pending" && (
                        <div className="card-actions justify-end pt-4">
                          <button
                            onClick={() => handleApprove(investor._id)}
                            className="btn btn-success btn-sm"
                            disabled={approveMutation.isPending}
                          >
                            <CheckCircle className="size-4 mr-1" />
                            Verify Investor
                          </button>
                          <button
                            onClick={() => handleReject(investor._id)}
                            className="btn btn-error btn-sm"
                            disabled={rejectMutation.isPending}
                          >
                            <XCircle className="size-4 mr-1" />
                            Reject
                          </button>
                        </div>
                      )}

                      {/* Rejection Reason */}
                      {investor.investorApprovalStatus === "rejected" && investor.investorRejectionReason && (
                        <div className="alert alert-error mt-2">
                          <span className="text-sm">
                            <strong>Rejection Reason:</strong> {investor.investorRejectionReason}
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

export default AdminInvestorsPage;

