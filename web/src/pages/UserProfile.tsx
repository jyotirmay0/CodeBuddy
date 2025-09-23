import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, UserPlus, MapPin, Calendar, Code, Heart, Coffee, Star, ArrowLeft, Users, Loader2, Video, CheckCircle, Github, Linkedin, Twitter, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { AnimatedBackground } from "@/components/ui/animated-background";
import api from "@/axios";

export default function UserProfile() {
  const { id } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      Promise.all([
        fetchUserProfile(),
        checkConnectionStatus()
      ]);
    }
  }, [id]);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get(`/user/buddy-details/${id}`);
      const buddyData = response.data?.data?.user; 
      setUser(buddyData);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      toast({ 
        title: "Failed to load profile", 
        description: "Could not fetch user profile data",
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const checkConnectionStatus = async () => {
    try {
      const response = await api.get('/user/buddies');
      const buddies = response.data?.data?.buddies || [];
      const isAlreadyBuddy = buddies.some(buddy => buddy._id === id);
      setIsConnected(isAlreadyBuddy);
    } catch (error) {
      console.error('Failed to check connection status:', error);
      setIsConnected(false);
    }
  };

  const handleSendBuddyRequest = async () => {
    setActionLoading(true);
    try {
      await api.post(`/user/send-request/${id}`);
      setRequestSent(true);
      toast({ 
        title: "Buddy request sent!",
        description: "Your buddy request has been sent successfully"
      });
    } catch (error) {
      toast({ 
        title: "Failed to send request", 
        description: error.response?.data?.message || "Something went wrong",
        variant: "destructive" 
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartChat = () => {
    toast({ title: "Opening chat..." });
    navigate(`/buddy/${id}/chat`);
  };

  const handleVideoCall = () => {
    toast({ title: "Starting video call..." });
    navigate(`/buddy/${id}/video`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center relative">
        <AnimatedBackground />
        <div className="text-center space-y-4 relative z-10">
          <Loader2 className="h-12 w-12 animate-spin gradient-primary rounded-xl p-2" />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold gradient-text">Loading Profile</h2>
            <p className="text-muted-foreground">Getting user information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center relative">
        <AnimatedBackground />
        <div className="text-center space-y-4 relative z-10">
          <Users className="h-16 w-16 mx-auto text-muted-foreground/50" />
          <h2 className="text-2xl font-bold">Profile Not Found</h2>
          <p className="text-muted-foreground">The user you're looking for doesn't exist.</p>
          <Button onClick={() => navigate(-1)} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const getSocialIcon = (platform) => {
    switch (platform) {
      case 'github': return <Github className="h-4 w-4" />;
      case 'linkedin': return <Linkedin className="h-4 w-4" />;
      case 'twitter': return <Twitter className="h-4 w-4" />;
      default: return <ExternalLink className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <AnimatedBackground />
      
      {/* Hero Section */}
      <section className="relative py-16 px-4 overflow-hidden">
        <div className="container mx-auto max-w-4xl relative z-10">
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

          {/* Profile Header */}
          <Card className="glass-effect border-border/50 mb-8 animate-slide-up">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <Avatar className="h-32 w-32 border-4 border-primary/20">
                  <AvatarImage src={user.pic} />
                  <AvatarFallback className="text-2xl font-bold gradient-primary text-primary-foreground">
                    {user.name?.[0] || user.username?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 text-center md:text-left space-y-4">
                  <div>
                    <h1 className="text-3xl font-bold gradient-text">{user.name || user.username}</h1>
                    <p className="text-muted-foreground">@{user.username}</p>
                  </div>

                  <p className="text-lg leading-relaxed">{user.bio || "Passionate developer and technology enthusiast."}</p>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {user.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {user.location}
                      </div>
                    )}
                    {user.dob && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Joined {format(new Date(user.dob), "MMM yyyy")}
                      </div>
                    )}
                  </div>

                  {/* Social Links */}
                  {user.socials && Object.keys(user.socials).length > 0 && (
                    <div className="flex gap-2">
                      {Object.entries(user.socials).map(([platform, username]) => (
                        username && (
                          <Button
                            key={platform}
                            variant="outline"
                            size="sm"
                            className="hover-lift"
                            onClick={() => {
                              const urls = {
                                github: `https://github.com/${username}`,
                                linkedin: `https://linkedin.com/in/${username}`,
                                twitter: `https://twitter.com/${username}`
                              };
                              window.open(urls[platform] || '#', '_blank');
                            }}
                          >
                            {getSocialIcon(platform)}
                            <span className="ml-2 capitalize">{platform}</span>
                          </Button>
                        )
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    {isConnected ? (
                      <Button variant="outline" className="hover-lift" disabled>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Already Buddies
                      </Button>
                    ) : requestSent ? (
                      <Button variant="outline" className="hover-lift" disabled>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Request Sent
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleSendBuddyRequest}
                        className="gradient-primary animate-glow hover-lift"
                        disabled={actionLoading}
                      >
                        {actionLoading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <UserPlus className="h-4 w-4 mr-2" />
                        )}
                        Add as Buddy
                      </Button>
                    )}
                    
                    <Button variant="outline" onClick={handleStartChat} className="hover-lift">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    
                    <Button variant="outline" onClick={handleVideoCall} className="hover-lift">
                      <Video className="h-4 w-4 mr-2" />
                      Video Call
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Tabs */}
          <Tabs defaultValue="skills" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="skills" className="hover-lift">Skills & Interests</TabsTrigger>
              <TabsTrigger value="projects" className="hover-lift">Projects</TabsTrigger>
              <TabsTrigger value="activity" className="hover-lift">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="skills" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Skills */}
                <Card className="glass-effect border-border/50 animate-slide-up">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {user.skills?.length > 0 ? (
                        user.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="hover-lift">
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-sm">No skills listed</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Interests */}
                <Card className="glass-effect border-border/50 animate-slide-up">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      Interests
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {user.interests?.length > 0 ? (
                        user.interests.map((interest, index) => (
                          <Badge key={index} variant="outline" className="hover-lift">
                            {interest}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-sm">No interests listed</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Hobbies */}
                <Card className="glass-effect border-border/50 animate-slide-up">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Coffee className="h-5 w-5" />
                      Hobbies
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {user.hobbies?.length > 0 ? (
                        user.hobbies.map((hobby, index) => (
                          <Badge key={index} variant="outline" className="hover-lift">
                            {hobby}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-sm">No hobbies listed</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="projects" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {user.projects?.length > 0 ? (
                  user.projects.map((project, index) => (
                    <Card key={index} className="glass-effect border-border/50 hover-lift animate-slide-up">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Code className="h-5 w-5" />
                          {project.name || `Project ${index + 1}`}
                        </CardTitle>
                        <CardDescription>{project.description || "A coding project"}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                          {project.details || "An awesome coding project showcasing various technologies and skills."}
                        </p>
                        {project.skills && (
                          <div className="flex flex-wrap gap-2">
                            {project.skills.map((skill, skillIndex) => (
                              <Badge key={skillIndex} variant="secondary">{skill}</Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="glass-effect border-border/50 col-span-full">
                    <CardContent className="text-center py-12">
                      <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
                      <p className="text-muted-foreground">This user hasn't shared any projects.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <Card className="glass-effect border-border/50 animate-slide-up">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/20 transition-colors">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <div>
                        <p className="font-medium">Profile updated</p>
                        <p className="text-sm text-muted-foreground">Recently active</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/20 transition-colors">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <div>
                        <p className="font-medium">Joined the platform</p>
                        <p className="text-sm text-muted-foreground">
                          {user.dob ? format(new Date(user.dob), "MMM dd, yyyy") : "Some time ago"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}