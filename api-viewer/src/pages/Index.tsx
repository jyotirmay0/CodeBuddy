import { useState, useMemo } from "react";
import { Search, Server } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ApiCard } from "@/components/ApiCard";
import { DatabaseViewer } from "@/components/DatabaseViewer";
import { endpoints } from "@/data/endpoints";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const categories = useMemo(() => {
    const cats = new Set(endpoints.map((e) => e.category));
    return ["all", ...Array.from(cats)];
  }, []);

  const filteredEndpoints = useMemo(() => {
    return endpoints.filter((endpoint) => {
      const matchesSearch =
        endpoint.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        endpoint.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        endpoint.method.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || endpoint.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-foreground text-background rounded flex items-center justify-center">
                <Server className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground tracking-tight">API VIEWER</h1>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Backend Testing Tool</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <DatabaseViewer />
              <div className="flex items-center gap-2 text-xs">
                {isLoggedIn ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <span className="text-foreground font-medium">AUTHENTICATED</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                    <span className="text-muted-foreground font-medium">NOT AUTHENTICATED</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {/* Search and Filter */}
        <div className="mb-12 space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search endpoints..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 bg-card border-border/50 focus:border-border text-sm"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Category:</span>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category 
                  ? "capitalize bg-foreground text-background hover:bg-foreground/90 font-medium" 
                  : "capitalize border-border/50 hover:border-border font-medium"
                }
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* API Endpoints */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Endpoints • {filteredEndpoints.length}
            </h2>
          </div>

          {filteredEndpoints.length === 0 ? (
            <div className="text-center py-20 bg-card/50 rounded border border-border/30">
              <p className="text-muted-foreground text-sm">No endpoints found</p>
            </div>
          ) : (
            filteredEndpoints.map((endpoint) => (
              <ApiCard
                key={endpoint.id}
                endpoint={endpoint}
                isLoggedIn={isLoggedIn}
                onAuthSuccess={() => setIsLoggedIn(true)}
              />
            ))
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 mt-20 py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">API Viewer © 2025</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
