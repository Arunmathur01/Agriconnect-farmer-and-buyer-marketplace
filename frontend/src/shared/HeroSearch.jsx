import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from './LanguageContext.jsx';

export default function HeroSearch() {
	const { t } = useLanguage();
	const [crop, setCrop] = useState('');
	const [mandi, setMandi] = useState('');
	const navigate = useNavigate();

	function onSearch(e) {
		e.preventDefault();
		const params = new URLSearchParams();
		if (crop) params.set('crop', crop);
		if (mandi) params.set('mandi', mandi);
		navigate(`/market?${params.toString()}`);
	}

	return (
		<section className="bg-primary text-white rounded-lg px-6 py-10 md:px-10">
			<h1 className="text-3xl md:text-4xl font-semibold mb-2">{t('heroTitle')}</h1>
			<p className="text-white/90 mb-6">{t('heroDesc')}</p>
			<form onSubmit={onSearch} className="grid grid-cols-1 md:grid-cols-5 gap-3">
				<input className="col-span-2 p-3 rounded text-gray-900" placeholder={t('searchCrop')} value={crop} onChange={(e) => setCrop(e.target.value)} />
				<input className="col-span-2 p-3 rounded text-gray-900" placeholder={t('searchMandi')} value={mandi} onChange={(e) => setMandi(e.target.value)} />
				<button className="bg-white text-primary font-medium rounded px-4">{t('search')}</button>
			</form>
		</section>
	);
}


