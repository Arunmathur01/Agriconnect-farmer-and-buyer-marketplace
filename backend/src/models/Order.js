import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
	{
		listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
		buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		pricePerKg: { type: Number, required: true },
		quantityKg: { type: Number, required: true },
		amount: { type: Number, required: true },
		status: { 
			type: String, 
			enum: ['pending', 'pending_advance', 'advance_paid', 'confirmed', 'paid', 'shipped', 'delivered', 'completed', 'cancelled'], 
			default: 'pending' 
		},
		orderType: { 
			type: String, 
			enum: ['bid', 'buy_now'], 
			default: 'bid' 
		},
		advancePayment: { type: Number, default: 0 },
		advancePaymentPercentage: { type: Number, default: 30 }, // Default 30% advance
		advancePaid: { type: Boolean, default: false },
		farmerAccepted: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

export default mongoose.model('Order', orderSchema);


