import { Link, useNavigate } from 'react-router-dom';
import { useCloseListing, useMyListings } from '../shared/useMyListings.js';
import { useBids, useAcceptBid } from '../shared/useBids.js';
import { useState, useEffect } from 'react';
import { useMyOrders } from '../shared/useOrders.js';
import OrderTimeline from '../shared/OrderTimeline.jsx';
import { useMyKyc } from '../shared/useKyc.js';
import { useLanguage } from '../shared/LanguageContext.jsx';
import api from '../shared/apiClient.js';

export default function FarmerDashboard() {
	const navigate = useNavigate();
	const { data: items, isLoading } = useMyListings();
	const closeMutation = useCloseListing();
	const [openBidsFor, setOpenBidsFor] = useState(null);
	const { data: bids } = useBids(openBidsFor);
	const acceptBidMutation = useAcceptBid();
	const { data: orders } = useMyOrders();
	const { data: kyc } = useMyKyc();
	const { t } = useLanguage();
	const canCreate = kyc?.status === 'approved';
	const [experts, setExperts] = useState([]);
	const [expertsLoading, setExpertsLoading] = useState(true);

	useEffect(() => {
		loadExperts();
	}, []);

	async function loadExperts() {
		try {
			const { data } = await api.get('/api/chat/experts/available');
			setExperts(data);
		} catch (error) {
			console.error('Error loading experts:', error);
		} finally {
			setExpertsLoading(false);
		}
	}

	async function handleChatWithExpert(expertId) {
		try {
			const { data } = await api.post('/api/chat/expert', { expertId });
			navigate(`/chat/${data._id}`);
		} catch (error) {
			console.error('Error creating expert chat:', error);
			alert('Failed to start chat with expert');
		}
	}
	
	const handleConfirmBid = async (bidId) => {
		if (window.confirm(t('confirmAcceptBid') || 'Are you sure you want to confirm this bid? This will create an order.')) {
			try {
				await acceptBidMutation.mutateAsync(bidId);
			} catch (error) {
				console.error('Error confirming bid:', error);
				alert(error.response?.data?.message || t('errorAcceptingBid') || 'Failed to confirm bid');
			}
		}
	};

	const handleBuyer = async (buyerId) => {
		try {
			const { data } = await api.post('/api/chat/create', { userId: buyerId });
			navigate(`/chat/${data._id}`);
		} catch (error) {
			console.error('Error creating chat:', error);
			alert('Failed to start chat');
		}
	};

	// Calculate statistics
	const activeListings = (items || []).filter(l => l.status === 'active').length;
	const totalBids = (bids || []).length;
	const completedOrders = (orders || []).filter(o => o.status === 'delivered' || o.status === 'paid' || o.status === 'shipped').length;
	const pendingBids = (bids || []).filter(b => b.status === 'pending').length;

	return (
		<div className="space-y-6">
			{/* Header with Stats */}
			<div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl p-6 md:p-8 shadow-lg">
				<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
					<div>
						<h1 className="text-3xl md:text-4xl font-bold mb-2">{t('farmerDashboard') || 'Farmer Dashboard'}</h1>
						<p className="text-green-50 text-lg">{t('') || 'Manage your listings, bids, and orders all in one place'}</p>
					</div>
					<div className="flex items-center gap-3">
						<Link to="/experts" className="inline-block bg-white text-green-600 hover:bg-green-50 px-4 py-2 rounded-lg font-semibold transition-colors">
							{t('Chat With Expert') || 'Chat with Expert'}
						</Link>
						{canCreate ? (
							<Link to="/farmer/new" className="inline-block bg-green-800 hover:bg-green-900 text-white px-4 py-2 rounded-lg font-semibold transition-colors shadow-md">
								{t('createListing') || '+ New Listing'}
							</Link>
						) : (
							<>
								<button className="inline-block bg-white/20 text-white px-4 py-2 rounded-lg cursor-not-allowed" disabled>
									{t('createListing') || 'Create Listing'}
								</button>
								<Link to="/farmer/kyc" className="text-white underline text-sm hover:text-green-200">
									{t('kycApprovalRequired') || 'Complete KYC'}
								</Link>
							</>
						)}
					</div>
				</div>
			</div>

			{/* Statistics Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600 mb-1">{t('Active Listings') || 'Active Listings'}</p>
							<p className="text-3xl font-bold text-gray-800">{activeListings}</p>
						</div>
						<div className="bg-blue-100 rounded-full p-3">
							<svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
							</svg>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500 hover:shadow-lg transition-shadow">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600 mb-1">{t('Pending Bids') || 'Pending Bids'}</p>
							<p className="text-3xl font-bold text-gray-800">{pendingBids}</p>
						</div>
						<div className="bg-yellow-100 rounded-full p-3">
							<svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600 mb-1">{t('Completed Orders') || 'Completed Orders'}</p>
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
							<p className="text-sm text-gray-600 mb-1">{t('Total Listings') || 'Total Listings'}</p>
							<p className="text-3xl font-bold text-gray-800">{(items || []).length}</p>
						</div>
						<div className="bg-purple-100 rounded-full p-3">
							<svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
							</svg>
						</div>
					</div>
				</div>
			</div>

			{/* Profile Status Card */}
			<div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className={`rounded-full p-2 ${kyc?.status === 'approved' ? 'bg-green-100' : kyc?.status === 'pending' ? 'bg-yellow-100' : 'bg-gray-100'}`}>
							{kyc?.status === 'approved' ? (
								<svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							) : (
								<svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							)}
						</div>
						<div>
							<p className="font-semibold text-gray-800">{t('kycStatus') || 'Profile Status'}</p>
							<p className="text-sm text-gray-600 capitalize">
								<span className={`font-medium ${kyc?.status === 'approved' ? 'text-green-700' : kyc?.status === 'pending' ? 'text-yellow-700' : 'text-gray-700'}`}>
									{kyc?.status || t('not_submitted') || 'Not Submitted'}
								</span>
							</p>
						</div>
					</div>
					<Link to="/farmer/kyc" className="bg-white hover:bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium transition-colors border border-blue-300">
						{kyc ? (kyc.status === 'approved' ? t('viewProfile') || 'View Profile' : t('updateProfile') || 'Update Profile') : t('completeKyc') || 'Complete Profile'}
					</Link>
				</div>
			</div>

			{/* My Listings Section */}
			<section className="bg-white rounded-xl shadow-md overflow-hidden">
				<div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4">
					<h2 className="text-xl font-bold">{t('My Listings') || 'My Listings'}</h2>
				</div>
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead className="bg-gray-50 text-left">
							<tr>
								<th className="p-4 font-semibold text-gray-700">{t('cropName')}</th>
								<th className="p-4 font-semibold text-gray-700">{t('quantity')}</th>
								<th className="p-4 font-semibold text-gray-700">{t('basePrice')}</th>
								<th className="p-4 font-semibold text-gray-700">{t('status')}</th>
								<th className="p-4 font-semibold text-gray-700">{t('actions')}</th>
							</tr>
						</thead>
						<tbody>
							{isLoading && (
								<tr><td className="p-4 text-center text-gray-600" colSpan={5}>{t('loading') || 'Loading...'}</td></tr>
							)}
							{!isLoading && (items || []).length === 0 && (
								<tr><td className="p-4 text-center text-gray-600" colSpan={5}>{t('noListings') || 'No listings yet. Create your first listing!'}</td></tr>
							)}
							{(items || []).map((l) => (
								<tr key={l._id} className="border-t hover:bg-gray-50 transition-colors">
									<td className="p-4 font-medium">{l.cropName}</td>
									<td className="p-4">{l.quantityKg} kg</td>
									<td className="p-4">₹{l.basePricePerKg}/kg</td>
									<td className="p-4">
										<span className={`px-3 py-1 rounded-full text-xs font-medium ${
											l.status === 'active' ? 'bg-green-100 text-green-800' :
											l.status === 'sold' ? 'bg-blue-100 text-blue-800' :
											l.status === 'closed' ? 'bg-gray-100 text-gray-800' :
											'bg-yellow-100 text-yellow-800'
										}`}>
											{t(l.status || 'active')}
										</span>
									</td>
									<td className="p-4">
										<div className="flex items-center gap-2">
											<Link className="text-blue-600 hover:text-blue-800 hover:underline font-medium" to={`/listing/${l._id}`}>{t('view')}</Link>
											<button className="text-green-600 hover:text-green-800 hover:underline font-medium" onClick={() => setOpenBidsFor(openBidsFor === l._id ? null : l._id)}>
												{openBidsFor === l._id ? t('hideBids') : t('viewBids')}
											</button>
											{l.status !== 'closed' && (
												<button className="text-red-600 hover:text-red-800 hover:underline font-medium" onClick={() => closeMutation.mutate(l._id)} disabled={closeMutation.isPending}>
													{t('close') || 'Close'}
												</button>
											)}
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</section>

			{/* Bids Section */}
			{openBidsFor && (
				<section className="bg-white rounded-xl shadow-md overflow-hidden">
					<div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4">
						<h2 className="text-xl font-bold">{t('bidsForListing') || 'Bids for Listing'}</h2>
					</div>
					<div className="divide-y">
						{(bids || []).length === 0 && (
							<div className="p-6 text-center text-gray-600">{t('noBidsYet') || 'No bids yet.'}</div>
						)}
						{(bids || []).map((b) => (
							<div key={b._id} className="p-6 hover:bg-gray-50 transition-colors">
								<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
									<div className="flex-1 space-y-2">
										<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
											<div className="bg-blue-50 rounded-lg p-3">
												<p className="text-xs text-gray-600 mb-1">{t('price') || 'Price'}</p>
												<p className="font-bold text-blue-700">₹{b.pricePerKg}/kg</p>
											</div>
											<div className="bg-green-50 rounded-lg p-3">
												<p className="text-xs text-gray-600 mb-1">{t('quantity')}</p>
												<p className="font-bold text-green-700">{b.quantityKg} kg</p>
											</div>
											<div className="bg-purple-50 rounded-lg p-3">
												<p className="text-xs text-gray-600 mb-1">{t('total') || 'Total'}</p>
												<p className="font-bold text-purple-700">₹{b.pricePerKg * b.quantityKg}</p>
											</div>
											<div className="bg-gray-50 rounded-lg p-3">
												<p className="text-xs text-gray-600 mb-1">{t('date') || 'Date'}</p>
												<p className="text-xs font-medium text-gray-700">{new Date(b.createdAt).toLocaleDateString()}</p>
											</div>
										</div>
										{b.buyerId && (
											<div className="flex items-center gap-2 text-sm">
												<svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
												</svg>
												<span className="text-gray-700 font-medium">{t('buyer') || 'Buyer'}:</span>
												<span className="text-gray-600">{typeof b.buyerId === 'object' ? b.buyerId.name : 'Unknown'}</span>
											</div>
										)}
										<div>
											<span className={`px-3 py-1 rounded-full text-xs font-medium ${
												b.status === 'accepted' ? 'bg-green-100 text-green-800' :
												b.status === 'rejected' ? 'bg-red-100 text-red-800' :
												'bg-yellow-100 text-yellow-800'
											}`}>
												{t(b.status || 'pending')}
											</span>
										</div>
									</div>
									<div className="flex items-center gap-2">
										{b.buyerId && (
											<button
												onClick={() => handleBuyer(typeof b.buyerId === 'object' ? b.buyerId._id : b.buyerId)}
												className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
											>
												{t('chat') || 'Chat'}
											</button>
										)}
										{b.status === 'pending' && (
											<button
												onClick={() => handleConfirmBid(b._id)}
												disabled={acceptBidMutation.isPending}
												className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
											>
												{acceptBidMutation.isPending ? t('processing') || 'Processing...' : t('confirmBid') || 'Confirm Bid'}
											</button>
										)}
									</div>
								</div>
							</div>
						))}
					</div>
				</section>
			)}

			{/* Available Experts Section */}
			<section className="bg-white rounded-xl shadow-md overflow-hidden">
				<div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between">
					<h2 className="text-xl font-bold">{t('Available Experts') || 'Available Experts'}</h2>
					<Link to="/experts" className="text-sm text-white hover:text-indigo-200 underline">
						{t('View All') || 'View All'}
					</Link>
				</div>
				<div className="divide-y">
					{expertsLoading ? (
						<div className="p-6 text-center text-gray-600">{t('loading') || 'Loading...'}</div>
					) : experts.length === 0 ? (
						<div className="p-6 text-center text-gray-600">{t('noExperts') || 'No experts available at the moment'}</div>
					) : (
						experts.slice(0, 5).map((expert) => (
							<div key={expert._id} className="p-6 hover:bg-gray-50 transition-colors">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-4">
										<div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-white flex items-center justify-center text-xl font-bold shadow-md">
											{expert.name?.charAt(0)?.toUpperCase() || '👨‍🔬'}
										</div>
										<div>
											<div className="flex items-center gap-2 mb-1">
												<div className="font-semibold text-gray-800">{expert.name}</div>
												{expert.isAvailable && (
													<span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
														✓ {t('available') || 'Available'}
													</span>
												)}
											</div>
											<div className="text-sm text-gray-600">{expert.email}</div>
											{expert.phone && (
												<div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
													<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
													</svg>
													{expert.phone}
												</div>
											)}
										</div>
									</div>
									<button
										onClick={() => handleChatWithExpert(expert._id)}
										className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg"
									>
										{t('Chat Now') || 'Chat Now'}
									</button>
								</div>
							</div>
						))
					)}
				</div>
				{experts.length > 5 && (
					<div className="text-center p-4 bg-gray-50">
						<Link to="/experts" className="text-indigo-600 hover:text-indigo-800 hover:underline text-sm font-medium">
							{t('viewMoreExperts') || `View ${experts.length - 5} more experts →`}
						</Link>
					</div>
				)}
			</section>

			{/* Buy Now Orders Pending Acceptance */}
			{(orders || []).filter(o => o.orderType === 'buy_now' && o.status === 'advance_paid' && !o.farmerAccepted).length > 0 && (
				<section className="bg-white rounded-xl shadow-md overflow-hidden">
					<div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white px-6 py-4">
						<h2 className="text-xl font-bold">{t('buyNowOrdersPending') || 'Buy Now Orders - Pending Acceptance'}</h2>
					</div>
					<div className="divide-y">
						{(orders || []).filter(o => o.orderType === 'buy_now' && o.status === 'advance_paid' && !o.farmerAccepted).map((o) => {
							const buyer = typeof o.buyerId === 'object' ? o.buyerId : null;
							const listing = typeof o.listingId === 'object' ? o.listingId : null;
							return (
								<div key={o._id} className="p-6 hover:bg-gray-50 transition-colors">
									<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
										<div className="flex-1 space-y-3">
											<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
												<div className="bg-blue-50 rounded-lg p-3">
													<p className="text-xs text-gray-600 mb-1">{t('cropName') || 'Crop'}</p>
													<p className="font-bold text-blue-700">{listing?.cropName || 'N/A'}</p>
												</div>
												<div className="bg-green-50 rounded-lg p-3">
													<p className="text-xs text-gray-600 mb-1">{t('quantity')}</p>
													<p className="font-bold text-green-700">{o.quantityKg} kg</p>
												</div>
												<div className="bg-purple-50 rounded-lg p-3">
													<p className="text-xs text-gray-600 mb-1">{t('advancePayment') || 'Advance Paid'}</p>
													<p className="font-bold text-purple-700">₹{o.advancePayment || 0}</p>
												</div>
												<div className="bg-yellow-50 rounded-lg p-3">
													<p className="text-xs text-gray-600 mb-1">{t('totalAmount') || 'Total Amount'}</p>
													<p className="font-bold text-yellow-700">₹{o.amount}</p>
												</div>
											</div>
											{buyer && (
												<div className="text-sm text-gray-600">
													<span>{t('buyer') || 'Buyer'}: {buyer.name} ({buyer.email})</span>
												</div>
											)}
										</div>
										<div className="flex items-center gap-2">
											<button
												onClick={async () => {
													if (window.confirm(t('confirmAcceptBuyNow') || 'Accept this Buy Now order? This will mark the listing as sold.')) {
														try {
															await api.post(`/api/orders/${o._id}/accept-buy-now`);
															window.location.reload();
														} catch (error) {
															alert(error.response?.data?.message || t('errorAcceptingOrder') || 'Failed to accept order');
														}
													}
												}}
												className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
											>
												{t('accept') || 'Accept'}
											</button>
											<button
												onClick={async () => {
													if (window.confirm(t('confirmRejectBuyNow') || 'Reject this Buy Now order? The advance payment will be refunded.')) {
														try {
															await api.post(`/api/orders/${o._id}/reject-buy-now`);
															window.location.reload();
														} catch (error) {
															alert(error.response?.data?.message || t('errorRejectingOrder') || 'Failed to reject order');
														}
													}
												}}
												className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
											>
												{t('reject') || 'Reject'}
											</button>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</section>
			)}

			{/* Order Completed Section */}
			<section className="bg-white rounded-xl shadow-md overflow-hidden">
				<div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4">
					<h2 className="text-xl font-bold">{t('Order Completed') || 'Order Completed'}</h2>
				</div>
				<div className="divide-y">
					{(orders || []).filter(o => o.status === 'delivered' || o.status === 'paid' || o.status === 'shipped').length === 0 && 
						<div className="p-6 text-center text-gray-600">{t('noCompletedOrders') || 'No completed orders yet'}</div>
					}
					{(orders || []).filter(o => o.status === 'delivered' || o.status === 'paid' || o.status === 'shipped').map((o) => (
						<div key={o._id} className="p-6 hover:bg-gray-50 transition-colors">
							<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
									<div className="bg-blue-50 rounded-lg p-3">
										<p className="text-xs text-gray-600 mb-1">{t('price')}</p>
										<p className="font-bold text-blue-700">₹{o.pricePerKg}/kg × {o.quantityKg} kg</p>
									</div>
									<div className="bg-green-50 rounded-lg p-3">
										<p className="text-xs text-gray-600 mb-1">{t('amount')}</p>
										<p className="font-bold text-green-700">₹{o.amount}</p>
									</div>
									<div className="bg-purple-50 rounded-lg p-3">
										<p className="text-xs text-gray-600 mb-1">{t('status')}</p>
										<p className="font-bold text-purple-700 capitalize">{t(o.status)}</p>
									</div>
									<div className="bg-gray-50 rounded-lg p-3">
										<p className="text-xs text-gray-600 mb-1">{t('date')}</p>
										<p className="text-xs font-medium text-gray-700">{new Date(o.createdAt).toLocaleDateString()}</p>
									</div>
								</div>
								{o.buyerId && (
									<div className="text-sm text-gray-600 flex items-center gap-2">
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
										</svg>
										<span>{t('buyer') || 'Buyer'}: {typeof o.buyerId === 'object' ? o.buyerId.name : 'Unknown'}</span>
									</div>
								)}
							</div>
						</div>
					))}
				</div>
			</section>
		</div>
	);
}
