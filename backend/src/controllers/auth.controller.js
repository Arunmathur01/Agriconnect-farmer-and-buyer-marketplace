import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

function signToken(user) {
	return jwt.sign({ id: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET, {
		expiresIn: '7d',
	});
}

export async function register(req, res) {
	try {
		const { name, email, password, role } = req.body;
		if (!name || !email || !password || !role) return res.status(400).json({ message: 'Missing fields' });
		const existing = await User.findOne({ email });
		if (existing) return res.status(409).json({ message: 'Email already in use' });
		const passwordHash = await bcrypt.hash(password, 10);
		const user = await User.create({ name, email, passwordHash, role });
		const token = signToken(user);
		return res.status(201).json({ token, user: { id: user._id, name: user.name, role: user.role, email: user.email } });
	} catch (err) {
		return res.status(500).json({ message: 'Registration failed' });
	}
}

export async function login(req, res) {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ email });
		if (!user) return res.status(401).json({ message: 'Invalid credentials' });
		const ok = await bcrypt.compare(password, user.passwordHash);
		if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
		const token = signToken(user);
		return res.json({ token, user: { id: user._id, name: user.name, role: user.role, email: user.email } });
	} catch (err) {
		return res.status(500).json({ message: 'Login failed' });
	}
}

export async function me(req, res) {
	const user = await User.findById(req.user.id).select('_id name email role');
	return res.json({ user });
}


