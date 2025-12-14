import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema(
	{
		listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
		buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		pricePerKg: { type: Number, required: true },
		quantityKg: { type: Number, required: true },
		status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
	},
	{ timestamps: true }
);

export default mongoose.model('Bid', bidSchema);


