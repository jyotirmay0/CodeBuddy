import { Router } from "express";
import {
  createProject,
  requestToJoinProject,
  acceptJoinRequest,
  closeProject,
  getAllOpenProjects,
  getMyProjects
} from "../controllers/project.js";
import { verifyJWT } from "../middleware/auth.js";

export const router = Router();

router.post("/", verifyJWT, createProject);
router.post("/:id/request", verifyJWT, requestToJoinProject);
router.put("/:id/accept/:userId", verifyJWT, acceptJoinRequest);
router.patch("/:id/close", verifyJWT, closeProject);
router.get("/open", verifyJWT, getAllOpenProjects);
router.get("/mine", verifyJWT, getMyProjects);