import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from './apiClient.js';

export function useWatchlist() {
	return useQuery({
		queryKey: ['watchlist'],
		queryFn: async () => (await api.get('/api/watchlist')).data.items,
	});
}

export function useAddToWatchlist() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (listingId) => (await api.post('/api/watchlist', { listingId })).data,
		onSuccess: () => qc.invalidateQueries({ queryKey: ['watchlist'] }),
	});
}

export function useRemoveFromWatchlist() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (listingId) => (await api.delete(`/api/watchlist/${listingId}`)).data,
		onSuccess: () => qc.invalidateQueries({ queryKey: ['watchlist'] }),
	});
}


