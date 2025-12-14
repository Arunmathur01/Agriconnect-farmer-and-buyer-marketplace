import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from './apiClient.js';

export function useBids(listingId) {
	return useQuery({
		queryKey: ['bids', listingId],
		queryFn: async () => {
			const { data } = await api.get(`/api/bids/listing/${listingId}`);
			return data.items;
		},
		enabled: !!listingId,
	});
}

export function usePlaceBid(listingId) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (payload) => {
			const { data } = await api.post(`/api/bids/listing/${listingId}`, payload);
			return data;
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['bids', listingId] });
		},
	});
}

export function useAcceptBid() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (bidId) => {
			const { data } = await api.post(`/api/bids/${bidId}/accept`);
			return data;
		},
		onSuccess: (data) => {
			// Invalidate bids for the listing
			if (data.bid?.listingId) {
				qc.invalidateQueries({ queryKey: ['bids', data.bid.listingId] });
			}
			// Invalidate all bids queries to refresh all bid lists
			qc.invalidateQueries({ queryKey: ['bids'] });
			// Invalidate orders to show new order
			qc.invalidateQueries({ queryKey: ['orders'] });
			// Invalidate listings to update quantity
			qc.invalidateQueries({ queryKey: ['listings'] });
			qc.invalidateQueries({ queryKey: ['myListings'] });
		},
	});
}


