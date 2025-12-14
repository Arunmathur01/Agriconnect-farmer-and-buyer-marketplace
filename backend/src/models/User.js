import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		passwordHash: { type: String, required: true },
		role: {
			type: String,
			enum: ['farmer', 'buyer', 'admin', 'assayer', 'mandi_manager', 'expert'],
			required: true,
		},
		isAvailable: { type: Boolean, default: false }, // For experts
		phone: String,
		address: String,
		// Premium subscription fields
		premiumPlan: { 
			type: String, 
			enum: ['free', 'basic', 'premium'], 
			default: 'free' 
		},
		premiumExpiresAt: Date,
		expertChatMessageCount: { type: Number, default: 0 }, // Count of messages sent to experts
	},
	{ timestamps: true }
);

export default mongoose.model('User', userSchema);


