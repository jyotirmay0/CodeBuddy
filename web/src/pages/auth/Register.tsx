import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Code2, Eye, EyeOff, User, ArrowLeft, CalendarIcon, Upload, Timer, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import api from "@/axios";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/store";
import { AnimatedBackground } from "@/components/ui/animated-background";

const SKILLS = [
  "JavaScript", "Python", "Java", "C++", "HTML", "CSS", "React", "Node.js", "Express.js", "MongoDB","SQL", "TypeScript", "Git", "Docker", "Kubernetes", "AWS", "Azure", "Firebase",
  "UI/UX Design", "Figma", "Sketch", "Adobe XD", "Photoshop", "Illustrator","Communication", "Teamwork", "Leadership", "Problem-solving", "Time management", "Public speaking","Project management", "Agile", "Scrum", "Data Analysis", "Machine Learning", "Deep Learning","Cybersecurity", "Networking", "Linux", "Cloud Computing", "DevOps", "CI/CD","Writing", "Editing", "Blogging", "Marketing", "SEO", "Sales", "Customer Support",
  "Video Editing", "3D Modeling", "Animation", "Game Development", "AR/VR"
];

const INTERESTS = [
  "Technology", "Science", "Artificial Intelligence", "Machine Learning", "Quantum Computing","Blockchain", "Cryptocurrency", "Cybersecurity", "Startups", "Entrepreneurship","Finance", "Stock Market", "Personal Development", "Psychology", "Philosophy","History", "Geopolitics", "Literature", "Space Exploration", "Astronomy","Climate Change", "Sustainability", "Photography", "Travel", "Food", "Fitness","Meditation", "Yoga", "Music", "Cinema", "Video Games", "E-Sports","Art", "Design", "Fashion", "Cars", "Motorsports", "Animals", "Wildlife","Education", "Learning Languages", "DIY Projects", "Open Source", "Volunteering","Robotics", "Biotech", "Neuroscience", "Data Privacy", "Human Rights"
];

const HOBBIES = [
  "Reading", "Writing", "Drawing", "Painting", "Photography", "Cooking", "Baking","Gardening", "Fishing", "Hiking", "Camping", "Cycling", "Running", "Swimming", "Singing", "Playing Guitar", "Playing Piano", "Drumming", "Dancing", "Chess","Board Games", "Collecting Stamps", "Collecting Coins", "Bird Watching", "Origami","Knitting", "Calligraphy", "Blogging", "Podcasting", "Filmmaking", "3D Printing", "Traveling", "Exploring Cafes", "Watching Movies", "Watching Anime", "Playing Video Games","Skateboarding", "Snowboarding", "Surfing", "Martial Arts", "Yoga", "Meditation", "DIY Projects", "Woodworking", "Home Brewing", "Journaling", "Astrophotography", "Model Building", "Rock Climbing", "Scuba Diving", "Magic Tricks", "Fantasy Sports"
];

