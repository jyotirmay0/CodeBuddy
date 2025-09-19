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
router.get("/joined",verifyJWT, getJoinedProjects);
router.get("/:id",verifyJWT, getProjectById);
router.put("/:id",verifyJWT, updateProject);
router.delete("/:id",verifyJWT, deleteProject);
router.patch("/:id/close",verifyJWT, closeProject);
router.patch("/:id/leave",verifyJWT, leaveProject);
router.delete("/:id/reject/:userId",verifyJWT, rejectJoinRequest);
router.delete("/:id/remove/:userId",verifyJWT, removeMember);