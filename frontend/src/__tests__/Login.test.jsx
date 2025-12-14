import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../pages/Login.jsx';
import { AuthProvider } from '../shared/AuthContext.jsx';
import { ToastProvider } from '../shared/Toast.jsx';
import { BrowserRouter } from 'react-router-dom';

function AppWrap({ children }) {
	return (
		<ToastProvider>
			<AuthProvider>
				<BrowserRouter>{children}</BrowserRouter>
			</AuthProvider>
		</ToastProvider>
	);
}

it('shows validation errors when submitting empty login form', async () => {
	render(
		<AppWrap>
			<Login />
		</AppWrap>
	);
	await userEvent.click(screen.getByRole('button', { name: /login/i }));
	expect(await screen.findAllByText(/required/i)).toHaveLength(2);
});


