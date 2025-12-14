import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema(
	{
		ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		cropName: { type: String, required: true },
		quantityKg: { type: Number, required: true },
		basePricePerKg: { type: Number, required: true },
		images: [String],
		location: String,
		status: { type: String, enum: ['draft', 'active', 'sold', 'closed'], default: 'active' },
		allowInstantBuy: { type: Boolean, default: false },
		instantBuyPricePerKg: { type: Number },
	},
	{ timestamps: true }
);

export default mongoose.model('Listing', listingSchema);


