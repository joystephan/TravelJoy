"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tripController_1 = require("../controllers/tripController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// All trip routes require authentication
router.use(authMiddleware_1.authMiddleware);
// Trip management routes
router.post("/", tripController_1.tripController.createTrip.bind(tripController_1.tripController));
router.get("/", tripController_1.tripController.getUserTrips.bind(tripController_1.tripController));
router.get("/:tripId", tripController_1.tripController.getTripById.bind(tripController_1.tripController));
router.delete("/:tripId", tripController_1.tripController.deleteTrip.bind(tripController_1.tripController));
router.post("/:tripId/optimize", tripController_1.tripController.optimizeTrip.bind(tripController_1.tripController));
// Activity management routes
router.put("/activities/:activityId", tripController_1.tripController.updateActivity.bind(tripController_1.tripController));
router.delete("/activities/:activityId", tripController_1.tripController.deleteActivity.bind(tripController_1.tripController));
router.post("/activities/:activityId/replace", tripController_1.tripController.replaceActivity.bind(tripController_1.tripController));
exports.default = router;
