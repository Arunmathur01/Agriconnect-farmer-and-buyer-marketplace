import { useState, useEffect } from 'react';

export default function ImageSlider({ images, alt = 'Image' }) {
	const [currentIndex, setCurrentIndex] = useState(0);

	useEffect(() => {
		if (images && images.length > 0) {
			setCurrentIndex(0);
		}
	}, [images]);

	if (!images || images.length === 0) {
		return (
			<div className="relative w-full h-80 bg-gray-100 rounded flex items-center justify-center">
				<span className="text-gray-400">No images available</span>
			</div>
		);
	}

	const goToPrevious = () => {
		setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
	};

	const goToNext = () => {
		setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
	};

	const goToSlide = (index) => {
		setCurrentIndex(index);
	};

	return (
		<div className="relative w-full h-80 rounded overflow-hidden group">
			{/* Main Image */}
			<img
				src={images[currentIndex]}
				alt={`${alt} ${currentIndex + 1}`}
				className="w-full h-full object-cover"
				onError={(e) => {
					e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" x="150" y="150" font-size="16"%3EImage not found%3C/text%3E%3C/svg%3E';
				}}
			/>

			{/* Navigation Arrows */}
			{images.length > 1 && (
				<>
					<button
						onClick={goToPrevious}
						className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
						aria-label="Previous image"
					>
						<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
						</svg>
					</button>
					<button
						onClick={goToNext}
						className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
						aria-label="Next image"
					>
						<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
						</svg>
					</button>
				</>
			)}

			{/* Dots Indicator */}
			{images.length > 1 && (
				<div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
					{images.map((_, index) => (
						<button
							key={index}
							onClick={() => goToSlide(index)}
							className={`w-2 h-2 rounded-full transition-all ${
								index === currentIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/75'
							}`}
							aria-label={`Go to image ${index + 1}`}
						/>
					))}
				</div>
			)}

			{/* Image Counter */}
			{images.length > 1 && (
				<div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
					{currentIndex + 1} / {images.length}
				</div>
			)}
		</div>
	);
}


