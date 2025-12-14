import { useAdminListings, useAdminStats, useAdminUsers, useModerateListing, useAdminKycs, useReviewKyc } from '../shared/useAdmin.js';
import { useLanguage } from '../shared/LanguageContext.jsx';

export default function AdminDashboard() {
	const { t } = useLanguage();
	const { data: stats } = useAdminStats();
	const { data: users } = useAdminUsers();
	const { data: listings } = useAdminListings();
	const moderate = useModerateListing();
	const { data: kycs } = useAdminKycs();
	const reviewKyc = useReviewKyc();

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-semibold">{t('adminDashboard')}</h1>
			<section className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="border rounded p-4"><div className="text-sm text-gray-600">{t('users')}</div><div className="text-2xl font-semibold">{stats?.users ?? '—'}</div></div>
				<div className="border rounded p-4"><div className="text-sm text-gray-600">{t('listings')}</div><div className="text-2xl font-semibold">{stats?.listings ?? '—'}</div></div>
			</section>

			<section>
				<h2 className="font-semibold mb-2">{t('users')}</h2>
				<div className="border rounded overflow-x-auto">
					<table className="w-full text-sm">
						<thead className="bg-gray-50 text-left"><tr><th className="p-2">{t('name')}</th><th className="p-2">{t('email')}</th><th className="p-2">{t('role')}</th></tr></thead>
						<tbody>
							{(users || []).map((u) => (
								<tr key={u._id} className="border-t"><td className="p-2">{u.name}</td><td className="p-2">{u.email}</td><td className="p-2">{t(u.role)}</td></tr>
							))}
						</tbody>
					</table>
				</div>
			</section>

			<section>
				<h2 className="font-semibold mb-2">{t('listings')}</h2>
				<div className="border rounded overflow-x-auto">
					<table className="w-full text-sm">
						<thead className="bg-gray-50 text-left"><tr><th className="p-2">{t('cropName')}</th><th className="p-2">{t('status')}</th><th className="p-2">{t('actions')}</th></tr></thead>
						<tbody>
							{(listings || []).map((l) => (
								<tr key={l._id} className="border-t">
									<td className="p-2">{l.cropName}</td>
									<td className="p-2">{t(l.status)}</td>
									<td className="p-2 space-x-2">
										<button className="px-2 py-1 border rounded" onClick={() => moderate.mutate({ id: l._id, action: 'approve' })}>{t('approve')}</button>
										<button className="px-2 py-1 border rounded" onClick={() => moderate.mutate({ id: l._id, action: 'reject' })}>{t('reject')}</button>
										<button className="px-2 py-1 border rounded" onClick={() => moderate.mutate({ id: l._id, action: 'close' })}>{t('close')}</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</section>

			<section>
				<h2 className="font-semibold mb-2">{t('kycReviews')}</h2>
				<div className="border rounded overflow-x-auto">
					<table className="w-full text-sm">
						<thead className="bg-gray-50 text-left"><tr><th className="p-2">{t('farmerColon')}</th><th className="p-2">{t('status')}</th><th className="p-2">{t('docs')}</th><th className="p-2">{t('actions')})</th></tr></thead>
						<tbody>
							{(kycs || []).map((k) => (
								<tr key={k._id} className="border-t">
									<td className="p-2">{k.userId?.name} <span className="text-xs text-gray-500">({k.userId?.email})</span></td>
									<td className="p-2 capitalize">{t(k.status)}</td>
									<td className="p-2 space-x-2">
										{k.docs?.idDocUrl && <a className="underline" href={k.docs.idDocUrl} target="_blank">ID</a>}
										{k.docs?.bankDocUrl && <a className="underline" href={k.docs.bankDocUrl} target="_blank">Bank</a>}
										{k.docs?.landDocUrl && <a className="underline" href={k.docs.landDocUrl} target="_blank">Land</a>}
									</td>
									<td className="p-2 space-x-2">
										<button className="px-2 py-1 border rounded" onClick={() => reviewKyc.mutate({ id: k._id, action: 'approve' })}>{t('approve')}</button>
										<button className="px-2 py-1 border rounded" onClick={() => reviewKyc.mutate({ id: k._id, action: 'reject', note: 'Insufficient proof' })}>{t('reject')}</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</section>
		</div>
	);
}
