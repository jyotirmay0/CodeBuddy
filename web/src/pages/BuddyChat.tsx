import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Send, Loader2, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/axios";
import { io } from "socket.io-client";
import { format } from "date-fns";
import { AnimatedBackground } from "@/components/ui/animated-background";

const socket = io(import.meta.env.VITE_BACKEND_URL);

export default function BuddyChat() {
  const { id: buddyId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [buddy, setBuddy] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollAreaRef = useRef(null);
  const [roomId, setRoomId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [chatRes, userRes] = await Promise.all([
          api.get(`/user/chat/${buddyId}`),
          api.get('/user/details')
        ]);
        const chatData = chatRes.data?.data;
        const userData = userRes.data?.data?.user;

        setBuddy(chatData.buddy);
        setCurrentUser(userData);
        setMessages((chatData.room?.messages || []).reverse());
        setRoomId(chatData.room?._id);
        
        socket.emit("join_room", { roomId: chatData.room._id, userId: userData._id });
      } catch (error) {
        toast({ title: "Error", description: "Could not load chat.", variant: "destructive" });
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    socket.on("receive_message", (message) => {
      if (message.roomId === roomId) {
        setMessages((prev) => [message, ...prev]);
      }
    });

    return () => {
      socket.off("receive_message");
    };
  }, [buddyId, navigate, toast, roomId]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !roomId || !currentUser) return;

    socket.emit("send_message", {
      roomId: roomId,
      senderId: currentUser._id,
      content: newMessage,
    });
    setNewMessage("");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <AnimatedBackground/>
      <div className="container mx-auto px-4 py-8 relative z-10">
        <Card className="max-w-4xl mx-auto glass-effect border-border/50">
          <CardHeader className="border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={buddy?.pic} />
                  <AvatarFallback>{buddy?.name?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>Chat with {buddy?.name}</CardTitle>
                  <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                    <User className="h-4 w-4" /> Direct Message
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[60vh] p-6" ref={scrollAreaRef}>
              <div className="space-y-2">
                {messages.map((msg, index) => {
                  const isCurrentUser = msg.sender?._id === currentUser?._id;
                  return (
                    <div key={index} className={`flex items-end gap-3 ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                      {!isCurrentUser && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={msg.sender?.pic} />
                          <AvatarFallback>{msg.sender?.name?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`max-w-xs min-w-36 md:max-w-md py-1 px-3 rounded-lg ${isCurrentUser ? "bg-zinc-900 text-primary-foreground" : "bg-muted"}`}>
                        {!isCurrentUser && <p className="text-xs font-bold mb-1">{msg.sender?.name || 'User'}</p>}
                        <p className={`text-sm ${isCurrentUser ? "text-right" : "text-left"} text-neutral-300`}>{msg.content}</p>
                        <p className={`text-[10px] mt-1 opacity-70 ${isCurrentUser ? "text-right" : "text-left"} text-neutral-300`}>
                          {format(new Date(msg.timestamp), "h:mm a")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
            <div className="p-4 border-t border-border/50">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="bg-background/50"
                />
                <Button type="submit" size="icon" className="gradient-primary animate-glow">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}