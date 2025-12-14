import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../shared/apiClient.js';
import { useLanguage } from '../shared/LanguageContext.jsx';

export default function ChatList() {
	const { t } = useLanguage();
	const [chats, setChats] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const navigate = useNavigate();

	useEffect(() => {
		loadChats();
	}, []);

	async function loadChats() {
		try {
			setIsLoading(true);
			setError(null);
			const { data } = await api.get('/api/chat/mine');
			setChats(data || []);
		} catch (err) {
			console.error('Error loading chats:', err);
			setChats([]);
			// Set error only for non-connection errors
			if (err.code === 'ERR_NETWORK' || err.code === 'ERR_CONNECTION_REFUSED') {
				setError('Connection error. Please check if the server is running.');
			} else {
				setError(err.response?.data?.message || 'Failed to load chats. Please try again.');
			}
		} finally {
			setIsLoading(false);
		}
	}

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="text-center">
					<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-4"></div>
					<div className="text-gray-600">{t('loadingChats')}</div>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<h1 className="text-2xl font-semibold">{t('chats')}</h1>
			{error && (
				<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
					<p className="font-semibold">{t('errorLoadingChats')}</p>
					<p className="text-sm">{error}</p>
					<button 
						onClick={loadChats} 
						className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
					>
						{t('retry')}
					</button>
				</div>
			)}
			<div className="space-y-2">
				{!error && chats.length === 0 && (
					<div className="bg-gray-50 rounded-lg p-8 text-center">
						<svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
						</svg>
						<p className="text-gray-600">{t('noChats')}</p>
					</div>
				)}
				{chats.map((chat) => {
					const otherParticipant = chat.participants?.find((p) => 
						p._id?.toString() !== chat.participants?.[0]?._id?.toString() || 
						(chat.participants?.length > 1 && p._id !== chat.participants?.[0]?._id)
					) || chat.participants?.find((p, i) => i > 0) || chat.participants?.[0];
					const unreadCount = chat.unreadCount || 0;
					
					return (
						<div 
							key={chat._id} 
							onClick={() => navigate(`/chat/${chat._id}`)} 
							className={`border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
								unreadCount > 0 ? 'bg-blue-50 border-blue-200' : ''
							}`}
						>
							<div className="flex items-start justify-between gap-3">
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2 mb-1">
										<div className="font-semibold text-gray-900 truncate">
											{chat.type === 'expert' ? '👨‍🔬 ' : ''}
											{otherParticipant?.name || t('unknown')}
										</div>
										{unreadCount > 0 && (
											<span className="flex-shrink-0 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
												{unreadCount}
											</span>
										)}
									</div>
									<div className="text-sm text-gray-600 truncate">{chat.lastMessage || t('noMessagesYetShort')}</div>
								</div>
								<div className="flex flex-col items-end gap-1 flex-shrink-0">
									<div className="text-xs text-gray-500 whitespace-nowrap">
										{chat.lastMessageAt ? new Date(chat.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
									</div>
									{unreadCount === 0 && chat.lastMessageAt && (
										<div className="w-2 h-2 bg-green-500 rounded-full" title={t('allRead')}></div>
									)}
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

