import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
	{
		chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
		senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		content: { type: String, required: true },
		type: { type: String, enum: ['text', 'video_call', 'call_ended', 'call_started'], default: 'text' },
		read: { type: Boolean, default: false },
		readAt: Date,
		callDuration: { type: Number }, // Duration in seconds
		callStartedAt: { type: Date },
		callEndedAt: { type: Date },
	},
	{ timestamps: true }
);

export default mongoose.model('Message', messageSchema);

