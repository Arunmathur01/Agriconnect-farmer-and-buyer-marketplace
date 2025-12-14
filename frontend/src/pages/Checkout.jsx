import { useEffect, useMemo, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../shared/apiClient.js';
import { useToast } from '../shared/Toast.jsx';
import { useLanguage } from '../shared/LanguageContext.jsx';
import { useCart } from '../shared/CartContext.jsx';

const pk = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
const stripePromise = pk ? loadStripe(pk) : null;

function useQuery() {
	const { search } = useLocation();
	return useMemo(() => new URLSearchParams(search), [search]);
}

function CheckoutForm({ clientSecret, cartItems, isCart }) {
	const { t } = useLanguage();
	const stripe = useStripe();
	const elements = useElements();
	const toast = useToast();
	const navigate = useNavigate();
	const { clearCart } = useCart();
	const [loading, setLoading] = useState(false);

	async function onSubmit(e) {
		e.preventDefault();
		if (!stripe || !elements) return;
		setLoading(true);
		const { error } = await stripe.confirmPayment({ elements, redirect: 'if_required' });
		if (error) {
			toast?.error(error.message || t('paymentFailed') || 'Payment failed');
		} else {
			toast?.success(t('paymentSuccessful') || 'Payment successful');
			if (isCart) {
				clearCart();
			}
			setTimeout(() => {
				navigate('/buyer');
			}, 2000);
		}
		setLoading(false);
	}

	return (
		<form onSubmit={onSubmit} className="space-y-4 max-w-md mx-auto">
			<PaymentElement />
			<button disabled={!stripe || loading} className="bg-primary text-white px-4 py-2 rounded w-full" aria-label={t('payNow')}>
				{loading ? t('processing') : t('payNow')}
			</button>
		</form>
	);
}

export default function Checkout() {
	const { t } = useLanguage();
	const { cartItems } = useCart();
	const q = useQuery();
	const orderId = q.get('orderId');
	const isCart = q.get('cart') === 'true';
	const clientSecretParam = q.get('clientSecret');
	const [clientSecret, setClientSecret] = useState(clientSecretParam || '');
	const [orderDetails, setOrderDetails] = useState(null);
	const navigate = useNavigate();

	useEffect(() => {
		async function init() {
			if (!stripePromise) return;
			
			if (isCart) {
				// Cart checkout - use provided clientSecret or create new one
				if (clientSecretParam) {
					setClientSecret(clientSecretParam);
				} else if (cartItems.length > 0) {
					try {
						const orderIds = cartItems.map(item => item._id);
						const { data } = await api.post('/api/payments/cart-intent', { orderIds });
						setClientSecret(data.clientSecret);
						setOrderDetails({ totalAmount: data.totalAmount, orderCount: data.orderCount });
					} catch (error) {
						console.error('Error creating cart payment intent:', error);
					}
				}
			} else if (orderId) {
				// Single order checkout
				try {
					// Fetch order details first
					const orderRes = await api.get(`/api/orders/${orderId}`);
					setOrderDetails(orderRes.data);
					// Check if it's advance payment
					const isAdvancePayment = q.get('isAdvancePayment') === 'true';
					// Then create payment intent
					const { data } = await api.post('/api/payments/intent', { orderId, isAdvancePayment });
					setClientSecret(data.clientSecret);
					if (data.isAdvancePayment) {
						setOrderDetails(prev => ({ ...prev, advancePayment: data.amount, isAdvancePayment: true }));
					}
				} catch (error) {
					console.error('Error creating payment intent:', error);
				}
			}
		}
		init();
	}, [orderId, isCart, cartItems.length, clientSecretParam]);

	if (!orderId && !isCart) {
		return (
			<div className="max-w-xl mx-auto">
				<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
					<p className="text-yellow-800">{t('noOrderSelected')}</p>
				</div>
				<button 
					onClick={() => navigate('/buyer')}
					className="bg-primary text-white px-4 py-2 rounded"
				>
					{t('backToDashboard') || 'Back to Dashboard'}
				</button>
			</div>
		);
	}

	if (isCart && cartItems.length === 0) {
		return (
			<div className="max-w-xl mx-auto">
				<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
					<p className="text-yellow-800">{t('cartEmpty') || 'Your cart is empty'}</p>
				</div>
				<button 
					onClick={() => navigate('/cart')}
					className="bg-primary text-white px-4 py-2 rounded"
				>
					{t('viewCart') || 'View Cart'}
				</button>
			</div>
		);
	}

	if (!stripePromise) {
		return (
			<div className="max-w-xl mx-auto space-y-2">
				<h1 className="text-2xl font-semibold">{t('checkout')}</h1>
				<p className="text-gray-700">{t('paymentDisabled')}</p>
				<p className="text-sm text-gray-600">{t('setStripeKey')}</p>
			</div>
		);
	}

	if (!clientSecret) return <div className="max-w-xl mx-auto">{t('loadingPayment')}</div>;

	const isAdvancePayment = orderDetails?.isAdvancePayment || q.get('isAdvancePayment') === 'true';
	const totalAmount = isAdvancePayment 
		? (orderDetails?.advancePayment || 0)
		: (orderDetails?.totalAmount || orderDetails?.amount || 0);

	return (
		<div className="max-w-4xl mx-auto space-y-6">
			<h1 className="text-3xl font-bold">{t('checkout')}</h1>
			
			{/* Order Summary */}
			<div className="bg-white rounded-xl shadow-md p-6">
				<h2 className="text-xl font-bold mb-4">{t('orderSummary') || 'Order Summary'}</h2>
				{isAdvancePayment && (
					<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
						<p className="text-blue-800 font-medium">
							{t('advancePayment') || 'Advance Payment'}: {orderDetails?.advancePaymentPercentage || 30}%
						</p>
						<p className="text-sm text-blue-600 mt-1">
							{t('advancePaymentDesc') || 'Pay the advance amount now. The remaining amount will be paid after farmer accepts the order.'}
						</p>
					</div>
				)}
				{isCart ? (
					<div className="space-y-3">
						<div className="flex justify-between text-gray-600">
							<span>{t('items') || 'Items'}:</span>
							<span>{cartItems.length}</span>
						</div>
						<div className="pt-3 border-t">
							<div className="flex justify-between text-lg font-bold text-gray-900">
								<span>{t('total')}:</span>
								<span className="text-green-600">₹{totalAmount.toFixed(2)}</span>
							</div>
						</div>
					</div>
				) : (
					<div className="space-y-3">
						{orderDetails && (
							<>
								<div className="flex justify-between text-gray-600">
									<span>{t('cropName') || 'Crop'}:</span>
									<span>{typeof orderDetails.listingId === 'object' ? orderDetails.listingId?.cropName : 'N/A'}</span>
								</div>
								<div className="flex justify-between text-gray-600">
									<span>{t('quantity')}:</span>
									<span>{orderDetails.quantityKg} kg</span>
								</div>
								<div className="flex justify-between text-gray-600">
									<span>{t('price')}:</span>
									<span>₹{orderDetails.pricePerKg}/kg</span>
								</div>
								{isAdvancePayment && (
									<>
										<div className="flex justify-between text-gray-600">
											<span>{t('advancePayment') || 'Advance Payment'} ({orderDetails?.advancePaymentPercentage || 30}%):</span>
											<span className="font-semibold">₹{orderDetails?.advancePayment?.toFixed(2) || totalAmount.toFixed(2)}</span>
										</div>
										<div className="flex justify-between text-gray-600">
											<span>{t('remainingAmount') || 'Remaining Amount'}:</span>
											<span>₹{(orderDetails?.amount - (orderDetails?.advancePayment || totalAmount)).toFixed(2)}</span>
										</div>
									</>
								)}
								<div className="pt-3 border-t">
									<div className="flex justify-between text-lg font-bold text-gray-900">
										<span>{isAdvancePayment ? (t('amountToPay') || 'Amount to Pay') : t('total')}:</span>
										<span className="text-green-600">₹{totalAmount.toFixed(2)}</span>
									</div>
								</div>
							</>
						)}
					</div>
				)}
			</div>

			{/* Payment Form */}
			<div className="bg-white rounded-xl shadow-md p-6">
				<h2 className="text-xl font-bold mb-4">{t('paymentDetails') || 'Payment Details'}</h2>
				<Elements stripe={stripePromise} options={{ clientSecret }}>
					<CheckoutForm clientSecret={clientSecret} cartItems={cartItems} isCart={isCart} />
				</Elements>
			</div>
		</div>
	);
}
