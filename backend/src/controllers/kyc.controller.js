import Kyc from '../models/Kyc.js';

export async function getMyKyc(req, res) {
	const kyc = await Kyc.findOne({ userId: req.user.id });
	return res.json({ kyc });
}

export async function upsertMyKyc(req, res) {
	const body = req.body;
	const updates = {
		fullName: body.fullName,
		phone: body.phone,
		address: body.address,
		state: body.state,
		district: body.district,
		pincode: body.pincode,
		aadhaar: body.aadhaar,
		pan: body.pan,
		bankAccount: body.bankAccount,
		ifsc: body.ifsc,
		landAreaAcre: body.landAreaAcre,
		landLocation: body.landLocation,
		mandi: body.mandi,
		status: 'pending',
	};
	updates.docs = updates.docs || {};
	if (req.files?.idDoc?.[0]) updates.docs.idDocUrl = `/uploads/kyc/${req.files.idDoc[0].filename}`;
	if (req.files?.landDoc?.[0]) updates.docs.landDocUrl = `/uploads/kyc/${req.files.landDoc[0].filename}`;
	if (req.files?.bankDoc?.[0]) updates.docs.bankDocUrl = `/uploads/kyc/${req.files.bankDoc[0].filename}`;

	const kyc = await Kyc.findOneAndUpdate(
		{ userId: req.user.id },
		{ userId: req.user.id, ...updates },
		{ new: true, upsert: true }
	);
	return res.status(201).json({ kyc });
}


