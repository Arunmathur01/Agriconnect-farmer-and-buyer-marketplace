import { Router } from 'express';
import { authRequired, requireRoles } from '../security/auth.middleware.js';
import { listMyOrders, createOrder, getOrder, payOrderStub, acceptBuyNowOrder, rejectBuyNowOrder } from '../controllers/order.controller.js';

const router = Router();

router.get('/', authRequired, listMyOrders);
router.get('/:orderId', authRequired, getOrder);
router.post('/', authRequired, createOrder);
router.post('/pay/:orderId', authRequired, payOrderStub);
router.post('/:orderId/accept-buy-now', authRequired, acceptBuyNowOrder);
router.post('/:orderId/reject-buy-now', authRequired, rejectBuyNowOrder);
router.post('/:orderId/status', authRequired, requireRoles('admin', 'mandi_manager'), async (req, res) => {
	const { orderId } = req.params;
	const { status } = req.body; // shipped | delivered | cancelled
	const allowed = ['shipped', 'delivered', 'cancelled'];
	if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });
	const Order = (await import('../models/Order.js')).default;
	const order = await Order.findById(orderId);
	if (!order) return res.status(404).json({ message: 'Not found' });
	order.status = status;
	await order.save();
	const io = req.app.get('io');
	io.to(`user_${order.farmerId}`).emit('order:updated', order);
	io.to(`user_${order.buyerId}`).emit('order:updated', order);
	return res.json(order);
});

export default router;
