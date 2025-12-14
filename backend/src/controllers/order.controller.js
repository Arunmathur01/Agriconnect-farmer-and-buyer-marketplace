import Order from '../models/Order.js';
import Listing from '../models/Listing.js';
import Bid from '../models/Bid.js';
import Notification from '../models/Notification.js';

export async function listMyOrders(req, res) {
	const userId = req.user.id;
	const role = req.user.role;
	const filter = role === 'farmer' ? { farmerId: userId } : { buyerId: userId };
	const items = await Order.find(filter)
		.sort({ createdAt: -1 })
		.limit(200)
		.populate('farmerId', 'name email')
		.populate('buyerId', 'name email')
		.populate('listingId', 'cropName');
	return res.json({ items });
}

export async function createOrder(req, res) {
	try {
		const { listingId, bidId, pricePerKg, quantityKg, orderType } = req.body;
		let price = Number(pricePerKg);
		let qty = Number(quantityKg);
		let listing = null;
		const isBuyNow = orderType === 'buy_now';

		if (bidId) {
			const bid = await Bid.findById(bidId);
			if (!bid) return res.status(400).json({ message: 'Invalid bid' });
			listing = await Listing.findById(bid.listingId);
			price = bid.pricePerKg;
			qty = bid.quantityKg;
		} else {
			listing = await Listing.findById(listingId);
		}
		if (!listing) return res.status(400).json({ message: 'Invalid listing' });

		// Check if listing is active
		if (listing.status !== 'active') {
			return res.status(400).json({ message: 'Listing is not active' });
		}

		// For buy_now, check quantity availability
		if (isBuyNow && qty > listing.quantityKg) {
			return res.status(400).json({ message: 'Requested quantity exceeds available quantity' });
		}

		const amount = price * qty;
		const advancePaymentPercentage = 30; // 30% advance payment
		const advancePayment = isBuyNow ? Math.round(amount * (advancePaymentPercentage / 100)) : 0;

		const order = await Order.create({
			listingId: listing._id,
			buyerId: req.user.id,
			farmerId: listing.ownerId,
			pricePerKg: price,
			quantityKg: qty,
			amount,
			status: isBuyNow ? 'pending_advance' : 'pending',
			orderType: isBuyNow ? 'buy_now' : 'bid',
			advancePayment,
			advancePaymentPercentage,
		});

		// Create notification for farmer if it's a buy_now order
		if (isBuyNow) {
			await Notification.create({
				userId: listing.ownerId,
				type: 'buy_now_order_created',
				payload: {
					orderId: order._id,
					listingId: listing._id,
					cropName: listing.cropName,
					buyerId: req.user.id,
					amount,
					advancePayment,
					quantityKg: qty,
				},
			});

			const io = req.app.get('io');
			io.to(`user_${listing.ownerId}`).emit('notification', {
				type: 'buy_now_order_created',
				message: `A buyer wants to buy ${listing.cropName} directly. Check your dashboard to accept or reject the order.`,
			});
		}

		return res.status(201).json(order);
	} catch (error) {
		console.error('Error creating order:', error);
		return res.status(500).json({ message: error.message || 'Failed to create order' });
	}
}

export async function getOrder(req, res) {
	const { orderId } = req.params;
	const order = await Order.findById(orderId)
		.populate('listingId', 'cropName')
		.populate('farmerId', 'name email')
		.populate('buyerId', 'name email');
	
	if (!order) return res.status(404).json({ message: 'Order not found' });
	
	// Check if user has access to this order
	const buyerId = typeof order.buyerId === 'object' ? String(order.buyerId._id) : String(order.buyerId);
	const farmerId = typeof order.farmerId === 'object' ? String(order.farmerId._id) : String(order.farmerId);
	
	if (buyerId !== req.user.id && 
		farmerId !== req.user.id && 
		req.user.role !== 'admin') {
		return res.status(403).json({ message: 'Forbidden' });
	}
	
	return res.json(order);
}

