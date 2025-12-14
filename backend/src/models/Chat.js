import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema(
	{
		participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
		type: { type: String, enum: ['direct', 'expert'], default: 'direct' },
		expertId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // For expert chats
		lastMessage: String,
		lastMessageAt: Date,
	},
	{ timestamps: true }
);

export default mongoose.model('Chat', chatSchema);

