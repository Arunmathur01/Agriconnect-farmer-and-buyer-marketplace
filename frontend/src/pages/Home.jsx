import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../shared/LanguageContext.jsx';
import ListingCard from '../shared/ListingCard.jsx';
import { useListingsQuery } from '../shared/useListingsQuery.js';

export default function Home() {
	const { t } = useLanguage();
	const navigate = useNavigate();
	const [crop, setCrop] = useState('');
	const [mandi, setMandi] = useState('');
	
	// Fetch latest listings for featured section
	const { data: listingsData, isLoading } = useListingsQuery({ limit: 6, sort: 'new' });
	const featured = listingsData?.items || [];

	function onSearch(e) {
		e.preventDefault();
		const params = new URLSearchParams();
		if (crop) params.set('crop', crop);
		if (mandi) params.set('mandi', mandi);
		navigate(`/market?${params.toString()}`);
	}

	return (
		<div className="space-y-16 pb-12">
			{/* Hero Section */}
			<section className="relative overflow-hidden bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 rounded-3xl shadow-2xl">
				<div className="absolute inset-0 bg-black/10"></div>
				<div className="relative px-6 py-16 md:py-20 text-center text-white">
					<div className="inline-block mb-6 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
						🌾 India's Trusted Agricultural Marketplace
					</div>
					<h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
						{t('heroTitle') || 'Buy and Sell Farm Produce Transparently'}
					</h1>
					<p className="text-xl md:text-2xl text-green-50 max-w-3xl mx-auto mb-10 leading-relaxed">
						{t('heroDesc') || 'Search by crop and mandi to discover live auctions and instant buy lots. Connect directly with farmers and buyers across India.'}
					</p>
					
					{/* Search Form */}
					<form onSubmit={onSearch} className="max-w-4xl mx-auto">
						<div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
							<div className="grid grid-cols-1 md:grid-cols-5 gap-4">
								<div className="md:col-span-2">
									<label className="block text-gray-700 text-sm font-semibold mb-2">
										<svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
										</svg>
										{t('searchCrop') || 'Crop'}
									</label>
									<input 
										className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-gray-900 transition-colors" 
										placeholder={t('searchCrop') || 'Crop (e.g., Wheat)'} 
										value={crop} 
										onChange={(e) => setCrop(e.target.value)} 
									/>
								</div>
								<div className="md:col-span-2">
									<label className="block text-gray-700 text-sm font-semibold mb-2">
										<svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
										</svg>
										{t('searchMandi') || 'Location'}
									</label>
									<input 
										className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-gray-900 transition-colors" 
										placeholder={t('searchMandi') || 'Mandi/City/State'} 
										value={mandi} 
										onChange={(e) => setMandi(e.target.value)} 
									/>
								</div>
								<div className="flex items-end">
									<button 
										type="submit"
										className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
									>
										<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
										</svg>
										{t('search') || 'Search'}
									</button>
								</div>
							</div>
						</div>
					</form>

					{/* Quick Stats */}
					<div className="flex flex-wrap justify-center gap-6 mt-10">
						<div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 min-w-[150px]">
							<div className="text-3xl font-bold">10M+</div>
							<div className="text-sm text-green-100">{t('activeUsersStat')}</div>
						</div>
						<div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 min-w-[150px]">
							<div className="text-3xl font-bold">500+</div>
							<div className="text-sm text-green-100">{t('citiesCovered')}</div>
						</div>
						<div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 min-w-[150px]">
							<div className="text-3xl font-bold">₹50B+</div>
							<div className="text-sm text-green-100">{t('transactionsStat')}</div>
						</div>
					</div>
				</div>
			</section>

			{/* Featured Listings Section */}
			<section>
				<div className="flex items-center justify-between mb-8">
					<div>
						<div className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-4">
							{t('latestListings')}
						</div>
						<h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
							{t('featuredListings') || 'Featured Listings'}
						</h2>
						<p className="text-xl text-gray-600">
							{t('discoverFreshCrops')}
						</p>
					</div>
					<Link 
						to="/market" 
						className="hidden md:block px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors"
					>
						{t('viewAll')}
					</Link>
				</div>
				
				{isLoading ? (
					<div className="text-center py-12">
						<div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
						<p className="mt-4 text-gray-600">{t('loadingListings')}</p>
					</div>
				) : featured.length === 0 ? (
					<div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-12 text-center">
						<svg className="w-20 h-20 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
						</svg>
						<h3 className="text-2xl font-bold text-gray-800 mb-2">{t('noListingsYet')}</h3>
						<p className="text-gray-600 mb-6">{t('beFirstToList')}</p>
						<Link 
							to="/register" 
							className="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors"
						>
							{t('getStarted')}
						</Link>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{featured.map((listing) => (
							<ListingCard key={listing._id} listing={listing} />
						))}
					</div>
				)}
				
				{featured.length > 0 && (
					<div className="text-center mt-8">
						<Link 
							to="/market" 
							className="inline-block px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors"
						>
							{t('browseAllListings')}
						</Link>
					</div>
				)}
			</section>

			{/* Key Benefits */}
			<section className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 md:p-12">
				<div className="text-center mb-12">
					<div className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-4">
						Why Agriconnect?
					</div>
					<h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
						Everything You Need to Succeed
					</h2>
					<p className="text-xl text-gray-600 max-w-2xl mx-auto">
						Join thousands of farmers and buyers who are transforming Indian agriculture
					</p>
				</div>

				<div className="grid md:grid-cols-3 gap-6">
					<div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow">
						<div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
							<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
							</svg>
						</div>
						<h3 className="text-2xl font-bold text-gray-900 mb-3">Real-Time Bidding</h3>
						<p className="text-gray-600 leading-relaxed">
							Watch multiple buyers compete for your produce in real-time. Get instant notifications 
							and maximize your profits with competitive bidding.
						</p>
					</div>

					<div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow">
						<div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6">
							<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
							</svg>
						</div>
						<h3 className="text-2xl font-bold text-gray-900 mb-3">100% Secure</h3>
						<p className="text-gray-600 leading-relaxed">
							KYC-verified farmers and buyers. All payments processed through secure escrow services. 
							Complete transparency and trust in every transaction.
						</p>
					</div>

					<div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow">
						<div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
							<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
							</svg>
						</div>
						<h3 className="text-2xl font-bold text-gray-900 mb-3">Expert Support</h3>
						<p className="text-gray-600 leading-relaxed">
							Connect with certified agricultural experts for personalized advice on crop management, 
							pest control, soil health, and market trends.
						</p>
					</div>
				</div>
			</section>

			{/* How It Works */}
			<section>
				<div className="text-center mb-12">
					<div className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-4">
						Simple Process
					</div>
					<h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
						{t('howItWorks') || 'How It Works'}
					</h2>
					<p className="text-xl text-gray-600 max-w-2xl mx-auto">
						From listing to payment, we've made agricultural trading simple and efficient
					</p>
				</div>

				<div className="grid md:grid-cols-3 gap-8">
					{[
						{ 
							number: 1, 
							title: t('step1Title') || 'List or Search Lots', 
							desc: t('step1Desc') || 'Farmers create lots; buyers search by crop, mandi, grade.',
							color: 'from-green-500 to-green-600'
						},
						{ 
							number: 2, 
							title: t('step2Title') || 'Bid or Buy Instantly', 
							desc: t('step2Desc') || 'Participate in live auctions or use Buy Now for fixed price.',
							color: 'from-blue-500 to-blue-600'
						},
						{ 
							number: 3, 
							title: t('step3Title') || 'Settle & Track Order', 
							desc: t('step3Desc') || 'Checkout, receive invoices, and track delivery updates.',
							color: 'from-purple-500 to-purple-600'
						}
					].map((step, i) => (
						<div key={i} className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100">
							<div className={`absolute -top-6 left-8 w-16 h-16 bg-gradient-to-br ${step.color} text-white rounded-2xl flex items-center justify-center font-bold text-2xl shadow-lg`}>
								{step.number}
							</div>
							<div className="mt-6">
								<h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
								<p className="text-gray-600 leading-relaxed">{step.desc}</p>
							</div>
						</div>
					))}
				</div>
			</section>

			{/* Stats Section */}
			<section className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-3xl p-8 md:p-12 text-white">
				<div className="text-center mb-12">
					<h2 className="text-4xl md:text-5xl font-bold mb-4">Our Impact</h2>
					<p className="text-xl text-green-50">Real numbers, real impact on Indian agriculture</p>
				</div>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
					<div className="text-center">
						<div className="text-4xl md:text-5xl font-bold mb-2">30%</div>
						<div className="text-green-100">Higher Farmer Income</div>
					</div>
					<div className="text-center">
						<div className="text-4xl md:text-5xl font-bold mb-2">2.5M+</div>
						<div className="text-green-100">Active Users</div>
					</div>
					<div className="text-center">
						<div className="text-4xl md:text-5xl font-bold mb-2">95%</div>
						<div className="text-green-100">Satisfaction Rate</div>
					</div>
					<div className="text-center">
						<div className="text-4xl md:text-5xl font-bold mb-2">24/7</div>
						<div className="text-green-100">Support Available</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 text-white text-center">
				<h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Transform Your Agricultural Business?</h2>
				<p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
					Join thousands of farmers and buyers who are already benefiting from Agriconnect's 
					revolutionary platform. Start your journey today!
				</p>
				<div className="flex flex-wrap justify-center gap-4">
					<Link 
						to="/register" 
						className="px-8 py-4 bg-green-600 hover:bg-green-700 rounded-xl font-semibold text-lg transition-colors"
					>
						Get Started as Farmer
					</Link>
					<Link 
						to="/register" 
						className="px-8 py-4 bg-white text-gray-900 hover:bg-gray-100 rounded-xl font-semibold text-lg transition-colors"
					>
						Start Buying Now
					</Link>
				</div>
			</section>
		</div>
	);
}
