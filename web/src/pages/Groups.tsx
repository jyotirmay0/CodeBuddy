import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { FloatingParticles } from "@/components/ui/floating-particles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Users, Gamepad2, Coffee, Music, Camera, Dumbbell, Book } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock data for coding groups
const mockGroups = [
  {
    id: 1,
    name: "Gaming Coders",
    description: "Code during the day, game during breaks! Perfect for developers who love gaming.",
    members: 24,
    maxMembers: 50,
    hobbies: ["Gaming", "Coding"],
    skills: ["React", "Unity", "C#", "JavaScript"],
    activity: "Active",
    icon: Gamepad2,
    color: "text-accent"
  },
  {
    id: 2,
    name: "Coffee & Code",
    description: "Early morning coding sessions with fellow caffeine enthusiasts.",
    members: 18,
    maxMembers: 30,
    hobbies: ["Coffee", "Early Morning Coding"],
    skills: ["Python", "Java", "Web Dev"],
    activity: "Very Active",
    icon: Coffee,
    color: "text-warning"
  },
  {
    id: 3,
    name: "Music Makers & Coders",
    description: "Developers who create music apps, audio tools, or just love music while coding.",
    members: 15,
    maxMembers: 25,
    hobbies: ["Music Production", "Audio Engineering"],
    skills: ["JavaScript", "Web Audio API", "React", "Node.js"],
    activity: "Active",
    icon: Music,
    color: "text-primary"
  },
  {
    id: 4,
    name: "Fitness Tech",
    description: "Building fitness apps while staying fit ourselves. Code, workout, repeat!",
    members: 12,
    maxMembers: 20,
    hobbies: ["Fitness", "Health Tech"],
    skills: ["React Native", "Swift", "Kotlin", "IoT"],
    activity: "Growing",
    icon: Dumbbell,
    color: "text-success"
  },
  {
    id: 5,
    name: "Photography & Dev",
    description: "Developers passionate about photography and building visual applications.",
    members: 8,
    maxMembers: 15,
    hobbies: ["Photography", "Visual Arts"],
    skills: ["CSS", "Three.js", "WebGL", "Image Processing"],
    activity: "New",
    icon: Camera,
    color: "text-secondary"
  }
];

export default function Groups() {
  const [searchTerm, setSearchTerm] = useState("");
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    hobby: "",
    skills: "",
    maxMembers: 20
  });

  const filteredGroups = mockGroups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.hobbies.some(hobby => hobby.toLowerCase().includes(searchTerm.toLowerCase())) ||
    group.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate with group creation API
    console.log("Creating group:", newGroup);
  };

  const handleJoinGroup = (groupId: number) => {
    // TODO: Integrate with join group API
    console.log("Joining group:", groupId);
  };

  return (
    <div className="min-h-screen bg-background">
      <FloatingParticles />
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 animate-slide-up">
          <div>
            <h1 className="text-3xl font-bold mb-2">Coding Groups</h1>
            <p className="text-muted-foreground">Join communities where coding meets your favorite hobbies</p>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gradient-primary hover:opacity-90 transition-all duration-300 hover-lift shadow-primary animate-glow">
                <Plus className="h-4 w-4 mr-2" />
                Create Group
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-effect border-border/50">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span>Create New Group</span>
                </DialogTitle>
                <DialogDescription>
                  Start a community around your coding interests and hobbies
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="groupName">Group Name</Label>
                  <Input
                    id="groupName"
                    placeholder="Enter group name"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-background/50"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="groupDescription">Description</Label>
                  <Textarea
                    id="groupDescription"
                    placeholder="Describe your group..."
                    value={newGroup.description}
                    onChange={(e) => setNewGroup(prev => ({ ...prev, description: e.target.value }))}
                    className="bg-background/50 min-h-[100px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hobby">Primary Hobby/Interest</Label>
                  <Select onValueChange={(value) => setNewGroup(prev => ({ ...prev, hobby: value }))}>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Select a hobby" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gaming">Gaming</SelectItem>
                      <SelectItem value="music">Music</SelectItem>
                      <SelectItem value="photography">Photography</SelectItem>
                      <SelectItem value="fitness">Fitness</SelectItem>
                      <SelectItem value="cooking">Cooking</SelectItem>
                      <SelectItem value="reading">Reading</SelectItem>
                      <SelectItem value="travel">Travel</SelectItem>
                      <SelectItem value="art">Art & Design</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="groupSkills">Coding Skills Focus</Label>
                  <Input
                    id="groupSkills"
                    placeholder="React, Python, Mobile Dev..."
                    value={newGroup.skills}
                    onChange={(e) => setNewGroup(prev => ({ ...prev, skills: e.target.value }))}
                    className="bg-background/50"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="groupMaxMembers">Maximum Members</Label>
                  <Input
                    id="groupMaxMembers"
                    type="number"
                    min="5"
                    max="100"
                    value={newGroup.maxMembers}
                    onChange={(e) => setNewGroup(prev => ({ ...prev, maxMembers: parseInt(e.target.value) }))}
                    className="bg-background/50"
                  />
                </div>
                
                <Button type="submit" className="w-full gradient-primary hover:opacity-90 transition-opacity">
                  Create Group
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search groups, hobbies, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background/50 border-border/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group, index) => {
            const IconComponent = group.icon;
            return (
              <Card key={group.id} className="glass-effect border-border/50 hover-lift animate-slide-up" style={{ animationDelay: `${0.1 * index}s` }}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg gradient-accent ${group.color}`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                        <Badge variant="outline" className="text-success border-success/50 mt-1">
                          {group.activity}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="line-clamp-2 mt-2">{group.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Hobbies:</p>
                    <div className="flex flex-wrap gap-1">
                      {group.hobbies.map((hobby) => (
                        <Badge key={hobby} variant="secondary" className="text-xs">
                          {hobby}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-2">Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {group.skills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{group.members}/{group.maxMembers} members</span>
                    </div>
                    <Button 
                      onClick={() => handleJoinGroup(group.id)}
                      className="gradient-primary hover:opacity-90 transition-all duration-300 animate-glow"
                      size="sm"
                    >
                      Join Group
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredGroups.length === 0 && (
          <div className="text-center py-12 animate-slide-up">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No groups found</h3>
            <p className="text-muted-foreground">Try adjusting your search or create a new group!</p>
          </div>
        )}
      </div>
    </div>
  );
}