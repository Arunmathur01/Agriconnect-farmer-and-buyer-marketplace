import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

export function registerSocketHandlers(io, socket) {
	// Join listing room to receive bid updates
	socket.on('join_listing', (listingId) => {
		socket.join(`listing_${listingId}`);
	});

	// Join user room to receive personal updates (orders, notifications)
	socket.on('join_user', (userId) => {
		socket.join(`user_${userId}`);
	});

	// Broadcast new bid to room
	socket.on('bid:placed', ({ listingId, bid }) => {
		io.to(`listing_${listingId}`).emit('bid:updated', bid);
	});

	// Chat handlers
	socket.on('join_chat', async (chatId) => {
		socket.join(`chat_${chatId}`);
	});

	socket.on('send_message', async (data) => {
		try {
			const { chatId, senderId, content, type = 'text' } = data;
			
			// Check if this is an expert chat and sender is a farmer
			const chat = await Chat.findById(chatId).populate('participants');
			if (chat && chat.type === 'expert') {
				const sender = await User.findById(senderId);
				if (sender && sender.role === 'farmer') {
					// Check if user has premium or free messages remaining
					const isPremium = sender.premiumPlan !== 'free' && 
						(!sender.premiumExpiresAt || new Date(sender.premiumExpiresAt) > new Date());
					
					if (!isPremium) {
						const messageCount = sender.expertChatMessageCount || 0;
						if (messageCount >= 10) {
							socket.emit('message_limit_reached', { 
								message: 'You have reached the free message limit. Please upgrade to premium to continue chatting with experts.',
								requiresPremium: true 
							});
							return;
						}
						
						// Increment message count for free users
						sender.expertChatMessageCount = messageCount + 1;
						await sender.save();
					}
				}
			}
			
			const message = new Message({ chatId, senderId, content, type });
			await message.save();
			
			// Populate senderId before emitting
			await message.populate('senderId', 'name email');
			
			// Update chat last message
			await Chat.findByIdAndUpdate(chatId, {
				lastMessage: content,
				lastMessageAt: new Date(),
			});
			
			// Emit to all participants in the chat
			io.to(`chat_${chatId}`).emit('new_message', message);
		} catch (err) {
			console.error('Error sending message:', err);
			socket.emit('message_error', { error: err.message });
		}
	});

	// WebRTC signaling handlers for video calls
	socket.on('offer', (data) => {
		const { targetUserId, offer } = data;
		io.to(`user_${targetUserId}`).emit('offer', {
			offer,
			senderId: socket.userId,
		});
	});

	socket.on('answer', (data) => {
		const { targetUserId, answer } = data;
		io.to(`user_${targetUserId}`).emit('answer', {
			answer,
			senderId: socket.userId,
		});
	});

	socket.on('ice_candidate', (data) => {
		const { targetUserId, candidate } = data;
		io.to(`user_${targetUserId}`).emit('ice_candidate', {
			candidate,
			senderId: socket.userId,
		});
	});

	socket.on('call_started', async (data) => {
		const { chatId, targetUserId } = data;
		if (chatId && socket.userId) {
			// Save call started message
			const message = new Message({
				chatId,
				senderId: socket.userId,
				content: 'Video call started',
				type: 'call_started',
				callStartedAt: new Date(),
			});
			await message.save();
			await message.populate('senderId', 'name email');
			io.to(`chat_${chatId}`).emit('new_message', message);
		}
	});

	socket.on('end_call', async (data) => {
		const { targetUserId, chatId, duration, startedAt, endedAt } = data;
		if (chatId && socket.userId) {
			// Format duration
			const minutes = Math.floor((duration || 0) / 60);
			const seconds = (duration || 0) % 60;
			const durationText = duration > 0 
				? `Video call ended (Duration: ${minutes}m ${seconds}s)`
				: 'Video call ended';
			
			// Save call ended message
			const message = new Message({
				chatId,
				senderId: socket.userId,
				content: durationText,
				type: 'call_ended',
				callDuration: duration || 0,
				callStartedAt: startedAt ? new Date(startedAt) : null,
				callEndedAt: endedAt ? new Date(endedAt) : new Date(),
			});
			await message.save();
			await message.populate('senderId', 'name email');
			io.to(`chat_${chatId}`).emit('new_message', message);
			io.to(`chat_${chatId}`).emit('call_ended', message);
		}
		io.to(`user_${targetUserId}`).emit('call_ended', { senderId: socket.userId });
	});

	socket.on('disconnect', () => {
		// noop
	});
}
