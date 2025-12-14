import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
	const [token, setToken] = useState(() => localStorage.getItem('token'));
	const [user, setUser] = useState(() => {
		const raw = localStorage.getItem('user');
		return raw ? JSON.parse(raw) : null;
	});

	useEffect(() => {
		if (token) localStorage.setItem('token', token);
		else localStorage.removeItem('token');
	}, [token]);

	useEffect(() => {
		if (user) localStorage.setItem('user', JSON.stringify(user));
		else localStorage.removeItem('user');
	}, [user]);

	function login(nextToken, nextUser) {
		setToken(nextToken);
		setUser(nextUser);
	}

	function logout() {
		setToken(null);
		setUser(null);
	}

	return (
		<AuthContext.Provider value={{ token, user, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	return useContext(AuthContext);
}


