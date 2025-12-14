import Watchlist from '../models/Watchlist.js';

export async function listMyWatchlist(req, res) {
	const items = await Watchlist.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(200);
	return res.json({ items });
}

export async function addToWatchlist(req, res) {
	const { listingId } = req.body;
	if (!listingId) return res.status(400).json({ message: 'listingId required' });
	const item = await Watchlist.findOneAndUpdate(
		{ userId: req.user.id, listingId },
		{ $setOnInsert: { userId: req.user.id, listingId } },
		{ upsert: true, new: true }
	);
	return res.status(201).json(item);
}

export async function removeFromWatchlist(req, res) {
	const { listingId } = req.params;
	await Watchlist.deleteOne({ userId: req.user.id, listingId });
	return res.status(204).send();
}


