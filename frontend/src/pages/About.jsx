import { useLanguage } from '../shared/LanguageContext.jsx';

export default function About() {
	const { t } = useLanguage();
	return (
		<div className="max-w-7xl mx-auto space-y-12 pb-12">
			{/* Hero Section */}
			<div className="relative overflow-hidden bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 rounded-3xl shadow-2xl">
				<div className="absolute inset-0 bg-black/10"></div>
				<div className="relative px-8 py-16 md:py-24 text-center text-white">
					<div className="inline-block mb-6 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
						🌾 {t('transformingAgriculture')}
					</div>
					<h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
						{t('welcomeToAgriconnect')}
					</h1>
					<p className="text-xl md:text-2xl text-green-50 max-w-3xl mx-auto mb-8 leading-relaxed">
						{t('aboutHeroDesc')}
					</p>
					<div className="flex flex-wrap justify-center gap-6 text-center">
						<div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 min-w-[150px]">
							<div className="text-3xl font-bold">10M+</div>
							<div className="text-sm text-green-100">{t('farmersConnected')}</div>
						</div>
						<div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 min-w-[150px]">
							<div className="text-3xl font-bold">₹50B+</div>
							<div className="text-sm text-green-100">{t('transactionsProcessed')}</div>
						</div>
						<div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 min-w-[150px]">
							<div className="text-3xl font-bold">500+</div>
							<div className="text-sm text-green-100">{t('citiesCovered')}</div>
						</div>
					</div>
				</div>
			</div>

			{/* Story Section */}
			<section className="grid md:grid-cols-2 gap-8 items-center">
				<div className="space-y-6">
					<div className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
						{t('ourStory')}
					</div>
					<h2 className="text-4xl md:text-5xl font-bold text-gray-900">
						{t('bornFromVision')}
					</h2>
					<p className="text-lg text-gray-700 leading-relaxed">
						{t('storyText1')}
					</p>
					<p className="text-lg text-gray-700 leading-relaxed">
						{t('storyText2')}
					</p>
					<p className="text-lg text-gray-700 leading-relaxed">
						{t('storyText3')}
					</p>
				</div>
				<div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 shadow-lg">
					<div className="space-y-4">
						<div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm">
							<div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl">✓</div>
							<div>
								<h3 className="font-bold text-gray-900">{t('directMarketAccess')}</h3>
								<p className="text-sm text-gray-600">{t('noMiddlemen')}</p>
							</div>
						</div>
						<div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm">
							<div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">✓</div>
							<div>
								<h3 className="font-bold text-gray-900">{t('fairPriceDiscovery')}</h3>
								<p className="text-sm text-gray-600">{t('competitiveBidding')}</p>
							</div>
						</div>
						<div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm">
							<div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">✓</div>
							<div>
								<h3 className="font-bold text-gray-900">{t('securePayments')}</h3>
								<p className="text-sm text-gray-600">{t('protectedTransactions')}</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Mission & Vision */}
			<section className="grid md:grid-cols-2 gap-8">
				<div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl p-8 shadow-xl">
					<div className="mb-6">
						<svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
						</svg>
						<h2 className="text-3xl font-bold mb-4">{t('ourMission')}</h2>
					</div>
					<p className="text-blue-50 text-lg leading-relaxed mb-4">
						{t('missionText1')}
					</p>
					<p className="text-blue-50 text-lg leading-relaxed">
						{t('missionText2')}
					</p>
				</div>

				<div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-2xl p-8 shadow-xl">
					<div className="mb-6">
						<svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
						</svg>
						<h2 className="text-3xl font-bold mb-4">{t('ourVision')}</h2>
					</div>
					<p className="text-purple-50 text-lg leading-relaxed mb-4">
						{t('visionText1')}
					</p>
					<p className="text-purple-50 text-lg leading-relaxed">
						{t('visionText2')}
					</p>
				</div>
			</section>

			{/* Core Features */}
			<section>
				<div className="text-center mb-12">
					<div className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-4">
						{t('whyAgriconnect')}
					</div>
					<h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
						{t('everythingYouNeed')}
					</h2>
					<p className="text-xl text-gray-600 max-w-2xl mx-auto">
						{t('joinThousands')}
					</p>
				</div>

				<div className="grid md:grid-cols-3 gap-6">
					<div className="group bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300">
						<div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
							<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
							</svg>
						</div>
						<h3 className="text-2xl font-bold text-gray-900 mb-3">{t('realTimeBidding')}</h3>
						<p className="text-gray-600 leading-relaxed">
							Watch multiple buyers compete for your produce in real-time. Get instant notifications 
							and make informed decisions to maximize your profits. No more waiting days for responses.
						</p>
					</div>

					<div className="group bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300">
						<div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
							<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
							</svg>
						</div>
						<h3 className="text-2xl font-bold text-gray-900 mb-3">{t('hundredPercentSecure')}</h3>
						<p className="text-gray-600 leading-relaxed">
							KYC-verified farmers and buyers. All payments processed through secure escrow services. 
							Your money is protected until order completion. Complete transparency and trust.
						</p>
					</div>

					<div className="group bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300">
						<div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
							<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
							</svg>
						</div>
						<h3 className="text-2xl font-bold text-gray-900 mb-3">{t('expertSupport')}</h3>
						<p className="text-gray-600 leading-relaxed">
							Connect with certified agricultural experts for personalized advice on crop management, 
							pest control, soil health, and market trends. Chat or video call with professionals.
						</p>
					</div>

					<div className="group bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300">
						<div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
							<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
						<h3 className="text-2xl font-bold text-gray-900 mb-3">{t('fastPayments')}</h3>
						<p className="text-gray-600 leading-relaxed">
							Receive payments within 48-72 hours of order delivery. No more waiting weeks for 
							payments or dealing with payment defaults. Secure and reliable.
						</p>
					</div>

					<div className="group bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300">
						<div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
							<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</div>
						<h3 className="text-2xl font-bold text-gray-900 mb-3">{t('qualityAssurance')}</h3>
						<p className="text-gray-600 leading-relaxed">
							Verified farmers and quality grading ensure buyers get exactly what they bid for. 
							Grade-based pricing helps you get fair value for quality produce.
						</p>
					</div>

					<div className="group bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300">
						<div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
							<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
							</svg>
						</div>
						<h3 className="text-2xl font-bold text-gray-900 mb-3">{t('nationwideReach')}</h3>
						<p className="text-gray-600 leading-relaxed">
							Connect with buyers and sellers across 500+ cities in India. Expand your market 
							reach beyond local mandis and access premium buyers nationwide.
						</p>
					</div>
				</div>
			</section>

			{/* How It Works */}
			<section className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 md:p-12">
				<div className="text-center mb-12">
					<div className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-4">
						Simple Process
					</div>
					<h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
						How Agriconnect Works
					</h2>
					<p className="text-xl text-gray-600 max-w-2xl mx-auto">
						From listing to payment, we've made agricultural trading simple and efficient
					</p>
				</div>

				<div className="grid md:grid-cols-2 gap-8">
					<div className="bg-white rounded-2xl p-8 shadow-lg">
						<div className="flex items-center gap-4 mb-6">
							<div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl flex items-center justify-center font-bold text-2xl">1</div>
							<h3 className="text-2xl font-bold text-gray-900">For Farmers</h3>
						</div>
						<ul className="space-y-4">
							<li className="flex items-start gap-3">
								<div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
									<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
									</svg>
								</div>
								<div>
									<p className="font-semibold text-gray-900">Complete KYC Verification</p>
									<p className="text-gray-600 text-sm">Get verified in 24-48 hours with simple documents</p>
								</div>
							</li>
							<li className="flex items-start gap-3">
								<div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
									<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
									</svg>
								</div>
								<div>
									<p className="font-semibold text-gray-900">Create Your Listing</p>
									<p className="text-gray-600 text-sm">Upload photos, set price, add crop details</p>
								</div>
							</li>
							<li className="flex items-start gap-3">
								<div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
									<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
									</svg>
								</div>
								<div>
									<p className="font-semibold text-gray-900">Receive & Review Bids</p>
									<p className="text-gray-600 text-sm">Get real-time bids from verified buyers</p>
								</div>
							</li>
							<li className="flex items-start gap-3">
								<div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
									<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
									</svg>
								</div>
								<div>
									<p className="font-semibold text-gray-900">Confirm Best Bid</p>
									<p className="text-gray-600 text-sm">Choose the best offer and create order</p>
								</div>
							</li>
							<li className="flex items-start gap-3">
								<div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
									<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
									</svg>
								</div>
								<div>
									<p className="font-semibold text-gray-900">Get Paid Securely</p>
									<p className="text-gray-600 text-sm">Receive payment within 48-72 hours</p>
								</div>
							</li>
						</ul>
					</div>

					<div className="bg-white rounded-2xl p-8 shadow-lg">
						<div className="flex items-center gap-4 mb-6">
							<div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl flex items-center justify-center font-bold text-2xl">2</div>
							<h3 className="text-2xl font-bold text-gray-900">For Buyers</h3>
						</div>
						<ul className="space-y-4">
							<li className="flex items-start gap-3">
								<div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
									<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
									</svg>
								</div>
								<div>
									<p className="font-semibold text-gray-900">Browse Quality Listings</p>
									<p className="text-gray-600 text-sm">Search and filter by crop, location, price</p>
								</div>
							</li>
							<li className="flex items-start gap-3">
								<div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
									<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
									</svg>
								</div>
								<div>
									<p className="font-semibold text-gray-900">Place Competitive Bids</p>
									<p className="text-gray-600 text-sm">Bid on listings that match your needs</p>
								</div>
							</li>
							<li className="flex items-start gap-3">
								<div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
									<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
									</svg>
								</div>
								<div>
									<p className="font-semibold text-gray-900">Get Bid Accepted</p>
									<p className="text-gray-600 text-sm">Farmer confirms your bid and creates order</p>
								</div>
							</li>
							<li className="flex items-start gap-3">
								<div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
									<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
									</svg>
								</div>
								<div>
									<p className="font-semibold text-gray-900">Secure Payment</p>
									<p className="text-gray-600 text-sm">Pay through protected escrow system</p>
								</div>
							</li>
							<li className="flex items-start gap-3">
								<div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
									<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
									</svg>
								</div>
								<div>
									<p className="font-semibold text-gray-900">Receive Quality Produce</p>
									<p className="text-gray-600 text-sm">Get verified, quality-graded crops delivered</p>
								</div>
							</li>
						</ul>
					</div>
				</div>
			</section>

			{/* Impact Stats */}
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
			{/* <section className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 text-white text-center">
				<h2 className="text-4xl md:text-5xl font-bold mb-6">{t('readyToTransform')}</h2>
				<p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
					Join thousands of farmers and buyers who are already benefiting from Agriconnect's 
					revolutionary platform. Start your journey today!
				</p>
				<div className="flex flex-wrap justify-center gap-4">
					<button className="px-8 py-4 bg-green-600 hover:bg-green-700 rounded-xl font-semibold text-lg transition-colors">
						Get Started as Farmer
					</button>
					<button className="px-8 py-4 bg-white text-gray-900 hover:bg-gray-100 rounded-xl font-semibold text-lg transition-colors">
						Start Buying Now
					</button>
				</div>
			</section> */}
		</div>
	);
}
