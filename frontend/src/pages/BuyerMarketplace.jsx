import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import FiltersBar from '../shared/FiltersBar.jsx';
import ListingCard from '../shared/ListingCard.jsx';
import Pagination from '../shared/Pagination.jsx';
import { useListingsQuery } from '../shared/useListingsQuery.js';
import { Skeleton } from '../shared/Skeleton.jsx';
import { useLanguage } from '../shared/LanguageContext.jsx';

export default function BuyerMarketplace() {
	const { t } = useLanguage();
	const [searchParams, setSearchParams] = useSearchParams();
	const [filters, setFilters] = useState({});
	const [page, setPage] = useState(1);
	const [sort, setSort] = useState('new');

	// Initialize filters from URL search params on mount
	useEffect(() => {
		const cropParam = searchParams.get('crop');
		const mandiParam = searchParams.get('mandi');
		
		if (cropParam || mandiParam) {
			const urlFilters = {};
			if (cropParam) urlFilters.crop = cropParam;
			if (mandiParam) urlFilters.location = mandiParam;
			setFilters(urlFilters);
		}
	}, []); // Only run on mount

	// Get initial filter values for FiltersBar component
	const initialFilters = useMemo(() => {
		const cropParam = searchParams.get('crop');
		const mandiParam = searchParams.get('mandi');
		const filters = {};
		if (cropParam) filters.crop = cropParam;
		if (mandiParam) filters.location = mandiParam;
		return filters;
	}, [searchParams]);

	const params = useMemo(() => ({ ...filters, page, limit: 9, sort }), [filters, page, sort]);
	const { data, isLoading } = useListingsQuery(params);
	const items = data?.items || [];

	function onChangeFilters(f) {
		setFilters(f);
		setPage(1);
		// Update URL params when filters change
		const newParams = new URLSearchParams();
		if (f.crop) newParams.set('crop', f.crop);
		if (f.location) newParams.set('mandi', f.location);
		setSearchParams(newParams, { replace: true });
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold">{t('marketplace')}</h1>
				<select aria-label={t('sort')} value={sort} onChange={(e) => setSort(e.target.value)} className="border p-2 rounded text-sm">
					<option value="new">{t('newest')}</option>
					<option value="price_asc">{t('priceLowToHigh')}</option>
					<option value="price_desc">{t('priceHighToLow')}</option>
				</select>
			</div>
			<FiltersBar onChange={onChangeFilters} initialFilters={initialFilters} />
			{isLoading && (
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{Array.from({ length: 6 }).map((_, i) => (
						<div key={i} className="border rounded overflow-hidden">
							<Skeleton className="h-36" />
							<div className="p-3 space-y-2">
								<Skeleton className="h-4" />
								<Skeleton className="h-3" />
								<Skeleton className="h-3 w-1/2" />
							</div>
						</div>
					))}
				</div>
			)}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				{!isLoading && items.length === 0 && <p className="text-gray-600">{t('noListings')}</p>}
				{items.map((l) => (
					<ListingCard key={l._id} listing={l} />
				))}
			</div>
			<Pagination page={data?.page || 1} pages={data?.pages || 1} onPage={setPage} />
		</div>
	);
}
