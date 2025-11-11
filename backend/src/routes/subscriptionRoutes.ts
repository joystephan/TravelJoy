import { Router } from "express";
import {
  getPlans,
  createSubscription,
  getSubscriptionStatus,
  cancelSubscription,
  handleWebhook,
  createPaymentIntent,
} from "../controllers/subscriptionController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

// Public routes
router.get("/plans", getPlans);

// Webhook route (no auth, verified by Stripe signature)
router.post("/webhook", handleWebhook);

// Protected routes
router.post("/subscribe", authMiddleware, createSubscription);
router.get("/status", authMiddleware, getSubscriptionStatus);
router.post("/cancel/:subscriptionId", authMiddleware, cancelSubscription);
router.post("/create-payment-intent", authMiddleware, createPaymentIntent);

export default router;
