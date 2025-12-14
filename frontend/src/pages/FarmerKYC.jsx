import { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useToast } from '../shared/Toast.jsx';
import { useMyKyc, useSubmitKyc } from '../shared/useKyc.js';
import { useLanguage } from '../shared/LanguageContext.jsx';

const schema = Yup.object({
	fullName: Yup.string().required('Required'),
	phone: Yup.string().matches(/^[0-9]{10}$/,'10-digit phone').required('Required'),
	address: Yup.string().required('Required'),
	state: Yup.string().required('Required'),
	district: Yup.string().required('Required'),
	pincode: Yup.string().matches(/^[1-9][0-9]{5}$/,'Invalid pincode').required('Required'),
	aadhaar: Yup.string().matches(/^[0-9]{12}$/,'12-digit Aadhaar').required('Required'),
	pan: Yup.string().matches(/^[A-Z]{5}[0-9]{4}[A-Z]$/,'Invalid PAN').required('Required'),
	bankAccount: Yup.string().required('Required'),
	ifsc: Yup.string().matches(/^[A-Z]{4}0[A-Z0-9]{6}$/,'Invalid IFSC').required('Required'),
	landAreaAcre: Yup.number().positive('Must be positive').required('Required'),
	landLocation: Yup.string().required('Required'),
	mandi: Yup.string().required('Required'),
});

