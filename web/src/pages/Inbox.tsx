import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, MessageSquare, Code2, Inbox as InboxIcon, Users, User, Video } from "lucide-react";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { useToast } from "@/hooks/use-toast";
import api from "@/axios";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Inbox() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await api.get('/user/inbox'); 
        setChats(res.data?.data || []);
      } catch (err) {
        toast({ title: "Error", description: "Could not fetch your chats.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
  }, [toast]);

  const handleChatClick = (chat) => {
    if (chat.type === 'project') {
      navigate(`/project/${chat.projectId}/chat`);
    } else {
      navigate(`/buddy/${chat.buddyId}/chat`);
    }
  };

  const handleVideoCallClick = (e, chat) => {
    e.stopPropagation();
    toast({ title: `Starting video call for ${chat.title}...` });
    if (chat.type === 'project') {
      navigate(`/project/${chat.projectId}/video`);
    } else {
      navigate(`/buddy/${chat.buddyId}/video`);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <AnimatedBackground />
      <Navbar />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-3xl mx-auto">
          <Card className="glass-effect border-border/50 animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-3xl gradient-text">
                <MessageSquare /> Inbox
              </CardTitle>
            </CardHeader>
            <CardContent>
              {chats.length > 0 ? (
                <div className="space-y-2">
                  {chats.map(chat => (
                    <div 
                      key={chat.roomId} 
                      onClick={() => handleChatClick(chat)} 
                      className="flex items-center p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer animate-slide-up"
                    >
                      <Avatar className="h-12 w-12 mr-4">
                        <AvatarImage src={chat.buddyAvatar} />
                        <AvatarFallback className="gradient-primary text-primary-foreground">
                          {chat.type === 'project' ? <Code2 /> : chat.title?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <p className="font-semibold truncate text-foreground">{chat.title}</p>
                          {chat.latestMessage?.timestamp && (
                            <p className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatDistanceToNow(new Date(chat.latestMessage.timestamp), { addSuffix: true })}
                            </p>
                          )}
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-sm text-muted-foreground truncate">
                            {chat.latestMessage?.content || "No messages yet"}
                          </p>
                          <div className="flex items-center gap-2">
                            {chat.type === 'project' ? (
                              <Badge variant={chat.type === 'project' ? 'secondary' : 'outline'}>Project</Badge>
                            ) : (
                              <Badge variant={chat.type === 'project' ? 'secondary' : 'outline'}>Buddy</Badge>
                            )}
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 rounded-full hover:bg-primary/10"
                              onClick={(e) => handleVideoCallClick(e, chat)}
                            >
                              <Video className="h-4 w-4 text-primary" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <InboxIcon className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-xl font-semibold">Your inbox is empty</h3>
                  <p className="text-muted-foreground mt-2">Start a conversation or join a project to get started!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}