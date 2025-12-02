"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentIntent = exports.handleWebhook = exports.cancelSubscription = exports.getSubscriptionStatus = exports.createSubscription = exports.getPlans = void 0;
const subscriptionService_1 = __importDefault(require("../services/subscriptionService"));
const stripe_1 = __importDefault(require("stripe"));
const database_1 = __importDefault(require("../config/database"));
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2025-10-29.clover",
});
const getPlans = async (req, res) => {
    try {
        const plans = await subscriptionService_1.default.getPlans();
        res.json({ success: true, plans });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getPlans = getPlans;
const createSubscription = async (req, res) => {
    try {
        const { planId, paymentMethodId } = req.body;
        const userId = req.user.id;
        if (!planId) {
            res.status(400).json({ success: false, message: "Plan ID is required" });
            return;
        }
        // For free trial, no payment method needed
        if (planId !== "free_trial" && !paymentMethodId) {
            res.status(400).json({
                success: false,
                message: "Payment method is required for paid plans",
            });
            return;
        }
        const result = await subscriptionService_1.default.createSubscription({
            userId,
            planId,
            paymentMethodId,
        });
        res.json({
            success: true,
            subscription: result.subscription,
            clientSecret: result.clientSecret,
        });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.createSubscription = createSubscription;
const getSubscriptionStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const status = await subscriptionService_1.default.checkSubscriptionStatus(userId);
        res.json({ success: true, ...status });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getSubscriptionStatus = getSubscriptionStatus;
const cancelSubscription = async (req, res) => {
    try {
        const { subscriptionId } = req.params;
        const userId = req.user.id;
        // Verify subscription belongs to user
        const subscription = await database_1.default.subscription.findUnique({
            where: { id: subscriptionId },
        });
        if (!subscription || subscription.userId !== userId) {
            res.status(403).json({
                success: false,
                message: "Subscription not found or unauthorized",
            });
            return;
        }
        await subscriptionService_1.default.cancelSubscription(subscriptionId);
        res.json({
            success: true,
            message: "Subscription will be canceled at period end",
        });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.cancelSubscription = cancelSubscription;
const handleWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    if (!sig) {
        res.status(400).json({ success: false, message: "No signature provided" });
        return;
    }
    try {
        const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || "");
        await subscriptionService_1.default.handleWebhook(event);
        res.json({ success: true, received: true });
    }
    catch (error) {
        console.error("Webhook error:", error.message);
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.handleWebhook = handleWebhook;
const createPaymentIntent = async (req, res) => {
    try {
        const { planId } = req.body;
        const userId = req.user.id;
        const plans = await subscriptionService_1.default.getPlans();
        const plan = plans.find((p) => p.id === planId);
        if (!plan) {
            res.status(400).json({ success: false, message: "Invalid plan" });
            return;
        }
        if (plan.price === 0) {
            res.status(400).json({
                success: false,
                message: "No payment needed for free trial",
            });
            return;
        }
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(plan.price * 100), // Convert to cents
            currency: plan.currency,
            metadata: {
                userId,
                planId,
            },
        });
        res.json({
            success: true,
            clientSecret: paymentIntent.client_secret,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createPaymentIntent = createPaymentIntent;
