import User from '../models/User.js';

const PREMIUM_PLANS = {
	basic: {
		amount: 199,
		name: 'Basic Plan',
		duration: 30, // days
	},
	premium: {
		amount: 299,
		name: 'Premium Plan',
		duration: 30, // days
	},
};

// Get premium plans
export async function getPremiumPlans(req, res) {
	try {
		res.json({ plans: PREMIUM_PLANS });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
}

// Subscribe to premium plan
export async function subscribePremium(req, res) {
	try {
		const { planType } = req.body;
		const userId = req.user.id;

		if (!PREMIUM_PLANS[planType]) {
			return res.status(400).json({ error: 'Invalid plan type' });
		}

		const plan = PREMIUM_PLANS[planType];
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + plan.duration);

		const user = await User.findById(userId);
		user.premiumPlan = planType;
		user.premiumExpiresAt = expiresAt;
		await user.save();

		// In a real app, you would process payment here (Stripe, Razorpay, etc.)
		// For now, we'll just update the user's subscription

		res.json({
			message: 'Subscription successful',
			plan: planType,
			expiresAt,
			amount: plan.amount,
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
}

// Get user's subscription status
export async function getSubscriptionStatus(req, res) {
	try {
		const userId = req.user.id;
		const user = await User.findById(userId).select('premiumPlan premiumExpiresAt expertChatMessageCount');

		const isPremium = user.premiumPlan !== 'free' && 
			(!user.premiumExpiresAt || new Date(user.premiumExpiresAt) > new Date());

		res.json({
			premiumPlan: isPremium ? user.premiumPlan : 'free',
			premiumExpiresAt: user.premiumExpiresAt,
			expertChatMessageCount: user.expertChatMessageCount || 0,
			isPremium,
			remainingFreeMessages: Math.max(0, 10 - (user.expertChatMessageCount || 0)),
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
}

