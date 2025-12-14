import express from 'express';
import { Router } from 'express';
import { authRequired } from '../security/auth.middleware.js';
import { createPaymentIntent, createCartPaymentIntent, stripeWebhook } from '../controllers/payment.controller.js';

const router = Router();

router.post('/intent', authRequired, createPaymentIntent);
router.post('/cart-intent', authRequired, createCartPaymentIntent);

// Stripe needs raw body
export function stripeWebhookMiddleware(app) {
	app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), stripeWebhook);
}

export default router;
