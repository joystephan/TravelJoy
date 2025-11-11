import { Request, Response } from "express";
import subscriptionService from "../services/subscriptionService";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-10-29.clover",
});

export const getPlans = async (req: Request, res: Response): Promise<void> => {
  try {
    const plans = await subscriptionService.getPlans();
    res.json({ success: true, plans });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createSubscription = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { planId, paymentMethodId } = req.body;
    const userId = (req as any).user.id;

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

    const result = await subscriptionService.createSubscription({
      userId,
      planId,
      paymentMethodId,
    });

    res.json({
      success: true,
      subscription: result.subscription,
      clientSecret: result.clientSecret,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getSubscriptionStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const status = await subscriptionService.checkSubscriptionStatus(userId);
    res.json({ success: true, ...status });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelSubscription = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { subscriptionId } = req.params;
    const userId = (req as any).user.id;

    // Verify subscription belongs to user
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription || subscription.userId !== userId) {
      res.status(403).json({
        success: false,
        message: "Subscription not found or unauthorized",
      });
      return;
    }

    await subscriptionService.cancelSubscription(subscriptionId);
    res.json({
      success: true,
      message: "Subscription will be canceled at period end",
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const handleWebhook = async (
  req: Request,
  res: Response
): Promise<void> => {
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    res.status(400).json({ success: false, message: "No signature provided" });
    return;
  }

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );

    await subscriptionService.handleWebhook(event);
    res.json({ success: true, received: true });
  } catch (error: any) {
    console.error("Webhook error:", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const createPaymentIntent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { planId } = req.body;
    const userId = (req as any).user.id;

    const plans = await subscriptionService.getPlans();
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
