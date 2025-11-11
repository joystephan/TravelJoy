import { Router } from "express";
import { tripController } from "../controllers/tripController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

// All trip routes require authentication
router.use(authMiddleware);

// Trip management routes
router.post("/", tripController.createTrip.bind(tripController));
router.get("/", tripController.getUserTrips.bind(tripController));
router.get("/:tripId", tripController.getTripById.bind(tripController));
router.delete("/:tripId", tripController.deleteTrip.bind(tripController));
router.post(
  "/:tripId/optimize",
  tripController.optimizeTrip.bind(tripController)
);

// Activity management routes
router.put(
  "/activities/:activityId",
  tripController.updateActivity.bind(tripController)
);
router.delete(
  "/activities/:activityId",
  tripController.deleteActivity.bind(tripController)
);
router.post(
  "/activities/:activityId/replace",
  tripController.replaceActivity.bind(tripController)
);

export default router;
