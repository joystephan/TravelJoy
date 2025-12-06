"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const hotelController_1 = require("../controllers/hotelController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// All hotel routes require authentication
router.use(authMiddleware_1.authMiddleware);
// Hotel search routes
router.get("/search", hotelController_1.hotelController.searchHotels.bind(hotelController_1.hotelController));
router.get("/popular", hotelController_1.hotelController.getPopularHotels.bind(hotelController_1.hotelController));
exports.default = router;
