"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chatController_1 = require("../controllers/chatController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// All chat routes require authentication
router.use(authMiddleware_1.authMiddleware);
// Chat routes
router.post("/message", chatController_1.chatController.sendMessage.bind(chatController_1.chatController));
router.post("/quick-action", chatController_1.chatController.quickAction.bind(chatController_1.chatController));
router.get("/history", chatController_1.chatController.getChatHistory.bind(chatController_1.chatController));
router.delete("/history", chatController_1.chatController.clearChatHistory.bind(chatController_1.chatController));
router.post("/modify-trip", chatController_1.chatController.modifyTripPlan.bind(chatController_1.chatController));
exports.default = router;
