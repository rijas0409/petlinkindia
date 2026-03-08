import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2, Mic, MicOff, PhoneOff } from "lucide-react";

declare global {
  interface Window {
    JitsiMeetExternalAPI?: any;
  }
}

const VideoCall = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const jitsiRef = useRef<any>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const matchedVet = (location.state as any)?.matchedVet;
  const doctorName = matchedVet?.name || "Veterinarian";

  const roomName = useMemo(() => {
    const paymentId = (location.state as any)?.paymentId;
    return `petlink-${paymentId || Date.now()}`;
  }, [location.state]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading) setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    let disposed = false;

    const initCall = () => {
      if (!window.JitsiMeetExternalAPI || !containerRef.current || disposed) return;

      const api = new window.JitsiMeetExternalAPI("meet.jit.si", {
        roomName,
        parentNode: containerRef.current,
        width: "100%",
        height: "100%",
        userInfo: { displayName: "Pet Parent" },
        configOverwrite: {
          prejoinPageEnabled: false,
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          disableDeepLinking: true,
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: ["microphone", "camera", "chat", "fullscreen", "hangup"],
          SHOW_CHROME_EXTENSION_BANNER: false,
        },
      });

      api.addEventListener("videoConferenceJoined", () => setIsLoading(false));
      api.addEventListener("readyToClose", () => {
        navigate("/vet/preparing-prescription", { replace: true, state: location.state });
      });

      jitsiRef.current = api;
    };

    if (window.JitsiMeetExternalAPI) {
      initCall();
    } else {
      const script = document.createElement("script");
      script.src = "https://meet.jit.si/external_api.js";
      script.async = true;
      script.onload = initCall;
      document.body.appendChild(script);
    }

    return () => {
      disposed = true;
      if (jitsiRef.current) {
        jitsiRef.current.dispose();
      }
    };
  }, [navigate, roomName, location.state]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleToggleMute = () => {
    if (!jitsiRef.current) return;
    jitsiRef.current.executeCommand("toggleAudio");
    setIsMuted((prev) => !prev);
  };

  const handleEndCall = () => {
    if (jitsiRef.current) {
      jitsiRef.current.executeCommand("hangup");
    }
    navigate("/vet/preparing-prescription", { replace: true, state: location.state });
  };

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-black">
      <div ref={containerRef} className="absolute inset-0" />

      <div className="absolute top-4 left-4 right-4 z-20">
        <div className="bg-black/60 backdrop-blur-md rounded-2xl p-3 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white">{doctorName}</h3>
            <p className="text-xs text-white/70">Live consultation</p>
          </div>
          <div className="bg-white/20 rounded-xl px-3 py-2">
            <span className="text-white font-mono font-semibold">{formatTime(callDuration)}</span>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="absolute inset-0 z-30 bg-black/70 flex items-center justify-center">
          <div className="flex items-center gap-2 text-white">
            <Loader2 className="w-5 h-5 animate-spin" />
            Connecting call...
          </div>
        </div>
      )}

      <div className="absolute bottom-8 left-4 right-4 z-20">
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={handleToggleMute}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isMuted ? "bg-red-500" : "bg-white/20"}`}
          >
            {isMuted ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
          </button>

          <button onClick={handleEndCall} className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
            <PhoneOff className="w-7 h-7 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
