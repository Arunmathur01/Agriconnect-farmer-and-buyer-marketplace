import { useState } from 'react';

export default function ListingForm() {
	const [cropName, setCropName] = useState('');
	const [quantity, setQuantity] = useState('');
	const [basePrice, setBasePrice] = useState('');

	function onSubmit(e) {
		e.preventDefault();
		// TODO: POST to /api/listings
		alert('Listing submitted (stub)');
	}

	return (
		<div className="max-w-lg">
			<h1 className="text-2xl font-semibold mb-4">Create Listing</h1>
			<form onSubmit={onSubmit} className="space-y-3">
				<input className="border w-full p-2" placeholder="Crop name" value={cropName} onChange={(e) => setCropName(e.target.value)} />
				<input className="border w-full p-2" placeholder="Quantity (kg)" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
				<input className="border w-full p-2" placeholder="Base price (₹/kg)" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} />
				<button className="bg-primary text-white px-4 py-2 rounded" type="submit">Submit</button>
			</form>
		</div>
	);
}


