import { useEffect, useState, useMemo } from "react";
import Navbar from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Code2, Users, Calendar, Loader2, ListFilter, Briefcase, Clock, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import api from "@/axios";
import { Link } from "react-router-dom";
import { FloatingParticles } from "@/components/ui/floating-particles";

const SKILLS = [
  "JavaScript", "Python", "Java", "C++", "HTML", "CSS", "React", "Node.js", "Express.js", "MongoDB","SQL", "TypeScript", "Git", "Docker", "Kubernetes", "AWS", "Azure", "Firebase",
  "UI/UX Design", "Figma", "Sketch", "Adobe XD", "Photoshop", "Illustrator","Communication", "Teamwork", "Leadership", "Problem-solving", "Time management", "Public speaking","Project management", "Agile", "Scrum", "Data Analysis", "Machine Learning", "Deep Learning","Cybersecurity", "Networking", "Linux", "Cloud Computing", "DevOps", "CI/CD","Writing", "Editing", "Blogging", "Marketing", "SEO", "Sales", "Customer Support",
  "Video Editing", "3D Modeling", "Animation", "Game Development", "AR/VR"
];

interface User {
  _id: string;
  name?: string;
  username: string;
  pic?: string;
}

interface Project {
  _id: string;
  name: string;
  description: string;
  requirements: string;
  skills: string[];
  members: User[] | string[];
  owner: User | string;
  status: "open" | "closed";
  createdAt: string;
  updatedAt: string;
}

interface CreateProjectData {
  name: string;
  description: string;
  requirements: string;
  skills: string[];
}

