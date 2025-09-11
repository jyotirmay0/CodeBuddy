import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full gradient-primary blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-secondary/20 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="text-center animate-slide-up relative z-10">
        <h1 className="mb-4 text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">404</h1>
        <p className="mb-6 text-xl text-muted-foreground">Oops! This page doesn't exist in our codebase</p>
        <p className="mb-8 text-muted-foreground">The path you're looking for seems to have been refactored away</p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="gradient-primary hover:opacity-90 transition-opacity">
            <Link to="/" className="flex items-center space-x-2">
              <Home className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </Button>
          <Button variant="outline" onClick={() => window.history.back()} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Go Back</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
