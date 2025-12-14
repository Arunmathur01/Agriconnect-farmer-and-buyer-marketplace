import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Check if Cloudinary is configured
const useCloudinary = !!(
	process.env.CLOUDINARY_CLOUD_NAME &&
	process.env.CLOUDINARY_API_KEY &&
	process.env.CLOUDINARY_API_SECRET
);

// Log Cloudinary configuration status
if (useCloudinary) {
	console.log('✓ Cloudinary configured:', {
		cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
		api_key: process.env.CLOUDINARY_API_KEY ? '***' + process.env.CLOUDINARY_API_KEY.slice(-4) : 'missing',
		api_secret: process.env.CLOUDINARY_API_SECRET ? '***' + process.env.CLOUDINARY_API_SECRET.slice(-4) : 'missing',
	});
} else {
	console.warn('⚠ Cloudinary not configured. Missing:', {
		CLOUDINARY_CLOUD_NAME: !process.env.CLOUDINARY_CLOUD_NAME,
		CLOUDINARY_API_KEY: !process.env.CLOUDINARY_API_KEY,
		CLOUDINARY_API_SECRET: !process.env.CLOUDINARY_API_SECRET,
	});
}

// Fallback: Set up upload directories for local storage
const uploadsDir = path.join(__dirname, '..', 'uploads');
const listingsDir = path.join(uploadsDir, 'listings');
const kycDir = path.join(uploadsDir, 'kyc');

// Create directories if they don't exist (for local fallback)
[uploadsDir, listingsDir, kycDir].forEach(dir => {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}
});

// Generate unique filename
function generateUniqueFilename(originalName) {
	const ext = path.extname(originalName);
	const uniqueName = crypto.randomBytes(16).toString('hex') + ext;
	return uniqueName;
}

// Storage configuration for listings
let listingStorage;
if (useCloudinary) {
	console.log('Using Cloudinary for image storage');
	listingStorage = new CloudinaryStorage({
		cloudinary: cloudinary,
		params: {
			folder: 'agriconnect/listings',
			allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
			transformation: [{ width: 800, height: 600, crop: 'limit' }],
		},
	});
} else {
	console.log('Using local file storage (Cloudinary not configured)');
	console.log('To use Cloudinary, add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to .env');
	// Disk storage configuration for listings (fallback)
	listingStorage = multer.diskStorage({
		destination: (req, file, cb) => {
			if (!fs.existsSync(listingsDir)) {
				fs.mkdirSync(listingsDir, { recursive: true });
				console.log(`Created listings directory: ${listingsDir}`);
			}
			cb(null, listingsDir);
		},
		filename: (req, file, cb) => {
			const filename = generateUniqueFilename(file.originalname);
			console.log(`Saving file: ${filename} to ${listingsDir}`);
			cb(null, filename);
		},
	});
}

// Storage configuration for KYC (local only for security)
const kycStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		if (!fs.existsSync(kycDir)) {
			fs.mkdirSync(kycDir, { recursive: true });
		}
		cb(null, kycDir);
	},
	filename: (req, file, cb) => {
		cb(null, generateUniqueFilename(file.originalname));
	},
});

// Multer uploader for listings (multiple images)
export const uploadListingImages = multer({
	storage: listingStorage,
	limits: {
		fileSize: 5 * 1024 * 1024, // 5MB limit
	},
	fileFilter: (req, file, cb) => {
		// Accept only images
		if (file.mimetype.startsWith('image/')) {
			cb(null, true);
		} else {
			cb(new Error('Only image files are allowed'), false);
		}
	},
}).array('images', 6);

// Multer uploader for KYC documents - stores locally
export const uploadKycDocs = multer({
	storage: kycStorage,
	limits: {
		fileSize: 5 * 1024 * 1024, // 5MB limit
	},
}).fields([
	{ name: 'idDoc', maxCount: 1 },
	{ name: 'landDoc', maxCount: 1 },
	{ name: 'bankDoc', maxCount: 1 },
]);

// Helper to extract URL from uploaded file
export function getImageUrl(file) {
	if (!file) return null;
	
	// If it's already a URL string (Cloudinary), return it
	if (typeof file === 'string' && file.startsWith('http')) {
		console.log('✅ Direct URL string:', file);
		return file;
	}
	
	// multer-storage-cloudinary stores the Cloudinary URL in the 'path' property
	// This is the primary location for Cloudinary URLs
	if (file.path && typeof file.path === 'string' && file.path.startsWith('http')) {
		console.log('✅ Found Cloudinary URL in path:', file.path);
		return file.path;
	}
	
	// Also check for secure_url (HTTPS)
	if (file.secure_url && typeof file.secure_url === 'string') {
		console.log('✅ Found Cloudinary secure_url:', file.secure_url);
		return file.secure_url;
	}
	
	// Check for regular url
	if (file.url && typeof file.url === 'string' && file.url.startsWith('http')) {
		console.log('✅ Found Cloudinary url:', file.url);
		return file.url;
	}
	
	// Check if file.result contains Cloudinary response
	if (file.result && typeof file.result === 'object') {
		if (file.result.secure_url) {
			console.log('✅ Found Cloudinary secure_url in result:', file.result.secure_url);
			return file.result.secure_url;
		}
		if (file.result.url) {
			console.log('✅ Found Cloudinary url in result:', file.result.url);
			return file.result.url;
		}
		if (file.result.public_id) {
			// Construct Cloudinary URL from public_id
			const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
			if (cloudName) {
				const url = `https://res.cloudinary.com/${cloudName}/image/upload/${file.result.public_id}.${file.result.format || 'jpg'}`;
				console.log('✅ Constructed Cloudinary URL from public_id:', url);
				return url;
			}
		}
	}
	
	// Local storage: File object from multer has filename property
	if (file.filename && typeof file.filename === 'string') {
		const localUrl = `/uploads/listings/${file.filename}`;
		console.log('📁 Using local file URL:', localUrl);
		return localUrl;
	}
	
	// Log all available properties for debugging
	console.error('❌ Could not extract URL from file object');
	console.error('   File object type:', typeof file);
	console.error('   File object keys:', Object.keys(file || {}));
	if (file && typeof file === 'object') {
		console.error('   File path:', file.path);
		console.error('   File secure_url:', file.secure_url);
		console.error('   File url:', file.url);
		console.error('   File filename:', file.filename);
		console.error('   File result:', file.result);
	}
	
	return null;
}

