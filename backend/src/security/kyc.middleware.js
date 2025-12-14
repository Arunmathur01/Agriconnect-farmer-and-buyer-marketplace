import Kyc from '../models/Kyc.js';

export async function requireApprovedKyc(req, res, next) {
	try {
		const kyc = await Kyc.findOne({ userId: req.user.id });
		if (!kyc || kyc.status !== 'approved') {
			return res.status(403).json({ message: 'KYC approval required' });
		}
		next();
	} catch (e) {
		return res.status(500).json({ message: 'KYC check failed' });
	}
}


