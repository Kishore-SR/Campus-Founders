import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";
import toast from "react-hot-toast";

import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";

// Only import our custom styles
import "../styles/callPage.css";
import ChatLoader from "../components/ChatLoader";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const CallPage = () => {
  const { id: callId } = useParams();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);

  const { authUser, isLoading } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    const initCall = async () => {
      if (!tokenData?.token || !authUser || !callId) return;

      try {
        console.log("Initializing Stream video client...");

        // Ensure the user object has valid data
        if (!authUser._id || !authUser.username) {
          toast.error("User data is invalid. Please try logging in again.");
          return;
        }

        const user = {
          id: authUser._id,
          name: authUser.fullName || authUser.username,
          image: authUser.profilePic || "",
        };

        const videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user,
          token: tokenData.token,
        });

        const callInstance = videoClient.call("default", callId);

        await callInstance.join({ create: true });

        console.log("Joined call successfully");

        setClient(videoClient);
        setCall(callInstance);
      } catch (error) {
        console.error("Error joining call:", error);
        toast.error("Could not join the call. Please try again.");
      } finally {
        setIsConnecting(false);
      }
    };

    initCall();
  }, [tokenData, authUser, callId]);
  if (isLoading || isConnecting) return <ChatLoader />;

  return (
    <div className="h-screen w-full overflow-hidden">
      <Helmet>
        <title>Video Call | Campus Founders</title>
        <meta
          name="description"
          content="Connect face-to-face with founders and investors on Campus Founders."
        />
      </Helmet>
      {!call ? (
        <ChatLoader />
      ) : (
        <div className="absolute inset-0">
          {client && call ? (
            <StreamVideo client={client}>
              <StreamCall call={call}>
                <CallContent />
              </StreamCall>
            </StreamVideo>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p>
                Could not initialize call. Please refresh or try again later.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CallContent = () => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  const navigate = useNavigate();

  if (callingState === CallingState.LEFT) return navigate("/home");

  return (
    <StreamTheme>
      <SpeakerLayout />
      <CallControls />
    </StreamTheme>
  );
};

export default CallPage;
