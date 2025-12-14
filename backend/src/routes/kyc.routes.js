import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { authRequired, requireRoles } from '../security/auth.middleware.js';
import { getMyKyc, upsertMyKyc } from '../controllers/kyc.controller.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'kyc');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
const upload = multer({ dest: uploadsDir });

router.use(authRequired);

router.get('/mine', getMyKyc);
router.post('/mine', upload.fields([
	{ name: 'idDoc', maxCount: 1 },
	{ name: 'landDoc', maxCount: 1 },
	{ name: 'bankDoc', maxCount: 1 },
]), upsertMyKyc);

export default router;