export default function FarmerKYC() {
	const { t } = useLanguage();
	const toast = useToast();
	const [idDoc, setIdDoc] = useState(null);
	const [landDoc, setLandDoc] = useState(null);
	const [bankDoc, setBankDoc] = useState(null);
	const { data: kyc } = useMyKyc();
	const submitKyc = useSubmitKyc();
	const isApproved = kyc?.status === 'approved';

	async function onSubmit(values, { setSubmitting, setStatus }) {
		try {
			const form = new FormData();
			Object.entries(values).forEach(([k, v]) => form.append(k, v));
			if (idDoc) form.append('idDoc', idDoc);
			if (landDoc) form.append('landDoc', landDoc);
			if (bankDoc) form.append('bankDoc', bankDoc);
			await submitKyc.mutateAsync(form);
			toast?.success('KYC submitted');
			setStatus('Submitted');
		} catch (e) {
			toast?.error('Failed to submit KYC');
			setStatus('Failed to submit');
		} finally {
			setSubmitting(false);
		}
	}

	const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

	return (
		<div className="max-w-3xl">
			<h1 className="text-2xl font-semibold mb-4">{t('profile') || 'Profile'}</h1>
			{kyc && (
				<div className="mb-4 p-3 border rounded bg-gray-50">
					<div className="flex items-center justify-between">
						<div>
							<span className="text-sm text-gray-600">{t('status') || 'Status'}: </span>
							<span className={`font-medium capitalize px-2 py-1 rounded text-sm ${
								kyc.status === 'approved' ? 'bg-green-100 text-green-800' :
								kyc.status === 'rejected' ? 'bg-red-100 text-red-800' :
								'bg-yellow-100 text-yellow-800'
							}`}>
								{t(kyc.status)}
							</span>
						</div>
						{isApproved && (
							<span className="text-sm text-green-600">✓ {t('approved') || 'Approved'}</span>
						)}
					</div>
					{kyc.reviewNote && (
						<div className="mt-2 text-sm text-gray-600">
							<strong>{t('reviewNote') || 'Review Note'}:</strong> {kyc.reviewNote}
						</div>
					)}
				</div>
			)}
			{isApproved ? (
				// Profile View (Read-only)
				<div className="space-y-6">
					<section className="space-y-3 border rounded p-4">
						<h2 className="font-semibold text-lg">{t('personalDetails') || 'Personal Details'}</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="text-sm text-gray-600">{t('name') || 'Full Name'}</label>
								<div className="font-medium">{kyc.fullName || '—'}</div>
							</div>
							<div>
								<label className="text-sm text-gray-600">{t('phone') || 'Phone'}</label>
								<div className="font-medium">{kyc.phone || '—'}</div>
							</div>
							<div className="md:col-span-2">
								<label className="text-sm text-gray-600">{t('address') || 'Address'}</label>
								<div className="font-medium">{kyc.address || '—'}</div>
							</div>
							<div>
								<label className="text-sm text-gray-600">{t('state') || 'State'}</label>
								<div className="font-medium">{kyc.state || '—'}</div>
							</div>
							<div>
								<label className="text-sm text-gray-600">{t('district') || 'District'}</label>
								<div className="font-medium">{kyc.district || '—'}</div>
							</div>
							<div>
								<label className="text-sm text-gray-600">{t('pincode') || 'Pincode'}</label>
								<div className="font-medium">{kyc.pincode || '—'}</div>
							</div>
						</div>
					</section>

					<section className="space-y-3 border rounded p-4">
						<h2 className="font-semibold text-lg">{t('identityBank') || 'Identity & Bank Details'}</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="text-sm text-gray-600">{t('aadhaar') || 'Aadhaar Number'}</label>
								<div className="font-medium">{kyc.aadhaar ? `**** **** ${kyc.aadhaar.slice(-4)}` : '—'}</div>
							</div>
							<div>
								<label className="text-sm text-gray-600">{t('pan') || 'PAN Number'}</label>
								<div className="font-medium">{kyc.pan || '—'}</div>
							</div>
							<div>
								<label className="text-sm text-gray-600">{t('bankAccount') || 'Bank Account'}</label>
								<div className="font-medium">{kyc.bankAccount ? `****${kyc.bankAccount.slice(-4)}` : '—'}</div>
							</div>
							<div>
								<label className="text-sm text-gray-600">{t('ifsc') || 'IFSC Code'}</label>
								<div className="font-medium">{kyc.ifsc || '—'}</div>
							</div>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
							{kyc.docs?.idDocUrl && (
								<div>
									<label className="block text-sm text-gray-600 mb-1">{t('govtIdDoc') || 'Government ID Document'}</label>
									<a href={`${API_URL}${kyc.docs.idDocUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
										📄 View Document
									</a>
								</div>
							)}
							{kyc.docs?.bankDocUrl && (
								<div>
									<label className="block text-sm text-gray-600 mb-1">{t('bankProof') || 'Bank Proof'}</label>
									<a href={`${API_URL}${kyc.docs.bankDocUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
										📄 View Document
									</a>
								</div>
							)}
							{kyc.docs?.landDocUrl && (
								<div>
									<label className="block text-sm text-gray-600 mb-1">{t('landProof') || 'Land Proof'}</label>
									<a href={`${API_URL}${kyc.docs.landDocUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
										📄 View Document
									</a>
								</div>
							)}
						</div>
					</section>

					<section className="space-y-3 border rounded p-4">
						<h2 className="font-semibold text-lg">{t('farmMandiDetails') || 'Farm & Mandi Details'}</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<label className="text-sm text-gray-600">{t('landAreaAcre') || 'Land Area (Acre)'}</label>
								<div className="font-medium">{kyc.landAreaAcre ? `${kyc.landAreaAcre} acres` : '—'}</div>
							</div>
							<div>
								<label className="text-sm text-gray-600">{t('landLocation') || 'Land Location'}</label>
								<div className="font-medium">{kyc.landLocation || '—'}</div>
							</div>
							<div>
								<label className="text-sm text-gray-600">{t('preferredMandi') || 'Preferred Mandi'}</label>
								<div className="font-medium">{kyc.mandi || '—'}</div>
							</div>
						</div>
					</section>
				</div>
			) : (
				// KYC Form (Editable)
				<Formik
				initialValues={{
					fullName: kyc?.fullName || '', phone: kyc?.phone || '', address: kyc?.address || '', state: kyc?.state || '', district: kyc?.district || '', pincode: kyc?.pincode || '',
					aadhaar: kyc?.aadhaar || '', pan: kyc?.pan || '', bankAccount: kyc?.bankAccount || '', ifsc: kyc?.ifsc || '', landAreaAcre: kyc?.landAreaAcre || '', landLocation: kyc?.landLocation || '', mandi: kyc?.mandi || ''
				}}
				enableReinitialize
				validationSchema={schema}
				onSubmit={onSubmit}
			>
				{({ isSubmitting, status }) => (
					<Form className="space-y-6">
						<section className="space-y-3">
							<h2 className="font-semibold">{t('personalDetails')}</h2>
							<Field name="fullName" aria-label={t('name')} className="border w-full p-2" placeholder={t('name')} />
							<ErrorMessage name="fullName" component="div" className="text-red-600 text-sm" />
							<Field name="phone" aria-label={t('phone')} className="border w-full p-2" placeholder={t('phone')} />
							<ErrorMessage name="phone" component="div" className="text-red-600 text-sm" />
							<Field name="address" aria-label={t('address')} className="border w-full p-2" placeholder={t('address')} />
							<ErrorMessage name="address" component="div" className="text-red-600 text-sm" />
							<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
								<div>
									<Field name="state" aria-label={t('state')} className="border w-full p-2" placeholder={t('state')} />
									<ErrorMessage name="state" component="div" className="text-red-600 text-sm" />
								</div>
								<div>
									<Field name="district" aria-label={t('district')} className="border w-full p-2" placeholder={t('district')} />
									<ErrorMessage name="district" component="div" className="text-red-600 text-sm" />
								</div>
								<div>
									<Field name="pincode" aria-label={t('pincode')} className="border w-full p-2" placeholder={t('pincode')} />
									<ErrorMessage name="pincode" component="div" className="text-red-600 text-sm" />
								</div>
							</div>
						</section>

						<section className="space-y-3">
							<h2 className="font-semibold">{t('identityBank')}</h2>
							<Field name="aadhaar" aria-label={t('aadhaar')} className="border w-full p-2" placeholder={t('aadhaar')} />
							<ErrorMessage name="aadhaar" component="div" className="text-red-600 text-sm" />
							<Field name="pan" aria-label={t('pan')} className="border w-full p-2" placeholder={t('pan')} />
							<ErrorMessage name="pan" component="div" className="text-red-600 text-sm" />
							<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
								<div>
									<Field name="bankAccount" aria-label={t('bankAccount')} className="border w-full p-2" placeholder={t('bankAccount')} />
									<ErrorMessage name="bankAccount" component="div" className="text-red-600 text-sm" />
								</div>
								<div>
									<Field name="ifsc" aria-label={t('ifsc')} className="border w-full p-2" placeholder={t('ifsc')} />
									<ErrorMessage name="ifsc" component="div" className="text-red-600 text-sm" />
								</div>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
								<div>
									<label className="block text-sm mb-1">{t('govtIdDoc')}</label>
									<input type="file" aria-label={t('govtIdDoc')} onChange={(e) => setIdDoc(e.target.files?.[0])} />
								</div>
								<div>
									<label className="block text-sm mb-1">{t('bankProof')}</label>
									<input type="file" aria-label={t('bankProof')} onChange={(e) => setBankDoc(e.target.files?.[0])} />
								</div>
								<div>
									<label className="block text-sm mb-1">{t('landProof')}</label>
									<input type="file" aria-label={t('landProof')} onChange={(e) => setLandDoc(e.target.files?.[0])} />
								</div>
							</div>
						</section>

						<section className="space-y-3">
							<h2 className="font-semibold">{t('farmMandiDetails')}</h2>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
								<div>
									<Field name="landAreaAcre" aria-label={t('landAreaAcre')} className="border w-full p-2" placeholder={t('landAreaAcre')} />
									<ErrorMessage name="landAreaAcre" component="div" className="text-red-600 text-sm" />
								</div>
								<div>
									<Field name="landLocation" aria-label={t('landLocation')} className="border w-full p-2" placeholder={t('landLocation')} />
									<ErrorMessage name="landLocation" component="div" className="text-red-600 text-sm" />
								</div>
								<div>
									<Field name="mandi" aria-label={t('preferredMandi')} className="border w-full p-2" placeholder={t('preferredMandi')} />
									<ErrorMessage name="mandi" component="div" className="text-red-600 text-sm" />
								</div>
							</div>
						</section>

						<div className="flex justify-end gap-2">
							<button type="submit" aria-label={t('submitKyc')} className="bg-primary text-white px-4 py-2 rounded" disabled={isSubmitting || submitKyc.isPending}>{isSubmitting || submitKyc.isPending ? t('submitting') : t('submitKyc')}</button>
							{status && <span className="text-sm text-gray-600">{status}</span>}
						</div>
					</Form>
				)}
			</Formik>
			)}
		</div>
	);
}
