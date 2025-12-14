import { useMyBids } from '../shared/useMyBids.js';
import { useMyOrders } from '../shared/useOrders.js';
import { useWatchlist } from '../shared/useWatchlist.js';
import { useLanguage } from '../shared/LanguageContext.jsx';
import { useCart } from '../shared/CartContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import api from '../shared/apiClient.js';

export default function BuyerDashboard() {
	const { t } = useLanguage();
	const navigate = useNavigate();
	const { addToCart } = useCart();
	const { data: bids, isLoading: bidsLoading } = useMyBids();
	const { data: orders, isLoading: ordersLoading } = useMyOrders();
	const { data: watchlist, isLoading: watchLoading } = useWatchlist();

	async function handleChatWithFarmer(farmerId) {
		try {
			const { data } = await api.post('/api/chat/create', { userId: farmerId });
			navigate(`/chat/${data._id}`);
		} catch (error) {
			console.error('Error creating chat:', error);
			alert('Failed to start chat with farmer');
		}
	}

	// Calculate statistics
	const activeBids = (bids || []).filter(b => b.status === 'pending').length;
	const totalBids = (bids || []).length;
	const completedOrders = (orders || []).filter(o => o.status === 'delivered' || o.status === 'paid' || o.status === 'shipped').length;
	const watchlistCount = (watchlist || []).length;

	return (
		<div className="space-y-6">
			{/* Header with Stats */}
			<div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl p-6 md:p-8 shadow-lg">
				<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
					<div>
						<h1 className="text-3xl md:text-4xl font-bold mb-2">{t('buyerDashboard')}</h1>
						<p className="text-green-50 text-lg">{t('buyerDashboardDesc') || 'Manage your bids, orders, and watchlist all in one place'}</p>
					</div>
					<Link to="/market" className="inline-block bg-white text-green-600 hover:bg-green-50 px-4 py-2 rounded-lg font-semibold transition-colors">
						{t('browseMarketplace') || 'Browse Marketplace'}
					</Link>
				</div>
			</div>

			{/* Statistics Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500 hover:shadow-lg transition-shadow">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600 mb-1">{t('activeBids')}</p>
							<p className="text-3xl font-bold text-gray-800">{activeBids}</p>
						</div>
						<div className="bg-yellow-100 rounded-full p-3">
							<svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
							</svg>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600 mb-1">{t('totalBids') || 'Total Bids'}</p>
							<p className="text-3xl font-bold text-gray-800">{totalBids}</p>
						</div>
						<div className="bg-blue-100 rounded-full p-3">
							<svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600 mb-1">{t('completedOrders') || 'Completed Orders'}</p>
							<p className="text-3xl font-bold text-gray-800">{completedOrders}</p>
						</div>
						<div className="bg-green-100 rounded-full p-3">
							<svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600 mb-1">{t('watchlist')}</p>
							<p className="text-3xl font-bold text-gray-800">{watchlistCount}</p>
						</div>
						<div className="bg-purple-100 rounded-full p-3">
							<svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
							</svg>
						</div>
					</div>
				</div>
			</div>
			{/* Watchlist Section */}
			<section className="bg-white rounded-xl shadow-md overflow-hidden">
				<div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-4">
					<h2 className="text-xl font-bold">{t('watchlist')}</h2>
				</div>
				<div className="divide-y">
					{watchLoading && <div className="p-6 text-center text-gray-600">{t('loading')}</div>}
					{!watchLoading && (watchlist || []).length === 0 && (
						<div className="p-6 text-center text-gray-600">
							<svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
							</svg>
							<p className="text-gray-600 mb-4">{t('noWatchlistItems') || 'No items in your watchlist yet'}</p>
							<Link to="/market" className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
								{t('browseMarketplace') || 'Browse Marketplace'}
							</Link>
						</div>
					)}
					{(watchlist || []).map((w) => (
						<div key={w._id} className="p-6 hover:bg-gray-50 transition-colors">
							<div className="flex items-center justify-between">
								<div className="flex-1">
									<p className="font-semibold text-gray-800">
										{typeof w.listingId === 'object' ? w.listingId.cropName : w.listingId || 'Unknown Listing'}
									</p>
									<p className="text-sm text-gray-600 mt-1">
										{t('addedOn') || 'Added on'} {new Date(w.createdAt).toLocaleDateString()}
									</p>
								</div>
								{typeof w.listingId === 'object' && w.listingId._id && (
									<Link 
										to={`/listing/${w.listingId._id}`}
										className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
									>
										{t('view') || 'View'}
									</Link>
								)}
							</div>
						</div>
					))}
				</div>
			</section>
			{/* Active Bids Section */}
			<section className="bg-white rounded-xl shadow-md overflow-hidden">
				<div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-4">
					<h2 className="text-xl font-bold">{t('activeBids')}</h2>
				</div>
				<div className="divide-y">
					{bidsLoading && <div className="p-6 text-center text-gray-600">{t('loading')}</div>}
					{!bidsLoading && ((bids || []).filter(b => b.status === 'pending').length === 0) && (
						<div className="p-6 text-center text-gray-600">
							<svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
							</svg>
							<p className="text-gray-600">{t('noActiveBids')}</p>
						</div>
					)}
					{(bids || []).filter(b => b.status === 'pending').map((b) => {
						const listing = typeof b.listingId === 'object' ? b.listingId : null;
						const farmer = listing && typeof listing.ownerId === 'object' ? listing.ownerId : null;
						const farmerId = farmer ? farmer._id : (listing?.ownerId || null);
						
						return (
							<div key={b._id} className="p-6 hover:bg-gray-50 transition-colors">
								<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
									<div className="flex-1 space-y-3">
										<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
											<div className="bg-blue-50 rounded-lg p-3">
												<p className="text-xs text-gray-600 mb-1">{t('cropName') || 'Crop'}</p>
												<p className="font-bold text-blue-700">
													{listing?.cropName || 'N/A'}
												</p>
											</div>
											<div className="bg-green-50 rounded-lg p-3">
												<p className="text-xs text-gray-600 mb-1">{t('price') || 'Price'}</p>
												<p className="font-bold text-green-700">₹{b.pricePerKg}/kg</p>
											</div>
											<div className="bg-purple-50 rounded-lg p-3">
												<p className="text-xs text-gray-600 mb-1">{t('quantity') || 'Quantity'}</p>
												<p className="font-bold text-purple-700">{b.quantityKg} kg</p>
											</div>
											<div className="bg-gray-50 rounded-lg p-3">
												<p className="text-xs text-gray-600 mb-1">{t('total') || 'Total'}</p>
												<p className="font-bold text-gray-700">₹{b.pricePerKg * b.quantityKg}</p>
											</div>
										</div>
										<div className="flex items-center gap-4">
											<div className="flex items-center gap-2 text-sm">
												<svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
												</svg>
												<span className="text-gray-600">{new Date(b.createdAt).toLocaleDateString()}</span>
											</div>
											<span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
												{t('pending')}
											</span>
										</div>
									</div>
									{farmerId && (
										<button
											onClick={() => handleChatWithFarmer(farmerId)}
											className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
										>
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
											</svg>
											{t('chat') || 'Chat'}
										</button>
									)}
								</div>
							</div>
						);
					})}
				</div>
			</section>
			{/* Order History Section */}
			<section className="bg-white rounded-xl shadow-md overflow-hidden">
				<div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4">
					<h2 className="text-xl font-bold">{t('orderHistory') || 'Order History'}</h2>
				</div>
				<div className="divide-y">
					{ordersLoading && <div className="p-6 text-center text-gray-600">{t('loading')}</div>}
					{!ordersLoading && (orders || []).filter(o => o.status !== 'pending').length === 0 && (
						<div className="p-6 text-center text-gray-600">
							<svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
							</svg>
							<p className="text-gray-600 mb-2">{t('noOrderHistory') || 'No order history yet. Orders appear here when farmers confirm your bids.'}</p>
							<p className="text-sm text-gray-500">{t('startBidding') || 'Start bidding on listings to see your orders here!'}</p>
						</div>
					)}
					{(orders || []).filter(o => o.status !== 'pending').map((o) => (
						<div key={o._id} className="p-6 hover:bg-gray-50 transition-colors">
							<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
								<div className="flex-1 space-y-3">
									<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
										<div className="bg-blue-50 rounded-lg p-3">
											<p className="text-xs text-gray-600 mb-1">{t('cropName') || 'Crop'}</p>
											<p className="font-bold text-blue-700">
												{typeof o.listingId === 'object' && o.listingId?.cropName ? o.listingId.cropName : 'N/A'}
											</p>
										</div>
										<div className="bg-green-50 rounded-lg p-3">
											<p className="text-xs text-gray-600 mb-1">{t('price') || 'Price'}</p>
											<p className="font-bold text-green-700">₹{o.pricePerKg}/kg × {o.quantityKg} kg</p>
										</div>
										<div className="bg-purple-50 rounded-lg p-3">
											<p className="text-xs text-gray-600 mb-1">{t('amount') || 'Amount'}</p>
											<p className="font-bold text-purple-700">₹{o.amount}</p>
										</div>
										<div className="bg-gray-50 rounded-lg p-3">
											<p className="text-xs text-gray-600 mb-1">{t('date') || 'Date'}</p>
											<p className="text-xs font-medium text-gray-700">{new Date(o.createdAt).toLocaleDateString()}</p>
										</div>
									</div>
									<div className="flex items-center gap-3">
										<span className={`px-3 py-1 rounded-full text-xs font-medium ${
											o.status === 'delivered' ? 'bg-green-100 text-green-800' :
											o.status === 'paid' ? 'bg-blue-100 text-blue-800' :
											o.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
											o.status === 'confirmed' ? 'bg-yellow-100 text-yellow-800' :
											o.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
											'bg-gray-100 text-gray-800'
										}`}>
											{t(o.status)}
										</span>
										{o.farmerId && (
											<div className="flex items-center gap-2 text-sm text-gray-600">
												<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
												</svg>
												<span>{t('farmer') || 'Farmer'}: {typeof o.farmerId === 'object' ? o.farmerId.name : 'Unknown'}</span>
											</div>
										)}
									</div>
								</div>
								<div className="flex items-center gap-2">
									{o.farmerId && (
										<button
											onClick={() => handleChatWithFarmer(typeof o.farmerId === 'object' ? o.farmerId._id : o.farmerId)}
											className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
										>
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
											</svg>
											{t('chat') || 'Chat'}
										</button>
									)}
									{o.status === 'confirmed' && (
										<>
											<button
												onClick={() => {
													const added = addToCart(o);
													if (added) {
														alert(t('addedToCart') || 'Order added to cart!');
													} else {
														alert(t('alreadyInCart') || 'Order already in cart');
													}
												}}
												className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
											>
												<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
												</svg>
												{t('addToCart') || 'Add to Cart'}
											</button>
											<button
												onClick={() => navigate(`/checkout?orderId=${o._id}`)}
												className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
											>
												<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
												</svg>
												{t('payNow') || 'Pay Now'}
											</button>
										</>
									)}
								</div>
							</div>
						</div>
					))}
				</div>
			</section>
		</div>
	);
}
