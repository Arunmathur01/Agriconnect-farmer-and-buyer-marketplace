import { useLanguage } from './LanguageContext.jsx';

export default function LanguageSwitcher() {
	const { lang, setLang } = useLanguage();
	return (
		<select value={lang} onChange={(e) => setLang(e.target.value)} className="border p-1 rounded text-sm bg-white text-gray-900">
			<option value="en">English</option>
			<option value="hi">हिंदी</option>
		</select>
	);
}

