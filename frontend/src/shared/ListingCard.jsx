import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from './LanguageContext.jsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function ListingCard({ listing }) {
	const { t } = useLanguage();
	const [imageError, setImageError] = useState(false);
	const [imageLoaded, setImageLoaded] = useState(false);
	
	const firstImage = listing.images?.[0];
	// Handle both Cloudinary URLs (full URLs) and local upload paths
	// Match the logic used in ListingDetail.jsx
	let imageUrl = null;
	if (firstImage) {
		if (firstImage.startsWith('http')) {
			imageUrl = firstImage;
		} else {
			// Prepend API_URL for local uploads - same logic as ListingDetail
			imageUrl = `${API_URL}${firstImage.startsWith('/') ? '' : '/'}${firstImage}`;
		}
	}
	
	// Debug logging (remove in production if needed)
	useEffect(() => {
		if (firstImage && !imageLoaded && !imageError) {
			// Only log when image is trying to load
			console.debug('ListingCard: Loading image', { listingId: listing._id, imageUrl });
		}
	}, [listing._id, imageUrl, imageLoaded, imageError, firstImage]);
	
	const hasImage = imageUrl && !imageError;
	
	return (
		<Link to={`/listing/${listing._id}`} className="border rounded overflow-hidden hover:shadow-lg transition-shadow bg-white">
			{/* Image Container - Always same height for consistency */}
			<div className="relative h-36 w-full bg-gray-200 overflow-hidden">
				{hasImage ? (
					<>
						<img 
							src={imageUrl} 
							alt={listing.cropName || 'Crop'} 
							className={`h-36 w-full object-cover transition-opacity ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
							loading="lazy"
							onLoad={() => setImageLoaded(true)}
							onError={(e) => {
								console.error('Image load error:', imageUrl, e);
								setImageError(true);
								setImageLoaded(false);
							}}
						/>
						{!imageLoaded && (
							<div className="absolute inset-0 flex items-center justify-center bg-gray-200">
								<svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
								</svg>
							</div>
						)}
					</>
			) : (
					<div className="h-full w-full flex items-center justify-center bg-gray-200">
						<svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
						</svg>
					</div>
				)}
			</div>
			{/* Card Content - Always consistent */}
			<div className="p-3 space-y-1">
				<div className="flex items-center justify-between">
					<h3 className="font-semibold truncate flex-1">{listing.cropName || t('cropName')}</h3>
					<span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-800 ml-2 flex-shrink-0">{listing.grade || 'A'}</span>
				</div>
				<p className="text-sm text-gray-600 truncate">{listing.location || t('location')}</p>
				<p className="text-sm">{t('lot')}: {listing.quantityKg || '—'} kg</p>
				<p className="text-sm font-medium">{t('start')}: ₹{listing.basePricePerKg || '—'}/kg</p>
				<p className="text-xs text-gray-500">{t('timeLeft')}: {listing.timeLeft || '—'}</p>
			</div>
		</Link>
	);
}


