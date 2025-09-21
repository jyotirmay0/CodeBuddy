import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { X, Code2, MapPin, Loader2, Frown, Sparkles, Handshake, Send, Terminal, Bot, Cpu } from "lucide-react";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { useToast } from "@/hooks/use-toast";
import api from "@/axios";
import { differenceInYears } from "date-fns";

export default function Discover() {
  const [developers, setDevelopers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const currentDeveloper = developers[currentIndex];

  useEffect(() => {
    const fetchRecentDevelopers = async () => {
      setLoading(true);
      try {
        const res = await api.get('/user/discover');
        setDevelopers(res.data?.data || []);
      } catch (err) {
        toast({ title: "Error", description: "Could not fetch developers.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchRecentDevelopers();
  }, [toast]);

  const handleAiSearch = async () => {
    setIsAiLoading(true);
    setCurrentIndex(0); // Reset the card stack
    setDevelopers([]); // Clear the current list to show the AI loading state
    try {
      const res = await api.get('/user/buddy-suggestions');
      setDevelopers(res.data?.data || []);
      toast({ title: "AI Matchmaking Complete!", description: "Here are your personalized buddy suggestions." });
    } catch (err) {
      toast({ title: "AI Error", description: err.response?.data?.message || "Could not fetch AI suggestions.", variant: "destructive" });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSwipe = async (direction, developerId) => {
    if (!developerId || swipeDirection) return; // Prevent multiple swipes
    setSwipeDirection(direction);

    if (direction === 'like') {
      try {
        await api.post(`/user/send-request/${developerId}`);
        toast({ title: "Success!", description: `Buddy request sent to ${currentDeveloper.name}` });
      } catch (err) {
        toast({ title: "Error", description: err.response?.data?.message || "Could not send request.", variant: "destructive" });
      }
    }
    
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setSwipeDirection(null);
    }, 300);
  };
  
  const getAge = (dob) => dob ? differenceInYears(new Date(), new Date(dob)) : null;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /><p className="ml-4">Finding coders...</p></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <AnimatedBackground/>
      <Navbar />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="text-center mb-6 animate-slide-up">
          <h1 className="text-3xl font-bold mb-2">Discover Coders</h1>
          <p className="text-muted-foreground">Browse recent members or use our AI to find your Best Buddy.</p>
        </div>

        <div className="flex justify-center mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handleAiSearch} disabled={isAiLoading} className="gradient-primary animate-glow shadow-primary">
                  {isAiLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  {isAiLoading ? "AI is Thinking..." : "AI Buddy Finder"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Uses AI to find the best matches for you. (Takes ~30 seconds)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="max-w-md mx-auto flex flex-col items-center justify-center min-h-[70vh]">
          {isAiLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-white">
              <Cpu className="h-12 w-12 animate-pulse text-primary mb-4" />
              <p className="text-lg font-semibold">Analyzing codebases...</p>
              <p className="text-muted-foreground">Building your buddy list, give us a moment.</p>
            </div>
          ) : currentDeveloper ? (
            <>
              <Card 
                className={`w-full glass-effect border-border/50 transition-all duration-300 ${
                  swipeDirection === 'like' ? 'animate-slide-in-right' : 
                  swipeDirection === 'pass' ? 'animate-slide-in-left' : 
                  'animate-slide-up'
                }`}
              >
                <CardHeader className="text-center">
                  <div className="relative">
                    <Avatar className="w-24 h-24 mx-auto mb-4 border-2 border-primary/20">
                      <AvatarImage src={currentDeveloper.pic} alt={currentDeveloper.name} />
                      <AvatarFallback className="text-lg font-semibold gradient-primary text-primary-foreground">
                        {currentDeveloper.name?.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {currentDeveloper.isOnline && (
                      <div className="absolute bottom-4 right-1/2 translate-x-6 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-glow" />
                    )}
                  </div>
                  
                  <CardTitle className="text-xl">{currentDeveloper.name}{getAge(currentDeveloper.dob) ? `, ${getAge(currentDeveloper.dob)}` : ""}</CardTitle>
                  {currentDeveloper.location && (
                    <CardDescription className="flex items-center justify-center gap-1"><MapPin className="h-4 w-4" /><span>{currentDeveloper.location}</span></CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground h-16 overflow-y-auto">{currentDeveloper.bio}</p>
                  
                  {['skills', 'interests', 'hobbies'].map(cat => (
                    currentDeveloper[cat]?.length > 0 && (
                      <div key={cat}>
                        <p className="flex items-center text-sm font-medium mb-1 capitalize">
                          {cat === 'skills' && <Code2 className="h-4 w-4 mr-1 text-primary" />}
                          {cat === 'interests' && <Terminal className="h-4 w-4 mr-1 text-primary" />}
                          {cat === 'hobbies' && <Bot className="h-4 w-4 mr-1 text-primary" />}
                          {cat}:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {currentDeveloper[cat].map(item => (
                            <Badge key={item} variant={cat==='skills'?'secondary':'outline'}>{item}</Badge>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                  <div className="grid grid-cols-1 gap-4 text-center py-2">
                    <div className="flex flex-col items-center">
                      <p className="text-2xl font-bold text-primary">{currentDeveloper.projects?.length || 0}</p> 
                      <p className="text-xs text-muted-foreground">Projects</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-center items-center space-x-4 mt-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <Button variant="outline" size="icon" className="w-16 h-16 rounded-full border-destructive/50 hover:bg-destructive/10 hover:border-destructive transition-all duration-300 hover-lift" onClick={() => handleSwipe('pass', currentDeveloper._id)}>
                  <X className="h-6 w-6 text-destructive" />
                </Button>
                
                <Button variant="outline" size="icon" className="w-12 h-12 rounded-full border-primary/50 hover:bg-primary/10 hover:border-primary transition-all duration-300 hover-lift" 
                // onClick={() => handleSendMessage(currentDeveloper._id)}
                >
                  <Send className="h-5 w-5 text-primary" />
                </Button>
                
                <Button size="icon" variant="outline" className="w-16 h-16 rounded-full gradient-primary hover:opacity-90 transition-all duration-300 hover-lift shadow-primary animate-glow" onClick={() => handleSwipe('like', currentDeveloper._id)}>
                  <Handshake className="h-6 w-6" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Frown className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-2">That's everyone for now!</h2>
              <p className="text-muted-foreground">You can try the AI Matchmaker or check back later.</p>
            </div>
          )}
        </div>
        
        {/* Developers Remaining Count */}
        {!isAiLoading && (
          <div className="text-center mt-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <p className="text-xs text-muted-foreground">
              {developers.length - currentIndex - 1 > 0 ? `${developers.length - currentIndex - 1} more developers` : "You've seen them all!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}