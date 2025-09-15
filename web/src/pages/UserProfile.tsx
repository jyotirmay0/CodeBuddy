import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, UserPlus, MapPin, Calendar, Code, Heart, Coffee, Star } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import api from "@/axios";

export default function UserProfile() {
  const { id } = useParams();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (id) {
      fetchUserProfile();
    }
  }, [id]);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get(`/user/buddy-details/${id}`);
      const buddyData = response.data?.data?.user; 
      setUser(buddyData);
      // Check if already connected (you'll need to implement this logic)
      setIsConnected(false);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      toast({ title: "Failed to load profile", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSendBuddyRequest = async () => {
    try {
      await api.post('/user/send-request', { receiverId: id });
      toast({ title: "Buddy request sent!" });
    } catch (error: any) {
      toast({ title: "Failed to send request", description: error.response?.data?.message, variant: "destructive" });
    }
  };

  const handleStartChat = () => {
    // Navigate to chat with this user
    toast({ title: "Opening chat..." });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 gradient-primary rounded-lg animate-pulse mx-auto"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Profile Not Found</h2>
          <p className="text-muted-foreground">The user you're looking for doesn't exist.</p>
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

        <div className="container mx-auto max-w-4xl relative z-10">
          {/* Profile Header */}
          <Card className="glass-effect border-border/50 mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <Avatar className="h-32 w-32 border-4 border-primary/20">
                  <AvatarImage src={user.pic} />
                  <AvatarFallback className="text-2xl font-bold">
                    {user.name?.[0] || user.username?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 text-center md:text-left space-y-4">
                  <div>
                    <h1 className="text-3xl font-bold gradient-text">{user.name || user.username}</h1>
                    <p className="text-muted-foreground">@{user.username}</p>
                  </div>

                  <p className="text-lg leading-relaxed">{user.bio || "Full-stack developer passionate about creating amazing experiences."}</p>

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
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      4.8/5 Rating
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {!isConnected ? (
                      <Button 
                        onClick={handleSendBuddyRequest}
                        className="gradient-primary animate-glow hover-lift"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add as Buddy
                      </Button>
                    ) : (
                      <Button variant="outline" className="hover-lift">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Buddies
                      </Button>
                    )}
                    <Button variant="outline" onClick={handleStartChat} className="hover-lift">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
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
                <Card className="glass-effect border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {user.skills?.length > 0 ? (
                        user.skills.map((skill: string, index: number) => (
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
                <Card className="glass-effect border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      Interests
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {user.interests?.length > 0 ? (
                        user.interests.map((interest: string, index: number) => (
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
                <Card className="glass-effect border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Coffee className="h-5 w-5" />
                      Hobbies
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {user.hobbies?.length > 0 ? (
                        user.hobbies.map((hobby: string, index: number) => (
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
                {/* Mock projects - replace with real data */}
                {[1, 2, 3].map((project) => (
                  <Card key={project} className="glass-effect border-border/50 hover-lift">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Code className="h-5 w-5" />
                        Project {project}
                      </CardTitle>
                      <CardDescription>An awesome coding project</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        A full-stack web application built with React, Node.js, and MongoDB.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">React</Badge>
                        <Badge variant="secondary">Node.js</Badge>
                        <Badge variant="secondary">MongoDB</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <Card className="glass-effect border-border/50">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((activity) => (
                      <div key={activity} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/20 transition-colors">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                        <div>
                          <p className="font-medium">Completed project milestone</p>
                          <p className="text-sm text-muted-foreground">2 days ago</p>
                        </div>
                      </div>
                    ))}
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