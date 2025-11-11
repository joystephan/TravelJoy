"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const subscriptionController_1 = require("../controllers/subscriptionController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Public routes
router.get("/plans", subscriptionController_1.getPlans);
// Webhook route (no auth, verified by Stripe signature)
router.post("/webhook", subscriptionController_1.handleWebhook);
// Protected routes
router.post("/subscribe", authMiddleware_1.authMiddleware, subscriptionController_1.createSubscription);
router.get("/status", authMiddleware_1.authMiddleware, subscriptionController_1.getSubscriptionStatus);
router.post("/cancel/:subscriptionId", authMiddleware_1.authMiddleware, subscriptionController_1.cancelSubscription);
router.post("/create-payment-intent", authMiddleware_1.authMiddleware, subscriptionController_1.createPaymentIntent);
exports.default = router;
