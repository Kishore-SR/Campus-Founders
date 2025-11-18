import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateStartupMetrics } from "../lib/startup-api";
import toast from "react-hot-toast";
import { X, Plus, Trash2, TrendingUp, Users as UsersIcon } from "lucide-react";

const MetricsEditModal = ({ isOpen, onClose, startup }) => {
  const queryClient = useQueryClient();
  const [metricsData, setMetricsData] = useState({
    revenue: startup?.revenue || 0,
    users: startup?.users || 0,
  });

  const [roadmapItems, setRoadmapItems] = useState(
    startup?.roadmap || [
      { phase: "Development", progress: 0, startDate: null, endDate: null },
      { phase: "Testing", progress: 0, startDate: null, endDate: null },
      { phase: "Beta Launch", progress: 0, startDate: null, endDate: null },
      { phase: "Full Launch", progress: 0, startDate: null, endDate: null },
    ]
  );

  // Update state when startup changes
  useEffect(() => {
    if (isOpen && startup) {
      setMetricsData({
        revenue: startup.revenue || 0,
        users: startup.users || 0,
      });
      setRoadmapItems(
        startup.roadmap && startup.roadmap.length > 0
          ? startup.roadmap.map((item) => ({
            phase: item.phase || item.title || "",
            progress: item.progress || 0,
            startDate: item.startDate ? new Date(item.startDate) : null,
            endDate: item.endDate ? new Date(item.endDate) : null,
          }))
          : [
            { phase: "Development", progress: 0, startDate: null, endDate: null },
            { phase: "Testing", progress: 0, startDate: null, endDate: null },
            { phase: "Beta Launch", progress: 0, startDate: null, endDate: null },
            { phase: "Full Launch", progress: 0, startDate: null, endDate: null },
          ]
      );
    }
  }, [isOpen, startup]);

  const { mutate: updateMutation, isPending } = useMutation({
    mutationFn: () =>
      updateStartupMetrics({
        ...metricsData,
        roadmap: roadmapItems.map((item) => ({
          title: item.phase || item.title || "",
          progress: item.progress || 0,
          startDate: item.startDate || null,
          endDate: item.endDate || null,
        })),
      }),
    onSuccess: () => {
      toast.success("Metrics updated successfully!");
      queryClient.invalidateQueries(["myStartup"]);
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update metrics");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation();
  };

  const updateRoadmapProgress = (index, progress) => {
    const updated = [...roadmapItems];
    updated[index].progress = parseInt(progress);
    setRoadmapItems(updated);
  };

  const addRoadmapItem = () => {
    setRoadmapItems([...roadmapItems, { phase: "", progress: 0, startDate: null, endDate: null }]);
  };

  const removeRoadmapItem = (index) => {
    setRoadmapItems(roadmapItems.filter((_, i) => i !== index));
  };

  const updateRoadmapPhase = (index, phase) => {
    const updated = [...roadmapItems];
    updated[index].phase = phase;
    setRoadmapItems(updated);
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <button
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        >
          <X className="size-5" />
        </button>

        <h2 className="text-2xl font-bold mb-6">Update Metrics & Progress</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Financial & User Metrics */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Key Metrics</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <TrendingUp className="size-4" />
                    Monthly Revenue (₹)
                  </span>
                </label>
                <input
                  type="number"
                  className="input input-bordered"
                  value={metricsData.revenue}
                  onChange={(e) =>
                    setMetricsData({ ...metricsData, revenue: parseInt(e.target.value) || 0 })
                  }
                  min="0"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2">
                    <UsersIcon className="size-4" />
                    Total Users
                  </span>
                </label>
                <input
                  type="number"
                  className="input input-bordered"
                  value={metricsData.users}
                  onChange={(e) =>
                    setMetricsData({ ...metricsData, users: parseInt(e.target.value) || 0 })
                  }
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Roadmap Progress */}
          <div className="divider">Roadmap Progress</div>
          <div className="space-y-4">
            {roadmapItems.map((item, index) => (
              <div key={index} className="space-y-3 p-3 bg-base-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    className="input input-bordered input-sm flex-1 placeholder:opacity-40"
                    value={item.phase}
                    onChange={(e) => updateRoadmapPhase(index, e.target.value)}
                    placeholder="Phase name (e.g., Development)"
                  />
                  <button
                    type="button"
                    onClick={() => removeRoadmapItem(index)}
                    className="btn btn-sm btn-ghost"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text text-xs">Start Date</span>
                    </label>
                    <input
                      type="date"
                      className="input input-bordered input-sm"
                      value={
                        item.startDate
                          ? new Date(item.startDate).toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) => {
                        const updated = [...roadmapItems];
                        updated[index].startDate = e.target.value
                          ? new Date(e.target.value)
                          : null;
                        setRoadmapItems(updated);
                      }}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text text-xs">End Date</span>
                    </label>
                    <input
                      type="date"
                      className="input input-bordered input-sm"
                      value={
                        item.endDate
                          ? new Date(item.endDate).toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) => {
                        const updated = [...roadmapItems];
                        updated[index].endDate = e.target.value
                          ? new Date(e.target.value)
                          : null;
                        setRoadmapItems(updated);
                      }}
                      min={
                        item.startDate
                          ? new Date(item.startDate).toISOString().split("T")[0]
                          : undefined
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={item.progress}
                    onChange={(e) => updateRoadmapProgress(index, e.target.value)}
                    className="range range-primary flex-1"
                  />
                  <span className="text-sm font-semibold w-12">{item.progress}%</span>
                </div>

                <div className="w-full bg-base-300 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addRoadmapItem}
              className="btn btn-outline btn-sm"
            >
              <Plus className="size-4 mr-1" />
              Add Milestone
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end pt-4">
            <button type="button" onClick={onClose} className="btn btn-ghost">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};

export default MetricsEditModal;

