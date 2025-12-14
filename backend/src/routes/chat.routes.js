import express from 'express';
import {
	getOrCreateChat,
	createExpertChat,
	getUserChats,
	getChatMessages,
	getAvailableExperts,
	toggleExpertAvailability,
	markMessagesAsRead,
} from '../controllers/chat.controller.js';
import { authRequired } from '../security/auth.middleware.js';

const router = express.Router();

router.post('/create', authRequired, getOrCreateChat);
router.post('/expert', authRequired, createExpertChat);
router.get('/mine', authRequired, getUserChats);
router.get('/experts/available', authRequired, getAvailableExperts); // Auth required to check user role
router.get('/:chatId/messages', authRequired, getChatMessages);
router.post('/experts/toggle-availability', authRequired, toggleExpertAvailability);
router.post('/:chatId/read', authRequired, markMessagesAsRead);

export default router;

