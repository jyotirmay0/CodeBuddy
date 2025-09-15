import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import api from "@/axios";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Code, 
  MessageSquare, 
  Calendar, 
  TrendingUp, 
  Star, 
  Target,
  Zap,
  Award,
  Activity,
  Plus,
  ArrowRight,
  Rocket,
  Coffee,
  Bell,
  Settings,
  Search
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState([]);
  const [buddies, setBuddies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    completedProjects: 12,
    activeChats: 8,
    profileStrength: 85,
    weeklyProgress: 67
  });

  useEffect(() => {
    const timer = setTimeout(() => {
    fetchDashboardData();
  }, 200); // give cookies time to attach
  return () => clearTimeout(timer);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const userRes = await api.get('/user/details');
      setUser(userRes.data?.data?.user || userRes.data?.data || null);
      
      try {
        const projectsRes = await api.get('/project/my-projects');
        setProjects(projectsRes.data?.data || []);
      } catch {
        setProjects([]);
      }

      try {
        const buddiesRes = await api.get('/user/buddies');
        setBuddies(buddiesRes.data?.data || []);
      } catch {
        setBuddies([]);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
        <div className="text-center space-y-4 relative z-10">
          <div className="w-16 h-16 gradient-primary rounded-xl animate-pulse mx-auto flex items-center justify-center">
            <Code className="h-8 w-8 text-primary-foreground animate-bounce" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold gradient-text">Loading Dashboard</h2>
            <p className="text-muted-foreground">Preparing your coding journey...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">      
      {/* Header */}
      <div className="relative z-10 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold gradient-text">
                Welcome back, {user?.name || 'Coder'}! 👋
              </h1>
              <p className="text-muted-foreground mt-1">
                Ready to build something amazing today?
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-effect border-border/50 hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
                  <div className="text-2xl font-bold">{projects.length}</div>
                  <p className="text-xs text-green-500 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +2 this week
                  </p>
                </div>
                <div className="h-12 w-12 gradient-primary rounded-lg flex items-center justify-center">
                  <Code className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-border/50 hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Code Buddies</p>
                  <div className="text-2xl font-bold">{buddies.length}</div>
                  <p className="text-xs text-blue-500 flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    5 online now
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-border/50 hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Chats</p>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-yellow-500 flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    3 unread
                  </p>
                </div>
                <div className="h-12 w-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-border/50 hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Profile Score</p>
                  <div className="text-2xl font-bold">85%</div>
                  <Progress value={85} className="mt-1" />
                </div>
                <div className="h-12 w-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Award className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Projects */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass-effect border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Recent Projects
                  </CardTitle>
                  <Link to="/projects">
                    <Button variant="ghost" size="sm">
                      View All <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {projects.length > 0 ? (
                  projects.slice(0, 3).map((project: any, index) => (
                    <div key={project.id || index} className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/20 transition-colors hover-lift">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                          <Code className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{project.title}</h3>
                          <p className="text-sm text-muted-foreground">{project.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={project.status === 'Active' ? 'default' : 'secondary'}>
                          {project.status || 'Active'}
                        </Badge>
                        <Button size="sm" variant="ghost">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No projects yet. Create your first project!</p>
                    <Button className="mt-4 gradient-primary">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Project
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="glass-effect border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button className="h-24 flex-col gradient-primary hover-lift">
                    <Plus className="h-6 w-6 mb-2" />
                    New Project
                  </Button>
                  <Button variant="outline" className="h-24 flex-col hover-lift">
                    <Search className="h-6 w-6 mb-2" />
                    Find Buddies
                  </Button>
                  <Button variant="outline" className="h-24 flex-col hover-lift">
                    <Users className="h-6 w-6 mb-2" />
                    Join Groups
                  </Button>
                  <Button variant="outline" className="h-24 flex-col hover-lift">
                    <MessageSquare className="h-6 w-6 mb-2" />
                    Start Chat
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Buddies */}
            <Card className="glass-effect border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Recent Buddies
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {buddies.length > 0 ? (
                  buddies.slice(0, 4).map((buddy: any, index) => (
                    <div key={buddy.id || index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/20 transition-colors hover-lift">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={buddy.pic} />
                        <AvatarFallback>{buddy.name?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{buddy.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{buddy.bio}</p>
                      </div>
                      <Button size="sm" variant="ghost">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No buddies yet</p>
                  </div>
                )}
                <Link to="/discover">
                  <Button variant="outline" className="w-full hover-lift">
                    Find New Buddies
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Activity Feed */}
            <Card className="glass-effect border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                    <div>
                      <p className="font-medium">Project updated</p>
                      <p className="text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                    <div>
                      <p className="font-medium">New buddy connected</p>
                      <p className="text-muted-foreground">1 day ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                    <div>
                      <p className="font-medium">Profile completed</p>
                      <p className="text-muted-foreground">3 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}