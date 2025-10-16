import express from "express";
import { bookingController } from "./booking.controller";
import { strictLimiter } from "../../middleware/rateLimiter";

const router = express.Router();


router.post("/",strictLimiter,bookingController.initiateBooking
);


router.patch("/:id",strictLimiter,bookingController.cancelBooking
);


router.get("/", bookingController.getFilteredBookings);


router.get("/:roomId", bookingController.checkAvailableRoomsById);
router.get("/userId/:id", bookingController.checkbookingRoomsByUserId);

export const bookingRoute = router;
