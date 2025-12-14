import Bid from '../models/Bid.js';
import Listing from '../models/Listing.js';
import Order from '../models/Order.js';

export async function listBidsForListing(req, res) {
	const { listingId } = req.params;
	const items = await Bid.find({ listingId })
		.populate('buyerId', 'name email')
		.sort({ createdAt: -1 })
		.limit(100);
	return res.json({ items });
}

export async function listMyBids(req, res) {
	const items = await Bid.find({ buyerId: req.user.id })
		.populate({
			path: 'listingId',
			select: 'cropName ownerId',
			populate: {
				path: 'ownerId',
				select: 'name email'
			}
		})
		.sort({ createdAt: -1 })
		.limit(200);
	return res.json({ items });
}

export async function placeBid(req, res) {
	try {
		const { listingId } = req.params;
		const { pricePerKg, quantityKg } = req.body;
		
		if (!pricePerKg || !quantityKg) {
			return res.status(400).json({ message: 'Missing fields' });
		}
		
		// Get the listing to check base price
		const listing = await Listing.findById(listingId);
		if (!listing) {
			return res.status(404).json({ message: 'Listing not found' });
		}
		
		// Check if listing is active
		if (listing.status !== 'active') {
			return res.status(400).json({ message: 'Listing is not active' });
		}
		
		// Get all pending bids for this listing to find the highest bid
		const existingBids = await Bid.find({ 
			listingId, 
			status: 'pending' 
		}).sort({ pricePerKg: -1 }).limit(1);
		
		const highestBid = existingBids.length > 0 ? existingBids[0].pricePerKg : null;
		const basePrice = listing.basePricePerKg || 0;
		
		// Determine minimum bid price required
		const minBidPrice = highestBid ? highestBid + 1 : basePrice + 1;
		
		const newBidPrice = Number(pricePerKg);
		
		// Validate that new bid is higher than base price or highest bid
		if (newBidPrice <= basePrice) {
			return res.status(400).json({ 
				message: `Bid price must be higher than base price of ₹${basePrice}/kg`,
				minBidPrice: basePrice + 1,
				currentHighest: highestBid || null
			});
		}
		
		if (highestBid && newBidPrice <= highestBid) {
			return res.status(400).json({ 
				message: `Your bid must be higher than the current highest bid of ₹${highestBid}/kg. Minimum bid required: ₹${minBidPrice}/kg`,
				minBidPrice: minBidPrice,
				currentHighest: highestBid
			});
		}
		
		// Check quantity availability
		if (quantityKg > listing.quantityKg) {
			return res.status(400).json({ message: 'Bid quantity exceeds available quantity' });
		}
		
		// Create the bid
		const bid = await Bid.create({
			listingId,
			buyerId: req.user.id,
			pricePerKg: newBidPrice,
			quantityKg: Number(quantityKg),
			status: 'pending',
		});
		
		// Emit to listing room
		const io = req.app.get('io');
		io.to(`listing_${listingId}`).emit('bid:updated', bid);
		
		return res.status(201).json(bid);
	} catch (error) {
		console.error('Error placing bid:', error);
		return res.status(500).json({ message: error.message || 'Failed to place bid' });
	}
}

export async function acceptBid(req, res) {
	try {
		const { bidId } = req.params;
		const bid = await Bid.findById(bidId);
		
		if (!bid) return res.status(404).json({ message: 'Bid not found' });
		
		const listing = await Listing.findById(bid.listingId);
		if (!listing) return res.status(404).json({ message: 'Listing not found' });
		
		// Check if farmer owns the listing
		if (String(listing.ownerId) !== req.user.id && req.user.role !== 'admin') {
			return res.status(403).json({ message: 'Only the listing owner can accept bids' });
		}
		
		// Check if bid is already accepted or rejected
		if (bid.status !== 'pending') {
			return res.status(400).json({ message: `Bid is already ${bid.status}` });
		}
		
		// Check if listing is still active
		if (listing.status !== 'active') {
			return res.status(400).json({ message: 'Listing is not active' });
		}
		
		// Check if quantity is available
		if (bid.quantityKg > listing.quantityKg) {
			return res.status(400).json({ message: 'Bid quantity exceeds available quantity' });
		}
		
		// Create order from accepted bid
		const amount = bid.pricePerKg * bid.quantityKg;
		const order = await Order.create({
			listingId: listing._id,
			buyerId: bid.buyerId,
			farmerId: listing.ownerId,
			pricePerKg: bid.pricePerKg,
			quantityKg: bid.quantityKg,
			amount,
			status: 'confirmed',
		});
		
		// Update bid status to accepted
		bid.status = 'accepted';
		await bid.save();
		
		// Update listing quantity (reduce available quantity)
		listing.quantityKg -= bid.quantityKg;
		if (listing.quantityKg <= 0) {
			listing.status = 'sold';
		}
		await listing.save();
		
		// Reject other pending bids for this listing (optional - you might want to keep them)
		// await Bid.updateMany(
		//	{ listingId: listing._id, _id: { $ne: bidId }, status: 'pending' },
		//	{ status: 'rejected' }
		// );
		
		// Emit events
		const io = req.app.get('io');
		io.to(`listing_${listing._id}`).emit('bid:accepted', { bid, order });
		io.to(`user_${bid.buyerId}`).emit('order:created', order);
		io.to(`user_${listing.ownerId}`).emit('order:created', order);
		
		return res.json({ bid, order, message: 'Bid accepted and order created' });
	} catch (error) {
		console.error('Error accepting bid:', error);
		return res.status(500).json({ message: error.message || 'Failed to accept bid' });
	}
}
