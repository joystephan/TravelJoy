"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatController = exports.ChatController = void 0;
const chatService_1 = require("../services/chatService");
class ChatController {
    /**
     * Send a chat message
     */
    async sendMessage(req, res) {
        try {
            const userId = req.user.userId;
            const { message, tripId } = req.body;
            if (!message) {
                return res.status(400).json({
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Message is required",
                    },
                });
            }
            const response = await chatService_1.chatService.processMessage(userId, message, tripId);
            res.json({
                response: response.message,
                action: response.action,
                updatedPlan: response.updatedPlan,
            });
        }
        catch (error) {
            console.error("Chat message error:", error);
            res.status(500).json({
                error: {
                    code: "CHAT_ERROR",
                    message: "Failed to process chat message",
                },
            });
        }
    }
    /**
     * Process a quick action
     */
    async quickAction(req, res) {
        try {
            const userId = req.user.userId;
            const { action, tripId } = req.body;
            if (!action) {
                return res.status(400).json({
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Action is required",
                    },
                });
            }
            const response = await chatService_1.chatService.processQuickAction(userId, action, tripId);
            res.json({
                response: response.message,
                action: response.action,
                updatedPlan: response.updatedPlan,
            });
        }
        catch (error) {
            console.error("Quick action error:", error);
            res.status(500).json({
                error: {
                    code: "QUICK_ACTION_ERROR",
                    message: "Failed to process quick action",
                },
            });
        }
    }
    /**
     * Get chat history
     */
    async getChatHistory(req, res) {
        try {
            const userId = req.user.userId;
            const { tripId } = req.query;
            const history = chatService_1.chatService.getChatHistory(userId, tripId);
            res.json({ history });
        }
        catch (error) {
            console.error("Get chat history error:", error);
            res.status(500).json({
                error: {
                    code: "FETCH_ERROR",
                    message: "Failed to fetch chat history",
                },
            });
        }
    }
    /**
     * Clear chat history
     */
    async clearChatHistory(req, res) {
        try {
            const userId = req.user.userId;
            const { tripId } = req.body;
            chatService_1.chatService.clearChatHistory(userId, tripId);
            res.json({
                message: "Chat history cleared successfully",
            });
        }
        catch (error) {
            console.error("Clear chat history error:", error);
            res.status(500).json({
                error: {
                    code: "CLEAR_ERROR",
                    message: "Failed to clear chat history",
                },
            });
        }
    }
    /**
     * Modify trip plan through natural language
     */
    async modifyTripPlan(req, res) {
        try {
            const userId = req.user.userId;
            const { tripId, modification } = req.body;
            if (!tripId || !modification) {
                return res.status(400).json({
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Trip ID and modification are required",
                    },
                });
            }
            const result = await chatService_1.chatService.modifyTripPlan(userId, tripId, modification);
            res.json({
                message: "Trip modification processed",
                result,
            });
        }
        catch (error) {
            console.error("Modify trip plan error:", error);
            res.status(500).json({
                error: {
                    code: "MODIFICATION_ERROR",
                    message: "Failed to modify trip plan",
                },
            });
        }
    }
}
exports.ChatController = ChatController;
exports.chatController = new ChatController();
