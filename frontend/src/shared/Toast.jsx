import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
	const [toasts, setToasts] = useState([]);

	const remove = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);
	const push = useCallback((toast) => {
		const id = Math.random().toString(36).slice(2);
		setToasts((t) => [...t, { id, ...toast }]);
		setTimeout(() => remove(id), toast.duration ?? 3000);
	}, [remove]);

	const api = useMemo(() => ({
		success: (m) => push({ type: 'success', message: m }),
		error: (m) => push({ type: 'error', message: m, duration: 4000 }),
		info: (m) => push({ type: 'info', message: m }),
	}), [push]);

	return (
		<ToastContext.Provider value={api}>
			{children}
			<div aria-live="polite" aria-atomic="true" className="fixed top-4 right-4 z-50 space-y-2">
				{toasts.map((t) => (
					<div key={t.id} role="status" className={`rounded px-4 py-2 shadow text-white ${t.type === 'error' ? 'bg-red-600' : t.type === 'success' ? 'bg-green-600' : 'bg-gray-800'}`}>
						{t.message}
					</div>
				))}
			</div>
		</ToastContext.Provider>
	);
}

export function useToast() {
	return useContext(ToastContext);
}


