import { Router } from "express";
import { chatController } from "../controllers/chatController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

// All chat routes require authentication
router.use(authMiddleware);

// Chat routes
router.post("/message", chatController.sendMessage.bind(chatController));
router.post("/quick-action", chatController.quickAction.bind(chatController));
router.get("/history", chatController.getChatHistory.bind(chatController));
router.delete("/history", chatController.clearChatHistory.bind(chatController));
router.post("/modify-trip", chatController.modifyTripPlan.bind(chatController));

export default router;
