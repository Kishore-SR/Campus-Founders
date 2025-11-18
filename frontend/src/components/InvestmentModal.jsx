import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { X, DollarSign, TrendingUp, CheckCircle } from "lucide-react";

const InvestmentModal = ({ isOpen, onClose, startup, founderName }) => {
  const queryClient = useQueryClient();
  const [investmentData, setInvestmentData] = useState({
    amount: "",
    milestone: "",
    message: "",
    deadlineStartDate: "",
    deadlineEndDate: "",
  });

  const { mutate: investMutation, isPending } = useMutation({
    mutationFn: async (data) => {
      const response = await axiosInstance.post(
        `/investments/${startup._id}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Investment commitment sent!");
      queryClient.invalidateQueries(["investments"]);
      onClose();
      setInvestmentData({
        amount: "",
        milestone: "",
        message: "",
        deadlineStartDate: "",
        deadlineEndDate: "",
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to send investment");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!investmentData.amount || parseFloat(investmentData.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    investMutation(investmentData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-lg">
        <button
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        >
          <X className="size-5" />
        </button>

        <div className="text-center mb-6">
          <div className="avatar mb-4">
            <div className="w-20 h-20 rounded-lg">
              {startup?.logo ? (
                <img src={startup.logo} alt={startup.name} />
              ) : (
                <div className="bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-bold text-primary-content">
                  {startup?.name?.charAt(0)}
                </div>
              )}
            </div>
          </div>
          <h2 className="text-2xl font-bold">{startup?.name}</h2>
          <p className="text-sm opacity-70">Investment Commitment</p>
        </div>

        <div className="alert alert-info mb-4">
          <TrendingUp className="size-5" />
          <span className="text-sm">
            This is a simulated investment platform. Your commitment will be visible
            to the founder.
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Investment Amount</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">₹</span>
              <input
                type="number"
                placeholder="50000"
                className="input input-bordered flex-1 placeholder:opacity-40"
                value={investmentData.amount}
                onChange={(e) =>
                  setInvestmentData({ ...investmentData, amount: e.target.value })
                }
                min="1"
                required
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Linked Milestone (Optional)</span>
            </label>
            <select
              className="select select-bordered"
              value={investmentData.milestone}
              onChange={(e) =>
                setInvestmentData({ ...investmentData, milestone: e.target.value })
              }
            >
              <option value="">Select a milestone</option>
              {startup?.roadmap?.map((item, index) => {
                // Get the actual milestone name - prioritize phase, then title
                const milestoneName = item.phase || item.title;
                if (!milestoneName) return null;
                return (
                  <option key={index} value={milestoneName}>
                    {milestoneName} ({item.progress || 0}%)
                  </option>
                );
              })}
            </select>
            <label className="label">
              <span className="label-text-alt">
                Link your investment to a specific milestone
              </span>
            </label>
          </div>

          {/* Deadline Section */}
          <div className="divider">Milestone Deadline</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Start Date</span>
              </label>
              <input
                type="date"
                className="input input-bordered"
                value={investmentData.deadlineStartDate}
                onChange={(e) =>
                  setInvestmentData({ ...investmentData, deadlineStartDate: e.target.value })
                }
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">End Date *</span>
              </label>
              <input
                type="date"
                className="input input-bordered"
                value={investmentData.deadlineEndDate}
                onChange={(e) =>
                  setInvestmentData({ ...investmentData, deadlineEndDate: e.target.value })
                }
                min={investmentData.deadlineStartDate || undefined}
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Message to Founder</span>
            </label>
            <textarea
              className="textarea textarea-bordered h-24 placeholder:opacity-40"
              placeholder="Share your vision and expectations..."
              value={investmentData.message}
              onChange={(e) =>
                setInvestmentData({ ...investmentData, message: e.target.value })
              }
            />
          </div>

          {/* Founder Info */}
          <div className="card bg-base-200">
            <div className="card-body p-4">
              <p className="text-sm">
                <span className="font-semibold">Founder:</span> {founderName}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Stage:</span>{" "}
                <span className="badge badge-sm">{startup?.stage}</span>
              </p>
              <p className="text-sm">
                <span className="font-semibold">Category:</span>{" "}
                <span className="badge badge-sm badge-primary">
                  {startup?.category}
                </span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end pt-4">
            <button type="button" onClick={onClose} className="btn btn-ghost">
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-success"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="size-5 mr-2" />
                  Commit Investment
                </>
              )}
            </button>
          </div>
        </form>

        <div className="divider text-xs opacity-50 mt-6">Simulation</div>
        <p className="text-xs text-center opacity-70">
          This is a demo platform. No real money will be transferred.
        </p>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};

export default InvestmentModal;

