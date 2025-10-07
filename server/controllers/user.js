import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import cloudinary from "../utils/Cloudinary.js"
import fs from 'fs';
import { InferenceClient } from "@huggingface/inference";
import dotenv from "dotenv"
import MessageRoom from "../models/Messages.js";
import Project from "../models/Projects.js";
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

const getSimilarItemsFromAICombined = async (user, allSkills, allHobbies, allInterests, expandFactor = 2) => {
  const prompt = `
  You're a recommendation system. Given a user's skills, hobbies and interests and full lists of each, 
  suggest ${5 * expandFactor} new items per category that the user does NOT have but are similar.

  User's skills: ${user.skills.join(", ")}
  All skills: ${allSkills.join(", ")}

  User's hobbies: ${user.hobbies.join(", ")}
  All hobbies: ${allHobbies.join(", ")}

  User's interests: ${user.interests.join(", ")}
  All interests: ${allInterests.join(", ")}

  Return the response strictly as JSON object:
  {
    "skills": ["skill1","skill2"],
    "hobbies": ["hobby1","hobby2"],
    "interests": ["interest1","interest2"]
  }
  `;
  const response = await
    client.chatCompletion({
      provider: "featherless-ai",
      model: "HuggingFaceH4/zephyr-7b-beta",
      messages: [{ role: "user", content: prompt }],
    })

  try {
    const raw = response.choices[0].message.content;
    const parsed = JSON.parse(raw);

    return {
      skills: parsed.skills?.filter(item => !user.skills.includes(item)) || [],
      hobbies: parsed.hobbies?.filter(item => !user.hobbies.includes(item)) || [],
      interests: parsed.interests?.filter(item => !user.interests.includes(item)) || [],
    };
  } catch (err) {
    return { skills: [], hobbies: [], interests: [] };
  }
};


const getSuggestions = async (user, extraSkills, extraHobbies, extraInterests) => {
  const totalSkills = [...new Set([...user.skills, ...extraSkills])];
  const totalHobbies = [...new Set([...user.hobbies, ...extraHobbies])];
  const totalInterests = [...new Set([...user.interests, ...extraInterests])];

  const excludeIds = [user._id.toString(), ...user.buddies.map(id => id.toString())];

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


export const sendBuddyRequet=AsyncHandler(async(req,res)=>{
    const { buddyId } = req.params;

    const sender=await User.findById(req.user._id)
    const receiver=await User.findById(buddyId)
    if(!sender ||!receiver)throw new ApiError(404, "User not found");

    if (receiver.requests.includes(sender._id))throw new ApiError(400, "Buddy request already sent");

    receiver.requests.push(sender._id);
    await receiver.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, null, "Buddy request sent successfully"));
})

export const acceptBuddyRequest=AsyncHandler(async(req,res)=>{
    const {buddyId}=req.params

    const receiver=await User.findById(req.user._id)
    const sender=await User.findById(buddyId)
    if(!sender ||!receiver)throw new ApiError(404, "User not found");

    if (receiver.buddies.includes(sender._id))throw new ApiError(400, "Already in buddy list");

    receiver.buddies.push(sender._id);
    sender.buddies.push(receiver._id);
    receiver.requests = receiver.requests.filter(id => id.toString() !== sender._id.toString());

    await receiver.save({ validateBeforeSave: false });
    await sender.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, null, "Buddy request sent successfully"));
})

export const rejectBuddyRequest = AsyncHandler(async (req, res) => {
  const { buddyId } = req.params;

  const receiver = await User.findById(req.user._id);
  if (!receiver) throw new ApiError(404, "User not found");

  const beforeCount = receiver.requests.length;
  receiver.requests = receiver.requests.filter(id => id.toString() !== buddyId.toString());

  if (receiver.requests.length === beforeCount) {
    throw new ApiError(400, "No pending request from this user");
  }

  await receiver.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, null, "Buddy request rejected successfully"));
});

export const buddyRequests = AsyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'requests',
    select: 'name dob location pic bio skills interests hobbies projects isOnline'
  });

  if (!user) throw new ApiError(404, "User not found");

  if(user.requests.length===0)return res.status(200).json(new ApiResponse(200, null, "U have no pending requests"));

  return res.status(200).json(
    new ApiResponse(200, { received: user.requests || [] }, "Received buddy requests fetched successfully")
  );
});


export const buddyList = AsyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("buddies");

  if (!user) throw new ApiError(404, "User not found");

  if(user.buddies.length===0)return res.status(200).json(new ApiResponse(200, null, "No buddies in List"));

  return res.status(200).json(
    new ApiResponse(200, { buddies: user.buddies }, "Buddies fetched successfully")
  );
});

export const buddyDetails=AsyncHandler(async(req,res)=>{
  const { id } = req.params;
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
  const { skills, interests, hobbies,name,dob,location,bio,projects,socials } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "User not found");

  if (skills) user.skills = skills;
  if (interests) user.interests = interests;
  if (hobbies) user.hobbies = hobbies;
  if (bio)user.bio=bio;
  if(projects)user.projects=projects
  if(socials)user.socials=socials

  user.name=name;user.dob=dob;user.location=location;

  await user.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(200, null, "User details updated successfully")
  );
});

