import mongoose from 'mongoose';

const kycSchema = new mongoose.Schema(
	{
		userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
		fullName: String,
		phone: String,
		address: String,
		state: String,
		district: String,
		pincode: String,
		aadhaar: String,
		pan: String,
		bankAccount: String,
		ifsc: String,
		landAreaAcre: Number,
		landLocation: String,
		mandi: String,
		docs: {
			idDocUrl: String,
			landDocUrl: String,
			bankDocUrl: String,
		},
		status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
		reviewNote: String,
	},
	{ timestamps: true }
);

export default mongoose.model('Kyc', kycSchema);


