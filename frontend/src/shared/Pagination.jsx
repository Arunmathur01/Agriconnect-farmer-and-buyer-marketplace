import { useLanguage } from './LanguageContext.jsx';

export default function Pagination({ page, pages, onPage }) {
	const { t } = useLanguage();
	if (!pages || pages <= 1) return null;
	const prev = () => onPage(Math.max(1, page - 1));
	const next = () => onPage(Math.min(pages, page + 1));
	return (
		<div className="flex items-center gap-2">
			<button onClick={prev} className="px-3 py-1 border rounded" disabled={page <= 1}>{t('prev')}</button>
			<span className="text-sm">{t('page')} {page} {t('of')} {pages}</span>
			<button onClick={next} className="px-3 py-1 border rounded" disabled={page >= pages}>{t('next')}</button>
		</div>
	);
}


