const STAGES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

export default function OrderTimeline({ status }) {
	return (
		<ol className="flex items-center gap-2 text-xs">
			{STAGES.map((s, i) => {
				const active = s === status;
				const done = STAGES.indexOf(status) > i || status === 'cancelled';
				return (
					<li key={s} className={`flex items-center gap-1 ${done ? 'text-green-700' : active ? 'text-primary' : 'text-gray-400'}`}>
						<span className={`inline-block w-2 h-2 rounded-full ${done || active ? 'bg-green-600' : 'bg-gray-300'}`} />
						<span className="capitalize">{s}</span>
						{i < STAGES.length - 1 && <span className="w-6 h-px bg-gray-300" />}
					</li>
				);
			})}
		</ol>
	);
}


