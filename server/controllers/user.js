import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import cloudinary from "../utils/Cloudinary.js"
import fs from 'fs';
import { InferenceClient } from "@huggingface/inference";
import dotenv from "dotenv"
dotenv.config()

const allSkills = ["JavaScript", "Python", "Java", "C++", "HTML", "CSS", "React", "Node.js", "Express.js", "MongoDB","SQL", "TypeScript", "Git", "Docker", "Kubernetes", "AWS", "Azure", "Firebase",
                "UI/UX Design", "Figma", "Sketch", "Adobe XD", "Photoshop", "Illustrator",
                "Communication", "Teamwork", "Leadership", "Problem-solving", "Time management", "Public speaking","Project management", "Agile", "Scrum", "Data Analysis", "Machine Learning", "Deep Learning","Cybersecurity", "Networking", "Linux", "Cloud Computing", "DevOps", "CI/CD","Writing", "Editing", "Blogging", "Marketing", "SEO", "Sales", "Customer Support",
                "Video Editing", "3D Modeling", "Animation", "Game Development", "AR/VR"];     
const allHobbies = ["Reading", "Writing", "Drawing", "Painting", "Photography", "Cooking", "Baking", 
                "Gardening", "Fishing", "Hiking", "Camping", "Cycling", "Running", "Swimming", 
                "Singing", "Playing Guitar", "Playing Piano", "Drumming", "Dancing", "Chess", 
                "Board Games", "Collecting Stamps", "Collecting Coins", "Bird Watching", "Origami", 
                "Knitting", "Calligraphy", "Blogging", "Podcasting", "Filmmaking", "3D Printing", 
                "Traveling", "Exploring Cafes", "Watching Movies", "Watching Anime", "Playing Video Games","Skateboarding", "Snowboarding", "Surfing", "Martial Arts", "Yoga", "Meditation", 
                "DIY Projects", "Woodworking", "Home Brewing", "Journaling", "Astrophotography", 
                "Model Building", "Rock Climbing", "Scuba Diving", "Magic Tricks", "Fantasy Sports"];    
  const allInterests = ["Technology", "Science", "Artificial Intelligence", "Machine Learning", "Quantum Computing","Blockchain", "Cryptocurrency", "Cybersecurity", "Startups", "Entrepreneurship","Finance", "Stock Market", "Personal Development", "Psychology", "Philosophy","History", "Geopolitics", "Literature", "Space Exploration", "Astronomy",
  "Climate Change", "Sustainability", "Photography", "Travel", "Food", "Fitness",
                "Meditation", "Yoga", "Music", "Cinema", "Video Games", "E-Sports",
                "Art", "Design", "Fashion", "Cars", "Motorsports", "Animals", "Wildlife",
                "Education", "Learning Languages", "DIY Projects", "Open Source", "Volunteering",
                "Robotics", "Biotech", "Neuroscience", "Data Privacy", "Human Rights"];

const client = new InferenceClient(process.env.HF_TOKEN);

const getSimilarItemsFromAI = async (userItems, allItems, categoryName, expandFactor = 2) => {
  const prompt = `
You're a recommendation system. Given a user's ${categoryName} and a full list of all possible ${categoryName}, suggest ${5 * expandFactor} items that the user does NOT have but are similar in meaning or context.

User's ${categoryName}: ${userItems.join(", ")}
All ${categoryName}: ${allItems.join(", ")}

Return the response as a JSON array of strings, e.g.:
["item1", "item2", "item3"]
`;

  const response = await client.chatCompletion({
    provider: "featherless-ai",
    model: "HuggingFaceH4/zephyr-7b-beta",
    messages: [{ role: "user", content: prompt }],
  });

  try {
    const raw = response.choices[0].message.content;
    return JSON.parse(raw).filter(item => !userItems.includes(item));
  } catch (err) {
    return [];
  }
};

const getSuggestions = async (user, extraSkills, extraHobbies, extraInterests) => {
  const totalSkills = [...new Set([...user.skills, ...extraSkills])];
  const totalHobbies = [...new Set([...user.hobbies, ...extraHobbies])];
  const totalInterests = [...new Set([...user.interests, ...extraInterests])];

  const excludeIds = [user._id.toString(), ...user.friends.map(id => id.toString())];

  const users = await User.find({
    _id: { $nin: excludeIds },
    $or: [
      { skills: { $in: totalSkills } },
      { hobbies: { $in: totalHobbies } },
      { interests: { $in: totalInterests } },
    ],
  }, "_id username skills hobbies interests");

  // Score and sort
  const scored = users.map(u => {
    const skillMatches = u.skills.filter(s => totalSkills.includes(s)).length;
    const interestMatches = u.interests.filter(i => totalInterests.includes(i)).length;
    const hobbyMatches = u.hobbies.filter(h => totalHobbies.includes(h)).length;
    const score = 3 * skillMatches + 2 * interestMatches + hobbyMatches;
    return { _id: u._id, username: u.username, score };
  });

  return scored.filter(u => u.score > 0).sort((a, b) => b.score - a.score).slice(0, 10);
};


