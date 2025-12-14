import { Link, useNavigate } from 'react-router-dom';
import api from '../shared/apiClient.js';
import { useAuth } from '../shared/AuthContext.jsx';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useToast } from '../shared/Toast.jsx';
import { useLanguage } from '../shared/LanguageContext.jsx';

const schema = Yup.object({
	email: Yup.string().email('Invalid email').required('Required'),
	password: Yup.string().min(6, 'Min 6 chars').required('Required'),
});

export default function Login() {
	const navigate = useNavigate();
	const { login } = useAuth();
	const toast = useToast();
	const { t } = useLanguage();

	async function handleSubmit(values, { setSubmitting, setStatus }) {
		setStatus('');
		try {
			const { data } = await api.post('/api/auth/login', values);
			login(data.token, data.user);
			toast?.success('Logged in');
			navigate('/');
		} catch (err) {
			setStatus('Invalid credentials');
			toast?.error('Login failed');
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div className="max-w-md mx-auto">
			<h1 className="text-2xl font-semibold mb-4">{t('login')}</h1>
			<Formik initialValues={{ email: '', password: '' }} validationSchema={schema} onSubmit={handleSubmit}>
				{({ isSubmitting, status }) => (
					<Form className="space-y-3">
						<Field name="email" aria-label={t('email')} className="border w-full p-2" placeholder={t('email')} />
						<ErrorMessage name="email" component="div" className="text-red-600 text-sm" />
						<Field name="password" aria-label={t('password')} type="password" className="border w-full p-2" placeholder={t('password')} />
						<ErrorMessage name="password" component="div" className="text-red-600 text-sm" />
						{status && <div className="text-red-600 text-sm">{status}</div>}
						<button aria-label={`Submit ${t('login')}`} className="bg-primary text-white px-4 py-2 rounded" type="submit" disabled={isSubmitting}>
							{isSubmitting ? 'Logging in…' : t('login')}
						</button>
						<p className="text-sm">No account? <Link to="/register" className="text-primary underline">{t('register')}</Link></p>
					</Form>
				)}
			</Formik>
		</div>
	);
}
