/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { ChevronDown, ChevronUp, Send, Loader2 } from "lucide-react";
import { ApiEndpoint } from "@/types/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { makeApiCall } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ApiCardProps {
  endpoint: ApiEndpoint;
  isLoggedIn: boolean;
  onAuthSuccess: () => void;
  onLogout:()=>void;
}

const methodColors = {
  GET: "bg-secondary text-success",
  POST: "bg-secondary text-info",
  PUT: "bg-secondary text-warning",
  PATCH: "bg-secondary text-secondary-foreground border-secondary",
  DELETE: "bg-secondary text-destructive",
};

export const ApiCard = ({ endpoint, isLoggedIn, onAuthSuccess,onLogout }: ApiCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [fileData, setFileData] = useState<File | null>(null);

  const handleInputChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileData(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (endpoint.requiresAuth && !isLoggedIn) {
      toast.error("Authentication required", {
        description: "Please login first to use this endpoint",
      });
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      let processedUrl = endpoint.url;
      let processedData: any = {};

      // Handle URL parameters
      Object.keys(formData).forEach((key) => {
        if (processedUrl.includes(`:${key}`)) {
          processedUrl = processedUrl.replace(`:${key}`, formData[key]);
        } else {
          processedData[key] = formData[key];
        }
      });

      // Handle array fields
      endpoint.bodyFields?.forEach((field) => {
        if (field.type === "array" && processedData[field.name]) {
          processedData[field.name] = processedData[field.name]
            .split(",")
            .map((item: string) => item.trim())
            .filter((item: string) => item.length > 0);
        }
      });

      // Handle file upload
      let isFormDataRequest = false;
      if (fileData) {
        const formDataObj = new FormData();
        formDataObj.append("image", fileData);
        Object.keys(processedData).forEach((key) => {
          formDataObj.append(key, processedData[key]);
        });
        processedData = formDataObj;
        isFormDataRequest = true;
      }

      const res = await makeApiCall(
        endpoint.method,
        processedUrl,
        Object.keys(processedData).length > 0 ? processedData : undefined,
        isFormDataRequest
      );

      setResponse({
        status: res.status,
        data: res.data,
        timestamp: Date.now(),
      });

      toast.success("Request successful", {
        description: `${endpoint.method} ${endpoint.url}`,
      });

      // Check if login or register was successful
      if ((endpoint.id === "auth-login" || endpoint.id === "auth-verify-otp") && res.status === 200)onAuthSuccess();
      if(endpoint.id==="auth-logout" && res.status===200)onLogout();
    } catch (error: any) {
      const errorData = {
        status: error.response?.status || 500,
        data: error.response?.data || { message: error.message },
        timestamp: Date.now(),
      };
      setResponse(errorData);

      toast.error("Request failed", {
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border/50 rounded overflow-hidden hover:border-border transition-all duration-200">
      <div
        className="p-5 cursor-pointer flex items-center justify-between group"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4 flex-1">
          <Badge className={cn("font-mono text-xs font-bold px-3 py-1", methodColors[endpoint.method])}>
            {endpoint.method}
          </Badge>
          <code className="text-sm text-foreground font-mono tracking-tight">{endpoint.url}</code>
        </div>
        <div className="flex items-center gap-3">
          {endpoint.requiresAuth && (
            <Badge variant="outline" className="text-xs font-medium border-muted-foreground/30 text-muted-foreground">
              AUTH
            </Badge>
          )}
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border/50 p-5 space-y-4 bg-background/50">
          <p className="text-sm text-muted-foreground leading-relaxed">{endpoint.description}</p>

          {endpoint.bodyFields && endpoint.bodyFields.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Request Body</h4>
              {endpoint.bodyFields.map((field) => (
                <div key={field.name} className="space-y-1">
                  <label className="text-xs text-muted-foreground flex items-center gap-1">
                    {field.name}
                    {field.required && <span className="text-destructive">*</span>}
                  </label>
                  {field.type === "textarea" ? (
                    <Textarea
                      placeholder={field.placeholder}
                      value={formData[field.name] || ""}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      className="bg-background"
                    />
                  ) : field.type === "file" ? (
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="bg-background"
                    />
                  ) : (
                    <Input
                      type={field.type}
                      placeholder={field.placeholder}
                      value={formData[field.name] || ""}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      className="bg-background"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className=" bg-foreground text-background hover:bg-foreground/90 font-medium"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Request
              </>
            )}
          </Button>

          {response && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Response</h4>
                <Badge
                  className={response.status >= 200 && response.status < 300 ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"}
                >
                  {response.status}
                </Badge>
              </div>
              <pre className="bg-background/80 p-4 rounded text-xs overflow-auto max-h-96 border border-border/30 font-mono">
                {JSON.stringify(response.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
