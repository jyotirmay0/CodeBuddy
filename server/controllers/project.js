import Project from "../models/Projects.js";
import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";

export const createProject = AsyncHandler(async (req, res) => {
  const { name, description, skills, requirements } = req.body;

  if (!name || !description || !skills?.length || !requirements) {
    throw new ApiError(400, "Name, description, and skills are required");
  }

  const project = await Project.create({
    name,
    description,
    skills,
    requirements,
    owner: req.user._id,
    members: [req.user._id]
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
