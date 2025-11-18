import { useEffect, useState } from "react";
import { LoaderIcon } from "lucide-react";
import { useThemeStore } from "../store/useThemeStore";

const messages = [
  "Loading...",
  "Just a second",
  "Connecting...",
  "Almost ready",
  "Tuning the experience",
  "Loading magic",
  "Please wait",
];

const PageLoader = () => {
  const { theme } = useThemeStore();
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
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      data-theme={theme}
    >
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
};

export default PageLoader;
