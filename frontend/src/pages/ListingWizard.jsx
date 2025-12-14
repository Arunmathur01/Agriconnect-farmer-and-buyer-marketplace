import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import api from '../shared/apiClient.js';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../shared/Toast.jsx';
import { useLanguage } from '../shared/LanguageContext.jsx';

const schemaStep1 = Yup.object({
	cropName: Yup.string().required('Required'),
	quantityKg: Yup.number().positive().required('Required'),
	basePricePerKg: Yup.number().positive().required('Required'),
	location: Yup.string().required('Required'),
	grade: Yup.string().oneOf(['A','B','C','D']).optional(),
	allowInstantBuy: Yup.boolean(),
	instantBuyPricePerKg: Yup.number().positive().when('allowInstantBuy', (a, s) => a ? s.required('Required') : s.optional()),
});

export default function ListingWizard() {
	const { t } = useLanguage();
	const [images, setImages] = useState([]);
	const navigate = useNavigate();
	const toast = useToast();

	async function submit(values, { setSubmitting, setStatus }) {
		try {
			const form = new FormData();
			Object.entries(values).forEach(([k, v]) => form.append(k, v));
			images.forEach((f) => form.append('images', f));
			const { data } = await api.post('/api/listings', form, { headers: { 'Content-Type': 'multipart/form-data' } });
			toast?.success('Listing created');
			navigate(`/listing/${data._id}`);
		} catch (err) {
			const errorMsg = err.response?.data?.message || err.message || 'Failed to create listing';
			setStatus(errorMsg);
			toast?.error(errorMsg);
			console.error('Error creating listing:', err);
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div className="max-w-2xl">
			<h1 className="text-2xl font-semibold mb-4">{t('createListing')}</h1>
			<Formik
				initialValues={{ cropName: '', quantityKg: '', basePricePerKg: '', location: '', grade: 'A', allowInstantBuy: false, instantBuyPricePerKg: '' }}
				validationSchema={schemaStep1}
				onSubmit={submit}
			>
				{({ isSubmitting, status, values, setFieldValue }) => (
					<Form className="space-y-4">
						<div className="space-y-3">
							<Field name="cropName" aria-label={t('cropName')} className="border w-full p-2" placeholder={t('cropName')} />
							<ErrorMessage name="cropName" component="div" className="text-red-600 text-sm" />
							<Field name="quantityKg" aria-label={t('quantity')} className="border w-full p-2" placeholder={t('quantity')} />
							<ErrorMessage name="quantityKg" component="div" className="text-red-600 text-sm" />
							<Field name="basePricePerKg" aria-label={t('basePrice')} className="border w-full p-2" placeholder={t('basePrice')} />
							<ErrorMessage name="basePricePerKg" component="div" className="text-red-600 text-sm" />
							<Field name="location" aria-label={t('location')} className="border w-full p-2" placeholder={t('mandiLocation')} />
							<ErrorMessage name="location" component="div" className="text-red-600 text-sm" />
							<Field as="select" name="grade" aria-label={t('grade')} className="border w-full p-2">
								<option>A</option><option>B</option><option>C</option><option>D</option>
							</Field>
							<div className="space-y-2">
								<label className="block text-sm font-medium">{t('uploadImages')}</label>
								<input type="file" aria-label={t('uploadImages')} multiple accept="image/*" onChange={(e) => setImages(Array.from(e.target.files || []))} />
								<p className="text-xs text-gray-600">{t('uploadUpTo6')}</p>
							</div>
							<label className="flex items-center gap-2 text-sm">
								<input type="checkbox" aria-label={t('enableBuyNow')} checked={values.allowInstantBuy} onChange={(e) => setFieldValue('allowInstantBuy', e.target.checked)} />
								{t('enableBuyNow')}
							</label>
							{values.allowInstantBuy && (
								<div>
									<Field name="instantBuyPricePerKg" aria-label={t('buyNowPrice')} className="border w-full p-2" placeholder={t('buyNowPrice')} />
									<ErrorMessage name="instantBuyPricePerKg" component="div" className="text-red-600 text-sm" />
								</div>
							)}
						</div>

						<div className="flex justify-end gap-2">
							<button type="submit" aria-label={t('submit')} className="px-4 py-2 bg-primary text-white rounded" disabled={isSubmitting}>{isSubmitting ? t('submitting') : t('submit')}</button>
						</div>
						{status && <div className="text-red-600 text-sm">{status}</div>}
					</Form>
				)}
			</Formik>
		</div>
	);
}
