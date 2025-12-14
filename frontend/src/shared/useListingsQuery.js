import { useQuery } from '@tanstack/react-query';
import api from './apiClient.js';

export function useListingsQuery(params) {
	// Filter out empty values from params before creating query string
	const cleanParams = {};
	if (params) {
		Object.keys(params).forEach(key => {
			const value = params[key];
			// Only include non-empty values (not null, undefined, empty string)
			if (value !== null && value !== undefined && value !== '') {
				cleanParams[key] = value;
			}
		});
	}
	const qp = new URLSearchParams(cleanParams).toString();
	return useQuery({
		queryKey: ['listings', qp],
		queryFn: async () => {
			const { data } = await api.get(`/api/listings?${qp}`);
			return data;
		},
		keepPreviousData: true,
	});
}


