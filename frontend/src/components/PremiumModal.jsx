import { useState } from "react";
import { X, CreditCard, CheckCircle } from "lucide-react";
import { purchasePremium } from "../lib/api";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const PremiumModal = ({ onClose }) => {
  const [cardNumber, setCardNumber] = useState("");
  const [cvv, setCvv] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const queryClient = useQueryClient();

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
  };

  const handleExpiryDateChange = (e) => {
    const formatted = formatExpiryDate(e.target.value);
    setExpiryDate(formatted);
  };

  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").substring(0, 3);
    setCvv(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!cardNumber || cardNumber.replace(/\s/g, "").length < 16) {
      toast.error("Please enter a valid card number");
      return;
    }
    if (!expiryDate || expiryDate.length < 5) {
      toast.error("Please enter a valid expiry date");
      return;
    }
    if (!cvv || cvv.length < 3) {
      toast.error("Please enter a valid CVV");
      return;
    }
    if (!cardholderName.trim()) {
      toast.error("Please enter cardholder name");
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Call the API to purchase premium
      const response = await purchasePremium();

      if (response.success) {
        setIsSuccess(true);
        // Invalidate and refetch auth user query to refresh user data immediately
        await queryClient.invalidateQueries({ queryKey: ["authUser"] });
        await queryClient.refetchQueries({ queryKey: ["authUser"] });
        toast.success("Premium subscription activated successfully!");

        // Close modal after 2 seconds
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        toast.error("Failed to activate premium subscription");
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Error purchasing premium:", error);
      toast.error(error.response?.data?.message || "Failed to process payment");
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-base-100 rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-success/20 p-4">
                <CheckCircle className="size-12 text-success" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
            <p className="text-base-content/70 mb-6">
              Your premium subscription has been activated. Enjoy all premium features!
            </p>
            <button
              onClick={onClose}
              className="btn btn-primary w-full"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <CreditCard className="size-6" />
              Purchase Premium
            </h2>
            <p className="text-sm text-base-content/70 mt-1">Premium Plan - ₹999</p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
            disabled={isProcessing}
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">
              <span className="label-text">Cardholder Name</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full placeholder:opacity-40"
              placeholder="John Doe"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              disabled={isProcessing}
              required
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Card Number</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full placeholder:opacity-40"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={handleCardNumberChange}
              maxLength={19}
              disabled={isProcessing}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="label-text">Expiry Date</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full placeholder:opacity-40"
                placeholder="MM/YY"
                value={expiryDate}
                onChange={handleExpiryDateChange}
                maxLength={5}
                disabled={isProcessing}
                required
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">CVV</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full placeholder:opacity-40"
                placeholder="123"
                value={cvv}
                onChange={handleCvvChange}
                maxLength={3}
                disabled={isProcessing}
                required
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost flex-1"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-warning flex-1"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Processing...
                </>
              ) : (
                "Purchase Now"
              )}
            </button>
          </div>
        </form>

        <p className="text-xs text-base-content/50 mt-4 text-center">
          This is a simulated payment. No actual charges will be made.
        </p>
      </div>
    </div>
  );
};

export default PremiumModal;

