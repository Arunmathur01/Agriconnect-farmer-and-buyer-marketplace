import { useQuery } from '@tanstack/react-query';
import api from './apiClient.js';

export function useMyBids() {
	return useQuery({
		queryKey: ['my_bids'],
		queryFn: async () => (await api.get('/api/bids/mine')).data.items,
	});
}