export async function acceptBuyNowOrder(req, res) {
	try {
		const { orderId } = req.params;
		const order = await Order.findById(orderId)
			.populate('listingId');
		
		if (!order) return res.status(404).json({ message: 'Order not found' });
		
		// Check if farmer owns the listing
		const listing = order.listingId;
		if (String(listing.ownerId) !== req.user.id && req.user.role !== 'admin') {
			return res.status(403).json({ message: 'Only the listing owner can accept orders' });
		}
		
		// Check if order is buy_now and advance is paid
		if (order.orderType !== 'buy_now') {
			return res.status(400).json({ message: 'This is not a Buy Now order' });
		}
		
		if (!order.advancePaid || order.status !== 'advance_paid') {
			return res.status(400).json({ message: 'Advance payment must be completed first' });
		}
		
		if (order.farmerAccepted) {
			return res.status(400).json({ message: 'Order already accepted' });
		}
		
		// Accept the order
		order.farmerAccepted = true;
		order.status = 'confirmed';
		await order.save();
		
		// Update listing - reduce quantity or mark as sold
		if (order.quantityKg >= listing.quantityKg) {
			listing.status = 'sold';
			listing.quantityKg = 0;
		} else {
			listing.quantityKg -= order.quantityKg;
		}
		await listing.save();
		
		// Create notification for buyer
		await Notification.create({
			userId: order.buyerId,
			type: 'buy_now_order_accepted',
			payload: {
				orderId: order._id,
				listingId: listing._id,
				cropName: listing.cropName,
				farmerId: req.user.id,
			},
		});
		
		const io = req.app.get('io');
		io.to(`user_${order.farmerId}`).emit('order:updated', order);
		io.to(`user_${order.buyerId}`).emit('order:updated', order);
		io.to(`user_${order.buyerId}`).emit('notification', {
			type: 'buy_now_order_accepted',
			message: `Your Buy Now order for ${listing.cropName} has been accepted`,
		});
		
		return res.json({ message: 'Order accepted successfully', order });
	} catch (error) {
		console.error('Error accepting buy now order:', error);
		return res.status(500).json({ message: error.message || 'Failed to accept order' });
	}
}

export async function rejectBuyNowOrder(req, res) {
	try {
		const { orderId } = req.params;
		const order = await Order.findById(orderId)
			.populate('listingId');
		
		if (!order) return res.status(404).json({ message: 'Order not found' });
		
		// Check if farmer owns the listing
		const listing = order.listingId;
		if (String(listing.ownerId) !== req.user.id && req.user.role !== 'admin') {
			return res.status(403).json({ message: 'Only the listing owner can reject orders' });
		}
		
		if (order.orderType !== 'buy_now') {
			return res.status(400).json({ message: 'This is not a Buy Now order' });
		}
		
		// Reject and cancel the order
		order.status = 'cancelled';
		await order.save();
		
		// Refund notification would be handled separately
		// Create notification for buyer
		await Notification.create({
			userId: order.buyerId,
			type: 'buy_now_order_rejected',
			payload: {
				orderId: order._id,
				listingId: listing._id,
				cropName: listing.cropName,
			},
		});
		
		const io = req.app.get('io');
		io.to(`user_${order.buyerId}`).emit('order:updated', order);
		io.to(`user_${order.buyerId}`).emit('notification', {
			type: 'buy_now_order_rejected',
			message: `Your Buy Now order for ${listing.cropName} has been rejected`,
		});
		
		return res.json({ message: 'Order rejected', order });
	} catch (error) {
		console.error('Error rejecting buy now order:', error);
		return res.status(500).json({ message: error.message || 'Failed to reject order' });
	}
}

export async function payOrderStub(req, res) {
	const { orderId } = req.params;
	const order = await Order.findById(orderId);
	if (!order) return res.status(404).json({ message: 'Not found' });
	if (String(order.buyerId) !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
	order.status = 'paid';
	await order.save();
	const io = req.app.get('io');
	io.to(`user_${order.farmerId}`).emit('order:updated', order);
	io.to(`user_${order.buyerId}`).emit('order:updated', order);
	return res.json({ status: 'paid', order });
}
