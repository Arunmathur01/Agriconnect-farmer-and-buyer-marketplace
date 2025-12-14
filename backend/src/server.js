import http from 'http';
import express from 'express';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectToMongo } from './utils/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { registerSocketHandlers } from './sockets/index.js';
import router from './routes/index.js';
import { stripeWebhookMiddleware } from './routes/payment.routes.js';
import fs from 'fs';

dotenv.config();

// Ensure uploads directories exist
// Files are saved to src/uploads/ from cloudinary.js, so we need to serve from there
const uploadsDir = path.join(__dirname, 'uploads');
const listingsDir = path.join(uploadsDir, 'listings');
const kycDir = path.join(uploadsDir, 'kyc');
[uploadsDir, listingsDir, kycDir].forEach(dir => {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
		console.log(`Created directory: ${dir}`);
	}
});

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
	cors: {
		origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
		credentials: true,
	},
});
app.set('io', io);

// Stripe webhook needs raw body, register before json
stripeWebhookMiddleware(app);

// Static uploads (before Helmet to avoid CSP issues)
// Add CORS headers for static file serving
const corsOptions = {
	origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
	credentials: true,
	methods: ['GET', 'HEAD', 'OPTIONS'],
	allowedHeaders: ['Content-Type'],
};

// Apply CORS to static files route with error handling
const staticOptions = {
	setHeaders: (res, filePath) => {
		res.set('Cross-Origin-Resource-Policy', 'cross-origin');
		res.set('Cross-Origin-Embedder-Policy', 'unsafe-none');
	},
	dotfiles: 'ignore',
	etag: true,
	extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'],
	index: false,
	lastModified: true,
	maxAge: '1d',
};

// Static file serving for uploads
// Files are saved to src/uploads/ and express.static will serve from there
// When mounting at /uploads, requests to /uploads/listings/file.jpg
// will look for listings/file.jpg in the static root directory
app.use('/uploads', cors(corsOptions), express.static(path.join(__dirname, 'uploads'), staticOptions));

// Global middlewares
app.use(helmet({
	contentSecurityPolicy: {
		directives: {
			defaultSrc: ["'self'"],
			imgSrc: ["'self'", "data:", "blob:", "https:", "http:", "http://localhost:4000", "http://localhost:5173", "https://res.cloudinary.com"],
			scriptSrc: ["'self'", "https://m.stripe.network", "https://js.stripe.com", "'unsafe-inline'", "'unsafe-eval'"],
			scriptSrcElem: ["'self'", "https://m.stripe.network", "https://js.stripe.com", "'unsafe-inline'", "'unsafe-eval'"],
			styleSrc: ["'self'", "https://m.stripe.network", "'unsafe-inline'", "'unsafe-hashes'"],
			styleSrcElem: ["'self'", "https://m.stripe.network", "'unsafe-inline'", "'unsafe-hashes'"],
			frameSrc: ["'self'", "https://js.stripe.com", "https://hooks.stripe.com", "https://m.stripe.network"],
			connectSrc: ["'self'", "https://api.stripe.com", "https://m.stripe.network", "ws://localhost:4000", "http://localhost:4000"],
		},
	},
	crossOriginEmbedderPolicy: false, // Allow images to load cross-origin
	crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin resources
}));
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Health
app.get('/health', (req, res) => {
	return res.json({ status: 'ok' });
});

// API
app.use('/api', router);

// Socket.io
io.on('connection', (socket) => {
	registerSocketHandlers(io, socket);
});

const PORT = process.env.PORT || 4000;

async function start() {
	await connectToMongo(process.env.MONGO_URI);
	server.listen(PORT, () => {
		console.log(`Backend running on http://localhost:${PORT}`);
	});
}

start().catch((err) => {
	console.error('Failed to start server', err);
	process.exit(1);
});