export default function Projects() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [openProjects, setOpenProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newProject, setNewProject] = useState<CreateProjectData>({
    name: "",
    description: "",
    requirements: "",
    skills: []
  });
  const { toast } = useToast();

  const CHAR_LIMITS = {
    name: 60,
    description: 500,
    requirements: 300,
    skills: 10
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [myProjectsRes, openProjectsRes] = await Promise.all([
          api.get('/project/mine'),
          api.get('/project/open')
        ]);
        setMyProjects(myProjectsRes.data?.data || []);
        setOpenProjects(openProjectsRes.data?.data || []);
      } catch (error: any) {
        console.error('Failed to fetch projects:', error);
        toast({
          title: "Failed to load project data",
          description: error.response?.data?.message || "Please refresh the page.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [toast]);
  
  const filteredOpenProjects = useMemo(() => {
    if (!openProjects) return [];
    return openProjects.filter((project: Project) => {
        const term = searchTerm.toLowerCase();
        if (!term) return true;

        const checkName = project.name?.toLowerCase().includes(term);
        const checkSkills = project.skills?.some((skill: string) => skill.toLowerCase().includes(term));
        const checkDescription = project.description?.toLowerCase().includes(term);
        const checkRequirements = project.requirements?.toLowerCase().includes(term);

        switch (filterBy) {
            case 'skills':
                return checkSkills;
            case 'requirements':
                return checkRequirements;
            default:
                return checkName || checkSkills || checkDescription || checkRequirements;
        }
    });
  }, [openProjects, searchTerm, filterBy]);

  const getOwnerName = (project: Project): string => {
    if (typeof project.owner === 'object' && project.owner !== null) {
      return (project.owner as User).name || (project.owner as User).username || 'Anonymous';
    }
    return 'Anonymous';
  };

  const getMemberCount = (project: Project): number => {
    if (Array.isArray(project.members)) {
      return project.members.length;
    }
    return 0;
  };

  const handleToggleSkill = (skill: string) => {
    setNewProject(prev => {
      if (prev.skills.includes(skill)) {
        return { ...prev, skills: prev.skills.filter(s => s !== skill) };
      } else if (prev.skills.length < CHAR_LIMITS.skills) {
        return { ...prev, skills: [...prev.skills, skill] };
      }
      return prev;
    });
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name.trim() || !newProject.description.trim()) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    if (newProject.name.length > CHAR_LIMITS.name) {
      toast({
        title: "Project name too long",
        description: `Maximum ${CHAR_LIMITS.name} characters allowed`,
        variant: "destructive"
      });
      return;
    }

    if (newProject.description.length > CHAR_LIMITS.description) {
      toast({
        title: "Description too long",
        description: `Maximum ${CHAR_LIMITS.description} characters allowed`,
        variant: "destructive"
      });
      return;
    }

    setCreating(true);
    try {
      const response = await api.post('/project/', newProject);
      setOpenProjects(prev => [response.data?.data, ...prev]);
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

  const getCharCount = (field: keyof CreateProjectData) => newProject[field].length;
  const getCharLimit = (field: keyof CreateProjectData) => CHAR_LIMITS[field];

  return (
    <div className="min-h-screen bg-background">
      <FloatingParticles />
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          
          {/* Left Sidebar: My Projects */}
          <aside className="lg:col-span-3 mb-8 lg:mb-0">
            <Card className="glass-effect border-border/50 sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  My Projects
                </CardTitle>
                <CardDescription>Projects you own or have joined</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-6 bg-muted/20 rounded animate-pulse"></div>
                    ))}
                  </div>
                ) : myProjects.length > 0 ? (
                  <ul className="space-y-3">
                    {myProjects.map((project: Project) => (
                      <li key={project._id}>
                        <Link 
                          to={`/project/${project._id}`} 
                          className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors p-2 rounded-md hover:bg-muted/30"
                        >
                          <Code2 className="h-4 w-4" />
                          <span className="truncate">{project.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-4">
                    <Code2 className="h-8 w-8 mx-auto text-muted-foreground mb-2 opacity-50" />
                    <p className="text-sm text-muted-foreground">You haven't joined any projects yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </aside>

          {/* Right Main Content: Discover Projects */}
          <main className="lg:col-span-9">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">Discover Projects</h1>
                <p className="text-muted-foreground">Find amazing projects and collaborate with talented developers</p>
              </div>
              
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gradient-primary hover-lift shadow-primary animate-glow">
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
                        maxLength={CHAR_LIMITS.name}
                        required 
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Required</span>
                        <span>{getCharCount('name')}/{CHAR_LIMITS.name}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea 
                        id="description" 
                        placeholder="Describe your project goals, features, and what you want to build..." 
                        value={newProject.description}
                        onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                        className="bg-background/50 min-h-[120px]" 
                        maxLength={CHAR_LIMITS.description}
                        required 
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Required</span>
                        <span>{getCharCount('description')}/{CHAR_LIMITS.description}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="requirements">Requirements & Criteria</Label>
                      <Textarea 
                        id="requirements" 
                        placeholder="What are the specific requirements or criteria for team members? (skills, experience, availability, etc.)" 
                        value={newProject.requirements}
                        onChange={(e) => setNewProject(prev => ({ ...prev, requirements: e.target.value }))}
                        className="bg-background/50 min-h-[80px]" 
                        maxLength={CHAR_LIMITS.requirements}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Optional but recommended</span>
                        <span>{getCharCount('requirements')}/{CHAR_LIMITS.requirements}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Label>Required Skills (select up to {CHAR_LIMITS.skills})</Label>
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
                          <span className="text-sm text-muted-foreground">Selected: {newProject.skills.length}/{CHAR_LIMITS.skills}</span>
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

            {/* Search and Filter Controls */}
            <div className="flex gap-4 mb-6">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  placeholder="Search projects by name, skills, description, or requirements..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="pl-10 bg-background/50 border-border/50" 
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex-shrink-0">
                    <ListFilter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 glass-effect border-border/50">
                  <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={filterBy} onValueChange={setFilterBy}>
                    <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="skills">Skills</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="requirements">Requirements</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {/* Project Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
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
            ) : filteredOpenProjects.length === 0 ? (
              <div className="text-center py-12">
                <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No projects found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filter settings.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredOpenProjects.map((project: Project, index: number) => (
                  <Card 
                    key={project._id} 
                    className="glass-effect border-border/50 hover-lift animate-slide-up" 
                    style={{ animationDelay: `${0.1 * index}s` }}
                  >
                    <Link to={`/project/${project._id}`}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">
                          <div className="hover:text-primary transition-colors">
                            {project.name}
                          </div>
                        </CardTitle>
                        <Badge variant="outline" className="text-success border-success/50">
                          {project.status || 'open'}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {project.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Requirements Section */}
                      {project.requirements && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                            <AlertCircle className="h-3 w-3" />
                            <span>Requirements</span>
                          </div>
                          <p className="text-sm text-foreground/80 line-clamp-2 bg-muted/20 p-2 rounded-md">
                            {project.requirements}
                          </p>
                        </div>
                      )}
                      
                      {/* Skills Section */}
                      <div className="flex flex-wrap gap-1 min-h-[22px]">
                        {project.skills?.slice(0, 4).map((skill: string, skillIndex: number) => (
                          <Badge key={skillIndex} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        )) || (
                          <span className="text-xs text-muted-foreground">No skills specified</span>
                        )}
                        {project.skills?.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{project.skills.length - 4} more
                          </Badge>
                        )}
                      </div>
                      
                      {/* Project Metadata */}
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{getMemberCount(project)} members</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      {/* Owner and Action */}
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">
                          {getOwnerName(project)}
                        </p>
                        <Button 
                          onClick={() => handleJoinProject(project._id)} 
                          className="gradient-primary hover:opacity-90 transition-all duration-300 animate-glow" 
                          size="sm"
                        >
                          Join Project
                        </Button>
                      </div>
                    </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}