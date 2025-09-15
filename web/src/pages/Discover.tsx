import { useEffect, useState } from "react";
import Navbar from "@/components/layout/navbar";
import { FloatingParticles } from "@/components/ui/floating-particles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, X, Code2, MapPin, MessageCircle, UserPlus } from "lucide-react";

// Mock data for random developers
const mockDevelopers = [
  {
    id: 1,
    name: "Alex Chen",
    age: 25,
    location: "San Francisco, CA",
    avatar: "/placeholder.svg",
    bio: "Full-stack developer passionate about AI and machine learning. Love gaming and building cool apps in my free time!",
    skills: ["React", "Python", "TensorFlow", "Node.js", "Docker"],
    hobbies: ["Gaming", "AI Research", "Photography"],
    interests: ["AI","Game Dev","Docker"],
    projects: 12,
    experience: "3 years",
    isOnline: true
  },
  {
    id: 2,
    name: "Sarah Johnson",
    age: 28,
    location: "Austin, TX",
    avatar: "/placeholder.svg",
    bio: "Frontend developer with an eye for design. Coffee enthusiast and part-time music producer.",
    skills: ["Vue.js", "TypeScript", "Figma", "SCSS", "WebGL"],
    hobbies: ["Music Production", "Coffee", "Design"],
    interests: ["AI","Game Dev","Docker"],
    projects: 8,
    experience: "4 years",
    isOnline: false
  },
  {
    id: 3,
    name: "Mike Rodriguez",
    age: 30,
    location: "New York, NY",
    avatar: "/placeholder.svg",
    bio: "Backend engineer who loves building scalable systems. Fitness enthusiast and weekend hiker.",
    skills: ["Go", "Kubernetes", "PostgreSQL", "GraphQL", "AWS"],
    hobbies: ["Fitness", "Hiking", "Cooking"],
    interests: ["AI","Game Dev","Docker"],
    projects: 15,
    experience: "6 years",
    isOnline: true
  }
];

export default function Discover() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null);
  const [developers, setDevelopers] = useState<any[]>([]);
  const currentDeveloper = mockDevelopers[currentIndex];
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/discover`, {
          credentials: 'include'
        });
        const data = await res.json();
        setDevelopers(data.users); // Your backend should return a list of users
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  // const currentDeveloper = developers[currentIndex];

  const handleSwipe = (direction: 'like' | 'pass') => {
    setSwipeDirection(direction);
    
    setTimeout(async() => {
      if (direction === 'like') {
        try {
          const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/${currentDeveloper.id}/request`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" }
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.message);
          console.log("Friend request sent:", data.message);
        } catch (err) {
          console.error("Error:", err.message);
        }
      }
      
      setCurrentIndex((prev) => (prev + 1) % mockDevelopers.length);
      setSwipeDirection(null);
    }, 300);
  };

  const handleSendMessage = () => {
    // TODO: Open message dialog or navigate to messages
    console.log("Opening message to:", currentDeveloper?.name);
  };

  if (!currentDeveloper) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <FloatingParticles />
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8 animate-slide-up">
          <h1 className="text-3xl font-bold mb-2">Discover Coders</h1>
          <p className="text-muted-foreground">Find your perfect coding buddy and collaboration partner</p>
        </div>

        <div className="max-w-md mx-auto">
          <Card 
            className={`glass-effect border-border/50 hover-lift transition-all duration-300 ${
              swipeDirection === 'like' ? 'animate-slide-in-right' : 
              swipeDirection === 'pass' ? 'animate-slide-in-left' : 
              'animate-slide-up'
            }`}
          >
            <CardHeader className="text-center">
              <div className="relative">
                <Avatar className="w-24 h-24 mx-auto mb-4 border-2 border-primary/20">
                  <AvatarImage src={currentDeveloper.avatar} alt={currentDeveloper.name} />
                  <AvatarFallback className="text-lg font-semibold gradient-primary text-primary-foreground">
                    {currentDeveloper.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {currentDeveloper.isOnline && (
                  <div className="absolute bottom-4 right-1/2 translate-x-6 w-4 h-4 bg-success rounded-full border-2 border-background animate-glow" />
                )}
              </div>
              
              <CardTitle className="text-xl">{currentDeveloper.name}{currentDeveloper.age ? `, ${currentDeveloper.age}` : ""}</CardTitle>
              <CardDescription className="flex items-center justify-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>{currentDeveloper.location}</span>
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">{currentDeveloper.bio}</p>
              
              <div>
                <p className="text-sm font-medium mb-2 flex items-center space-x-1">
                  <Code2 className="h-4 w-4" />
                  <span>Skills:</span>
                </p>
                <div className="flex flex-wrap gap-1">
                  {currentDeveloper.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-2">Interests:</p>
                <div className="flex flex-wrap gap-1">
                  {currentDeveloper.interests.map((interest) => (
                    <Badge key={interest} variant="outline" className="text-xs">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Hobbies:</p>
                <div className="flex flex-wrap gap-1">
                  {currentDeveloper.hobbies.map((hobby) => (
                    <Badge key={hobby} variant="outline" className="text-xs">
                      {hobby}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center py-2">
                <div>
                  <p className="text-2xl font-bold text-primary">{currentDeveloper.projects}</p>
                  <p className="text-xs text-muted-foreground">Projects</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-secondary">{currentDeveloper.experience}</p>
                  <p className="text-xs text-muted-foreground">Experience</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center space-x-4 mt-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Button
              variant="outline"
              size="icon"
              className="w-16 h-16 rounded-full border-destructive/50 hover:bg-destructive/10 hover:border-destructive transition-all duration-300 hover-lift"
              onClick={() => handleSwipe('pass')}
            >
              <X className="h-6 w-6 text-destructive" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              className="w-12 h-12 rounded-full border-primary/50 hover:bg-primary/10 hover:border-primary transition-all duration-300 hover-lift"
              onClick={handleSendMessage}
            >
              <MessageCircle className="h-5 w-5 text-primary" />
            </Button>
            
            <Button
              size="icon"
              className="w-16 h-16 rounded-full gradient-primary hover:opacity-90 transition-all duration-300 hover-lift shadow-primary animate-glow"
              onClick={() => handleSwipe('like')}
            >
              <Heart className="h-6 w-6" />
            </Button>
          </div>
          
          <div className="text-center mt-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <p className="text-xs text-muted-foreground">
              Swipe right to connect • Swipe left to pass
            </p>
          </div>
        </div>

        <div className="mt-12 text-center animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <div className="inline-flex items-center space-x-2 bg-card/50 backdrop-blur-sm border border-border/50 rounded-full px-4 py-2">
            <UserPlus className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              {mockDevelopers.length - currentIndex - 1} more developers to discover
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}