import { useLanguage } from './LanguageContext.jsx';

export default function HowItWorks() {
	const { t } = useLanguage();
	const steps = [
		{ title: t('step1Title'), desc: t('step1Desc') },
		{ title: t('step2Title'), desc: t('step2Desc') },
		{ title: t('step3Title'), desc: t('step3Desc') },
	];
	return (
		<section className="bg-white">
			<h2 className="text-xl font-semibold mb-3">{t('howItWorks')}</h2>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				{steps.map((s, i) => (
					<div key={i} className="border rounded p-4">
						<h3 className="font-semibold">{i + 1}. {s.title}</h3>
						<p className="text-gray-600 text-sm">{s.desc}</p>
					</div>
				))}
			</div>
		</section>
	);
}


