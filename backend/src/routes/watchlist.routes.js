import { Router } from 'express';
import { authRequired } from '../security/auth.middleware.js';
import { listMyWatchlist, addToWatchlist, removeFromWatchlist } from '../controllers/watchlist.controller.js';

const router = Router();

router.use(authRequired);
router.get('/', listMyWatchlist);
router.post('/', addToWatchlist);
router.delete('/:listingId', removeFromWatchlist);

export default router;