export default function Register() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string>("");
  const dispatch=useDispatch()
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    dob: undefined as Date | undefined,
    location: "",
    bio: "",
    contact: "",
    skills: [] as string[],
    interests: [] as string[],
    hobbies: [] as string[],
    projects: "",
    socials: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (formData.password !== formData.confirmPassword) {
        toast({ title: "Passwords don't match", variant: "destructive" });
        return;
      }
      try {
        await api.post('/auth/register', {
          username: formData.username,
          email: formData.email,
          password: formData.password
        });
        await handleSendOTP();
        setStep(2);
        startTimer();
      } catch (error: any) {
        toast({ title: "Registration failed", description: error.response?.data?.message, variant: "destructive" });
      }
    }
  };

  const handleSendOTP = async () => {
    try {
      await api.post('/auth/send-otp', { email: formData.email });
      toast({ title: "OTP sent to your email" });
      setTimer(180);
      setCanResend(false);
    } catch (error: any) {
      toast({ title: "Failed to send OTP", description: error.response?.data?.message, variant: "destructive" });
    }
  };

  const handleVerifyOTP = async () => {
    try {
      await api.post('/auth/verify-otp', {
        email: formData.email,
        otp
      });
      toast({ title: "OTP verified successfully" });
      setStep(3);
    } catch (error: any) {
      toast({ title: "Invalid OTP", description: error.response?.data?.message, variant: "destructive" });
    }
  };

  const handleCompleteProfile = async () => {
    try {
      if (profilePic) {
        const formDataPic = new FormData();
        formDataPic.append('image', profilePic);
        await api.post('/user/upload-pic', formDataPic);
      }
      
      await api.patch('/user/update-contact', { contact: formData.contact });
      await api.patch('/user/update-details', {
        skills: formData.skills,
        interests: formData.interests,
        hobbies: formData.hobbies,
        name: formData.name,
        dob: formData.dob,
        location: formData.location,
        bio: formData.bio,
        projects: formData.projects,
        socials: formData.socials
      });
      toast({ title: "Profile completed successfully" });
      const res = await api.get('/user/details');
      const { username, name, email } = res.data.data.user;
      dispatch(setCredentials({ username, name, email }));
      navigate('/dashboard');
    } catch (error: any) {
      toast({ title: "Failed to complete profile", description: error.response?.data?.message, variant: "destructive" });
    }
  };

  const startTimer = () => {
    setTimer(180);
    setCanResend(false);
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePic(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleSelection = (item: string, type: 'skills' | 'interests' | 'hobbies') => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].includes(item) 
        ? prev[type].filter(i => i !== item)
        : [...prev[type], item]
    }));
  };

  const handleGoBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate(-1);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Your unique username"
                value={formData.username}
                onChange={handleChange}
                required
                className="bg-background/50 border-border/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="bg-background/50 border-border/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="bg-background/50 border-border/50"
              />
            </div>

            <Button type="submit" className="w-full gradient-primary hover:opacity-90 transition-all duration-300 shadow-primary animate-glow">
              Continue
            </Button>
          </form>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <Timer className="h-4 w-4" />
                <span>{Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Enter the OTP sent to {formData.email}
              </p>
            </div>

            <div className="flex justify-center">
              <InputOTP value={otp} onChange={setOtp} maxLength={6}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button 
              onClick={handleVerifyOTP} 
              disabled={otp.length !== 6}
              className="w-full gradient-primary hover:opacity-90 transition-all duration-300 shadow-primary animate-glow"
            >
              Verify OTP
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleSendOTP}
              disabled={!canResend}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {canResend ? "Resend OTP" : `Resend in ${timer}s`}
            </Button>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 max-h-96 overflow-y-auto">
            <div className="space-y-4">
              <div className="text-center">
                <div className="relative inline-block">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profilePicPreview} />
                    <AvatarFallback>
                      <Upload className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePicChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">Click to upload profile picture</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="bg-background/50 border-border/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact">Contact</Label>
                  <Input
                    id="contact"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    className="bg-background/50 border-border/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-background/50 border-border/50",
                        !formData.dob && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dob ? format(formData.dob, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.dob}
                      onSelect={(date) => setFormData(prev => ({ ...prev, dob: date }))}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="bg-background/50 border-border/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="bg-background/50 border-border/50"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Skills</Label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {SKILLS.map((skill) => (
                    <Badge
                      key={skill}
                      variant={formData.skills.includes(skill) ? "default" : "outline"}
                      className="cursor-pointer hover-lift"
                      onClick={() => toggleSelection(skill, 'skills')}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Interests</Label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {INTERESTS.map((interest) => (
                    <Badge
                      key={interest}
                      variant={formData.interests.includes(interest) ? "default" : "outline"}
                      className="cursor-pointer hover-lift"
                      onClick={() => toggleSelection(interest, 'interests')}
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Hobbies</Label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {HOBBIES.map((hobby) => (
                    <Badge
                      key={hobby}
                      variant={formData.hobbies.includes(hobby) ? "default" : "outline"}
                      className="cursor-pointer hover-lift"
                      onClick={() => toggleSelection(hobby, 'hobbies')}
                    >
                      {hobby}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <Button
              onClick={handleCompleteProfile}
              className="w-full gradient-primary hover:opacity-90 transition-all duration-300 shadow-primary animate-glow"
            >
              Complete Profile
            </Button>
          </div>
        );

      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <AnimatedBackground />
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full gradient-primary blur-3xl animate-float" />
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 rounded-full bg-secondary/20 blur-3xl animate-float" style={{ animationDelay: '3s' }} />
      </div>

      <Button
        variant="ghost"
        onClick={handleGoBack}
        className="absolute top-4 left-4 z-20 hover-lift"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <Card className={cn(
        "w-full glass-effect border-border/50 animate-slide-up relative z-10",
        step === 3 ? "max-w-2xl" : "max-w-md"
      )}>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 gradient-primary rounded-lg flex items-center justify-center mb-4 shadow-primary animate-glow">
            <User className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {step === 1 && "Join CodeBuddy"}
            {step === 2 && "Verify Your Email"}
            {step === 3 && "Complete Your Profile"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "Create your account and start connecting with developers"}
            {step === 2 && "We've sent you a verification code"}
            {step === 3 && "Tell us more about yourself"}
          </CardDescription>
          <div className="flex justify-center mt-4">
            <div className="flex space-x-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "w-3 h-3 rounded-full transition-all duration-300",
                    i <= step ? "bg-primary" : "bg-muted"
                  )}
                />
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {renderStep()}

          {step === 1 && (
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:text-primary-glow transition-colors underline">
                  Sign in
                </Link>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}