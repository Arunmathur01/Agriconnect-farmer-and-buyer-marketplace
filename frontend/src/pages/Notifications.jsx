import { useEffect, useState } from 'react';
import { useAuth } from '../shared/AuthContext.jsx';
import { useSocket } from '../shared/useSocket.js';
import { useLanguage } from '../shared/LanguageContext.jsx';

export default function Notifications() {
	const { t } = useLanguage();
	const { user } = useAuth();
	const socketRef = useSocket();
	const [events, setEvents] = useState([]);

	useEffect(() => {
		const s = socketRef.current;
		if (!s || !user) return;
		s.emit('join_user', user.id);
		const onOrder = (order) => setEvents((e) => [{ type: 'order:updated', payload: order, ts: Date.now() }, ...e]);
		s.on('order:updated', onOrder);
		return () => {
			s.off('order:updated', onOrder);
		};
	}, [socketRef, user]);

	return (
		<div className="space-y-4">
			<h1 className="text-2xl font-semibold">{t('notifications')}</h1>
			<div className="border rounded divide-y">
				{events.length === 0 && <div className="p-4 text-gray-600">{t('noNotifications')}</div>}
				{events.map((ev, i) => (
					<div key={i} className="p-3 text-sm">
						<div className="font-medium">{ev.type}</div>
						<pre className="text-xs bg-gray-50 p-2 rounded overflow-auto">{JSON.stringify(ev.payload, null, 2)}</pre>
						<div className="text-xs text-gray-500">{new Date(ev.ts).toLocaleString()}</div>
					</div>
				))}
			</div>
		</div>
	);
}
