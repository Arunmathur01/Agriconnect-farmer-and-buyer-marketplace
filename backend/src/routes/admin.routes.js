import { Router } from 'express';
import { authRequired, requireRoles } from '../security/auth.middleware.js';
import { getVitals, listUsers, listListings, moderateListing, listKycs, reviewKyc } from '../controllers/admin.controller.js';

const router = Router();

router.use(authRequired, requireRoles('admin'));

router.get('/stats', getVitals);
router.get('/users', listUsers);
router.get('/listings', listListings);
router.post('/moderate/listing/:id', moderateListing);

// KYC review
router.get('/kyc', listKycs);
router.post('/kyc/:id/review', reviewKyc);

export default router;
