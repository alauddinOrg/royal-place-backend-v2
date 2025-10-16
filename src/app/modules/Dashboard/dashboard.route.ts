import express from "express";
import { dashboardController } from "./dashboard.controller";
import { authenticateUser } from "../../middleware/authenticateUser";
import { authorizeRoles } from "../../middleware/authorizeRoles";

const router = express.Router();

// ✅ Only one dashboard route (role-based)
router.get("/", authenticateUser, authorizeRoles("admin", "guest", "receptonist"), dashboardController.getDashboardData);

export const dashboardRoute = router;
