import { Link } from 'react-router-dom';

export default function NotFound() {
	return (
		<div className="text-center py-16">
			<h1 className="text-3xl font-semibold mb-2">Page not found</h1>
			<p className="text-gray-600 mb-4">The page you requested does not exist.</p>
			<Link className="text-primary underline" to="/">Go home</Link>
		</div>
	);
}


