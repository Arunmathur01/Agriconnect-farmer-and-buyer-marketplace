import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from './apiClient.js';

export function useMyKyc() {
	return useQuery({
		queryKey: ['my_kyc'],
		queryFn: async () => (await api.get('/api/kyc/mine')).data.kyc,
	});
}

export function useSubmitKyc() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (formData) => (await api.post('/api/kyc/mine', formData, { headers: { 'Content-Type': 'multipart/form-data' } })).data.kyc,
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['my_kyc'] });
		},
	});
}


