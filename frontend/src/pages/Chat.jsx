import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../shared/useSocket.js';
import api from '../shared/apiClient.js';
import { useAuth } from '../shared/AuthContext.jsx';
import { useLanguage } from '../shared/LanguageContext.jsx';
import VideoCall from '../shared/VideoCall.jsx';
import PremiumPlansModal from '../shared/PremiumPlansModal.jsx';

export default function Chat() {
	const { chatId: routeChatId } = useParams();
	const { t } = useLanguage();
	const { user, setUser } = useAuth();
	const socketRef = useSocket();
	const [chatId, setChatId] = useState(routeChatId);
	const [chat, setChat] = useState(null);
	const [messages, setMessages] = useState([]);
	const [message, setMessage] = useState('');
	const [showVideo, setShowVideo] = useState(false);
	const [showPremiumModal, setShowPremiumModal] = useState(false);
	const [subscriptionStatus, setSubscriptionStatus] = useState(null);
	const [messageLimitReached, setMessageLimitReached] = useState(false);
	const messagesEndRef = useRef(null);

	useEffect(() => {
		if (routeChatId) {
			setChatId(routeChatId);
			loadChat(routeChatId);
			loadMessages(routeChatId);
			loadSubscriptionStatus();
		}
	}, [routeChatId]);

	useEffect(() => {
		if (chat && chat.type === 'expert' && user?.role === 'farmer') {
			loadSubscriptionStatus();
		}
	}, [chat, user]);

	useEffect(() => {
		if (!chatId) return;
		const s = socketRef.current;
		if (!s) return;

		s.emit('join_chat', chatId);
		s.on('new_message', (msg) => {
			setMessages((prev) => {
				// Check if message already exists (avoid duplicates)
				const exists = prev.find(m => m._id === msg._id);
				if (exists) return prev;
				// Add new message and sort
				const updated = [...prev, msg].sort((a, b) => 
					new Date(a.createdAt) - new Date(b.createdAt)
				);
				return updated;
			});
			// Mark as read if message is from other user
			const senderId = msg.senderId?._id || msg.senderId;
			if (senderId && senderId !== user.id && senderId.toString() !== user.id?.toString()) {
				markMessagesAsRead(chatId);
			}
			// Reload subscription status after receiving message
			if (chat?.type === 'expert' && user?.role === 'farmer') {
				loadSubscriptionStatus();
			}
		});

		s.on('message_limit_reached', (data) => {
			setMessageLimitReached(true);
			setShowPremiumModal(true);
		});

		s.on('message_error', (data) => {
			alert(data.error || 'Failed to send message');
		});

		return () => {
			s.off('new_message');
			s.off('message_limit_reached');
			s.off('message_error');
		};
	}, [chatId, socketRef, chat, user]);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	// Mark messages as read when chat is opened or user views the chat
	useEffect(() => {
		if (chatId && messages.length > 0) {
			// Mark messages as read after a short delay (when user is viewing)
			const timer = setTimeout(() => {
				markMessagesAsRead(chatId);
			}, 500);
			return () => clearTimeout(timer);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [chatId, messages.length]);

	async function loadChat(id) {
		try {
			const { data } = await api.get('/api/chat/mine');
			const found = data?.find(c => c._id === id);
			setChat(found || null);
		} catch (err) {
			console.error('Error loading chat:', err);
			// Don't show alert for connection errors
			if (err.code !== 'ERR_NETWORK' && err.code !== 'ERR_CONNECTION_REFUSED') {
				console.error('Failed to load chat:', err.message);
			}
			setChat(null);
		}
	}

	async function loadMessages(id) {
		try {
			const { data } = await api.get(`/api/chat/${id}/messages`);
			// Sort messages by createdAt to ensure proper order
			const sortedMessages = (data || []).sort((a, b) => 
				new Date(a.createdAt) - new Date(b.createdAt)
			);
			setMessages(sortedMessages);
			// Mark messages as read when loading
			markMessagesAsRead(id);
		} catch (err) {
			console.error('Error loading messages:', err);
		}
	}

	async function markMessagesAsRead(chatId) {
		try {
			await api.post(`/api/chat/${chatId}/read`);
		} catch (err) {
			console.error('Error marking messages as read:', err);
		}
	}

	async function loadSubscriptionStatus() {
		try {
			const { data } = await api.get('/api/premium/status');
			setSubscriptionStatus(data);
			if (!data.isPremium && data.remainingFreeMessages <= 0) {
				setMessageLimitReached(true);
			}
		} catch (err) {
			console.error('Error loading subscription status:', err);
		}
	}

	function sendMessage(e) {
		e.preventDefault();
		if (!message.trim() || !chatId) return;

		// Check if message limit reached (for expert chats)
		if (chat?.type === 'expert' && user?.role === 'farmer') {
			if (messageLimitReached || (!subscriptionStatus?.isPremium && subscriptionStatus?.remainingFreeMessages <= 0)) {
				setShowPremiumModal(true);
				return;
			}
		}

		socketRef.current?.emit('send_message', {
			chatId,
			senderId: user.id,
			content: message,
		});

		setMessage('');
	}

	async function startVideoCall() {
		// Check premium for video calls
		if (chat?.type === 'expert' && user?.role === 'farmer') {
			if (!subscriptionStatus?.isPremium) {
				if (window.confirm('Video calls require premium subscription. Would you like to upgrade?')) {
					setShowPremiumModal(true);
					return;
				}
				return;
			}
		}
		setShowVideo(true);
	}

	const handlePremiumSubscribe = (data) => {
		loadSubscriptionStatus();
		setMessageLimitReached(false);
	};

	const otherUser = chat?.participants?.find((p) => p._id !== user.id);
	const isExpertChat = chat?.type === 'expert';
	const isFarmer = user?.role === 'farmer';
	const canSendMessage = !messageLimitReached && (subscriptionStatus?.isPremium || (subscriptionStatus?.remainingFreeMessages || 10) > 0);

	return (
		<div className="flex flex-col h-[600px] border rounded">
			<div className="p-4 border-b flex items-center justify-between bg-primary text-white">
				<div>
					{otherUser?.name || t('chat')}
					{isExpertChat && isFarmer && subscriptionStatus && (
						<div className="text-xs mt-1">
							{subscriptionStatus.isPremium ? (
								<span className="text-green-200">✓ {t('premiumActive')}</span>
							) : (
								<span className="text-yellow-200">
									{subscriptionStatus.remainingFreeMessages || 0} {t('freeMessagesRemaining')}
								</span>
							)}
						</div>
					)}
				</div>
				<button 
					onClick={startVideoCall} 
					className="px-3 py-1 bg-white text-primary rounded flex items-center gap-2"
					title={isExpertChat && !subscriptionStatus?.isPremium ? t('premiumRequired') : ''}
				>
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
					</svg>
					{t('videoCall')}
				</button>
			</div>
			<div className="flex-1 overflow-y-auto p-4 space-y-2">
				{messageLimitReached && (
					<div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-2">
						<p className="font-semibold">{t('messageLimitReached')}</p>
						<p className="text-sm">{t('upgradeToContinue')}</p>
						<button 
							onClick={() => setShowPremiumModal(true)} 
							className="mt-2 bg-green-600 text-white px-4 py-1 rounded text-sm"
						>
							{t('viewPlans')}
						</button>
					</div>
				)}
				{messages.length === 0 ? (
					<div className="text-center py-8 text-gray-500">
						<p>{t('noMessagesYet')}</p>
					</div>
				) : (
					messages.map((msg) => {
						const isMyMessage = msg.senderId?._id === user.id || msg.senderId?._id?.toString() === user.id?.toString();
						const isRead = msg.read === true;
						
						return (
							<div key={msg._id || msg.createdAt} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} mb-2`}>
								<div className={`max-w-xs px-4 py-2 rounded-lg shadow-sm ${
									isMyMessage 
										? 'bg-green-600 text-white' 
										: 'bg-gray-100 text-gray-900'
								}`}>
									{!isMyMessage && (
										<div className={`text-xs mb-1 ${isMyMessage ? 'text-white/80' : 'text-gray-600 font-semibold'}`}>
											{msg.senderId?.name || t('unknown')}
										</div>
									)}
									{msg.type === 'call_started' ? (
										<div className={`flex items-center gap-2 text-sm p-2 rounded-lg ${
											isMyMessage ? 'bg-green-700/50' : 'bg-blue-100'
										}`}>
											<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
											</svg>
											<span className="font-medium">{t('videoCallStarted')}</span>
											{msg.callStartedAt && (
												<span className="text-xs opacity-75">
													{new Date(msg.callStartedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
												</span>
											)}
										</div>
									) : msg.type === 'call_ended' ? (
										<div className={`flex flex-col gap-1 text-sm p-2 rounded-lg ${
											isMyMessage ? 'bg-green-700/50' : 'bg-blue-100'
										}`}>
											<div className="flex items-center gap-2">
												<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
												</svg>
												<span className="font-medium">{t('videoCallEnded')}</span>
											</div>
											{msg.callDuration > 0 && (
												<div className="flex items-center gap-2 text-xs opacity-90">
													<span>{t('duration')}: {Math.floor(msg.callDuration / 60)}m {msg.callDuration % 60}s</span>
													{msg.callStartedAt && msg.callEndedAt && (
														<span>•</span>
													)}
													{msg.callStartedAt && (
														<span>
															{new Date(msg.callStartedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
															{msg.callEndedAt && ` ${new Date(msg.callEndedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
														</span>
													)}
												</div>
											)}
										</div>
									) : (
										<div className="break-words">{msg.content}</div>
									)}
									<div className={`flex items-center justify-end gap-1 mt-1 ${
										isMyMessage ? 'text-white/70' : 'text-gray-500'
									}`}>
										<span className="text-xs">
											{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
										</span>
										{isMyMessage && (
											<span className="ml-1 flex items-center">
												{isRead ? (
													<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
														<path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
													</svg>
												) : (
													<svg className="w-3 h-3 opacity-70" fill="currentColor" viewBox="0 0 20 20">
														<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
													</svg>
												)}
											</span>
										)}
										{!isMyMessage && !isRead && (
											<span className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse" title={t('unread')}></span>
										)}
									</div>
								</div>
							</div>
						);
					})
				)}
				<div ref={messagesEndRef} />
			</div>
			<form onSubmit={sendMessage} className="p-4 border-t flex gap-2">
				<input 
					value={message} 
					onChange={(e) => setMessage(e.target.value)} 
					placeholder={messageLimitReached ? t('upgradeToContinuePlaceholder') : t('typeMessage')}
					className="flex-1 border p-2 rounded"
					disabled={messageLimitReached || !canSendMessage}
				/>
				<button 
					type="submit" 
					className="bg-primary text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
					disabled={messageLimitReached || !canSendMessage}
				>
					{t('send')}
				</button>
			</form>
			{showVideo && <VideoCall chatId={chatId} targetUserId={otherUser?._id} onClose={() => setShowVideo(false)} />}
			<PremiumPlansModal 
				open={showPremiumModal} 
				onClose={() => setShowPremiumModal(false)}
				onSubscribe={handlePremiumSubscribe}
			/>
		</div>
	);
}

