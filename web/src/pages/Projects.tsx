import { useState } from "react";
import Navbar from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Code2, Users, Calendar, Star } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AnimatedBackground } from "@/components/ui/animated-background";

// Mock data for demonstration
const mockProjects = [
  {
    id: 1,
    title: "AI Chat Application",
    description: "Building a modern chat app with AI integration using React and Node.js",
    creator: "Alex Chen",
    members: 3,
    maxMembers: 5,
    skills: ["React", "Node.js", "AI/ML", "TypeScript"],
    createdAt: "2024-01-15",
    status: "open"
  },
  {
    id: 2,
    title: "E-commerce Platform",
    description: "Full-stack e-commerce solution with modern UX/UI design",
    creator: "Sarah Johnson",
    members: 2,
    maxMembers: 4,
    skills: ["Next.js", "PostgreSQL", "Stripe", "Tailwind"],
    createdAt: "2024-01-10",
    status: "open"
  },
  {
    id: 3,
    title: "Gaming Tournament Platform",
    description: "Platform for organizing and managing gaming tournaments",
    creator: "Mike Rodriguez",
    members: 4,
    maxMembers: 6,
    skills: ["Vue.js", "Express", "Socket.io", "MongoDB"],
    createdAt: "2024-01-08",
    status: "open"
  }
];

export default function Projects() {
  const [searchTerm, setSearchTerm] = useState("");
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    skills: "",
    maxMembers: 5
  });

  const filteredProjects = mockProjects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate with createProject API
    console.log("Creating project:", newProject);
  };

  const handleJoinProject = (projectId: number) => {
    // TODO: Integrate with requestToJoinProject API
    console.log("Requesting to join project:", projectId);
  };

  return (
    <div className="min-h-screen bg-background">
      <AnimatedBackground/>
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 animate-slide-up">
          <div>
            <h1 className="text-3xl font-bold mb-2">Coding Projects</h1>
            <p className="text-muted-foreground">Discover amazing projects and collaborate with talented developers</p>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gradient-primary hover:opacity-90 transition-all duration-300 hover-lift shadow-primary animate-glow">
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-effect border-border/50">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Code2 className="h-5 w-5 text-primary" />
                  <span>Create New Project</span>
                </DialogTitle>
                <DialogDescription>
                  Start a new project and invite developers to collaborate
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Project Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter project title"
                    value={newProject.title}
                    onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                    className="bg-background/50"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your project..."
                    value={newProject.description}
                    onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                    className="bg-background/50 min-h-[100px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="skills">Required Skills (comma separated)</Label>
                  <Input
                    id="skills"
                    placeholder="React, Node.js, TypeScript..."
                    value={newProject.skills}
                    onChange={(e) => setNewProject(prev => ({ ...prev, skills: e.target.value }))}
                    className="bg-background/50"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maxMembers">Maximum Team Members</Label>
                  <Input
                    id="maxMembers"
                    type="number"
                    min="2"
                    max="10"
                    value={newProject.maxMembers}
                    onChange={(e) => setNewProject(prev => ({ ...prev, maxMembers: parseInt(e.target.value) }))}
                    className="bg-background/50"
                  />
                </div>
                
                <Button type="submit" className="w-full gradient-primary hover:opacity-90 transition-opacity">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => (
            <Card key={project.id} className="glass-effect border-border/50 hover-lift animate-slide-up" style={{ animationDelay: `${0.1 * index}s` }}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  <Badge variant="outline" className="text-success border-success/50">
                    {project.status}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">{project.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-1">
                  {project.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{project.members}/{project.maxMembers}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{project.creator}</p>
                  <Button 
                    onClick={() => handleJoinProject(project.id)}
                    className="gradient-primary hover:opacity-90 transition-all duration-300 animate-glow"
                    size="sm"
                  >
                    Join Project
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}