import { Router } from 'express';
import { authRequired } from '../security/auth.middleware.js';
import { getPremiumPlans, subscribePremium, getSubscriptionStatus } from '../controllers/premium.controller.js';

const router = Router();

router.get('/plans', getPremiumPlans);
router.get('/status', authRequired, getSubscriptionStatus);
router.post('/subscribe', authRequired, subscribePremium);

export default router;

