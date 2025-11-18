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
        return { label: "🎓 Founder", badge: "badge-accent" };
      case "investor":
        return { label: "💼 Investor", badge: "badge-info" };
      default:
        return { label: "👤 Member", badge: "badge-ghost" };
    }
  };

  const profileInfo = getProfileLabel(friend.role);

  return (
    <div className="card border border-primary/25 bg-base-100 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
      <div className="card-body p-4">
        {/* USER INFO */}
        <div className="flex items-center gap-3 mb-3">
          <div className="avatar size-12">
            <img src={friend.profilePic} alt={`@${friend.username}`} />
          </div>
          <div className="flex-1 flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold truncate font-mono">
              @{friend.username}
            </h3>
            <div className={`badge badge-sm ${profileInfo.badge}`}>
              {profileInfo.label}
            </div>
          </div>
        </div>
        {/* Only show Focus, not Track */}
        {friend.currentFocus && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="badge badge-secondary text-xs">
              {getLanguageFlag(friend.currentFocus)}
              Focus: {friend.currentFocus}
            </span>
          </div>
        )}
        <Link to={`/chat/${friend._id}`} className="btn btn-success btn-sm">
          <MessageSquareIcon className="h-4 w-4 mr-1" />
          Message
        </Link>
      </div>
    </div>
  );
};
export default FriendCard;

export function getLanguageFlag(language) {
  // Return null to remove all flag/icon symbols
  return null;
}
