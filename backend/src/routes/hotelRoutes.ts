import { Router } from "express";
import { hotelController } from "../controllers/hotelController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

// All hotel routes require authentication
router.use(authMiddleware);

// Hotel search routes
router.get("/search", hotelController.searchHotels.bind(hotelController));
router.get("/popular", hotelController.getPopularHotels.bind(hotelController));

export default router;

