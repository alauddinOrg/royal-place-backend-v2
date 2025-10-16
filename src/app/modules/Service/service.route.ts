import { Router } from "express";
import { serviceController } from "./service.controller";
import upload from "../../middleware/uploadMiddleware";
import { authenticateUser } from "../../middleware/authenticateUser";
import { authorizeRoles } from "../../middleware/authorizeRoles";

const router = Router();

// 🔓 Public Route — Anyone with authentication can access this
router.get("/",  serviceController.getAllServices);


// Create a new service (Only "receptionist" role is allowed)
router.post(
  "/",
  authenticateUser,
  authorizeRoles("admin"),
  upload.single("image"),
  serviceController.createService
);

// Delete an existing service (Only "receptionist" role is allowed)
router.delete(
  "/:id",
  authenticateUser,
  authorizeRoles("admin"),
  serviceController.deleteService
);

// Update an existing service (Only "admin" role is allowed)
router.patch(
  "/:id",
  authenticateUser,
  authorizeRoles("admin"),
  upload.single("image"),
  serviceController.updateService
);

// Export the router to be used in the main app
export const serviceRoute = router;
