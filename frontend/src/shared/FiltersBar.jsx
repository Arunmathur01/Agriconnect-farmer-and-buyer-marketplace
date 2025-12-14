import { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext.jsx';

export default function FiltersBar({ onChange, initialFilters = {} }) {
	const { t } = useLanguage();
	const [crop, setCrop] = useState(initialFilters.crop || '');
	const [grade, setGrade] = useState(initialFilters.grade || '');
	const [location, setLocation] = useState(initialFilters.location || '');
	const [type, setType] = useState(initialFilters.type || '');
	const [minPrice, setMinPrice] = useState(initialFilters.minPrice || '');
	const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice || '');

	// Update state when initialFilters change (from URL params)
	useEffect(() => {
		if (initialFilters.crop !== undefined) setCrop(initialFilters.crop);
		if (initialFilters.grade !== undefined) setGrade(initialFilters.grade);
		if (initialFilters.location !== undefined) setLocation(initialFilters.location);
		if (initialFilters.type !== undefined) setType(initialFilters.type);
		if (initialFilters.minPrice !== undefined) setMinPrice(initialFilters.minPrice);
		if (initialFilters.maxPrice !== undefined) setMaxPrice(initialFilters.maxPrice);
	}, [initialFilters]);

	function apply() {
		// Only include non-empty values in the filter object
		const filterObj = {};
		if (crop.trim()) filterObj.crop = crop.trim();
		if (grade.trim()) filterObj.grade = grade.trim();
		if (location.trim()) filterObj.location = location.trim();
		if (type.trim()) filterObj.type = type.trim();
		if (minPrice.trim()) filterObj.minPrice = minPrice.trim();
		if (maxPrice.trim()) filterObj.maxPrice = maxPrice.trim();
		onChange?.(filterObj);
	}

	function removeFilters() {
		// Reset all filter inputs
		setCrop('');
		setGrade('');
		setLocation('');
		setType('');
		setMinPrice('');
		setMaxPrice('');
		// Clear filters by passing empty object
		onChange?.({});
	}

	return (
		<div className="bg-white border rounded p-4">
			<div className="grid grid-cols-2 md:grid-cols-8 gap-3 items-end">
				<input 
					className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500" 
					placeholder={t('crop')} 
					value={crop} 
					onChange={(e) => setCrop(e.target.value)}
					type="text"
					autoComplete="off"
				/>
				<select 
					className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none bg-white" 
					value={grade} 
					onChange={(e) => setGrade(e.target.value)}
				>
					<option value="">{t('grade')}</option>
					<option>A</option>
					<option>B</option>
					<option>C</option>
				</select>
				<input 
					className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500" 
					placeholder={t('stateMandi')} 
					value={location} 
					onChange={(e) => setLocation(e.target.value)}
					type="text"
					autoComplete="off"
				/>
				<select 
					className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none bg-white" 
					value={type} 
					onChange={(e) => setType(e.target.value)}
				>
					<option value="">{t('type')}</option>
					<option value="auction">{t('auction')}</option>
					<option value="fixed">{t('instantBuy')}</option>
				</select>
				<input 
					className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500" 
					placeholder={t('minPrice')} 
					value={minPrice} 
					onChange={(e) => setMinPrice(e.target.value)}
					type="number"
					min="0"
					autoComplete="off"
				/>
				<input 
					className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500" 
					placeholder={t('maxPrice')} 
					value={maxPrice} 
					onChange={(e) => setMaxPrice(e.target.value)}
					type="number"
					min="0"
					autoComplete="off"
				/>
				<button 
					onClick={apply} 
					className="bg-primary text-white px-4 py-2 rounded hover:bg-green-700 transition-colors whitespace-nowrap"
				>
					{t('apply')}
				</button>
				<button 
					onClick={removeFilters} 
					className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors whitespace-nowrap"
				>
					{t('remove') || 'Remove'}
				</button>
			</div>
		</div>
	);
}


