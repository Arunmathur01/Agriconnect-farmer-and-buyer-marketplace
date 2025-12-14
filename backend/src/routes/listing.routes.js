import { Router } from 'express';
import { authRequired } from '../security/auth.middleware.js';
import { requireApprovedKyc } from '../security/kyc.middleware.js';
import { listListings, getListing, createListing, updateListing, deleteListing, listMyListings, closeListing } from '../controllers/listing.controller.js';
import { uploadListingImages } from '../utils/cloudinary.js';

const router = Router();

// Error handling middleware for multer uploads
const handleUploadErrors = (err, req, res, next) => {
	if (err) {
		console.error('Upload error:', err);
		if (err.code === 'LIMIT_FILE_SIZE') {
			return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
		}
		if (err.code === 'LIMIT_FILE_COUNT') {
			return res.status(400).json({ message: 'Too many files. Maximum is 6 images.' });
		}
		if (err.message.includes('Only image files')) {
			return res.status(400).json({ message: 'Only image files are allowed.' });
		}
		return res.status(500).json({ message: 'File upload failed: ' + err.message });
	}
	next();
};

router.get('/', listListings);
router.get('/mine', authRequired, listMyListings);
router.get('/:id', getListing);
router.post('/', authRequired, requireApprovedKyc, uploadListingImages, handleUploadErrors, createListing);
router.put('/:id', authRequired, uploadListingImages, handleUploadErrors, updateListing);
router.post('/:id/close', authRequired, closeListing);
router.delete('/:id', authRequired, deleteListing);

export default router;