export const sendFriendRequet=AsyncHandler(async(req,res)=>{
    const {friend}=req.body

    const sender=await User.findById(req.user._id)
    const receiver=await User.findById(friend)
    if(!sender ||!receiver)throw new ApiError(404, "User not found");

    if (receiver.requests.includes(sender._id))throw new ApiError(400, "Friend request already sent");

    receiver.requests.push(sender._id);
    await receiver.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, null, "Friend request sent successfully"));
})

export const acceptFriendRequest=AsyncHandler(async(req,res)=>{
    const {friend}=req.body

    const sender=await User.findById(req.user._id)
    const receiver=await User.findById(friend)
    if(!sender ||!receiver)throw new ApiError(404, "User not found");

    if (receiver.friends.includes(sender._id))throw new ApiError(400, "Already in friend list");

    receiver.friends.push(sender._id);
    receiver.requests = receiver.requests.filter(id => id.toString() !== sender._id.toString());
    await receiver.save({ validateBeforeSave: false });

    sender.friends.push(receiver._id);
    await sender.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, null, "Friend request sent successfully"));
})

export const friendList = AsyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("friends", "_id username");

  if (!user) throw new ApiError(404, "User not found");

  return res.status(200).json(
    new ApiResponse(200, { friends: user.friends }, "Friends fetched successfully")
  );
});

export const friendDetails=AsyncHandler(async(req,res)=>{
  const {id}=req.body
  const user=await User.findById(id).select("-password -verified -_id -createdAt -updatedAt")
  if(!user)throw new ApiError(401,"User not found");
  return res.status(200).json(
    new ApiResponse(200,{user},"User fetched successfully")
  )
})

export const uploadProfilePic = AsyncHandler(async (req, res) => {
  if (!req.file)throw new ApiError(400, "Image file is required");
  const localPath = req.file.path;

  const result = await cloudinary.uploader.upload(localPath, {
    folder: 'profile_pics',
    crop: 'limit'
  });
  fs.unlinkSync(localPath);

  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "User not found");

  user.pic = result.secure_url;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(200, { pic: user.pic }, "Profile picture uploaded successfully")
  );
});

export const updateContact = AsyncHandler(async (req, res) => {
  const { contact } = req.body;
  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "User not found");

  user.contact = contact;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(200,null, "Contact updated successfully")
  );
});

export const updateUserDetails = AsyncHandler(async (req, res) => {
  const { skills, interests, hobbies } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "User not found");

  if (skills) user.skills = skills;
  if (interests) user.interests = interests;
  if (hobbies) user.hobbies = hobbies;

  await user.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(200, null, "User details updated successfully")
  );
});

export const userDetails=AsyncHandler(async(req,res)=>{
  if(!req.user)throw new ApiError(401,"User not authenticated");
  const user=await User.findById(req.user._id).select("-password -verified -_id -createdAt -updatedAt")
  return res.status(200).json(
    new ApiResponse(200,{user},"User fetched successfully")
  )
})

export const updatePassword=AsyncHandler(async(req,res)=>{
  const {oldPassword,newPassword}=req.body

  if (!oldPassword || !newPassword || oldPassword.trim() === "" || newPassword.trim() === "") {
    throw new ApiError(400, "Both old and new passwords are required");
  }

  const user=await User.findById(req.user._id)
  if(!user)throw new ApiError(400, "User doesnot exist");

  const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)
  if(!isPasswordCorrect)throw new ApiError(401,"Incorrect original password");

  user.password=newPassword

  await user.save({validateBeforeSave:false})

  return res.status(200).json(
    new ApiResponse(200,null,"Password Changed Successfully")
  )
})

export const friendSuggestions = AsyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "User not found");

  const extraFactor = [2,3,4,5]; // two passes: normal and expanded
  let suggestions = [];

  for (const factor of extraFactor) {
    const [extraSkills, extraHobbies, extraInterests] = await Promise.all([
      getSimilarItemsFromAI(user.skills, allSkills, "skills", factor),
      getSimilarItemsFromAI(user.hobbies, allHobbies, "hobbies", factor),
      getSimilarItemsFromAI(user.interests, allInterests, "interests", factor),
    ]);

    suggestions = await getSuggestions(user, extraSkills, extraHobbies, extraInterests);
    if (suggestions.length >= 5) break; // accept results if 5+ users
  }

  return res.status(200).json(
    new ApiResponse(200, { suggestions }, "AI-based friend suggestions fetched")
  );
});