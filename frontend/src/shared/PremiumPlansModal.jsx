import { useState } from 'react';
import api from './apiClient.js';
import { useAuth } from './AuthContext.jsx';
import { useLanguage } from './LanguageContext.jsx';

export default function PremiumPlansModal({ open, onClose, onSubscribe }) {
	const { t } = useLanguage();
	const { user, setUser } = useAuth();
	const [loading, setLoading] = useState(false);
	const [selectedPlan, setSelectedPlan] = useState(null);
	const [plans, setPlans] = useState({
		basic: { amount: 199, name: 'Basic Plan' },
		premium: { amount: 299, name: 'Premium Plan' },
	});

	const handleSubscribe = async (planType) => {
		setLoading(true);
		try {
			const { data } = await api.post('/api/premium/subscribe', { planType });
			// Update user in context if needed
			if (onSubscribe) {
				onSubscribe(data);
			}
			alert(`Successfully subscribed to ${data.plan}!`);
			onClose();
		} catch (error) {
			console.error('Subscription error:', error);
			alert(error.response?.data?.error || 'Failed to subscribe. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	if (!open) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-2xl font-bold">Upgrade to Premium</h2>
					<button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
				</div>
				<p className="text-gray-600 mb-4">
					You've reached the free message limit. Upgrade to continue chatting with experts and unlock video calls!
				</p>
				<div className="space-y-3">
					{/* Basic Plan */}
					<div 
						className={`border-2 rounded p-4 cursor-pointer transition ${selectedPlan === 'basic' ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}
						onClick={() => setSelectedPlan('basic')}
					>
						<div className="flex justify-between items-center">
							<div>
								<h3 className="font-semibold text-lg">{plans.basic.name}</h3>
								<p className="text-sm text-gray-600">Unlimited expert chats for 30 days</p>
							</div>
							<div className="text-right">
								<div className="text-2xl font-bold">₹{plans.basic.amount}</div>
								<div className="text-xs text-gray-500">per month</div>
							</div>
						</div>
						<ul className="mt-2 text-sm text-gray-700 space-y-1">
							<li>✓ Unlimited messages with experts</li>
							<li>✓ Video call access (fees apply)</li>
							<li>✓ Priority support</li>
						</ul>
					</div>
					{/* Premium Plan */}
					<div 
						className={`border-2 rounded p-4 cursor-pointer transition ${selectedPlan === 'premium' ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}
						onClick={() => setSelectedPlan('premium')}
					>
						<div className="flex justify-between items-center">
							<div>
								<h3 className="font-semibold text-lg">{plans.premium.name}</h3>
								<p className="text-sm text-gray-600">All features for 30 days</p>
							</div>
							<div className="text-right">
								<div className="text-2xl font-bold">₹{plans.premium.amount}</div>
								<div className="text-xs text-gray-500">per month</div>
							</div>
						</div>
						<ul className="mt-2 text-sm text-gray-700 space-y-1">
							<li>✓ Unlimited messages with experts</li>
							<li>✓ Video calls included (first 5 free)</li>
							<li>✓ Priority support</li>
							<li>✓ Expert consultation reports</li>
						</ul>
					</div>
				</div>
				<div className="mt-6 flex gap-3">
					<button
						onClick={onClose}
						className="flex-1 border border-gray-300 px-4 py-2 rounded hover:bg-gray-50"
					>
						Cancel
					</button>
					<button
						onClick={() => selectedPlan && handleSubscribe(selectedPlan)}
						disabled={!selectedPlan || loading}
						className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{loading ? 'Processing...' : 'Subscribe'}
					</button>
				</div>
			</div>
		</div>
	);
}

