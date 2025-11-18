import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Crown, Check, Sparkles, Video, MessageSquare, Headphones, TrendingUp, BookOpen } from "lucide-react";
import PremiumModal from "../components/PremiumModal";
import useAuthUser from "../hooks/useAuthUser";

const PremiumPage = () => {
  const { authUser } = useAuthUser();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const freeFeatures = [
    "Basic startup browsing",
    "View investor profiles",
    "Basic connections",
    "View startup details",
  ];

  const premiumFeatures = [
    { icon: MessageSquare, text: "Chat with connections" },
    { icon: Video, text: "Video call feature" },
    { icon: Sparkles, text: "Extended AI chat support" },
    { icon: Headphones, text: "24/7 tech support" },
    { icon: TrendingUp, text: "Startup matching score" },
    { icon: BookOpen, text: "Get access to high quality courses" },
  ];

  return (
    <div className="min-h-screen bg-base-100 p-4 sm:p-6 lg:p-8">
      <Helmet>
        <title>Premium Plans | Campus Founders</title>
        <meta
          name="description"
          content="Upgrade to premium and unlock advanced features on Campus Founders."
        />
      </Helmet>

      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Crown className="size-16 text-warning" fill="currentColor" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-lg text-base-content/70">
            Unlock premium features to enhance your startup journey
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="bg-base-200 rounded-xl p-8 border-2 border-base-300">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Free Mode</h2>
              <div className="text-4xl font-bold mb-1">₹0</div>
              <p className="text-sm text-base-content/70">Forever</p>
              {!authUser?.isPremium && (
                <span className="badge badge-primary badge-lg mt-3">Current Plan</span>
              )}
            </div>

            <ul className="space-y-3 mb-8">
              {freeFeatures.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <Check className="size-5 text-success flex-shrink-0 mt-0.5" />
                  <span className="text-base-content/80">{feature}</span>
                </li>
              ))}
            </ul>

            {!authUser?.isPremium && (
              <button
                className="btn btn-outline w-full"
                disabled
              >
                Current Plan
              </button>
            )}
          </div>

          {/* Premium Plan */}
          <div className="bg-gradient-to-br from-warning/20 to-warning/5 rounded-xl p-8 border-2 border-warning relative overflow-hidden">
            {authUser?.isPremium && (
              <div className="absolute top-4 right-4">
                <span className="badge badge-warning badge-lg">Active</span>
              </div>
            )}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Crown className="size-6 text-warning" fill="currentColor" />
                <h2 className="text-2xl font-bold">Premium</h2>
              </div>
              <div className="text-4xl font-bold mb-1">₹999</div>
              <p className="text-sm text-base-content/70">One-time payment</p>
            </div>

            <ul className="space-y-3 mb-8">
              {premiumFeatures.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <li key={idx} className="flex items-start gap-3">
                    <Icon className="size-5 text-warning flex-shrink-0 mt-0.5" />
                    <span className="text-base-content/80 font-medium">{feature.text}</span>
                  </li>
                );
              })}
            </ul>

            {authUser?.isPremium ? (
              <button className="btn btn-warning w-full" disabled>
                <Crown className="size-5 mr-2" />
                Premium Active
              </button>
            ) : (
              <button
                onClick={() => setShowPurchaseModal(true)}
                className="btn btn-warning w-full"
              >
                Purchase Now
              </button>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <p className="text-sm text-base-content/60">
            All plans include access to our platform. Premium features unlock advanced
            communication and AI-powered tools.
          </p>
        </div>
      </div>

      {showPurchaseModal && (
        <PremiumModal onClose={() => setShowPurchaseModal(false)} />
      )}
    </div>
  );
};

export default PremiumPage;

