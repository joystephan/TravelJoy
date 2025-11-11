import { Request, Response } from "express";
import { chatService } from "../services/chatService";

export class ChatController {
  /**
   * Send a chat message
   */
  async sendMessage(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { message, tripId } = req.body;

      if (!message) {
        return res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "Message is required",
          },
        });
      }

      const response = await chatService.processMessage(
        userId,
        message,
        tripId
      );

      res.json({
        response: response.message,
        action: response.action,
        updatedPlan: response.updatedPlan,
      });
    } catch (error: any) {
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
  async quickAction(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { action, tripId } = req.body;

      if (!action) {
        return res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "Action is required",
          },
        });
      }

      const response = await chatService.processQuickAction(
        userId,
        action,
        tripId
      );

      res.json({
        response: response.message,
        action: response.action,
        updatedPlan: response.updatedPlan,
      });
    } catch (error: any) {
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
  async getChatHistory(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { tripId } = req.query;

      const history = chatService.getChatHistory(userId, tripId as string);

      res.json({ history });
    } catch (error: any) {
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
  async clearChatHistory(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { tripId } = req.body;

      chatService.clearChatHistory(userId, tripId);

      res.json({
        message: "Chat history cleared successfully",
      });
    } catch (error: any) {
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
  async modifyTripPlan(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const { tripId, modification } = req.body;

      if (!tripId || !modification) {
        return res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "Trip ID and modification are required",
          },
        });
      }

      const result = await chatService.modifyTripPlan(
        userId,
        tripId,
        modification
      );

      res.json({
        message: "Trip modification processed",
        result,
      });
    } catch (error: any) {
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

export const chatController = new ChatController();
