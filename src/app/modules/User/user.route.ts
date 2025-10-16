import { Router } from "express";
import { userController } from "./user.controller";
import { generalLimiter} from "../../middleware/rateLimiter";
import upload from "../../middleware/uploadMiddleware";
import { authorizeRoles } from "../../middleware/authorizeRoles";
import { authenticateUser } from "../../middleware/authenticateUser";

const router = Router();

// User registration with general rate limiter
router.post("/signup",  userController.regestrationUser);

// User login with strict rate limiter
router.post("/login", userController.loginUser);

// Refresh access token with strict rate limiter
router.post("/refresh-token",  userController.refreshAccessToken);

// Get all users (admin only) with authentication and strict limiter
router.get("/",authenticateUser, authorizeRoles("admin"), userController.getAllUsers);


// Get single user by ID with general rate limiter
router.get("/:id", generalLimiter, userController.getSingleUser);

// Update user by ID with optional image upload and general limiter
router.patch("/:id", generalLimiter, upload.single("image"), userController.updateUser);

// Delete user by ID with general limiter
router.delete("/:id", generalLimiter, userController.deleteUser);

// Logout route (clears tokens)
router.post("/logout", userController.logoutUser);

export const userRoute = router;
