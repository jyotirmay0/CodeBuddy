import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Projects from "./pages/Projects";
import Groups from "./pages/Groups";
import Discover from "./pages/Discover";
import NotFound from "./pages/NotFound";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { clearCredentials, setCredentials } from "./store";
import api from "./axios";
import Dashboard from "./pages/Dashboard";
import UserProfile from "./pages/UserProfile";
import ProjectDetail from "./pages/ProjectDetail";
import Profile from "./pages/Profile";
import { AnimatedBackground } from "./components/ui/animated-background";

const queryClient = new QueryClient();

function App(){ 
  const dispatch=useDispatch()
  useEffect(()=>{
    const check=async()=>{
      try {
        const res=await api.get("user/details")
        const {username,name,email}=res.data.data.user
        dispatch(setCredentials({username,name,email}))
      } catch (error) {
        console.error(error)
        dispatch(clearCredentials())
      }
    }
    check()
  },[dispatch])
  return(
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
    <div className="relative min-h-screen">
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/user/:id" element={<UserProfile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
)}

export default App;
