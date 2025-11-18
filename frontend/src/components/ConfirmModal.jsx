import { useState } from "react";
import { X, AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react";

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "info", // info, success, warning, error
  showReasonInput = false,
  reasonPlaceholder = "Enter reason...",
  reasonRequired = false,
  isPending = false,
}) => {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (showReasonInput && reasonRequired && !reason.trim()) {
      return;
    }
    onConfirm(reason);
    setReason(""); // Reset reason after confirm
  };

  const handleClose = () => {
    setReason(""); // Reset reason on close
    onClose();
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="size-12 text-success" />;
      case "warning":
        return <AlertTriangle className="size-12 text-warning" />;
      case "error":
        return <XCircle className="size-12 text-error" />;
      default:
        return <Info className="size-12 text-info" />;
    }
  };

  const getConfirmButtonClass = () => {
    switch (type) {
      case "success":
        return "btn-success";
      case "warning":
        return "btn-warning";
      case "error":
        return "btn-error";
      default:
        return "btn-primary";
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        <button
          onClick={handleClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          disabled={isPending}
        >
          <X className="size-5" />
        </button>

        <div className="flex flex-col items-center text-center space-y-4 py-4">
          {getIcon()}
          <div>
            <h3 className="text-2xl font-bold">{title}</h3>
          </div>
          <p className="opacity-70">{message}</p>

          {showReasonInput && (
            <div className="form-control w-full mt-4">
              <label className="label">
                <span className="label-text">
                  Reason {reasonRequired && <span className="text-error">*</span>}
                </span>
              </label>
              <textarea
                className="textarea textarea-bordered w-full h-24"
                placeholder={reasonPlaceholder}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={isPending}
              />
              {reasonRequired && !reason.trim() && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    Please provide a reason
                  </span>
                </label>
              )}
            </div>
          )}

          <div className="flex gap-3 w-full pt-4">
            <button
              onClick={handleClose}
              className="btn btn-ghost flex-1"
              disabled={isPending}
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              className={`btn ${getConfirmButtonClass()} flex-1`}
              disabled={isPending || (showReasonInput && reasonRequired && !reason.trim())}
            >
              {isPending ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Processing...
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
      <div className="modal-backdrop" onClick={handleClose}></div>
    </div>
  );
};

export default ConfirmModal;

