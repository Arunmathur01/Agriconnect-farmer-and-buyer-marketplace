import { useEffect, useRef, useState } from 'react';
import { useSocket } from './useSocket.js';
import { useAuth } from './AuthContext.jsx';
import { useLanguage } from './LanguageContext.jsx';

export default function VideoCall({ chatId, targetUserId, onClose }) {
	const { user } = useAuth();
	const { t } = useLanguage();
	const socketRef = useSocket();
	const localVideoRef = useRef(null);
	const remoteVideoRef = useRef(null);
	const pcRef = useRef(null);
	const [isConnected, setIsConnected] = useState(false);
	const [callDuration, setCallDuration] = useState(0);
	const callStartTimeRef = useRef(null);
	const durationIntervalRef = useRef(null);

	useEffect(() => {
		if (!socketRef.current || !targetUserId) return;

		const socket = socketRef.current;
		const pc = new RTCPeerConnection({
			iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
		});
		pcRef.current = pc;

		pc.onicecandidate = (event) => {
			if (event.candidate) {
				socket.emit('ice_candidate', { targetUserId, candidate: event.candidate });
			}
		};

		pc.ontrack = (event) => {
			remoteVideoRef.current.srcObject = event.streams[0];
		};

		navigator.mediaDevices.getUserMedia({ video: true, audio: true })
			.then((stream) => {
				localVideoRef.current.srcObject = stream;
				stream.getTracks().forEach((track) => pc.addTrack(track, stream));

				// Record call start time
				callStartTimeRef.current = new Date();
				
				// Start duration timer
				durationIntervalRef.current = setInterval(() => {
					if (callStartTimeRef.current) {
						const elapsed = Math.floor((new Date() - callStartTimeRef.current) / 1000);
						setCallDuration(elapsed);
					}
				}, 1000);
				
				// Emit call started event
				if (socketRef.current && chatId) {
					socketRef.current.emit('call_started', { chatId, targetUserId });
				}

				pc.createOffer().then((offer) => {
					pc.setLocalDescription(offer);
					socket.emit('offer', { targetUserId, offer });
				});
			})
			.catch((err) => {
				console.error('Error accessing media:', err);
			});

		socket.on('answer', ({ answer, senderId }) => {
			if (senderId === targetUserId) {
				pc.setRemoteDescription(new RTCSessionDescription(answer));
				setIsConnected(true);
			}
		});

		socket.on('ice_candidate', ({ candidate, senderId }) => {
			if (senderId === targetUserId) {
				pc.addIceCandidate(new RTCIceCandidate(candidate));
			}
		});

		socket.on('offer', ({ offer, senderId }) => {
			if (senderId === targetUserId) {
				pc.setRemoteDescription(new RTCSessionDescription(offer));
				pc.createAnswer().then((answer) => {
					pc.setLocalDescription(answer);
					socket.emit('answer', { targetUserId, answer });
				});
			}
		});

		socket.on('call_ended', () => {
			endCall();
		});

		return () => {
			if (durationIntervalRef.current) {
				clearInterval(durationIntervalRef.current);
			}
			if (pcRef.current) {
				pcRef.current.close();
			}
			if (localVideoRef.current?.srcObject) {
				localVideoRef.current.srcObject.getTracks().forEach((track) => track.stop());
			}
		};
	}, [socketRef, targetUserId]);

	function endCall() {
		// Clear duration interval
		if (durationIntervalRef.current) {
			clearInterval(durationIntervalRef.current);
			durationIntervalRef.current = null;
		}
		
		const callEndTime = new Date();
		const duration = callStartTimeRef.current 
			? Math.floor((callEndTime - callStartTimeRef.current) / 1000) 
			: callDuration;
		
		if (socketRef.current && targetUserId && chatId) {
			socketRef.current.emit('end_call', { 
				targetUserId, 
				chatId,
				duration,
				startedAt: callStartTimeRef.current,
				endedAt: callEndTime
			});
		}
		if (pcRef.current) {
			pcRef.current.close();
		}
		if (localVideoRef.current?.srcObject) {
			localVideoRef.current.srcObject.getTracks().forEach((track) => track.stop());
		}
		setCallDuration(0);
		onClose();
	}

	function formatDuration(seconds) {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	}

	return (
		<div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
			<div className="relative w-full h-full max-w-4xl">
				{/* Call Duration Display */}
				<div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full z-10 flex items-center gap-2">
					<div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
					<span className="font-mono text-sm">{formatDuration(callDuration)}</span>
					<span className="text-xs opacity-75">{isConnected ? t('connected') : t('connecting')}</span>
				</div>
				<button onClick={endCall} className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full z-10 flex items-center gap-2 transition-colors">
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
					</svg>
					{t('endCall')}
				</button>
				<div className="grid grid-cols-2 gap-4 p-4 h-full">
					<div className="relative">
						<video ref={localVideoRef} autoPlay muted className="w-full h-full object-cover rounded" />
						<div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">{t('you')}</div>
					</div>
					<div className="relative">
						<video ref={remoteVideoRef} autoPlay className="w-full h-full object-cover rounded" />
						{!isConnected && (
							<div className="absolute inset-0 flex items-center justify-center bg-gray-900">
								<div className="text-white">{t('connecting')}</div>
							</div>
						)}
						<div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">{t('remote')}</div>
					</div>
				</div>
			</div>
		</div>
	);
}

