import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Code2, Users, Sparkles, User, ArrowLeft } from "lucide-react";

export const Navbar = () => {
  return (
    <nav className="glass-effect border-b border-border/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-2 hover-lift">
            <div className="gradient-primary p-2 rounded-lg shadow-primary animate-glow">
              <Code2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              CodeBuddy
            </span>
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-6">
          <Link to="/discover" className="text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1 hover-lift">
            <Sparkles className="h-4 w-4" />
            <span>Discover</span>
          </Link>
          <Link to="/projects" className="text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1 hover-lift">
            <Code2 className="h-4 w-4" />
            <span>Projects</span>
          </Link>
          <Link to="/groups" className="text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1 hover-lift">
            <Users className="h-4 w-4" />
            <span>Groups</span>
          </Link>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" asChild className="hidden sm:inline-flex hover-lift">
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild className="gradient-primary hover:opacity-90 transition-all duration-300 shadow-primary animate-glow">
            <Link to="/register">Get Started</Link>
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden hover-lift">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
};