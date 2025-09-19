import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Code, 
  Users, 
  MessageSquare, 
  Video, 
  Send, 
  Calendar, 
  MapPin, 
  Star,
  UserPlus,
  Github,
  ExternalLink,
  Clock,
  ArrowLeft,
  Settings,
  Trash2,
  UserMinus,
  CheckCircle,
  XCircle,
  Loader2,
  MessageSquareText
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import api from "@/axios";
import { FloatingParticles } from "@/components/ui/floating-particles";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: "Alice", message: "Hey everyone! Just pushed the latest changes to the repo.", time: "2:30 PM", avatar: "/avatars/alice.jpg" },
    { id: 2, user: "Bob", message: "Great work! I'll review the PR shortly.", time: "2:35 PM", avatar: "/avatars/bob.jpg" },
    { id: 3, user: "Charlie", message: "Should we schedule a video call to discuss the UI changes?", time: "2:40 PM", avatar: "/avatars/charlie.jpg" },
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (id) {
        fetchProjectDetails();
        fetchCurrentUser();
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [id]);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/user/details');
      setCurrentUser(response.data?.data?.user || response.data?.data);
    } catch (error) {
      console.error('Failed to fetch current user:', error);
    }
  };

  const fetchProjectDetails = async () => {
    try {
      const response = await api.get(`/project/${id}`);
      setProject(response.data?.data);
    } catch (error: any) {
      console.error('Failed to fetch project details:', error);
      toast({ 
        title: "Failed to load project", 
        description: error.response?.data?.message || "Project not found",
        variant: "destructive" 
      });
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinProject = async () => {
    if (!id) return;
    setActionLoading("join");
    try {
      await api.post(`/project/${id}/request`);
      toast({ title: "Join request sent successfully!" });
      fetchProjectDetails(); // Refresh to show updated requests
    } catch (error: any) {
      toast({ 
        title: "Failed to send request", 
        description: error.response?.data?.message || "Please try again",
        variant: "destructive" 
      });
    } finally {
      setActionLoading("");
    }
  };

  const handleAcceptRequest = async (userId: string) => {
    if (!id) return;
    setActionLoading(`accept-${userId}`);
    try {
      await api.put(`/project/${id}/accept/${userId}`);
      toast({ title: "Request accepted!" });
      fetchProjectDetails(); // Refresh data
    } catch (error: any) {
      toast({
        title: "Failed to accept request",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setActionLoading("");
    }
  };

  const handleRejectRequest = async (userId: string) => {
    if (!id) return;
    setActionLoading(`reject-${userId}`);
    try {
      await api.delete(`/project/${id}/reject/${userId}`);
      toast({ title: "Request rejected" });
      fetchProjectDetails(); // Refresh data
    } catch (error: any) {
      toast({
        title: "Failed to reject request",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setActionLoading("");
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!id || !confirm("Are you sure you want to remove this member?")) return;
    setActionLoading(`remove-${userId}`);
    try {
      await api.delete(`/project/${id}/remove/${userId}`);
      toast({ title: "Member removed successfully" });
      fetchProjectDetails(); // Refresh data
    } catch (error: any) {
      toast({
        title: "Failed to remove member",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setActionLoading("");
    }
  };

  const handleLeaveProject = async () => {
    if (!id || !confirm("Are you sure you want to leave this project?")) return;
    setActionLoading("leave");
    try {
      await api.patch(`/project/${id}/leave`);
      toast({ title: "Left project successfully" });
      navigate('/projects');
    } catch (error: any) {
      toast({
        title: "Failed to leave project",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setActionLoading("");
    }
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    
    const newMessage = {
      id: Date.now(),
      user: "You",
      message: chatMessage,
      time: format(new Date(), "h:mm a"),
      avatar: "/avatars/you.jpg"
    };
    
    setChatMessages([...chatMessages, newMessage]);
    setChatMessage("");
  };

  const handleStartVideoCall = () => {
    toast({ title: "Starting video call..." });
    navigate(`/project/${id}/video`);
  };
  const handleEnterchat = () => {
    toast({ title: "Opening chat history" });
    navigate(`/project/${id}/chat`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
        <FloatingParticles />
        <div className="text-center space-y-4 relative z-10">
          <div className="w-16 h-16 gradient-primary rounded-xl animate-pulse mx-auto flex items-center justify-center">
            <Code className="h-8 w-8 text-primary-foreground animate-bounce" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold gradient-text">Loading Project</h2>
            <p className="text-muted-foreground">Fetching project details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
        <FloatingParticles />
        <div className="text-center space-y-4 relative z-10">
          <h2 className="text-2xl font-bold">Project Not Found</h2>
          <p className="text-muted-foreground">The project you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/projects')} className="gradient-primary hover:opacity-90 transition-opacity">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  const isOwner = currentUser && project.owner && (currentUser._id === project.owner._id || currentUser.id === project.owner.id);
  const isMember = currentUser && project.members?.some((member: any) => 
    member._id === currentUser._id || member.id === currentUser.id || member === currentUser._id || member === currentUser.id
  );
  const hasRequested = currentUser && project.requests?.some((request: any) => 
    request._id === currentUser._id || request.id === currentUser.id || request === currentUser._id || request === currentUser.id
  );

  return (
    <div className="min-h-screen bg-background">
      <FloatingParticles />
      
      {/* Hero Section */}
      <section className="relative py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 right-1/3 w-64 h-64 rounded-full gradient-primary blur-3xl animate-float" />
          <div className="absolute bottom-1/3 left-1/4 w-48 h-48 rounded-full bg-secondary/30 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="container mx-auto max-w-6xl relative z-10">
          {/* Back Button */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="hover-lift"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>

          {/* Project Header */}
          <Card className="glass-effect border-border/50 mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-4xl font-bold gradient-text mb-2">{project.name || project.title}</h1>
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Created {format(new Date(project.createdAt), "MMM yyyy")}
                        </div>
                        <Badge variant={project.status === 'open' ? 'default' : 'secondary'}>
                          {project.status || 'open'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      {!isOwner && !isMember && (
                        <Button 
                          onClick={handleJoinProject} 
                          disabled={hasRequested || actionLoading === "join"}
                          className="gradient-primary animate-glow hover-lift"
                        >
                          {actionLoading === "join" && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          {hasRequested ? (
                            <>
                              <Clock className="h-4 w-4 mr-2" />
                              Request Sent
                            </>
                          ) : (
                            <>
                              <UserPlus className="h-4 w-4 mr-2" />
                              Join Project
                            </>
                          )}
                        </Button>
                      )}
                      {isMember && !isOwner && (
                        <Button 
                          onClick={handleLeaveProject}
                          disabled={actionLoading === "leave"}
                          variant="destructive"
                        >
                          {actionLoading === "leave" && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          <UserMinus className="h-4 w-4 mr-2" />
                          Leave Project
                        </Button>
                      )}
                      <Button variant="outline" className="hover-lift">
                        <Star className="h-4 w-4 mr-2" />
                        Star
                      </Button>
                    </div>
                  </div>

                  <p className="text-lg leading-relaxed text-muted-foreground">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {project.skills?.map((skill: string, index: number) => (
                      <Badge key={index} variant="secondary" className="hover-lift">
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-4">
                    {project.githubUrl && (
                      <Button variant="outline" size="sm" className="hover-lift" asChild>
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                          <Github className="h-4 w-4 mr-2" />
                          GitHub
                        </a>
                      </Button>
                    )}
                    {project.liveUrl && (
                      <Button variant="outline" size="sm" className="hover-lift" asChild>
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Live Demo
                        </a>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Project Stats */}
                <div className="lg:w-80 space-y-4">
                  <Card className="glass-effect border-border/50">
                    <CardHeader>
                      <CardTitle className="text-lg">Project Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold">{project.members?.length || 0}</div>
                          <p className="text-sm text-muted-foreground">Members</p>
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{project.requests?.length || 0}</div>
                          <p className="text-sm text-muted-foreground">Pending</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Project Details */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs defaultValue="members" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="members" className="hover-lift">Members</TabsTrigger>
                  {isOwner && <TabsTrigger value="requests" className="hover-lift">Requests ({project.requests?.length || 0})</TabsTrigger>}
                  <TabsTrigger value="timeline" className="hover-lift">Timeline</TabsTrigger>
                  <TabsTrigger value="files" className="hover-lift">Files</TabsTrigger>
                </TabsList>

                <TabsContent value="members" className="space-y-4">
                  <Card className="glass-effect border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Team Members
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Owner */}
                      <div className="flex items-center justify-between p-4 rounded-lg border border-primary/20 bg-primary/5">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={project.owner?.avatar} />
                            <AvatarFallback>{project.owner?.name?.[0] || project.owner?.username?.[0] || 'O'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{project.owner?.name || project.owner?.username || 'Project Owner'}</p>
                            <p className="text-sm text-muted-foreground">@{project.owner?.username || 'owner'}</p>
                          </div>
                        </div>
                        <Badge variant="default">Owner</Badge>
                      </div>

                      {/* Members */}
                      {project.members?.map((member: any, index: number) => {
                        const memberData = typeof member === 'string' ? { _id: member, name: 'Member', username: 'member' } : member;
                        const memberId = memberData._id || memberData.id;
                        
                        return (
                          <div key={index} className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/20 transition-colors">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={memberData.avatar} />
                                <AvatarFallback>{memberData.name?.[0] || memberData.username?.[0] || 'M'}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold">{memberData.name || memberData.username || 'Member'}</p>
                                <p className="text-sm text-muted-foreground">@{memberData.username || 'member'}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="ghost">
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                              {isOwner && memberId !== project.owner?._id && (
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => handleRemoveMember(memberId)}
                                  disabled={actionLoading === `remove-${memberId}`}
                                  className="text-red-500 hover:text-red-600"
                                >
                                  {actionLoading === `remove-${memberId}` ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      }) || (
                        <p className="text-muted-foreground text-center py-4">No members yet</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {isOwner && (
                  <TabsContent value="requests" className="space-y-4">
                    <Card className="glass-effect border-border/50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <UserPlus className="h-5 w-5" />
                          Join Requests
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {project.requests?.length > 0 ? (
                          project.requests.map((request: any, index: number) => {
                            const requestData = typeof request === 'string' ? { _id: request, name: 'User', username: 'user' } : request;
                            const requestId = requestData._id || requestData.id;
                            
                            return (
                              <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/20 transition-colors">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-12 w-12">
                                    <AvatarImage src={requestData.avatar} />
                                    <AvatarFallback>{requestData.name?.[0] || requestData.username?.[0] || 'U'}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-semibold">{requestData.name || requestData.username || 'User'}</p>
                                    <p className="text-sm text-muted-foreground">@{requestData.username || 'user'}</p>
                                    <p className="text-xs text-muted-foreground">Wants to join your project</p>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleAcceptRequest(requestId)}
                                    disabled={actionLoading === `accept-${requestId}`}
                                    className="gradient-primary hover:opacity-90"
                                  >
                                    {actionLoading === `accept-${requestId}` ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <CheckCircle className="h-4 w-4" />
                                    )}
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="destructive"
                                    onClick={() => handleRejectRequest(requestId)}
                                    disabled={actionLoading === `reject-${requestId}`}
                                  >
                                    {actionLoading === `reject-${requestId}` ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <XCircle className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No join requests yet</p>
                            <p className="text-sm">Users who request to join your project will appear here</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}

                <TabsContent value="timeline" className="space-y-4">
                  <Card className="glass-effect border-border/50">
                    <CardHeader>
                      <CardTitle>Project Timeline</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { event: "Project created", date: "Jan 15, 2024", user: "John Doe" },
                          { event: "First commit pushed", date: "Jan 16, 2024", user: "Alice Smith" },
                          { event: "UI mockups completed", date: "Jan 20, 2024", user: "Charlie Brown" },
                          { event: "Backend API setup", date: "Jan 25, 2024", user: "Bob Johnson" },
                        ].map((item, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/20 transition-colors">
                            <div className="w-2 h-2 rounded-full bg-primary"></div>
                            <div className="flex-1">
                              <p className="font-medium">{item.event}</p>
                              <p className="text-sm text-muted-foreground">by {item.user} • {item.date}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="files" className="space-y-4">
                  <Card className="glass-effect border-border/50">
                    <CardHeader>
                      <CardTitle>Recent Files</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { name: "App.tsx", size: "2.4 KB", modified: "2 hours ago", user: "Alice Smith" },
                          { name: "api.ts", size: "1.8 KB", modified: "5 hours ago", user: "Bob Johnson" },
                          { name: "styles.css", size: "3.2 KB", modified: "1 day ago", user: "Charlie Brown" },
                        ].map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/20 transition-colors">
                            <div className="flex items-center gap-3">
                              <Code className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{file.name}</p>
                                <p className="text-sm text-muted-foreground">{file.size} • Modified {file.modified} by {file.user}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Column - Chat */}
            <div className="space-y-6">
              <Card className="glass-effect border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Team Chat
                    </span>
                    <Button size="sm" onClick={handleStartVideoCall} className="gradient-primary animate-glow">
                      <Video className="h-4 w-4 mr-2" />
                      Video Call
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-80 px-6">
                    <div className="space-y-4">
                      {chatMessages.map((msg) => (
                        <div key={msg.id} className="flex gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={msg.avatar} />
                            <AvatarFallback>{msg.user[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm">{msg.user}</span>
                              <span className="text-xs text-muted-foreground">{msg.time}</span>
                            </div>
                            <p className="text-sm bg-muted/20 p-3 rounded-lg">{msg.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  <Separator />
                  
                  <div className="p-4">
                    <div className="flex gap-2">
                      <Input
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        placeholder="Type a message..."
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="bg-background/50"
                      />
                      <Button size="icon" onClick={handleSendMessage} className="gradient-primary animate-glow">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-center mb-3">
                  <Button
                    size="sm"
                    onClick={handleEnterchat}
                    className="gradient-accent"
                  >
                    <MessageSquareText className="h-4 w-4 mr-2" />
                    Chat History
                  </Button>
                </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}