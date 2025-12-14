import jwt from 'jsonwebtoken';

export function authRequired(req, res, next) {
	const authHeader = req.headers.authorization || '';
	const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
	if (!token) return res.status(401).json({ message: 'Unauthorized' });
	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET);
		req.user = payload; // { id, role }
		return next();
	} catch (err) {
		return res.status(401).json({ message: 'Invalid token' });
	}
}

export function requireRoles(...roles) {
	return (req, res, next) => {
		if (!req.user || !roles.includes(req.user.role)) {
			return res.status(403).json({ message: 'Forbidden' });
		}
		next();
	};
}


