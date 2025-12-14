import mongoose from 'mongoose';

const watchlistSchema = new mongoose.Schema(
	{
		userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
		listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true, index: true },
	},
	{ timestamps: true }
);

watchlistSchema.index({ userId: 1, listingId: 1 }, { unique: true });

export default mongoose.model('Watchlist', watchlistSchema);


