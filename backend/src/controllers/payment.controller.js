import Stripe from 'stripe';
import Order from '../models/Order.js';
import Notification from '../models/Notification.js';

const stripe = new Stripe(process.env.STRIPE_SECRET || '', { apiVersion: '2024-06-20' });

export async function createPaymentIntent(req, res) {
	try {
		const { orderId, isAdvancePayment } = req.body;
		if (!orderId) return res.status(400).json({ message: 'orderId required' });
		const order = await Order.findById(orderId);
		if (!order) return res.status(404).json({ message: 'Order not found' });
		if (String(order.buyerId) !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

		// For buy_now orders, check if it's advance payment
		const isAdvance = isAdvancePayment === true || (order.orderType === 'buy_now' && order.status === 'pending_advance');
		const paymentAmount = isAdvance ? order.advancePayment : order.amount;
		const amountInPaise = Math.round(paymentAmount * 100);

		const paymentIntent = await stripe.paymentIntents.create({
			amount: amountInPaise,
			currency: 'inr',
			automatic_payment_methods: { enabled: true },
			metadata: { 
				orderId: String(order._id),
				isAdvancePayment: isAdvance ? 'true' : 'false',
				orderType: order.orderType || 'bid'
			},
		});
		return res.json({ 
			clientSecret: paymentIntent.client_secret,
			amount: paymentAmount,
			isAdvancePayment: isAdvance
		});
	} catch (error) {
		console.error('Error creating payment intent:', error);
		return res.status(500).json({ message: error.message || 'Failed to create payment intent' });
	}
}

export async function createCartPaymentIntent(req, res) {
	try {
		const { orderIds, isAdvancePayment } = req.body;
		if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
			return res.status(400).json({ message: 'orderIds array required' });
		}

		const isAdvance = isAdvancePayment === true;
		
		// Verify all orders belong to the user
		const orders = await Order.find({ 
			_id: { $in: orderIds },
			buyerId: req.user.id,
		});

		if (orders.length !== orderIds.length) {
			return res.status(400).json({ message: 'Some orders are invalid' });
		}

		// For advance payment, check if all are buy_now with pending_advance status
		if (isAdvance) {
			const invalidOrders = orders.filter(o => o.orderType !== 'buy_now' || o.status !== 'pending_advance');
			if (invalidOrders.length > 0) {
				return res.status(400).json({ message: 'All orders must be Buy Now orders with pending advance payment' });
			}
		} else {
			// For regular payment, check if all are confirmed
			const invalidOrders = orders.filter(o => o.status !== 'confirmed');
			if (invalidOrders.length > 0) {
				return res.status(400).json({ message: 'All orders must be confirmed' });
			}
		}

		// Calculate total amount (advance payment for buy_now, or full amount for confirmed)
		const totalAmount = orders.reduce((sum, order) => {
			return sum + (isAdvance ? (order.advancePayment || 0) : order.amount);
		}, 0);
		const amountInPaise = Math.round(totalAmount * 100);

		// Create payment intent with all order IDs in metadata
		const paymentIntent = await stripe.paymentIntents.create({
			amount: amountInPaise,
			currency: 'inr',
			automatic_payment_methods: { enabled: true },
			metadata: { 
				orderIds: JSON.stringify(orderIds),
				type: 'cart',
				isAdvancePayment: isAdvance ? 'true' : 'false'
			},
		});

		return res.json({ 
			clientSecret: paymentIntent.client_secret,
			totalAmount,
			orderCount: orders.length,
			isAdvancePayment: isAdvance
		});
	} catch (error) {
		console.error('Error creating cart payment intent:', error);
		return res.status(500).json({ message: error.message || 'Failed to create payment intent' });
	}
}

export async function stripeWebhook(req, res) {
	let event = req.body;
	const sig = req.headers['stripe-signature'];
	try {
		if (process.env.STRIPE_WEBHOOK_SECRET) {
			event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
		}
	} catch (err) {
		return res.status(400).send(`Webhook Error: ${err.message}`);
	}

	switch (event.type) {
		case 'payment_intent.succeeded': {
			const pi = event.data.object;
			const paymentType = pi.metadata?.type;
			
			if (paymentType === 'cart') {
				// Handle cart payment - update multiple orders
				const orderIds = JSON.parse(pi.metadata?.orderIds || '[]');
				const isAdvancePayment = pi.metadata?.isAdvancePayment === 'true';
				
				if (orderIds.length > 0) {
					const orders = await Order.find({ _id: { $in: orderIds } });
					const io = req.app.get('io');
					
					for (const order of orders) {
						if (isAdvancePayment && order.orderType === 'buy_now') {
							// Handle advance payment for buy_now orders in cart
							order.advancePaid = true;
							order.status = 'advance_paid';
							await order.save();
							
							// Create notification for farmer
							await Notification.create({
								userId: order.farmerId,
								type: 'buy_now_advance_paid',
								payload: {
									orderId: order._id,
									listingId: order.listingId,
									advancePayment: order.advancePayment,
									buyerId: order.buyerId,
								},
							});
							
							io.to(`user_${order.farmerId}`).emit('order:updated', order);
							io.to(`user_${order.buyerId}`).emit('order:updated', order);
							io.to(`user_${order.farmerId}`).emit('notification', {
								type: 'buy_now_advance_paid',
								message: `Advance payment received for Buy Now order`,
							});
						} else {
							// Handle full payment for confirmed orders
							order.status = 'paid';
							await order.save();
							io.to(`user_${order.farmerId}`).emit('order:updated', order);
							io.to(`user_${order.buyerId}`).emit('order:updated', order);
						}
					}
				}
			} else {
				// Handle single order payment
				const orderId = pi.metadata?.orderId;
				const isAdvancePayment = pi.metadata?.isAdvancePayment === 'true';
				const orderType = pi.metadata?.orderType || 'bid';
				
				if (orderId) {
					const order = await Order.findById(orderId);
					if (order) {
						if (isAdvancePayment && orderType === 'buy_now') {
							// Handle advance payment for buy_now orders
							order.advancePaid = true;
							order.status = 'advance_paid';
							await order.save();
							
							// Create notification for farmer
							await Notification.create({
								userId: order.farmerId,
								type: 'buy_now_advance_paid',
								payload: {
									orderId: order._id,
									listingId: order.listingId,
									advancePayment: order.advancePayment,
									buyerId: order.buyerId,
								},
							});
							
							const io = req.app.get('io');
							io.to(`user_${order.farmerId}`).emit('order:updated', order);
							io.to(`user_${order.buyerId}`).emit('order:updated', order);
							io.to(`user_${order.farmerId}`).emit('notification', {
								type: 'buy_now_advance_paid',
								message: `Advance payment received for Buy Now order`,
							});
						} else {
							// Handle full payment
							order.status = 'paid';
							await order.save();
							const io = req.app.get('io');
							io.to(`user_${order.farmerId}`).emit('order:updated', order);
							io.to(`user_${order.buyerId}`).emit('order:updated', order);
						}
					}
				}
			}
			break;
		}
		default:
			break;
	}
	res.json({ received: true });
}


