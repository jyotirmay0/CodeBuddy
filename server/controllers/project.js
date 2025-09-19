import Project from "../models/Projects.js";
import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import MessageRoom from "../models/Messages.js"

export const createProject = AsyncHandler(async (req, res) => {
  const { name, description, skills, requirements } = req.body;

  if (!name || !description || !skills?.length || !requirements) {
    throw new ApiError(400, "Name, description, and skills are required");
  }

  const chatRoom = await MessageRoom.create({
    name: `${name} Chat`,
    members: [req.user._id],
  });

  const project = await Project.create({
    name,
    description,
    skills,
    requirements,
    owner: req.user._id,
    members: [req.user._id],
    chatRoom: chatRoom._id
  });

  return res.status(201).json(
    new ApiResponse(201, project, "Project created successfully")
  );
});

export const requestToJoinProject = AsyncHandler(async (req, res) => {
  const { id } = req.params;

  const project = await Project.findById(id);
  if (!project) throw new ApiError(404, "Project not found");

  if (project.status === "closed")throw new ApiError(403, "Project is closed for new requests");

  if (project.members.includes(req.user._id))throw new ApiError(400, "You are already a member of this project");

  if (project.requests.includes(req.user._id))throw new ApiError(400, "You have already requested to join");

  project.requests.push(req.user._id);
  await project.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(200, null, "Join request sent successfully")
  );
});


export const acceptJoinRequest = AsyncHandler(async (req, res) => {
  const { id, userId } = req.params;

  const project = await Project.findById(id);
  if (!project) throw new ApiError(404, "Project not found");
  if (!project.owner.equals(req.user._id))throw new ApiError(403, "Only project owner can accept requests");
  if (!project.requests.includes(userId))throw new ApiError(400, "User has not requested to join");

  project.requests = project.requests.filter(id => id.toString() !== userId);
  project.members.push(userId);

  await MessageRoom.findByIdAndUpdate(project.chatRoom, {
    $push: { members: userId },
  });

  await project.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(200, null, "User added to project successfully")
  );
});

export const closeProject = AsyncHandler(async (req, res) => {
  const { id } = req.params;

  const project = await Project.findById(id);
  if (!project) throw new ApiError(404, "Project not found");

  if (!project.owner.equals(req.user._id)) {
    throw new ApiError(403, "Only project owner can close the project");
  }

  project.status = "closed";
  await project.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(200, null, "Project has been closed to new requests")
  );
});

export const getAllOpenProjects = AsyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "User not found");
  
  const projects = await Project.find({
    status: "open",
    skills: { $in: user.skills || [] }
  }).populate("owner", "username");

  return res.status(200).json(
    new ApiResponse(200,projects, "Matching open projects fetched")
  );
});


export const getMyProjects = AsyncHandler(async (req, res) => {
  const projects = await Project.find({ owner: req.user._id });
  return res.status(200).json(
    new ApiResponse(200, projects, "Your projects fetched")
  );
});

export const getProjectById = AsyncHandler(async (req, res) => {
  const { id } = req.params;

  const project = await Project.findById(id)
    .populate("owner", "username avatar")
    .populate("members", "username avatar")
    .populate("requests", "username avatar")
    .populate({
      path: "chatRoom",
      select: "name messages", 
      model: "MessageRoom", 
      options: {
      perDocumentLimit: 50,
      sort: { "messages.timestamp": -1 }
      },
      populate: {
      path: "messages.sender", 
      select: "username name pic", 
      model: "User"
      }
    });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return res.status(200).json(
    new ApiResponse(200, project, "Project details fetched successfully")
  );
});

export const updateProject = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, skills, requirements } = req.body;

  const project = await Project.findById(id);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // Authorization: Only the owner can update the project
  if (!project.owner.equals(req.user._id)) {
    throw new ApiError(403, "You are not authorized to update this project");
  }

  // Update fields if they are provided
  project.name = name || project.name;
  project.description = description || project.description;
  project.skills = skills || project.skills;
  project.requirements = requirements || project.requirements;

  await project.save({ validateBeforeSave: true }); // Use validation here

  return res.status(200).json(
    new ApiResponse(200, project, "Project updated successfully")
  );
});

export const deleteProject = AsyncHandler(async (req, res) => {
  const { id } = req.params;

  const project = await Project.findById(id);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (!project.owner.equals(req.user._id)) {
    throw new ApiError(403, "Only the project owner can delete the project");
  }

  await Project.findByIdAndDelete(id);
  await MessageRoom.findByIdAndDelete(project.chatRoom);
  return res.status(200).json(
    new ApiResponse(200, {}, "Project deleted successfully")
  );
});

export const rejectJoinRequest = AsyncHandler(async (req, res) => {
  const { id, userId } = req.params;

  const project = await Project.findById(id);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (!project.owner.equals(req.user._id)) {
    throw new ApiError(403, "Only the project owner can reject requests");
  }

  if (!project.requests.includes(userId)) {
    throw new ApiError(400, "User has not requested to join");
  }

  // Simply remove the user's ID from the requests array
  project.requests = project.requests.filter(id => id.toString() !== userId);
  await project.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(200, null, "Join request rejected")
  );
});

export const removeMember = AsyncHandler(async (req, res) => {
  const { id, userId } = req.params;

  // You cannot remove yourself using this route; use a "leave" route for that.
  if (req.user._id.toString() === userId) {
      throw new ApiError(400, "You cannot remove yourself with this action.");
  }

  const project = await Project.findById(id);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (!project.owner.equals(req.user._id)) {
    throw new ApiError(403, "Only the project owner can remove members");
  }
  
  if (!project.members.includes(userId)) {
      throw new ApiError(404, "This user is not a member of the project.");
  }

  project.members = project.members.filter(memberId => memberId.toString() !== userId);
  await MessageRoom.findByIdAndUpdate(project.chatRoom, { $pull: { members: userId } });
  await project.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(200, null, "Member removed from the project")
  );
});

export const leaveProject = AsyncHandler(async (req, res) => {
  const { id } = req.params;

  const project = await Project.findById(id);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // The owner cannot leave the project; they must delete it or transfer ownership.
  if (project.owner.equals(req.user._id)) {
    throw new ApiError(400, "Owner cannot leave the project. Please delete it instead.");
  }

  if (!project.members.includes(req.user._id)) {
    throw new ApiError(400, "You are not a member of this project.");
  }

  project.members = project.members.filter(memberId => !memberId.equals(req.user._id));
  await MessageRoom.findByIdAndUpdate(project.chatRoom, { $pull: { members: req.user._id } });
  await project.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(200, {}, "You have left the project")
  );
});

export const getJoinedProjects = AsyncHandler(async (req, res) => {
  const projects = await Project.find({
    members: req.user._id, // User is in the members array
    owner: { $ne: req.user._id } // But is NOT the owner
  }).populate("owner", "username");

  return res.status(200).json(
    new ApiResponse(200, projects, "Projects you've joined fetched")
  );
});