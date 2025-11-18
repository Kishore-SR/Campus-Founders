import { useEffect, useState } from "react";
import { LoaderIcon } from "lucide-react";

const messages = [
  "Loading your chat...",
  "Just a second",
  "Connecting...",
  "Tuning the experience",
  "Almost ready",
  "Setting up servers",
  "Please wait",
];

function ChatLoader() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false); 

      setTimeout(() => {
        setIndex((prev) => (prev + 1) % messages.length);
        setFade(true); 
      }, 300); 
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen flex flex-col items-center justify-center p-4 bg-background">
      <LoaderIcon className="animate-spin size-10 text-primary" />
      <p
        className={`mt-4 text-center text-lg font-mono transition-opacity duration-300 ${
          fade ? "opacity-100" : "opacity-0"
        }`}
      >
        {messages[index]}
      </p>
    </div>
  );
}

export default ChatLoader;
