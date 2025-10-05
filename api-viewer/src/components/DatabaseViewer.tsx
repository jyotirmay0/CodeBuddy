import { useState, useEffect } from "react";
import { Database, RefreshCw, Table2 } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { API_BASE_URL } from "@/data/endpoints";

export const DatabaseViewer = () => {
  const [loading, setLoading] = useState(false);
  const [collectionStats, setCollectionStats] = useState([]);
  const [databaseStructure, setDatabaseStructure] = useState([]);

  useEffect(() => {
    loadCollectionStats();
  }, []);

  const loadCollectionStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/db`);
      const data = await response.json();
      if (data.success) {
        setCollectionStats(data.data);
        setDatabaseStructure(data.data);
      }
    } catch (error) {
      console.error('Error fetching collection stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadCollectionStats();
  };

  const getLiveCount = (collectionName) => {
    const stat = collectionStats.find(s => s.name === collectionName);
    return stat ? stat.count : '...';
  };

  const getFieldBadgeVariant = (field) => {
    if (field.required) return "default";
    if (field.ref) return "secondary";
    return "outline";
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-border/50 hover:border-border font-medium">
          <Database className="h-4 w-4" />
          Database Schema
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-foreground">
            <div className="w-8 h-8 bg-foreground text-background rounded flex items-center justify-center">
              <Database className="h-4 w-4" />
            </div>
            DATABASE SCHEMA
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Mongoose model structures with live document counts
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-between items-center">
          <div className="text-xs text-muted-foreground">
            {databaseStructure.length} collections • Live document counts
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="gap-2 border-border/50 hover:border-border font-medium"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            {databaseStructure.map((collection) => (
              <div
                key={collection.name}
                className="bg-card rounded-lg p-6 space-y-4 border border-border/50 shadow-sm"
              >
                {/* Collection Header */}
                <div className="flex items-center justify-between border-b border-border/30 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-foreground text-background rounded flex items-center justify-center">
                      <Table2 className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground tracking-tight text-lg">
                        {collection.name}
                      </h3>
                      <p className="text-xs text-muted-foreground font-mono">
                        mongoose.model("{collection.name}")
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-500 text-white border-0">
                      {getLiveCount(collection.name)} docs
                    </Badge>
                    <Badge variant="outline" className="border-border/50 text-xs">
                      {collection.fields.length} fields
                    </Badge>
                  </div>
                </div>

                {/* Fields Grid - FIXED: Proper grid layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {collection.fields.map((field) => (
                    <div
                      key={field.name}
                      className="bg-background/50 rounded p-3 border border-border/30 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm font-semibold text-foreground">
                          {field.name}
                        </span>
                        <Badge 
                          variant={getFieldBadgeVariant(field)}
                          className="text-xs"
                        >
                          {field.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};