import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../shared/useSocket.js';
import api from '../shared/apiClient.js';
import { useBids, usePlaceBid } from '../shared/useBids.js';
import { useAddToWatchlist, useRemoveFromWatchlist, useWatchlist } from '../shared/useWatchlist.js';
import { useLanguage } from '../shared/LanguageContext.jsx';
import { useCart } from '../shared/CartContext.jsx';
import ImageSlider from '../shared/ImageSlider.jsx';

function BidModal({ open, onClose, onSubmit, listing, bids, error }) {
	const { t } = useLanguage();
	const [pricePerKg, setPricePerKg] = useState('');
	const [quantityKg, setQuantityKg] = useState('');
	
	// Calculate minimum bid price
	const highestBid = bids && bids.length > 0 
		? Math.max(...bids.filter(b => b.status === 'pending').map(b => b.pricePerKg))
		: null;
	
	const basePrice = listing?.basePricePerKg || 0;
	const minBidPrice = highestBid ? highestBid + 1 : basePrice + 1;
	
	useEffect(() => {
		if (open) {
			setPricePerKg('');
			setQuantityKg('');
		}
	}, [open]);
	
	if (!open) return null;
	
	return (
		<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
			<div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
				<h3 className="text-xl font-bold mb-4">{t('placeABid')}</h3>
				
				{/* Minimum Bid Info */}
				<div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
					<p className="text-sm text-blue-800 font-medium">
						{highestBid ? (
							<>
								{t('currentHighestBid') || 'Current Highest Bid'}: <span className="font-bold">₹{highestBid}/kg</span>
								<br />
								{t('minimumBidRequired') || 'Minimum Bid Required'}: <span className="font-bold text-green-700">₹{minBidPrice}/kg</span>
							</>
						) : (
							<>
								{t('basePrice')}: <span className="font-bold">₹{basePrice}/kg</span>
								<br />
								{t('minimumBidRequired') || 'Minimum Bid Required'}: <span className="font-bold text-green-700">₹{minBidPrice}/kg</span>
							</>
						)}
					</p>
				</div>
				
				{error && (
					<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
						<p className="text-sm">{error}</p>
					</div>
				)}
				
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							{t('price')} ({t('minimumBidRequired') || 'Min'}: ₹{minBidPrice}/kg)
						</label>
						<input 
							className="border w-full p-3 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" 
							type="number"
							placeholder={`₹${minBidPrice}/kg`}
							value={pricePerKg} 
							onChange={(e) => setPricePerKg(e.target.value)} 
							min={minBidPrice}
							step="0.01"
						/>
					</div>
					
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							{t('quantity')} (Max: {listing?.quantityKg || 0} kg)
						</label>
						<input 
							className="border w-full p-3 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" 
							type="number"
							placeholder={t('quantity')}
							value={quantityKg} 
							onChange={(e) => setQuantityKg(e.target.value)}
							max={listing?.quantityKg || 0}
							min="1"
						/>
					</div>
					
					{pricePerKg && Number(pricePerKg) < minBidPrice && (
						<p className="text-sm text-red-600">
							{t('bidTooLow') || `Bid must be at least ₹${minBidPrice}/kg`}
						</p>
					)}
					
					<div className="flex justify-end gap-3 pt-2">
						<button 
							className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors" 
							onClick={onClose}
						>
							{t('cancel')}
						</button>
						<button 
							className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
							onClick={() => onSubmit({ pricePerKg, quantityKg })}
							disabled={!pricePerKg || !quantityKg || Number(pricePerKg) < minBidPrice}
						>
							{t('placeBid')}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default function ListingDetail() {
	const { t } = useLanguage();
	const { id } = useParams();
	const { addToCart } = useCart();
	const [listing, setListing] = useState(null);
	const [open, setOpen] = useState(false);
	const [bidError, setBidError] = useState('');
	const socketRef = useSocket();
	const navigate = useNavigate();
	const { data: bids } = useBids(id);
	const placeBidMutation = usePlaceBid(id);
	const { data: watchlist } = useWatchlist();
	const addWatch = useAddToWatchlist();
	const removeWatch = useRemoveFromWatchlist();
	const isWatched = useMemo(() => (watchlist || []).some((w) => w.listingId === id), [watchlist, id]);
	
	// Sort bids by price (highest first)
	const sortedBids = useMemo(() => {
		if (!bids || bids.length === 0) return [];
		return [...bids].sort((a, b) => b.pricePerKg - a.pricePerKg);
	}, [bids]);

	useEffect(() => {
		(async () => {
			const { data } = await api.get(`/api/listings/${id}`);
			setListing(data);
		})();
	}, [id]);

	useEffect(() => {
		const s = socketRef.current;
		if (!s) return;
		s.emit('join_listing', id);
		s.on('bid:updated', () => {
			// socket event received; React Query bids list will refresh on demand
		});
		return () => {
			s.off('bid:updated');
		};
	}, [id, socketRef]);

	async function placeBid(values) {
		try {
			setBidError('');
			await placeBidMutation.mutateAsync(values);
			setOpen(false);
			setBidError('');
		} catch (e) {
			const errorMessage = e.response?.data?.message || t('failedToPlaceBid') || 'Failed to place bid';
			setBidError(errorMessage);
		}
	}

	async function buyNow() {
		try {
			// Create buy_now order
			const { data } = await api.post('/api/orders', { 
				listingId: id, 
				pricePerKg: listing.instantBuyPricePerKg || listing.basePricePerKg, 
				quantityKg: listing.quantityKg,
				orderType: 'buy_now'
			});
			
			// Add to cart
			const added = addToCart(data);
			if (added) {
				alert(t('buyNowAddedToCart') || 'Buy Now order added to cart! Farmer has been notified. You can proceed to checkout from your cart.');
			} else {
				alert(t('alreadyInCart') || 'Order already in cart');
			}
		} catch (e) {
			alert(e.response?.data?.message || t('failedToCreateOrder') || 'Failed to create order');
		}
	}

	function toggleWatch() {
		if (isWatched) removeWatch.mutate(id);
		else addWatch.mutate(id);
	}

	if (!listing) return <div className="text-gray-600">{t('loading')}</div>;

	// Process images - Cloudinary URLs should already be full URLs, but handle local URLs too
	const processedImages = (listing.images || [])
		.map((img) => {
			if (!img) return null;
			// If it's already a full URL (Cloudinary), return it
			if (img.startsWith('http')) return img;
			// Otherwise, prepend API_URL for local uploads
			return `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${img.startsWith('/') ? '' : '/'}${img}`;
		})
		.filter((img) => img !== null);

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-semibold">{listing.cropName}</h1>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="md:col-span-2 border rounded overflow-hidden">
					<ImageSlider images={processedImages} alt={listing.cropName} />
				</div>
				<div className="border rounded p-4 space-y-2">
					<p><span className="text-gray-600">{t('location')}:</span> {listing.location || '—'}</p>
					<p><span className="text-gray-600">{t('grade')}:</span> {listing.grade || '—'}</p>
					<p><span className="text-gray-600">{t('quantity')}:</span> {listing.quantityKg} kg</p>
					<p><span className="text-gray-600">{t('basePrice')}:</span> ₹{listing.basePricePerKg}/kg</p>
					{listing.allowInstantBuy && (
						<p><span className="text-gray-600">{t('buyNowPrice')}:</span> ₹{listing.instantBuyPricePerKg || listing.basePricePerKg}/kg</p>
					)}
					<div className="flex flex-wrap gap-2 pt-2">
						<button className="bg-primary text-white px-4 py-2 rounded" onClick={() => setOpen(true)}>{t('placeBid')}</button>
						{listing.allowInstantBuy && (
							<button className="border px-4 py-2 rounded" onClick={buyNow}>{t('buyNow')}</button>
						)}
						<button className="border px-4 py-2 rounded" onClick={toggleWatch}>{isWatched ? t('unwatch') : t('watch')}</button>
					</div>
				</div>
			</div>
			<section>
				<h2 className="font-semibold mb-2">{t('biddingHistory')}</h2>
				<div className="border rounded divide-y">
					{(sortedBids || []).length === 0 && <div className="p-3 text-gray-600">{t('noBidsYet')}</div>}
					{(sortedBids || []).map((b, index) => (
						<div key={b._id} className={`p-4 flex justify-between items-center ${index === 0 && b.status === 'pending' ? 'bg-yellow-50 border-l-4 border-yellow-500' : ''}`}>
							<div className="flex-1">
								<div className="flex items-center gap-3">
									<span className="font-bold text-lg">₹{b.pricePerKg}/kg</span>
									{index === 0 && b.status === 'pending' && (
										<span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full text-xs font-medium">
											{t('highestBid') || 'Highest Bid'}
										</span>
									)}
									<span className={`px-2 py-1 rounded-full text-xs font-medium ${
										b.status === 'accepted' ? 'bg-green-100 text-green-800' :
										b.status === 'rejected' ? 'bg-red-100 text-red-800' :
										'bg-gray-100 text-gray-800'
									}`}>
										{t(b.status || 'pending')}
									</span>
								</div>
								<div className="text-sm text-gray-600 mt-1">
									<span>{b.quantityKg} kg</span>
									<span className="mx-2">•</span>
									<span>{new Date(b.createdAt).toLocaleString()}</span>
									{b.buyerId && typeof b.buyerId === 'object' && (
										<>
											<span className="mx-2">•</span>
											<span>{b.buyerId.name}</span>
										</>
									)}
								</div>
							</div>
						</div>
					))}
				</div>
			</section>
			<BidModal 
				open={open} 
				onClose={() => {
					setOpen(false);
					setBidError('');
				}} 
				onSubmit={placeBid}
				listing={listing}
				bids={bids}
				error={bidError}
			/>
		</div>
	);
}
