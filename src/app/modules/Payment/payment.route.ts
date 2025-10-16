import express from "express";
import { paymentController } from "./payment.controller";
import { strictLimiter } from "../../middleware/rateLimiter";
import { authorizeRoles } from "../../middleware/authorizeRoles";

const router = express.Router();

// payment sucess
router.post(
    "/success",

    strictLimiter,
    paymentController.paymentSuccess
);
// payment fail
router.post(
    "/fail",

    strictLimiter,
    paymentController.paymentFail
);

// payment fail
router.get(
    "/cancel",

    strictLimiter,
    paymentController.paymentCancel
);
// get all paymnets 
router.get('/', paymentController.getPayments
);
// get payments by User id
router.get('/:id', paymentController.getPaymentsByUserId
);


export const paymentRoute = router;
