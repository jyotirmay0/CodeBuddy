import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Code2, Users, Sparkles, ArrowRight } from "lucide-react";
import heroBackground from "@/assets/hero-background.jpg";
import { AnimatedBackground } from "../ui/animated-background";

export const Hero = () => {
  return (
    <section className="min-h-screen relative overflow-hidden flex items-center">
      <AnimatedBackground />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center animate-slide-up">
          <div className="inline-flex items-center space-x-2 bg-card/50 backdrop-blur-sm border border-border/50 rounded-full px-4 py-2 mb-6 animate-glow">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Find Your Perfect Coding Partner</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Code Together,{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Build Amazing
            </span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Connect with developers who share your interests, collaborate on exciting projects, 
            and build the future of technology together. Gaming breaks included!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" asChild className="gradient-primary hover:opacity-90 transition-all duration-300 group">
              <Link to="/register" className="flex items-center space-x-2">
                <span>Start Your Journey</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="hover-lift">
              <Link to="/discover">Discover Coders</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="glass-effect p-6 rounded-lg hover-lift animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Users className="h-8 w-8 text-primary mb-3 mx-auto" />
              <h3 className="font-semibold mb-2">Find Your Tribe</h3>
              <p className="text-sm text-muted-foreground">Connect with developers based on skills, interests, and hobbies</p>
            </div>
            
            <div className="glass-effect p-6 rounded-lg hover-lift animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <Code2 className="h-8 w-8 text-secondary mb-3 mx-auto" />
              <h3 className="font-semibold mb-2">Collaborate on Projects</h3>
              <p className="text-sm text-muted-foreground">Start projects and invite talented developers to join your team</p>
            </div>
            
            <div className="glass-effect p-6 rounded-lg hover-lift animate-slide-up" style={{ animationDelay: '0.6s' }}>
              <Sparkles className="h-8 w-8 text-accent mb-3 mx-auto" />
              <h3 className="font-semibold mb-2">Code & Chill</h3>
              <p className="text-sm text-muted-foreground">Bond over shared hobbies during breaks - gaming, music, and more</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};