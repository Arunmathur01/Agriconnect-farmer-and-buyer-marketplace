import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from './apiClient.js';

export function useAdminStats() {
	return useQuery({
		queryKey: ['admin_stats'],
		queryFn: async () => (await api.get('/api/admin/stats')).data,
	});
}

export function useAdminUsers() {
	return useQuery({
		queryKey: ['admin_users'],
		queryFn: async () => (await api.get('/api/admin/users')).data.items,
	});
}

export function useAdminListings() {
	return useQuery({
		queryKey: ['admin_listings'],
		queryFn: async () => (await api.get('/api/admin/listings')).data.items,
	});
}

export function useModerateListing() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, action }) => (await api.post(`/api/admin/moderate/listing/${id}`, { action })).data,
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['admin_listings'] });
		},
	});
}

export function useAdminKycs() {
	return useQuery({
		queryKey: ['admin_kyc'],
		queryFn: async () => (await api.get('/api/admin/kyc')).data.items,
	});
}

export function useReviewKyc() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, action, note }) => (await api.post(`/api/admin/kyc/${id}/review`, { action, note })).data,
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['admin_kyc'] });
		},
	});
}
