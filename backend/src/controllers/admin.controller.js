import User from '../models/User.js';
import Listing from '../models/Listing.js';
import { sendMail } from '../utils/mailer.js';

export async function getVitals(req, res) {
	const [users, listings] = await Promise.all([
		User.countDocuments({}),
		Listing.countDocuments({}),
	]);
	return res.json({ users, listings });
}

export async function listUsers(req, res) {
	const items = await User.find({}).select('_id name email role createdAt').sort({ createdAt: -1 }).limit(200);
	return res.json({ items });
}

export async function listListings(req, res) {
	const items = await Listing.find({}).sort({ createdAt: -1 }).limit(200);
	return res.json({ items });
}

export async function moderateListing(req, res) {
	const { id } = req.params;
	const { action } = req.body; // 'approve' | 'reject' | 'close'
	const listing = await Listing.findById(id);
	if (!listing) return res.status(404).json({ message: 'Not found' });
	if (action === 'approve') listing.status = 'active';
	else if (action === 'reject') listing.status = 'closed';
	else if (action === 'close') listing.status = 'closed';
	else return res.status(400).json({ message: 'Invalid action' });
	await listing.save();
	return res.json(listing);
}

export async function listKycs(req, res) {
	const Kyc = (await import('../models/Kyc.js')).default;
	const items = await Kyc.find({}).sort({ createdAt: -1 }).limit(200).populate('userId', 'name email');
	return res.json({ items });
}

export async function reviewKyc(req, res) {
	const { id } = req.params; // KYC doc id
	const { action, note } = req.body; // 'approve' | 'reject'
	const Kyc = (await import('../models/Kyc.js')).default;
	const kyc = await Kyc.findById(id).populate('userId', 'name email');
	if (!kyc) return res.status(404).json({ message: 'Not found' });
	if (action === 'approve') kyc.status = 'approved';
	else if (action === 'reject') kyc.status = 'rejected';
	else return res.status(400).json({ message: 'Invalid action' });
	kyc.reviewNote = note || '';
	await kyc.save();
	// Send email notification
	try {
		const to = kyc.userId?.email;
		if (to) {
			const subject = `KYC ${kyc.status === 'approved' ? 'Approved' : 'Rejected'} - Agriconnect`;
			const text = `Hello ${kyc.userId?.name || ''},\n\nYour KYC has been ${kyc.status}. ${kyc.reviewNote ? 'Note: ' + kyc.reviewNote : ''}\n\nRegards,\nAgriconnect Team`;
			await sendMail({ to, subject, text });
		}
	} catch (e) {
		console.error('Failed to send KYC email', e);
	}
	return res.json({ kyc });
}
