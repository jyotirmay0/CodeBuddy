import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import api from "@/axios";

export default function ProjectDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: "Alice", message: "Hey everyone! Just pushed the latest changes to the repo.", time: "2:30 PM", avatar: "/avatars/alice.jpg" },
    { id: 2, user: "Bob", message: "Great work! I'll review the PR shortly.", time: "2:35 PM", avatar: "/avatars/bob.jpg" },
    { id: 3, user: "Charlie", message: "Should we schedule a video call to discuss the UI changes?", time: "2:40 PM", avatar: "/avatars/charlie.jpg" },
  ]);

  useEffect(() => {
    if (id) {
      fetchProjectDetails();
    }
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      // Mock project data - replace with actual API call
      const mockProject = {
        id: id,
        title: "CodeBuddy Mobile App",
        description: "A revolutionary mobile application for connecting developers worldwide. Built with React Native, Node.js, and MongoDB.",
        owner: { name: "John Doe", username: "johndoe", avatar: "/avatars/john.jpg" },
        members: [
          { name: "Alice Smith", username: "alicesmith", avatar: "/avatars/alice.jpg", role: "Frontend Developer" },
          { name: "Bob Johnson", username: "bobjohnson", avatar: "/avatars/bob.jpg", role: "Backend Developer" },
          { name: "Charlie Brown", username: "charliebrown", avatar: "/avatars/charlie.jpg", role: "UI/UX Designer" },
        ],
        skills: ["React Native", "Node.js", "MongoDB", "TypeScript", "UI/UX Design"],
        status: "Active",
        createdAt: new Date("2024-01-15"),
        deadline: new Date("2024-06-30"),
        progress: 65,
        githubUrl: "https://github.com/example/codebuddy-mobile",
        liveUrl: "https://codebuddy-app.com",
      };
      setProject(mockProject);
    } catch (error) {
      console.error('Failed to fetch project details:', error);
      toast({ title: "Failed to load project", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinProject = async () => {
    try {
      await api.post('/project/request-join', { projectId: id });
      toast({ title: "Join request sent!" });
    } catch (error: any) {
      toast({ title: "Failed to send request", description: error.response?.data?.message, variant: "destructive" });
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
    toast({ title: "Starting video call...", description: "This feature will be available soon!" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 gradient-primary rounded-lg animate-pulse mx-auto"></div>
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Project Not Found</h2>
          <p className="text-muted-foreground">The project you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 right-1/3 w-64 h-64 rounded-full gradient-primary blur-3xl animate-float" />
          <div className="absolute bottom-1/3 left-1/4 w-48 h-48 rounded-full bg-secondary/30 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="container mx-auto max-w-6xl relative z-10">
          {/* Project Header */}
          <Card className="glass-effect border-border/50 mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-4xl font-bold gradient-text mb-2">{project.title}</h1>
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Created {format(project.createdAt, "MMM yyyy")}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Deadline {format(project.deadline, "MMM dd, yyyy")}
                        </div>
                        <Badge variant={project.status === 'Active' ? 'default' : 'secondary'}>
                          {project.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={handleJoinProject} className="gradient-primary animate-glow hover-lift">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Join Project
                      </Button>
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
                    {project.skills.map((skill: string, index: number) => (
                      <Badge key={index} variant="secondary" className="hover-lift">
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-4">
                    {project.githubUrl && (
                      <Button variant="outline" size="sm" className="hover-lift">
                        <Github className="h-4 w-4 mr-2" />
                        GitHub
                      </Button>
                    )}
                    {project.liveUrl && (
                      <Button variant="outline" size="sm" className="hover-lift">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Live Demo
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
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <div className="w-full bg-muted/20 rounded-full h-2">
                          <div 
                            className="gradient-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold">{project.members.length}</div>
                          <p className="text-sm text-muted-foreground">Members</p>
                        </div>
                        <div>
                          <div className="text-2xl font-bold">47</div>
                          <p className="text-sm text-muted-foreground">Commits</p>
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
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="members" className="hover-lift">Members</TabsTrigger>
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
                            <AvatarImage src={project.owner.avatar} />
                            <AvatarFallback>{project.owner.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{project.owner.name}</p>
                            <p className="text-sm text-muted-foreground">@{project.owner.username}</p>
                          </div>
                        </div>
                        <Badge variant="default">Owner</Badge>
                      </div>

                      {/* Members */}
                      {project.members.map((member: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/20 transition-colors">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={member.avatar} />
                              <AvatarFallback>{member.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">{member.name}</p>
                              <p className="text-sm text-muted-foreground">@{member.username}</p>
                              <p className="text-sm text-primary">{member.role}</p>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

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
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}