import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

// Get or create a chat between users
export async function getOrCreateChat(req, res) {
	try {
		const { userId } = req.body;
		const currentUserId = req.user.id;
		
		if (!userId) {
			return res.status(400).json({ error: 'User ID required' });
		}

		// Find existing chat between these users
		let chat = await Chat.findOne({
			participants: { $all: [currentUserId, userId] },
		});

		if (!chat) {
			chat = new Chat({
				participants: [currentUserId, userId],
			});
			await chat.save();
		}

		await chat.populate('participants', 'name email role');
		res.json(chat);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
}

// Create expert chat
export async function createExpertChat(req, res) {
	try {
		const { expertId } = req.body;
		const currentUserId = req.user.id;

		if (!expertId) {
			return res.status(400).json({ error: 'Expert ID required' });
		}

		// Verify user is an expert
		const expert = await User.findById(expertId);
		if (!expert || expert.role !== 'expert') {
			return res.status(400).json({ error: 'Invalid expert' });
		}

		// Find or create expert chat
		let chat = await Chat.findOne({
			type: 'expert',
			expertId,
			participants: currentUserId,
		});

		if (!chat) {
			chat = new Chat({
				participants: [currentUserId, expertId],
				type: 'expert',
				expertId,
			});
			await chat.save();
		}

		await chat.populate(['participants', 'expertId'], 'name email role');
		res.json(chat);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
}

// Get user's chats
export async function getUserChats(req, res) {
	try {
		const userId = req.user.id;
		const chats = await Chat.find({ participants: userId })
			.populate('participants', 'name email role')
			.populate('expertId', 'name email role')
			.sort({ lastMessageAt: -1 })
			.lean();
		
		// Add unread count for each chat
		const chatsWithUnread = await Promise.all(
			chats.map(async (chat) => {
				const unreadCount = await Message.countDocuments({
					chatId: chat._id,
					senderId: { $ne: userId },
					read: false,
				});
				return { ...chat, unreadCount };
			})
		);
		
		res.json(chatsWithUnread);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
}

// Get messages for a chat
export async function getChatMessages(req, res) {
	try {
		const { chatId } = req.params;
		const messages = await Message.find({ chatId })
			.populate('senderId', 'name email')
			.sort({ createdAt: 1 })
			.limit(100)
			.lean();

		res.json(messages);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
}

// Get available experts (or all experts for farmers)
export async function getAvailableExperts(req, res) {
	try {
		// For farmers, show all experts; for others, show only available ones
		const filter = req.user?.role === 'farmer' 
			? { role: 'expert' }
			: { role: 'expert', isAvailable: true };
		
		const experts = await User.find(filter)
			.select('name email role phone isAvailable')
			.sort({ name: 1 })
			.lean();

		res.json(experts);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
}

// Toggle expert availability
export async function toggleExpertAvailability(req, res) {
	try {
		const userId = req.user.id;
		const user = await User.findById(userId);
		
		if (user.role !== 'expert') {
			return res.status(403).json({ error: 'Only experts can toggle availability' });
		}

		user.isAvailable = !user.isAvailable;
		await user.save();

		res.json({ isAvailable: user.isAvailable });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
}

// Mark messages as read
export async function markMessagesAsRead(req, res) {
	try {
		const { chatId } = req.params;
		const userId = req.user.id;

		await Message.updateMany(
			{ chatId, senderId: { $ne: userId }, read: false },
			{ read: true, readAt: new Date() }
		);

		res.json({ success: true });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
}

