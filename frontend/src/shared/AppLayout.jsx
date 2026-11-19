import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import { useLanguage } from './LanguageContext.jsx';
import { useCart } from './CartContext.jsx';
import LanguageSwitcher from './LanguageSwitcher.jsx';

export default function AppLayout({ children }) {
	const { user, logout } = useAuth();
	const { t } = useLanguage();
	const { getCartCount } = useCart();
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
	const [q, setQ] = useState('');
	const navigate = useNavigate();
	const dropdownRef = useRef(null);
	const cartCount = getCartCount();

	// Close dropdown when clicking outside
	useEffect(() => {
		function handleClickOutside(event) {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setProfileDropdownOpen(false);
			}
		}

		if (profileDropdownOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [profileDropdownOpen]);

	function getProfileLink() {
		if (user?.role === 'farmer') return '/farmer/kyc';
		if (user?.role === 'buyer') return '/buyer';
		if (user?.role === 'admin') return '/admin';
		return '#';
	}

	function submitSearch(e) {
		e.preventDefault();
		navigate(`/market?crop=${encodeURIComponent(q)}`);
		setDrawerOpen(false);
	}

	return (
		<div className="min-h-screen flex flex-col">
			<header className="bg-primary text-white">
				<div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4 justify-between">
					<div className="flex items-center gap-3">
						<button className="md:hidden bg-white/10 px-2 py-1 rounded" onClick={() => setDrawerOpen(true)}>☰</button>
						<Link to="/" className="font-semibold tracking-wide">Agriconnect</Link>
					</div>
					<form onSubmit={submitSearch} className="hidden md:flex items-center gap-2 w-full max-w-md">
						<input value={q} onChange={(e) => setQ(e.target.value)} className="flex-1 p-2 rounded text-gray-900" placeholder={t('search')} />
						<button className="bg-white text-primary px-3 py-1 rounded">{t('search')}</button>
					</form>
					<nav className="hidden md:flex items-center gap-6">
						<Link to="/market" className="hover:underline whitespace-nowrap">{t('marketplace')}</Link>
						{user?.role !== 'buyer' && (
							<Link to="/experts" className="hover:underline whitespace-nowrap">{t('experts')}</Link>
						)}
						<Link to="/about" className="hover:underline whitespace-nowrap">{t('about')}</Link>
						{user && <Link to="/chat" className="hover:underline whitespace-nowrap">{t('chat', 'Chat')}</Link>}
						{user && <Link to="/notifications" className="hover:underline whitespace-nowrap">{t('notifications')}</Link>}
						{user?.role === 'buyer' && (
							<Link to="/cart" className="relative hover:underline whitespace-nowrap flex items-center gap-1">
								<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
								</svg>
								{t('cart') || 'Cart'}
								{cartCount > 0 && (
									<span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
										{cartCount}
									</span>
								)}
							</Link>
						)}
						{user?.role === 'farmer' && (
							<Link to="/farmer" className="hover:underline whitespace-nowrap">{t('farmer')}</Link>
						)}
						{user?.role === 'buyer' && <Link to="/buyer" className="hover:underline whitespace-nowrap">{t('buyer')}</Link>}
						{user?.role === 'admin' && <Link to="/admin" className="hover:underline whitespace-nowrap">Admin</Link>}
						<div className="ml-2">
							<LanguageSwitcher />
						</div>
						{!user && (
							<Link to="/login" className="bg-white text-primary px-4 py-2 rounded hover:bg-gray-100 transition-colors whitespace-nowrap ml-2">
								{t('login')}
							</Link>
						)}
						{user && (
							<div className="relative ml-2" ref={dropdownRef}>
								<button
									onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
									className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-primary hover:bg-gray-100 transition-colors"
									aria-label="User menu"
								>
									<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
									</svg>
								</button>
								{profileDropdownOpen && (
									<div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
										<Link
											to={getProfileLink()}
											onClick={() => setProfileDropdownOpen(false)}
											className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
										>
											{t('profile') || 'Profile'}
										</Link>
										<button
											onClick={() => {
												setProfileDropdownOpen(false);
												logout();
											}}
											className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
										>
											{t('logout') || 'Logout'}
										</button>
									</div>
								)}
							</div>
						)}
					</nav>
				</div>
			</header>

			{/* Mobile drawer */}
			{drawerOpen && (
				<div className="md:hidden fixed inset-0 z-50 bg-black/40" onClick={() => setDrawerOpen(false)}>
					<div className="absolute left-0 top-0 h-full w-72 max-w-[85vw] bg-white text-gray-900 p-4 overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
						<form onSubmit={submitSearch} className="mb-4 flex gap-2">
							<input value={q} onChange={(e) => setQ(e.target.value)} className="flex-1 p-2 border rounded" placeholder={t('search')} />
							<button className="bg-primary text-white px-3 rounded">Go</button>
						</form>
						<nav className="flex flex-col gap-2">
							<Link to="/market" onClick={() => setDrawerOpen(false)}>{t('marketplace')}</Link>
							{user?.role !== 'buyer' && (
								<Link to="/experts" onClick={() => setDrawerOpen(false)}>{t('experts')}</Link>
							)}
							<Link to="/about" onClick={() => setDrawerOpen(false)}>{t('about')}</Link>
							{user && <Link to="/chat" onClick={() => setDrawerOpen(false)}>{t('chat', 'Chat')}</Link>}
							{user && <Link to="/notifications" onClick={() => setDrawerOpen(false)}>{t('notifications')}</Link>}
							{user?.role === 'buyer' && (
								<Link to="/cart" onClick={() => setDrawerOpen(false)} className="flex items-center gap-2">
									{t('cart') || 'Cart'}
									{cartCount > 0 && (
										<span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
											{cartCount}
										</span>
									)}
								</Link>
							)}
							{user?.role === 'farmer' && (
								<Link to="/farmer" onClick={() => setDrawerOpen(false)}>{t('farmer')}</Link>
							)}
							{user?.role === 'buyer' && <Link to="/buyer" onClick={() => setDrawerOpen(false)}>{t('buyer')}</Link>}
							{user?.role === 'admin' && <Link to="/admin" onClick={() => setDrawerOpen(false)}>Admin</Link>}
							<LanguageSwitcher />
							{!user && <Link to="/login" onClick={() => setDrawerOpen(false)}>{t('login')}</Link>}
							{user && (
								<>
									<Link to={getProfileLink()} onClick={() => setDrawerOpen(false)} className="text-left">{t('profile') || 'Profile'}</Link>
									<button onClick={() => { logout(); setDrawerOpen(false); }} className="text-left">{t('logout')}</button>
								</>
							)}
						</nav>
					</div>
				</div>
			)}

			<main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
				{children}
			</main>

			<footer className="bg-white border-t">
				<div className="max-w-6xl mx-auto px-4 py-4 text-sm text-gray-600 flex items-center justify-between">
					<p>© {new Date().getFullYear()} Agriconnect</p>
					<nav className="flex gap-4">
						<Link to="/about" className="hover:underline">{t('about')}</Link>
						<a className="hover:underline" href="#" onClick={(e) => e.preventDefault()}>Privacy</a>
					</nav>
				</div>
			</footer>
		</div>
	);
}


