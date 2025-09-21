import { useEffect, useState } from "react";
import Navbar from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Code2, Users, Calendar, Star, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { useToast } from "@/hooks/use-toast";
import api from "@/axios";
import { Link } from "react-router-dom";
import { FloatingParticles } from "@/components/ui/floating-particles";

const SKILLS = [
  "JavaScript", "Python", "Java", "C++", "HTML", "CSS", "React", "Node.js", "Express.js", "MongoDB","SQL", "TypeScript", "Git", "Docker", "Kubernetes", "AWS", "Azure", "Firebase",
  "UI/UX Design", "Figma", "Sketch", "Adobe XD", "Photoshop", "Illustrator","Communication", "Teamwork", "Leadership", "Problem-solving", "Time management", "Public speaking","Project management", "Agile", "Scrum", "Data Analysis", "Machine Learning", "Deep Learning","Cybersecurity", "Networking", "Linux", "Cloud Computing", "DevOps", "CI/CD","Writing", "Editing", "Blogging", "Marketing", "SEO", "Sales", "Customer Support",
  "Video Editing", "3D Modeling", "Animation", "Game Development", "AR/VR"
];

export default function Projects() {
  const [searchTerm, setSearchTerm] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    requirements: "",
    skills: [] as string[]
  });
  const { toast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProjects();
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/project/open');
      setProjects(response.data?.data || []);
    } catch (error: any) {
      console.error('Failed to fetch projects:', error);
      toast({
        title: "Failed to load projects",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter((project: any) =>
    project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.skills?.some((skill: string) => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleToggleSkill = (skill: string) => {
    setNewProject(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name || !newProject.description) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    setCreating(true);
    try {
      const response = await api.post('/project/', newProject);
      setProjects(prev => [response.data?.data, ...prev]);
      setNewProject({ name: "", description: "", requirements: "", skills: [] });
      setDialogOpen(false);
      toast({ title: "Project created successfully!" });
    } catch (error: any) {
      toast({
        title: "Failed to create project",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  const handleJoinProject = async (projectId: string) => {
    try {
      await api.post(`/project/${projectId}/request`);
      toast({ title: "Join request sent successfully!" });
    } catch (error: any) {
      toast({
        title: "Failed to send join request",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <FloatingParticles />
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 animate-slide-up">
          <div>
            <h1 className="text-3xl font-bold mb-2">Coding Projects</h1>
            <p className="text-muted-foreground">Discover amazing projects and collaborate with talented developers</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary hover:opacity-90 transition-all duration-300 hover-lift shadow-primary animate-glow">
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-effect border-border/50 max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Code2 className="h-5 w-5 text-primary" />
                  <span>Create New Project</span>
                </DialogTitle>
                <DialogDescription>
                  Start a new project and invite developers to collaborate
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleCreateProject} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter project name"
                    value={newProject.name}
                    onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-background/50"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your project goals, features, and what you want to build..."
                    value={newProject.description}
                    onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                    className="bg-background/50 min-h-[120px]"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="requirements">Requirements</Label>
                  <Textarea
                    id="requirements"
                    placeholder="What are the specific requirements or criteria for team members?"
                    value={newProject.requirements}
                    onChange={(e) => setNewProject(prev => ({ ...prev, requirements: e.target.value }))}
                    className="bg-background/50 min-h-[80px]"
                  />
                </div>
                
                <div className="space-y-3">
                  <Label>Required Skills (select relevant skills)</Label>
                  <div className="max-h-40 overflow-y-auto border border-border/50 rounded-lg p-3 bg-background/30">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {SKILLS.map((skill) => (
                        <Badge
                          key={skill}
                          variant={newProject.skills.includes(skill) ? "default" : "outline"}
                          className="cursor-pointer text-xs hover:opacity-80 transition-opacity"
                          onClick={() => handleToggleSkill(skill)}
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {newProject.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      <span className="text-sm text-muted-foreground">Selected:</span>
                      {newProject.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full gradient-primary hover:opacity-90 transition-opacity"
                  disabled={creating}
                >
                  {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Project
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search projects or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background/50 border-border/50"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="glass-effect border-border/50 animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted/20 rounded w-3/4"></div>
                  <div className="h-3 bg-muted/20 rounded w-full mt-2"></div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <div className="h-5 bg-muted/20 rounded w-16"></div>
                    <div className="h-5 bg-muted/20 rounded w-20"></div>
                  </div>
                  <div className="h-8 bg-muted/20 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <Code2 className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm ? "Try adjusting your search terms" : "Be the first to create a project!"}
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => setDialogOpen(true)}
                className="gradient-primary hover:opacity-90 transition-all duration-300"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Project
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project: any, index: number) => (
              <Card key={project._id || project.id} className="glass-effect border-border/50 hover-lift animate-slide-up" style={{ animationDelay: `${0.1 * index}s` }}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">
                      <Link 
                        to={`/project/${project._id || project.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {project.name || project.title}
                      </Link>
                    </CardTitle>
                    <Badge variant="outline" className="text-success border-success/50">
                      {project.status || 'open'}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-1">
                    {project.skills?.map((skill: string, skillIndex: number) => (
                      <Badge key={skillIndex} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    )) || (
                      <span className="text-xs text-muted-foreground">No skills specified</span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{project.members?.length || 0}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(project.createdAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      {project.owner?.name || project.owner?.name || 'Anonymous'}
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleJoinProject(project._id || project.id)}
                        className="gradient-primary hover:opacity-90 transition-all duration-300 animate-glow"
                        size="sm"
                      >
                        Join Project
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}