import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/axios";
import { io } from "socket.io-client";
import { AnimatedBackground } from "@/components/ui/animated-background";

const socket = io(import.meta.env.VITE_BACKEND_URL);

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
  ],
};

export default function BuddyVideo() {
  const { id: buddyId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});

  const localStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const peerConnectionsRef = useRef({});

  useEffect(() => {
    const initialize = async () => {
      try {
        const [chatRes, userRes] = await Promise.all([
          api.get(`/user/chat/${buddyId}`),
          api.get('/user/details')
        ]);
        const chatData = chatRes.data?.data;
        const userData = userRes.data?.data?.user;
        const chatRoomId = chatData.room._id;

        setCurrentUser(userData);
        setRoomId(chatRoomId);

        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        socket.emit("rtc_join", { roomId: chatRoomId, userId: userData._id }, (response) => {
          if (response.ok) {
            toast({ title: `Joined call for ${chatData.name}` });
            response.peers.forEach(socketId => createPeerConnection(socketId, true, chatRoomId));
          } else {
            toast({ title: "Error", description: `Could not join call: ${response.error}`, variant: "destructive" });
            navigate(-1);
          }
        });

      } catch (error) {
        console.error("Failed to initialize video call:", error);
        toast({ title: "Error", description: "Camera/mic access denied or failed to load data.", variant: "destructive" });
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    initialize();

    socket.on("rtc_peer_joined", ({ socketId, userId }) => {
      toast({ description: `User ${userId} joined the call.` });
      createPeerConnection(socketId, false, roomId);
    });

    socket.on("rtc_offer", handleOffer);
    socket.on("rtc_answer", handleAnswer);
    socket.on("rtc_ice_candidate", handleIceCandidate);
    socket.on("rtc_peer_left", handlePeerLeft);

    return () => {
      if (roomId) {
        socket.emit("rtc_end", { roomId });
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      Object.values(peerConnectionsRef.current).forEach(pc => (pc as RTCPeerConnection).close());

      socket.off("rtc_peer_joined");
      socket.off("rtc_offer");
      socket.off("rtc_answer");
      socket.off("rtc_ice_candidate");
      socket.off("rtc_peer_left");
    };
  }, [navigate, toast, roomId,buddyId]);

  const createPeerConnection = (socketId, isInitiator, currentRoomId) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    localStreamRef.current.getTracks().forEach(track => {
      pc.addTrack(track, localStreamRef.current);
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("rtc_ice_candidate", { roomId: currentRoomId, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStreams(prev => ({ ...prev, [socketId]: event.streams[0] }));
    };

    if (isInitiator) {
      pc.createOffer()
        .then(offer => pc.setLocalDescription(offer))
        .then(() => {
          socket.emit("rtc_offer", { roomId: currentRoomId, sdp: pc.localDescription });
        });
    }

    peerConnectionsRef.current[socketId] = pc;
  };
  
  const handleOffer = async ({ socketId, sdp }) => {
    const pc = peerConnectionsRef.current[socketId];
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("rtc_answer", { roomId, sdp: pc.localDescription });
    }
  };

  const handleAnswer = ({ socketId, sdp }) => {
    const pc = peerConnectionsRef.current[socketId];
    if (pc) {
      pc.setRemoteDescription(new RTCSessionDescription(sdp));
    }
  };

  const handleIceCandidate = ({ socketId, candidate }) => {
    const pc = peerConnectionsRef.current[socketId];
    if (pc) {
      pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
  };
  
  const handlePeerLeft = ({ socketId }: { socketId: string }) => {
    if (peerConnectionsRef.current[socketId]) {
      peerConnectionsRef.current[socketId].close();
      delete peerConnectionsRef.current[socketId];
    }
    setRemoteStreams(prev => {
      const { [socketId]: _, ...rest } = prev;
      return rest;
    });
  };

  const toggleMute = () => {
    localStreamRef.current.getAudioTracks().forEach(track => {
      track.enabled = !track.enabled;
    });
    setIsMuted(prev => !prev);
  };

  const toggleCamera = () => {
    localStreamRef.current.getVideoTracks().forEach(track => {
      track.enabled = !track.enabled;
    });
    setIsCameraOff(prev => !prev);
  };

  const handleLeaveCall = () => {
    navigate(-1);
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-white" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col relative overflow-hidden">
      <AnimatedBackground />
      <div className="flex-grow p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
        <div className="relative bg-black rounded-lg overflow-hidden glass-effect border-border/50">
          <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>
          <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded-md text-sm">
            {currentUser?.name || 'You'} (You)
          </div>
        </div>
        
        {Object.entries(remoteStreams).map(([socketId, stream]) => (
          <div key={socketId} className="relative bg-black rounded-lg overflow-hidden glass-effect border-border/50">
            <video
              ref={video => { if (video) video.srcObject = stream; }}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            ></video>
            <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded-md text-sm">
              Remote User
            </div>
          </div>
        ))}
      </div>

      <div className="bg-background/80 backdrop-blur-sm p-4 relative z-10">
        <div className="max-w-md mx-auto flex items-center justify-center gap-4">
          <Button onClick={toggleMute} variant="outline" size="lg" className="rounded-full h-14 w-14">
            {isMuted ? <MicOff /> : <Mic />}
          </Button>
          <Button onClick={toggleCamera} variant="outline" size="lg" className="rounded-full h-14 w-14">
            {isCameraOff ? <VideoOff /> : <Video />}
          </Button>
          <Button onClick={handleLeaveCall} variant="destructive" size="lg" className="rounded-full h-14 w-14">
            <PhoneOff />
          </Button>
        </div>
      </div>
    </div>
  );
}