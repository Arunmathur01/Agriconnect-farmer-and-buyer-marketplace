import Listing from '../models/Listing.js';
import { getImageUrl } from '../utils/cloudinary.js';
import fs from 'fs';

function toNumber(value, fallback) {
	const n = Number(value);
	return Number.isFinite(n) ? n : fallback;
}

export async function listListings(req, res) {
	const page = Math.max(1, toNumber(req.query.page, 1));
	const limit = Math.min(50, Math.max(1, toNumber(req.query.limit, 12)));
	const skip = (page - 1) * limit;

	const {
		crop,
		grade,
		location,
		minPrice,
		maxPrice,
		type, // 'auction' | 'fixed'
		sort, // 'new' | 'price_asc' | 'price_desc'
	} = req.query;

	const filter = { status: 'active' };
	if (crop) filter.cropName = new RegExp(crop, 'i');
	if (grade) filter.grade = grade;
	if (location) filter.location = new RegExp(location, 'i');
	if (type === 'fixed') filter.allowInstantBuy = true;
	if (type === 'auction') filter.allowInstantBuy = { $ne: true };

	const priceCond = {};
	const min = toNumber(minPrice, undefined);
	const max = toNumber(maxPrice, undefined);
	if (min !== undefined) priceCond.$gte = min;
	if (max !== undefined) priceCond.$lte = max;
	if (Object.keys(priceCond).length) filter.basePricePerKg = priceCond;

	let sortBy = { createdAt: -1 };
	if (sort === 'price_asc') sortBy = { basePricePerKg: 1 };
	if (sort === 'price_desc') sortBy = { basePricePerKg: -1 };

	const [items, total] = await Promise.all([
		Listing.find(filter).sort(sortBy).skip(skip).limit(limit),
		Listing.countDocuments(filter),
	]);

	return res.json({ items, total, page, limit, pages: Math.ceil(total / limit) });
}

export async function listMyListings(req, res) {
	const items = await Listing.find({ ownerId: req.user.id }).sort({ createdAt: -1 }).limit(200);
	return res.json({ items });
}

export async function getListing(req, res) {
	const item = await Listing.findById(req.params.id);
	if (!item) return res.status(404).json({ message: 'Not found' });
	return res.json(item);
}

export async function createListing(req, res) {
	try {
		const { cropName, quantityKg, basePricePerKg, location, allowInstantBuy, instantBuyPricePerKg, grade } = req.body;
		if (!cropName || !quantityKg || !basePricePerKg) return res.status(400).json({ message: 'Missing fields' });
		
		// Extract image URLs from uploaded files (Cloudinary or local storage)
		const images = (req.files || [])
			.map((f) => {
				const url = getImageUrl(f);
				if (url) {
					console.log(`Image URL extracted: ${url} from file:`, {
						filename: f.filename,
						secure_url: f.secure_url,
						url: f.url,
						path: f.path
					});
				}
				return url;
			})
			.filter((url) => url !== null);
		
		if (req.files && req.files.length > 0) {
			console.log(`Successfully saved ${images.length} images:`, images);
			console.log('Full file objects:', req.files.map(f => {
				const obj = {
					filename: f.filename,
					path: f.path,
					mimetype: f.mimetype,
					size: f.size,
					destination: f.destination,
					// Cloudinary properties
					secure_url: f.secure_url,
					url: f.url,
					result: f.result ? Object.keys(f.result) : null,
				};
				// Log all properties for debugging
				console.log('File object keys:', Object.keys(f));
				return obj;
			}));
			// Verify files actually exist on disk (only for local storage)
			if (!process.env.CLOUDINARY_CLOUD_NAME) {
				req.files.forEach(f => {
					const fullPath = f.path;
					try {
						if (fs.existsSync(fullPath)) {
							const stats = fs.statSync(fullPath);
							console.log(`✓ File exists: ${fullPath} (${stats.size} bytes)`);
						} else {
							console.error(`✗ File NOT found: ${fullPath}`);
							console.error(`   Expected at: ${fullPath}`);
							console.error(`   Check directory: ${f.destination}`);
						}
					} catch (err) {
						console.error(`✗ Error checking file: ${fullPath}`, err.message);
					}
				});
			}
		} else {
			console.warn('⚠ No files uploaded with listing creation request');
			console.log('Request body keys:', Object.keys(req.body));
			console.log('Request files:', req.files);
			console.log('Files in request:', req.files ? req.files.length : 0);
		}
		
		// Log what images will be stored
		console.log('📸 Images to be stored in database:', images);
		if (images.length === 0) {
			console.warn('⚠ No images extracted! Listing will be created without images.');
		}
		
		const listing = await Listing.create({
			ownerId: req.user.id,
			cropName,
			quantityKg: Number(quantityKg),
			basePricePerKg: Number(basePricePerKg),
			location,
			allowInstantBuy: allowInstantBuy === 'true' || allowInstantBuy === true,
			instantBuyPricePerKg: instantBuyPricePerKg ? Number(instantBuyPricePerKg) : undefined,
			grade,
			images,
		});
		
		console.log('✅ Listing created successfully:', {
			id: listing._id,
			cropName: listing.cropName,
			imageCount: listing.images?.length || 0,
			images: listing.images
		});
		
		return res.status(201).json(listing);
	} catch (error) {
		console.error('Error creating listing:', error);
		console.error('Error stack:', error.stack);
		return res.status(500).json({ message: error.message || 'Failed to create listing' });
	}
}

export async function updateListing(req, res) {
	try {
		const listing = await Listing.findById(req.params.id);
		if (!listing) return res.status(404).json({ message: 'Not found' });
		if (String(listing.ownerId) !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
		const updates = req.body;
		
		// Extract new image URLs from uploaded files (local storage)
		if (req.files?.length) {
			const newImageUrls = (req.files || [])
				.map((f) => getImageUrl(f))
				.filter((url) => url !== null);
			updates.images = [...(listing.images || []), ...newImageUrls];
			console.log(`Successfully saved ${newImageUrls.length} new images locally`);
		}
		
		Object.assign(listing, updates);
		await listing.save();
		return res.json(listing);
	} catch (error) {
		console.error('Error updating listing:', error);
		return res.status(500).json({ message: error.message || 'Failed to update listing' });
	}
}

export async function closeListing(req, res) {
	const listing = await Listing.findById(req.params.id);
	if (!listing) return res.status(404).json({ message: 'Not found' });
	if (String(listing.ownerId) !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
	listing.status = 'closed';
	await listing.save();
	return res.json(listing);
}

export async function deleteListing(req, res) {
	const listing = await Listing.findById(req.params.id);
	if (!listing) return res.status(404).json({ message: 'Not found' });
	if (String(listing.ownerId) !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
	await listing.deleteOne();
	return res.status(204).send();
}
