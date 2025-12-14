/** @type {import('tailwindcss').Config} */
export default {
	content: [
		'./index.html',
		'./src/**/*.{js,jsx,ts,tsx}',
	],
	theme: {
		extend: {
			colors: {
				primary: {
					DEFAULT: '#0B7A4A',
					light: '#10a059',
					dark: '#085a37',
				},
			},
		},
	},
	plugins: [],
};


