import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Listing from '../models/Listing.js';
import User from '../models/User.js';
import bcrypt from 'bcrypt';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/agriconnect';

async function seedListings() {
	try {
		// Connect to MongoDB
		await mongoose.connect(MONGO_URI);
		console.log('✓ Connected to MongoDB');

		// Find or create a test farmer
		let farmer = await User.findOne({ email: 'testfarmer@agriconnect.com', role: 'farmer' });
		
		if (!farmer) {
			console.log('Creating test farmer...');
			const passwordHash = await bcrypt.hash('password123', 10);
			farmer = await User.create({
				name: 'Test Farmer',
				email: 'testfarmer@agriconnect.com',
				passwordHash,
				role: 'farmer',
				phone: '+91-9876543210',
				address: 'Test Farm, Test District, Test State',
			});
			console.log('✓ Test farmer created:', farmer.email);
		} else {
			console.log('✓ Using existing farmer:', farmer.email);
		}

		// Create 3 sample listings with different crops
		const listings = [
			{
				ownerId: farmer._id,
				cropName: 'Wheat',
				quantityKg: 500,
				basePricePerKg: 25,
				location: 'Punjab, India',
				grade: 'A',
				status: 'active',
				allowInstantBuy: true,
				instantBuyPricePerKg: 27,
				images: [
					'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800',
					'https://images.unsplash.com/photo-1574943320219-553eb2133cc5?w=800'
				],
			},
			{
				ownerId: farmer._id,
				cropName: 'Rice',
				quantityKg: 750,
				basePricePerKg: 35,
				location: 'Tamil Nadu, India',
				grade: 'A',
				status: 'active',
				allowInstantBuy: false,
				images: [
					'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800',
					'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800'
				],
			},
			{
				ownerId: farmer._id,
				cropName: 'Corn',
				quantityKg: 1000,
				basePricePerKg: 20,
				location: 'Maharashtra, India',
				grade: 'B',
				status: 'active',
				allowInstantBuy: true,
				instantBuyPricePerKg: 22,
				images: [
					'https://source.unsplash.com/800x600/?corn',
					'https://source.unsplash.com/800x600/?maize'
				],
			},
		];

		// Check if listings already exist (to avoid duplicates)
		const existingListings = await Listing.find({ ownerId: farmer._id, cropName: { $in: ['Wheat', 'Rice', 'Corn'] } });
		
		if (existingListings.length > 0) {
			console.log(`⚠ Found ${existingListings.length} existing listing(s). Updating with new data...`);
			
			// Delete old listings and create new ones with updated data
			await Listing.deleteMany({ ownerId: farmer._id, cropName: { $in: ['Wheat', 'Rice', 'Corn'] } });
		}

		// Create listings
		const createdListings = await Listing.insertMany(listings);
		console.log(`✓ Created ${createdListings.length} listings:`);
		createdListings.forEach(listing => {
			console.log(`  - ${listing.cropName} (${listing.quantityKg} kg) @ ₹${listing.basePricePerKg}/kg - ${listing.location}`);
		});

		console.log('\n✓ Seed completed successfully!');
		process.exit(0);
	} catch (error) {
		console.error('✗ Error seeding listings:', error);
		process.exit(1);
	}
}

seedListings();

