import { useMemo, useRef, useState } from 'react';
import { useMyOrders } from '../shared/useOrders.js';
import OrderTimeline from '../shared/OrderTimeline.jsx';
import { useAuth } from '../shared/AuthContext.jsx';
import { useLanguage } from '../shared/LanguageContext.jsx';

export default function BuyerOrders() {
	const { t } = useLanguage();
	const { data: orders, isLoading } = useMyOrders();
	const [status, setStatus] = useState('');
	const printRef = useRef(null);
	const { user } = useAuth();

	const filtered = useMemo(() => {
		if (!orders) return [];
		return orders.filter((o) => !status || o.status === status);
	}, [orders, status]);

	function print(orderId) {
		const order = (orders || []).find((o) => o._id === orderId);
		if (!order) return;
		const seller = order.farmerId && typeof order.farmerId === 'object' ? order.farmerId : null;
		const styles = `
			<style>
				body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; margin: 32px; color: #111827; }
				.header { display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e5e7eb; padding-bottom:12px; margin-bottom:16px; }
				.brand { color:#0B7A4A; font-weight:700; font-size:20px; }
				.section { margin: 16px 0; }
				.table { width:100%; border-collapse:collapse; }
				.table th, .table td { text-align:left; padding:8px; border-bottom:1px solid #e5e7eb; }
				.small { color:#6b7280; font-size:12px; }
				.badge { display:inline-block; padding:2px 8px; border-radius:999px; background:#ecfdf5; color:#065f46; font-size:12px; }
				.footer { margin-top:24px; border-top:1px solid #e5e7eb; padding-top:12px; font-size:12px; color:#6b7280; }
			</style>
		`;
		const html = `
			<!doctype html><html><head><meta charset="utf-8"/>${styles}<title>${t('invoice')} ${orderId}</title></head>
			<body>
				<div class="header">
					<div class="brand">Agriconnect</div>
					<div class="small">${t('invoice')} #: ${orderId}<br/>${t('date')}: ${new Date(order.createdAt).toLocaleString()}</div>
				</div>
				<div class="section">
					<strong>${t('billTo')}</strong>
					<div>${user?.name || t('buyer')} (${user?.email || '—'})</div>
				</div>
				<div class="section">
					<strong>${t('seller')}</strong>
					<div>${seller?.name || t('farmer')} (${seller?.email || '—'})</div>
				</div>
				<div class="section">
					<table class="table">
						<thead><tr><th>${t('description')}</th><th>${t('price')}</th><th>${t('qty')}</th><th>${t('total')}</th></tr></thead>
						<tbody>
							<tr>
								<td>${t('order')} ${orderId.slice(-6)} — ${t('cropName')}</td>
								<td>₹${order.pricePerKg}/kg</td>
								<td>${order.quantityKg} kg</td>
								<td>₹${order.amount}</td>
							</tr>
						</tbody>
					</table>
				</div>
				<div class="section"><span class="badge">${t('status')}: ${t(order.status)}</span></div>
				<div class="footer">${t('thankYou')}</div>
			</body></html>
		`;
		const w = window.open('', 'PRINT', 'height=650,width=900,top=100,left=150');
		w.document.write(html);
		w.document.close();
		w.focus();
		w.print();
		w.close();
	}

	return (
		<div className="space-y-4">
			<h1 className="text-2xl font-semibold">{t('myOrders')}</h1>
			<div className="flex items-center gap-2">
				<label className="text-sm">{t('filter')}:</label>
				<select value={status} onChange={(e) => setStatus(e.target.value)} className="border p-2 rounded text-sm">
					<option value="">{t('all')}</option>
					<option value="pending">{t('pending')}</option>
					<option value="paid">{t('paid')}</option>
					<option value="shipped">{t('shipped')}</option>
					<option value="delivered">{t('delivered')}</option>
					<option value="cancelled">{t('cancelled')}</option>
				</select>
			</div>
			<div className="border rounded divide-y" ref={printRef}>
				{isLoading && <div className="p-3 text-gray-600">{t('loading')}</div>}
				{!isLoading && filtered.length === 0 && <div className="p-3 text-gray-600">{t('noItems')}</div>}
				{filtered.map((o) => (
					<div key={o._id} className="p-3 text-sm grid grid-cols-2 md:grid-cols-6 gap-2 items-center">
						<span>{t('order')}: {o._id.slice(-6)}</span>
						<span>₹{o.pricePerKg}/kg × {o.quantityKg} kg</span>
						<span>{t('amount')}: ₹{o.amount}</span>
						<span>{t('status')}: {t(o.status)}</span>
						<OrderTimeline status={o.status} />
						<button className="border px-3 py-1 rounded" onClick={() => print(o._id)}>{t('print')}</button>
					</div>
				))}
			</div>
		</div>
	);
}
