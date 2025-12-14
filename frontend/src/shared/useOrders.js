import { useQuery } from '@tanstack/react-query';
import api from './apiClient.js';

export function useMyOrders() {
	return useQuery({
		queryKey: ['my_orders'],
		queryFn: async () => (await api.get('/api/orders')).data.items,
	});
}