export const userDetails=AsyncHandler(async(req,res)=>{
  if(!req.user)throw new ApiError(401,"User not authenticated");
  const user=await User.findById(req.user._id).select("-password -verified -createdAt -updatedAt")
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

export const buddySuggestions = AsyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "User not found");

  const extra = await getSimilarItemsFromAICombined(user, allSkills, allHobbies, allInterests);
  const suggestions = await getSuggestions(user, extra.skills, extra.hobbies, extra.interests);
  
  if (suggestions.length === 0) {
    return res.status(200).json(new ApiResponse(200, [], "No AI suggestions found"));
  }

  const suggestedIds = suggestions.map(s => s._id);

  const usersToDisplay = await User.find({ _id: { $in: suggestedIds } })
    .select("name dob location pic bio skills interests hobbies projects isOnline");

  const sortedUsers = suggestedIds.map(id => 
    usersToDisplay.find(u => u._id.equals(id))
  ).filter(Boolean);

  return res.status(200).json(
    new ApiResponse(200, sortedUsers, "AI-based buddy suggestions fetched")
  );
});

export const dashboardStats = AsyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate("projects", "_id")
    .populate("buddies", "_id")
    .lean();

  if (!user) throw new ApiError(404, "User not found");

  const projectsJoined = user.projects?.length || 0;
  const buddiesCount = user.buddies?.length || 0;
  const skillsCount = user.skills?.length || 0;

  const fields = [
    user.name,
    user.dob,
    user.location,
    user.pic,
    user.bio,
    user.skills?.length > 0,
    user.socials?.length > 0,
    user.deployedProjects?.length > 0,
  ];

  const filled = fields.filter(Boolean).length;
  const profileCompletion = Math.round((filled / fields.length) * 100);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        projectsJoined,
        buddiesCount,
        skillsCount,
        profileCompletion,
      },
      "Dashboard stats fetched successfully"
    )
  );
});

export const discoverUsers = AsyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "User not found");

  const excludeIds = [
    user._id,
    ...user.buddies.map(id => id.toString()),
    ...user.requests.map(id => id.toString())
  ];

  const recentUsers = await User.find({ _id: { $nin: excludeIds } })
    .sort({ createdAt: -1 })
    .limit(50)
    .select("name dob location pic bio skills interests hobbies projects isOnline");

  return res.status(200).json(
    new ApiResponse(200, recentUsers, "Recent users fetched successfully")
  );
});

export const sendBuddyRequestWithMessage = AsyncHandler(async (req, res) => {
  const { buddyId } = req.params;
  const { content } = req.body;

  const sender = await User.findById(req.user._id);
  const receiver = await User.findById(buddyId);
  if (!sender || !receiver) throw new ApiError(404, "User not found");

  if (receiver.requests.includes(sender._id))
    throw new ApiError(400, "Buddy request already sent. Waiting for buddy to accept request.");

  receiver.requests.push(sender._id);
  await receiver.save({ validateBeforeSave: false });

  let room = await MessageRoom.findOne({
    members: { $all: [sender._id, receiver._id], $size: 2 }
  });

  if (!room) {
    room = await MessageRoom.create({
      members: [sender._id, receiver._id],
      messages: [],
    });

    await User.updateMany(
      { _id: { $in: [sender._id, receiver._id] } },
      { $push: { chatRooms: room._id } }
    );
  }

  if (!content || !content.trim()) {
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Buddy request sent (no message content)"));
  }

  const message = {
    sender: sender._id,
    content: content.trim(),
    timestamp: new Date(),
  };

  await MessageRoom.findByIdAndUpdate(room._id, {
    $push: { messages: message },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          roomId: room._id,
          message,
        },
        "Buddy request sent and message delivered"
      )
    );
});

export const openChats = AsyncHandler(async (req, res) => {
  const userId = req.user._id;
  const rooms = await MessageRoom.find({ members: userId }).sort({ updatedAt: -1 });

  const results = await Promise.all(
    rooms.map(async (room) => {
      const latestMessage = room.messages?.length
        ? room.messages[room.messages.length - 1]
        : null;

      const project = await Project.findOne({ chatRoom: room._id });
      if (project) {
        return {
          type: 'project',
          projectId: project._id,
          roomId: room._id,
          title: project.name,
          latestMessage: latestMessage?.content || "",
          latestMessageGiver: latestMessage
            ? (await User.findById(latestMessage.sender).select("name")).name
            : null,
        };
      } else {
        const buddyId = room.members.find((m) => m.toString() !== userId.toString());
        const buddy = await User.findById(buddyId).select("name");

        return {
          type: 'dm',
          buddyId:buddy._id,
          buddyAvatar: buddy.pic,
          roomId: room._id,
          title: buddy.name,
          latestMessage: latestMessage?.content || "",
          latestMessageGiver: latestMessage
            ? (await User.findById(latestMessage.sender).select("name")).name
            : null,
        };
      }
    })
  );

  return res.status(200).json(new ApiResponse(200, results, "Inbox found"));
});

export const getDmChat = AsyncHandler(async (req, res) => {
  const { buddyId } = req.params;
  const userId = req.user._id;

  let room = await MessageRoom.findOne({
    members: { $all: [userId, buddyId], $size: 2 },
  }).populate({
    path: 'messages',
    populate: { path: 'sender', select: 'name pic username' }
  });

  if (!room)room = await MessageRoom.create({ members: [userId, buddyId], messages: [] });
  const buddy = await User.findById(buddyId).select("name pic");

  return res.status(200).json(new ApiResponse(200, {room,buddy}, "DM chat fetched successfully"));
});