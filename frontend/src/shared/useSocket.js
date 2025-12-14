import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export function useSocket() {
	const ref = useRef(null);
	useEffect(() => {
		const url = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';
		ref.current = io(url, { 
			transports: ['websocket', 'polling'],
			reconnection: true,
			reconnectionAttempts: 5,
			reconnectionDelay: 1000,
		});
		
		// Handle connection errors silently (they're expected if backend is down)
		ref.current.on('connect_error', (error) => {
			// Silently handle - backend might not be running
			console.debug('Socket connection error:', error.message);
		});
		
		return () => {
			ref.current?.disconnect();
		};
	}, []);
	return ref;
}


