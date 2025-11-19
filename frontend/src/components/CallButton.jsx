import { VideoIcon } from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";

function CallButton({ handleVideoCall }) {
  const { authUser } = useAuthUser();

  // TODO: Revert to actual implementation when video call limits are resolved
  const handleDemoCall = () => {
    // Demo video call link - open in new tab with actual username
    const userId = authUser?.username || authUser?.fullName?.replace(/\s+/g, "_") || authUser?._id || "User";
    const demoCallUrl = `https://getstream.io/video/demos/join/JRcWJUMVmWdqGYdRqIr5g?user_id=${encodeURIComponent(userId)}`;
    window.open(demoCallUrl, "_blank");
  };

  return (
    <div className="p-3 border-b flex items-center justify-end max-w-7xl mx-auto w-full absolute top-0">
      {/* Using demo link temporarily */}
      <button onClick={handleDemoCall} className="btn btn-success btn-sm text-white">
        <VideoIcon className="size-6" />
      </button>
      {/* COMMENTED OUT - Actual implementation (to revert later)
      <button onClick={handleVideoCall} className="btn btn-success btn-sm text-white">
        <VideoIcon className="size-6" />
      </button>
      */}
    </div>
  );
}

export default CallButton;