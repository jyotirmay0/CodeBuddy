import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Upload, CalendarIcon, Save, Lock, Mail, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import api from "@/axios";

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

export default function Profile() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string>("");
  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    name: "",
    dob: undefined as Date | undefined,
    location: "",
    bio: "",
    contact: "",
    skills: [] as string[],
    interests: [] as string[],
    hobbies: [] as string[],
    projects: "",
    socials: "",
    pic: ""
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await api.get('/user/details');
      const data = await response.json();
      const userData = data.data;
      setProfileData({
        username: userData.username || "",
        email: userData.email || "",
        name: userData.name || "",
        dob: userData.dob ? new Date(userData.dob) : undefined,
        location: userData.location || "",
        bio: userData.bio || "",
        contact: userData.contact || "",
        skills: userData.skills || [],
        interests: userData.interests || [],
        hobbies: userData.hobbies || [],
        projects: userData.projects || "",
        socials: userData.socials || "",
        pic: userData.pic || ""
      });
      setProfilePicPreview(userData.pic || "");
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      toast({ title: "Failed to load profile", variant: "destructive" });
    } finally {
      setLoading(false);
    }
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const toggleSelection = (item: string, type: 'skills' | 'interests' | 'hobbies') => {
    setProfileData(prev => ({
      ...prev,
      [type]: prev[type].includes(item) 
        ? prev[type].filter(i => i !== item)
        : [...prev[type], item]
    }));
  };

  const handleSaveProfile = async () => {
    try {
      if (profilePic) {
        const formData = new FormData();
        formData.append('image', profilePic);
        await api.post('/user/upload-pic', formData);
      }

      await api.patch('/user/update-contact', { contact: profileData.contact });
      await api.patch('/user/update-details', {
        skills: profileData.skills,
        interests: profileData.interests,
        hobbies: profileData.hobbies,
        name: profileData.name,
        dob: profileData.dob,
        location: profileData.location,
        bio: profileData.bio,
        projects: profileData.projects,
        socials: profileData.socials
      });

      toast({ title: "Profile updated successfully" });
    } catch (error: any) {
      toast({ title: "Failed to update profile", description: error.response?.data?.message, variant: "destructive" });
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }

    try {
      await api.post('/user/update-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast({ title: "Password updated successfully" });
    } catch (error: any) {
      toast({ title: "Failed to update password", description: error.response?.data?.message, variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 gradient-primary rounded-lg animate-pulse mx-auto"></div>
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="hover-lift"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold gradient-text mb-2">Your Profile</h1>
            <p className="text-muted-foreground">Manage your account settings and preferences</p>
          </div>
          <div className="w-20"></div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile" className="hover-lift">Profile Information</TabsTrigger>
            <TabsTrigger value="security" className="hover-lift">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card className="glass-effect border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>Update your personal information and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture */}
                <div className="text-center">
                  <div className="relative inline-block">
                    <Avatar className="h-24 w-24">
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
                  <p className="text-sm text-muted-foreground mt-2">Click to change profile picture</p>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={profileData.username}
                      disabled
                      className="bg-muted/20"
                    />
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      Cannot be changed
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={profileData.email}
                      disabled
                      className="bg-muted/20"
                    />
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      Cannot be changed
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={profileData.name}
                      onChange={handleChange}
                      className="bg-background/50 border-border/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact">Contact</Label>
                    <Input
                      id="contact"
                      name="contact"
                      value={profileData.contact}
                      onChange={handleChange}
                      className="bg-background/50 border-border/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal bg-background/50 border-border/50",
                            !profileData.dob && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {profileData.dob ? format(profileData.dob, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={profileData.dob}
                          onSelect={(date) => setProfileData(prev => ({ ...prev, dob: date }))}
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
                      value={profileData.location}
                      onChange={handleChange}
                      className="bg-background/50 border-border/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={profileData.bio}
                    onChange={handleChange}
                    className="bg-background/50 border-border/50"
                    rows={3}
                  />
                </div>

                {/* Skills */}
                <div className="space-y-2">
                  <Label>Skills</Label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {SKILLS.map((skill) => (
                      <Badge
                        key={skill}
                        variant={profileData.skills.includes(skill) ? "default" : "outline"}
                        className="cursor-pointer hover-lift"
                        onClick={() => toggleSelection(skill, 'skills')}
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Interests */}
                <div className="space-y-2">
                  <Label>Interests</Label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {INTERESTS.map((interest) => (
                      <Badge
                        key={interest}
                        variant={profileData.interests.includes(interest) ? "default" : "outline"}
                        className="cursor-pointer hover-lift"
                        onClick={() => toggleSelection(interest, 'interests')}
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Hobbies */}
                <div className="space-y-2">
                  <Label>Hobbies</Label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {HOBBIES.map((hobby) => (
                      <Badge
                        key={hobby}
                        variant={profileData.hobbies.includes(hobby) ? "default" : "outline"}
                        className="cursor-pointer hover-lift"
                        onClick={() => toggleSelection(hobby, 'hobbies')}
                      >
                        {hobby}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button onClick={handleSaveProfile} className="w-full gradient-primary animate-glow hover-lift">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card className="glass-effect border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Change Password
                </CardTitle>
                <CardDescription>Update your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="bg-background/50 border-border/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="bg-background/50 border-border/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="bg-background/50 border-border/50"
                  />
                </div>

                <Button onClick={handleChangePassword} className="gradient-primary animate-glow hover-lift">
                  <Lock className="h-4 w-4 mr-2" />
                  Update Password
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}