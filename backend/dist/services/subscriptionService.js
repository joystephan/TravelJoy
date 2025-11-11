"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionStatus = exports.SUBSCRIPTION_PLANS = void 0;
const stripe_1 = __importDefault(require("stripe"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2025-10-29.clover",
});
exports.SUBSCRIPTION_PLANS = [
    {
        id: "free_trial",
        name: "Free Trial",
        description: "7-day trial with 1 trip generation",
        price: 0,
        currency: "usd",
        interval: "month",
        features: [
            "1 trip per trial period",
            "Basic AI planning",
            "Standard support",
        ],
        maxTripsPerMonth: 1,
        stripePriceId: "", // No Stripe price for trial
    },
    {
        id: "basic",
        name: "Basic Plan",
        description: "Perfect for occasional travelers",
        price: 9.99,
        currency: "usd",
        interval: "month",
        features: ["5 trips per month", "AI-powered planning", "Email support"],
        maxTripsPerMonth: 5,
        stripePriceId: process.env.STRIPE_BASIC_PRICE_ID || "",
    },
    {
        id: "premium",
        name: "Premium Plan",
        description: "Unlimited travel planning",
        price: 19.99,
        currency: "usd",
        interval: "month",
        features: [
            "Unlimited trips",
            "Priority AI processing",
            "Advanced customization",
            "Priority support",
        ],
        maxTripsPerMonth: -1, // -1 means unlimited
        stripePriceId: process.env.STRIPE_PREMIUM_PRICE_ID || "",
    },
];
var SubscriptionStatus;
(function (SubscriptionStatus) {
    SubscriptionStatus["ACTIVE"] = "active";
    SubscriptionStatus["CANCELED"] = "canceled";
    SubscriptionStatus["PAST_DUE"] = "past_due";
    SubscriptionStatus["UNPAID"] = "unpaid";
    SubscriptionStatus["TRIALING"] = "trialing";
})(SubscriptionStatus || (exports.SubscriptionStatus = SubscriptionStatus = {}));
class SubscriptionService {
    async createSubscription(input) {
        const { userId, planId, paymentMethodId } = input;
        // Get user
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { subscription: true },
        });
        if (!user) {
            throw new Error("User not found");
        }
        // Check if user already has an active subscription
        if (user.subscription && user.subscription.status === "active") {
            throw new Error("User already has an active subscription");
        }
        // Get plan details
        const plan = exports.SUBSCRIPTION_PLANS.find((p) => p.id === planId);
        if (!plan) {
            throw new Error("Invalid plan ID");
        }
        // Handle free trial
        if (planId === "free_trial") {
            const trialEnd = new Date();
            trialEnd.setDate(trialEnd.getDate() + 7);
            const subscription = await prisma.subscription.create({
                data: {
                    userId,
                    planId,
                    status: SubscriptionStatus.TRIALING,
                    currentPeriodStart: new Date(),
                    currentPeriodEnd: trialEnd,
                    cancelAtPeriodEnd: false,
                    stripeSubscriptionId: `trial_${userId}_${Date.now()}`,
                },
            });
            return { subscription };
        }
        // Create or retrieve Stripe customer
        let stripeCustomerId = user.email;
        const existingCustomers = await stripe.customers.list({
            email: user.email,
            limit: 1,
        });
        let customer;
        if (existingCustomers.data.length > 0) {
            customer = existingCustomers.data[0];
            stripeCustomerId = customer.id;
        }
        else {
            customer = await stripe.customers.create({
                email: user.email,
                metadata: {
                    userId: user.id,
                },
            });
            stripeCustomerId = customer.id;
        }
        // Attach payment method to customer
        await stripe.paymentMethods.attach(paymentMethodId, {
            customer: stripeCustomerId,
        });
        // Set as default payment method
        await stripe.customers.update(stripeCustomerId, {
            invoice_settings: {
                default_payment_method: paymentMethodId,
            },
        });
        // Create Stripe subscription
        const stripeSubscription = await stripe.subscriptions.create({
            customer: stripeCustomerId,
            items: [{ price: plan.stripePriceId }],
            payment_behavior: "default_incomplete",
            payment_settings: { save_default_payment_method: "on_subscription" },
            expand: ["latest_invoice.payment_intent"],
        });
        // Save subscription to database
        const subData = stripeSubscription;
        const subscription = await prisma.subscription.create({
            data: {
                userId,
                planId,
                status: stripeSubscription.status,
                currentPeriodStart: new Date(subData.current_period_start * 1000),
                currentPeriodEnd: new Date(subData.current_period_end * 1000),
                cancelAtPeriodEnd: subData.cancel_at_period_end || false,
                stripeSubscriptionId: stripeSubscription.id,
            },
        });
        // Get client secret for payment confirmation
        const invoice = stripeSubscription.latest_invoice;
        const paymentIntent = invoice
            .payment_intent;
        return {
            subscription,
            clientSecret: paymentIntent?.client_secret || undefined,
        };
    }
    async cancelSubscription(subscriptionId) {
        const subscription = await prisma.subscription.findUnique({
            where: { id: subscriptionId },
        });
        if (!subscription) {
            throw new Error("Subscription not found");
        }
        // Cancel at period end in Stripe
        if (subscription.stripeSubscriptionId.startsWith("trial_")) {
            // For trial subscriptions, just mark as canceled
            await prisma.subscription.update({
                where: { id: subscriptionId },
                data: {
                    status: SubscriptionStatus.CANCELED,
                    cancelAtPeriodEnd: true,
                },
            });
        }
        else {
            await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
                cancel_at_period_end: true,
            });
            await prisma.subscription.update({
                where: { id: subscriptionId },
                data: { cancelAtPeriodEnd: true },
            });
        }
    }
    async checkSubscriptionStatus(userId) {
        const subscription = await prisma.subscription.findUnique({
            where: { userId },
        });
        if (!subscription) {
            return {
                hasSubscription: false,
                status: null,
                plan: null,
                canCreateTrip: false,
            };
        }
        const plan = exports.SUBSCRIPTION_PLANS.find((p) => p.id === subscription.planId);
        const user = await prisma.user.findUnique({ where: { id: userId } });
        // Check if subscription is active
        const isActive = subscription.status === SubscriptionStatus.ACTIVE ||
            subscription.status === SubscriptionStatus.TRIALING;
        // Check if user can create more trips
        let canCreateTrip = false;
        if (isActive && plan) {
            if (plan.maxTripsPerMonth === -1) {
                canCreateTrip = true; // Unlimited
            }
            else {
                canCreateTrip = (user?.tripsThisMonth || 0) < plan.maxTripsPerMonth;
            }
        }
        return {
            hasSubscription: true,
            status: subscription.status,
            plan: plan,
            currentPeriodEnd: subscription.currentPeriodEnd,
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
            canCreateTrip,
            tripsThisMonth: user?.tripsThisMonth || 0,
        };
    }
    async handleWebhook(event) {
        switch (event.type) {
            case "customer.subscription.updated":
            case "customer.subscription.created":
                await this.handleSubscriptionUpdate(event.data.object);
                break;
            case "customer.subscription.deleted":
                await this.handleSubscriptionDeleted(event.data.object);
                break;
            case "invoice.payment_succeeded":
                await this.handlePaymentSucceeded(event.data.object);
                break;
            case "invoice.payment_failed":
                await this.handlePaymentFailed(event.data.object);
                break;
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
    }
    async handleSubscriptionUpdate(stripeSubscription) {
        const subscription = await prisma.subscription.findUnique({
            where: { stripeSubscriptionId: stripeSubscription.id },
        });
        if (subscription) {
            const subData = stripeSubscription;
            await prisma.subscription.update({
                where: { id: subscription.id },
                data: {
                    status: stripeSubscription.status,
                    currentPeriodStart: new Date(subData.current_period_start * 1000),
                    currentPeriodEnd: new Date(subData.current_period_end * 1000),
                    cancelAtPeriodEnd: subData.cancel_at_period_end || false,
                },
            });
        }
    }
    async handleSubscriptionDeleted(stripeSubscription) {
        const subscription = await prisma.subscription.findUnique({
            where: { stripeSubscriptionId: stripeSubscription.id },
        });
        if (subscription) {
            await prisma.subscription.update({
                where: { id: subscription.id },
                data: { status: SubscriptionStatus.CANCELED },
            });
        }
    }
    async handlePaymentSucceeded(invoice) {
        const subscriptionId = invoice.subscription;
        if (subscriptionId) {
            const subscription = await prisma.subscription.findUnique({
                where: { stripeSubscriptionId: subscriptionId },
            });
            if (subscription) {
                // Reset monthly trip counter on successful payment
                await prisma.user.update({
                    where: { id: subscription.userId },
                    data: { tripsThisMonth: 0 },
                });
            }
        }
    }
    async handlePaymentFailed(invoice) {
        const subscriptionId = invoice.subscription;
        if (subscriptionId) {
            const subscription = await prisma.subscription.findUnique({
                where: { stripeSubscriptionId: subscriptionId },
            });
            if (subscription) {
                await prisma.subscription.update({
                    where: { id: subscription.id },
                    data: { status: SubscriptionStatus.PAST_DUE },
                });
            }
        }
    }
    async getPlans() {
        return exports.SUBSCRIPTION_PLANS;
    }
}
exports.default = new SubscriptionService();
