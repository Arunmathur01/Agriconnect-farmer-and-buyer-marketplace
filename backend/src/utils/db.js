import mongoose from 'mongoose';

export async function connectToMongo(mongoUri) {
	if (!mongoUri) throw new Error('MONGO_URI not provided');
	mongoose.set('strictQuery', true);
	await mongoose.connect(mongoUri, {
		serverSelectionTimeoutMS: 15000,
	});
	console.log('Connected to MongoDB');
}

