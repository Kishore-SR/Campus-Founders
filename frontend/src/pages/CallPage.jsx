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
  const [initError, setInitError] = useState(null);

  const { authUser, isLoading } = useAuthUser();
  const navigate = useNavigate();

  const { data: tokenData, isLoading: tokenLoading, error: tokenError } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser && !!authUser.isPremium, // Only fetch token if premium
    retry: 2,
    retryDelay: 1000,
  });

  // Check premium status - redirect if not premium
  useEffect(() => {
    if (!isLoading && authUser && !authUser.isPremium) {
      toast.error("Premium subscription required for video calls");
      navigate("/premium");
      setIsConnecting(false);
    }
  }, [authUser, isLoading, navigate]);

  // Handle token error
  useEffect(() => {
    if (tokenError) {
      console.error("Token fetch error:", tokenError);
      toast.error("Failed to get authentication token. Please try again.");
      setInitError("Failed to get authentication token");
      setIsConnecting(false);
    }
  }, [tokenError]);

  // Timeout fallback - if loading takes too long, show error
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isConnecting && !tokenLoading && !isLoading) {
        console.warn("Call initialization timeout");
        setInitError("Call initialization is taking too long. Please try again.");
        setIsConnecting(false);
      }
    }, 15000); // 15 second timeout

    return () => clearTimeout(timeout);
  }, [isConnecting, tokenLoading, isLoading]);

  useEffect(() => {
    const initCall = async () => {
      // Wait for all required data
      if (!tokenData || !authUser || !callId || isLoading || tokenLoading) {
        console.log("Waiting for data:", {
          hasToken: !!tokenData,
          hasUser: !!authUser,
          hasCallId: !!callId,
          isLoading,
          tokenLoading
        });
        return;
      }

      // Double check premium
      if (!authUser.isPremium) {
        toast.error("Premium subscription required for video calls");
        navigate("/premium");
        setIsConnecting(false);
        return;
      }

      try {
        console.log("Initializing Stream video client...");
        console.log("Token data:", tokenData);
        console.log("Auth user:", authUser);

        // Ensure the user object has valid data
        if (!authUser._id || !authUser.username) {
          toast.error("User data is invalid. Please try logging in again.");
          setIsConnecting(false);
          return;
        }

        // Extract token - handle both { token: "..." } and direct token string
        const token = typeof tokenData === 'string'
          ? tokenData
          : tokenData?.token || tokenData?.data?.token;

        if (!token) {
          console.error("No valid token found. Token data:", tokenData);
          toast.error("Unable to get authentication token. Please refresh and try again.");
          setIsConnecting(false);
          return;
        }

        // Ensure user ID is a string
        const userId = authUser._id.toString();

        const user = {
          id: userId,
          name: authUser.fullName || authUser.username,
          image: authUser.profilePic || "",
        };

        console.log("Creating StreamVideoClient with user:", user);

        const videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user,
          token: token,
        });

        console.log("Video client created, creating call instance with callId:", callId);
        const callInstance = videoClient.call("default", callId);

        console.log("Joining call...");
        await callInstance.join({ create: true });

        console.log("Joined call successfully");

        setClient(videoClient);
        setCall(callInstance);
        setIsConnecting(false);
      } catch (error) {
        console.error("Error joining call:", error);
        console.error("Error details:", {
          message: error.message,
          response: error.response,
          stack: error.stack
        });

        const errorMessage = error.message || "Please try again.";
        toast.error(`Could not join the call: ${errorMessage}`);
        setInitError(errorMessage);
        setIsConnecting(false);
      }
    };

    if (authUser?.isPremium && !isLoading && !tokenLoading && tokenData) {
      initCall();
    } else if (!isLoading && !tokenLoading && authUser && !authUser.isPremium) {
      setIsConnecting(false);
    } else if (!isLoading && !tokenLoading && tokenError) {
      // Token fetch failed
      setIsConnecting(false);
    } else if (!isLoading && !tokenLoading && !tokenData && authUser?.isPremium) {
      // Token not available but should be
      console.warn("Token not available but user is premium");
      setIsConnecting(false);
    }
  }, [tokenData, authUser, callId, navigate, isLoading, tokenLoading, tokenError]);

  if (isLoading || isConnecting || tokenLoading) return <ChatLoader />;

  // Show error if initialization failed
  if (initError && !call) {
    return (
      <div className="h-screen w-full overflow-hidden flex items-center justify-center bg-base-100">
        <Helmet>
          <title>Video Call Error | Campus Founders</title>
        </Helmet>
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">Unable to Start Call</h2>
          <p className="text-base-content/70 mb-6">{initError}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                setInitError(null);
                setIsConnecting(true);
                window.location.reload();
              }}
              className="btn btn-primary"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate("/connections")}
              className="btn btn-outline"
            >
              Back to Connections
            </button>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <ChatLoader />
            <p className="mt-4 text-base-content/70">Initializing call...</p>
          </div>
        </div>
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
