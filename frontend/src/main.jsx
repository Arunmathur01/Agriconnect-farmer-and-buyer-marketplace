import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './shared/AuthContext.jsx';
import { ToastProvider } from './shared/Toast.jsx';
import { LanguageProvider } from './shared/LanguageContext.jsx';
import { CartProvider } from './shared/CartContext.jsx';

const queryClient = new QueryClient();

const router = createBrowserRouter(
	[
		{ path: '/*', element: <App /> },
	],
	{ future: { v7_startTransition: true, v7_relativeSplatPath: true } }
);

createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<LanguageProvider>
				<AuthProvider>
					<CartProvider>
						<ToastProvider>
							<RouterProvider router={router} />
						</ToastProvider>
					</CartProvider>
				</AuthProvider>
			</LanguageProvider>
		</QueryClientProvider>
	</React.StrictMode>
);
