import { Link } from "react-router";
import { MessageSquareIcon } from "lucide-react";

const FriendCard = ({ friend }) => {
  // Add a null check to prevent errors with deleted users
  if (!friend || !friend._id || !friend.username || !friend.profilePic) {
    return null;
  }

  // Get profile label based on role
  const getProfileLabel = (role) => {
    // Ensure we have a role value
    const userRole = role || friend.role || "normal";
    switch (userRole) {
      case "student":
        return { label: "🎓 Founder", badgeClass: "badge-accent" };
      case "investor":
        return { label: "💼 Investor", badgeClass: "badge-info" };
      default:
        return { label: "👤 Member", badgeClass: "badge-primary" };
    }
  };

  const profileInfo = getProfileLabel(friend.role);

  return (
    <div className="card border border-primary/25 bg-base-100 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
      <div className="card-body p-4">
        {/* USER INFO */}
        <div className="flex items-center gap-3 mb-3">
          <div className="avatar">
            <div className="w-12 h-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-1 overflow-hidden">
              {friend.profilePic && friend.profilePic.trim() ? (
                <img
                  src={friend.profilePic}
                  alt={friend.fullName || friend.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm w-full h-full">
                  {friend.fullName?.charAt(0) || friend.username?.charAt(0) || "U"}
                </div>
              )}
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold truncate">
              {friend.fullName || friend.username}
            </h3>
          </div>
        </div>
        {/* Role badge and Focus on same line */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <span className={`badge ${profileInfo.badgeClass} text-xs`}>
            {profileInfo.label}
          </span>
          {friend.currentFocus && (
            <span className="badge badge-secondary text-xs">
              {getLanguageFlag(friend.currentFocus)}
              <span className="font-bold">Focus</span>: {friend.currentFocus}
            </span>
          )}
        </div>
        <Link to={`/chat/${friend._id}`} className="btn btn-success btn-sm">
          <MessageSquareIcon className="h-4 w-4 mr-1" />
          Message
        </Link>
      </div>
    </div>
  );
};
export default FriendCard;

// eslint-disable-next-line no-unused-vars
export function getLanguageFlag(_language) {
  // Return null to remove all flag/icon symbols
  return null;
}
