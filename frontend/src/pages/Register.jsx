import { Link, useNavigate } from 'react-router-dom';
import api from '../shared/apiClient.js';
import { useAuth } from '../shared/AuthContext.jsx';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useToast } from '../shared/Toast.jsx';
import { useLanguage } from '../shared/LanguageContext.jsx';

const schema = Yup.object({
	name: Yup.string().min(2, 'Too short').required('Required'),
	email: Yup.string().email('Invalid email').required('Required'),
	password: Yup.string().min(6, 'Min 6 chars').required('Required'),
	role: Yup.mixed().oneOf(['farmer', 'buyer', 'expert'], 'Invalid role').required('Required'),
});

export default function Register() {
	const navigate = useNavigate();
	const { login } = useAuth();
	const toast = useToast();
	const { t } = useLanguage();

	async function handleSubmit(values, { setSubmitting, setStatus }) {
		setStatus('');
		try {
			const { data } = await api.post('/api/auth/register', values);
			login(data.token, data.user);
			toast?.success('Account created');
			navigate('/');
		} catch (err) {
			setStatus('Registration failed');
			toast?.error('Registration failed');
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div className="max-w-md mx-auto">
			<h1 className="text-2xl font-semibold mb-4">{t('register')}</h1>
			<Formik initialValues={{ name: '', email: '', password: '', role: 'farmer' }} validationSchema={schema} onSubmit={handleSubmit}>
				{({ isSubmitting, status }) => (
					<Form className="space-y-3">
						<Field name="name" aria-label={t('name')} className="border w-full p-2" placeholder={t('name')} />
						<ErrorMessage name="name" component="div" className="text-red-600 text-sm" />
						<Field name="email" aria-label={t('email')} className="border w-full p-2" placeholder={t('email')} />
						<ErrorMessage name="email" component="div" className="text-red-600 text-sm" />
						<Field name="password" aria-label={t('password')} type="password" className="border w-full p-2" placeholder={t('password')} />
						<ErrorMessage name="password" component="div" className="text-red-600 text-sm" />
					<Field as="select" name="role" aria-label={t('role')} className="border w-full p-2">
						<option value="farmer">{t('farmer')}</option>
						<option value="buyer">{t('buyer')}</option>
						<option value="expert">{t('expert') || 'Expert'}</option>
					</Field>
						<ErrorMessage name="role" component="div" className="text-red-600 text-sm" />
						{status && <div className="text-red-600 text-sm">{status}</div>}
						<button aria-label={`Submit ${t('register')}`} className="bg-primary text-white px-4 py-2 rounded" type="submit" disabled={isSubmitting}>
							{isSubmitting ? 'Creating…' : t('register')}
						</button>
						<p className="text-sm">{t('haveAccount')} <Link to="/login" className="text-primary underline">{t('login')}</Link></p>
					</Form>
				)}
			</Formik>
		</div>
	);
}
