import { Router } from "express";
import {
  createProject,
  requestToJoinProject,
  acceptJoinRequest,
  closeProject,
  getAllOpenProjects,
  getMyProjects,
  getProjectById,
  updateProject,
  deleteProject,
  rejectJoinRequest,
  removeMember,
  leaveProject,
  getJoinedProjects
} from "../controllers/project.js";
import { verifyJWT } from "../middleware/auth.js";

export const router = Router();

router.post("/", verifyJWT, createProject);
router.post("/:id/request", verifyJWT, requestToJoinProject);
router.put("/:id/accept/:userId", verifyJWT, acceptJoinRequest);
router.patch("/:id/close", verifyJWT, closeProject);
router.get("/open", verifyJWT, getAllOpenProjects);
router.get("/mine", verifyJWT, getMyProjects);
router.get("/joined", getJoinedProjects);
router.get("/:id", getProjectById);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);
router.patch("/:id/close", closeProject);
router.patch("/:id/leave", leaveProject);
router.post("/:id/request", requestToJoinProject);
router.put("/:id/accept/:userId", acceptJoinRequest);
router.delete("/:id/reject/:userId", rejectJoinRequest);
router.delete("/:id/remove/:userId", removeMember);