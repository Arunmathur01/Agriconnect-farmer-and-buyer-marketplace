import { Router } from 'express';
import { authRequired } from '../security/auth.middleware.js';
import { listBidsForListing, placeBid, listMyBids, acceptBid } from '../controllers/bid.controller.js';

const router = Router();

router.get('/mine', authRequired, listMyBids);
router.get('/listing/:listingId', listBidsForListing);
router.post('/listing/:listingId', authRequired, placeBid);
router.post('/:bidId/accept', authRequired, acceptBid);

export default router;
