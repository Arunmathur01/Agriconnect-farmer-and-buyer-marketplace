import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../shared/apiClient.js';
import { useAuth } from '../shared/AuthContext.jsx';
import { useLanguage } from '../shared/LanguageContext.jsx';

export default function ExpertConnect() {
	const { t } = useLanguage();
	const { user } = useAuth();
	const [experts, setExperts] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const navigate = useNavigate();

	useEffect(() => {
		loadExperts();
	}, []);

	async function loadExperts() {
		const { data } = await api.get('/api/chat/experts/available');
		setExperts(data);
		setIsLoading(false);
	}

	async function connectExpert(expertId) {
		const { data } = await api.post('/api/chat/expert', { expertId });
		navigate(`/chat/${data._id}`);
	}

	if (isLoading) return <div>{t('loading')}</div>;

	return (
		<div className="space-y-4">
			<h1 className="text-2xl font-semibold">{t('connectExpert', 'Connect with Experts')}</h1>
			<p className="text-gray-600">{t('expertDesc', 'Get advice from agricultural experts via chat or video call')}</p>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{experts.length === 0 && <div className="text-gray-600">{t('noExperts', 'No experts available')}</div>}
				{experts.map((expert) => (
					<div key={expert._id} className="border rounded p-4">
						<div className="flex items-center gap-3">
							<div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl">👨‍🔬</div>
							<div>
								<div className="font-medium">{expert.name}</div>
								<div className="text-sm text-gray-600">{expert.email}</div>
							</div>
						</div>
						<button onClick={() => connectExpert(expert._id)} className="mt-3 w-full bg-primary text-white px-4 py-2 rounded">
							{t('Chat Now', 'Chat Now')}
						</button>
					</div>
				))}
			</div>
		</div>
	);
}

