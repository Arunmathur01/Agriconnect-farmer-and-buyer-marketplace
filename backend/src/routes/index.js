import { Router } from 'express';
import authRoutes from './auth.routes.js';
import listingRoutes from './listing.routes.js';
import bidRoutes from './bid.routes.js';
import orderRoutes from './order.routes.js';
import adminRoutes from './admin.routes.js';
import watchlistRoutes from './watchlist.routes.js';
import paymentRoutes from './payment.routes.js';
import kycRoutes from './kyc.routes.js';
import chatRoutes from './chat.routes.js';
import premiumRoutes from './premium.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/listings', listingRoutes);
router.use('/bids', bidRoutes);
router.use('/orders', orderRoutes);
router.use('/admin', adminRoutes);
router.use('/watchlist', watchlistRoutes);
router.use('/payments', paymentRoutes);
router.use('/kyc', kycRoutes);
router.use('/chat', chatRoutes);
router.use('/premium', premiumRoutes);

export default router;
