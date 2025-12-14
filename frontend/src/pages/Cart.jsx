import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../shared/CartContext.jsx';
import { useLanguage } from '../shared/LanguageContext.jsx';
import api from '../shared/apiClient.js';

export default function Cart() {
	const { t } = useLanguage();
	const navigate = useNavigate();
	const { cartItems, removeFromCart, clearCart, getCartTotal } = useCart();
	const [isProcessing, setIsProcessing] = useState(false);

	async function handleCheckout() {
		if (cartItems.length === 0) return;
		
		setIsProcessing(true);
		try {
			// Separate buy_now orders (need advance payment) from regular orders
			const buyNowOrders = cartItems.filter(item => item.orderType === 'buy_now' && item.status === 'pending_advance');
			const confirmedOrders = cartItems.filter(item => item.orderType !== 'buy_now' || item.status === 'confirmed');
			
			// If there are buy_now orders, handle them separately
			if (buyNowOrders.length > 0 && confirmedOrders.length === 0) {
				// All are buy_now orders - create advance payment intent
				const orderIds = buyNowOrders.map(item => item._id);
				const { data } = await api.post('/api/payments/cart-intent', { 
					orderIds,
					isAdvancePayment: true 
				});
				navigate(`/checkout?cart=true&clientSecret=${data.clientSecret}&isAdvancePayment=true`);
			} else if (buyNowOrders.length > 0) {
				// Mixed orders - show message
				alert(t('mixedOrdersInCart') || 'Your cart contains both Buy Now and confirmed orders. Please checkout Buy Now orders separately first.');
				setIsProcessing(false);
				return;
			} else {
				// Regular confirmed orders
				const orderIds = confirmedOrders.map(item => item._id);
				const { data } = await api.post('/api/payments/cart-intent', { orderIds });
				navigate(`/checkout?cart=true&clientSecret=${data.clientSecret}`);
			}
		} catch (error) {
			console.error('Error processing cart checkout:', error);
			alert(error.response?.data?.message || t('checkoutError') || 'Failed to process checkout');
		} finally {
			setIsProcessing(false);
		}
	}

	if (cartItems.length === 0) {
		return (
			<div className="max-w-4xl mx-auto">
				<h1 className="text-3xl font-bold mb-6">{t('cart') || 'Shopping Cart'}</h1>
				<div className="bg-white rounded-xl shadow-md p-12 text-center">
					<svg className="w-24 h-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
					</svg>
					<h2 className="text-2xl font-semibold text-gray-800 mb-2">{t('cartEmpty') || 'Your cart is empty'}</h2>
					<p className="text-gray-600 mb-6">{t('cartEmptyDesc') || 'Add confirmed orders to your cart to proceed with payment'}</p>
					<button
						onClick={() => navigate('/buyer')}
						className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
					>
						{t('browseOrders') || 'Browse Orders'}
					</button>
				</div>
			</div>
		);
	}

	const total = getCartTotal();

	return (
		<div className="max-w-4xl mx-auto space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold">{t('cart') || 'Shopping Cart'}</h1>
				<button
					onClick={clearCart}
					className="text-red-600 hover:text-red-800 text-sm font-medium"
				>
					{t('clearCart') || 'Clear Cart'}
				</button>
			</div>

			<div className="bg-white rounded-xl shadow-md overflow-hidden">
				<div className="divide-y">
					{cartItems.map((order) => (
						<div key={order._id} className="p-6 hover:bg-gray-50 transition-colors">
							<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
								<div className="flex-1">
									<div className="flex items-start gap-4">
										<div className="flex-1">
											<h3 className="font-semibold text-lg text-gray-900 mb-2">
												{typeof order.listingId === 'object' && order.listingId?.cropName 
													? order.listingId.cropName 
													: t('order') + ' #' + order._id.slice(-6)}
											</h3>
											<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
												<div>
													<p className="text-gray-600">{t('price')}:</p>
													<p className="font-semibold">₹{order.pricePerKg}/kg</p>
												</div>
												<div>
													<p className="text-gray-600">{t('quantity')}:</p>
													<p className="font-semibold">{order.quantityKg} kg</p>
												</div>
												<div>
													<p className="text-gray-600">
														{order.orderType === 'buy_now' && order.status === 'pending_advance' 
															? (t('advancePayment') || 'Advance Payment') 
															: t('amount')}
													</p>
													<p className="font-semibold text-green-600">
														₹{order.orderType === 'buy_now' && order.status === 'pending_advance' 
															? (order.advancePayment || 0) 
															: order.amount}
													</p>
												</div>
												<div>
													<p className="text-gray-600">{t('status')}:</p>
													<span className={`px-2 py-1 rounded-full text-xs font-medium ${
														order.orderType === 'buy_now' ? 'bg-orange-100 text-orange-800' :
														order.status === 'confirmed' ? 'bg-green-100 text-green-800' :
														'bg-yellow-100 text-yellow-800'
													}`}>
														{order.orderType === 'buy_now' ? (t('buyNow') || 'Buy Now') : t(order.status)}
													</span>
												</div>
											</div>
											{order.orderType === 'buy_now' && order.status === 'pending_advance' && (
												<div className="mt-2 text-xs text-blue-600">
													{t('buyNowOrderPending') || 'Buy Now order - Waiting for advance payment'}
												</div>
											)}
										</div>
									</div>
								</div>
								<button
									onClick={() => removeFromCart(order._id)}
									className="text-red-600 hover:text-red-800 px-4 py-2 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
								>
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
									</svg>
								</button>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Order Summary */}
			<div className="bg-white rounded-xl shadow-md p-6">
				<h2 className="text-xl font-bold mb-4">{t('orderSummary') || 'Order Summary'}</h2>
				<div className="space-y-3">
					<div className="flex justify-between text-gray-600">
						<span>{t('items') || 'Items'}:</span>
						<span>{cartItems.length}</span>
					</div>
					<div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t">
						<span>{t('total')}:</span>
						<span className="text-green-600">₹{total.toFixed(2)}</span>
					</div>
				</div>
				<button
					onClick={handleCheckout}
					disabled={isProcessing || cartItems.length === 0}
					className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isProcessing ? t('processing') : t('proceedToCheckout') || 'Proceed to Checkout'}
				</button>
			</div>
		</div>
	);
}

