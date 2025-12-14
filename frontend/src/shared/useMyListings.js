import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from './apiClient.js';

export function useMyListings() {
	return useQuery({
		queryKey: ['my_listings'],
		queryFn: async () => {
			const { data } = await api.get('/api/listings/mine');
			return data.items;
		},
	});
}

export function useCloseListing() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (id) => {
			const { data } = await api.post(`/api/listings/${id}/close`);
			return data;
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['my_listings'] });
		},
	});
}


