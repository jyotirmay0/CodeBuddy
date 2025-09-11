import { Navbar } from "@/components/layout/navbar";
import { Hero } from "@/components/sections/hero";
import { FloatingParticles } from "@/components/ui/floating-particles";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <FloatingParticles />
      <Navbar />
      <Hero />
    </div>
  );
};

export default Index;
