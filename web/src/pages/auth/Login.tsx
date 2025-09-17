import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code2, Eye, EyeOff, ArrowLeft, Mail, Chrome, Github } from "lucide-react";
import { useDispatch } from "react-redux";
import api from "@/axios";
import { setCredentials } from "@/store";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { AnimatedBackground } from "@/components/ui/animated-background";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const dispatch=useDispatch()
  const [loading, setLoading] = useState(false);

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/login",{
        credential:credential,
        password
      })
      const res = await api.get('/user/details');
      const { username, name, email } = res.data.data.user;
      dispatch(setCredentials({ username, name, email }));
      toast({ title: "Welcome back!", description: "Successfully logged in." });
      navigate('/dashboard')
    } catch (error) {
      console.error(error)
      toast({ 
        title: "Login failed", 
        description: error.response?.data?.message || "Please check your credentials",
        variant: "destructive" 
      });
    }
    console.log("Login attempt:", { credential, password });
  };

  const handleGoBack = () => {
    navigate(-1);
  };

   return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full gradient-primary blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-secondary/20 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <Button
        variant="ghost"
        onClick={handleGoBack}
        className="absolute top-4 left-4 z-20 hover-lift"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <Card className="w-full max-w-md glass-effect border-border/50 animate-slide-up relative z-10">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 gradient-primary rounded-lg flex items-center justify-center mb-4 shadow-primary animate-glow">
            <Code2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Sign in to continue your coding journey</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={credential}
                onChange={(e) => setCredential(e.target.value)}
                required
                className="bg-background/50 border-border/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-background/50 border-border/50 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full gradient-primary hover:opacity-90 transition-all duration-300 shadow-primary animate-glow">
              <Mail className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          </form>

          <div className="mt-4 space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="hover-lift">
                <Github className="h-4 w-4 mr-2" />
                GitHub
              </Button>
              <Button variant="outline" className="hover-lift">
                <Chrome className="h-4 w-4 mr-2" />
                Google
              </Button>
            </div>
            
            <div className="mt-4 p-3 bg-muted/20 rounded-lg border border-primary/20">
              <p className="text-sm font-medium text-primary mb-1">Demo Credentials</p>
              <p className="text-xs text-muted-foreground">Email: demo@codebuddy.com</p>
              <p className="text-xs text-muted-foreground">Password: demo123</p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary hover:text-primary-glow transition-colors underline">
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link to="/forgot-password" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Forgot your password?
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}