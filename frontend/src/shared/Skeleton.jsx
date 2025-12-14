export function Skeleton({ className = '' }) {
	return <div className={`animate-pulse bg-gray-200 ${className}`} />;
}

export function SkeletonText({ lines = 3 }) {
	return (
		<div className="space-y-2">
			{Array.from({ length: lines }).map((_, i) => (
				<div key={i} className="animate-pulse bg-gray-200 h-3 rounded" />
				))}
		</div>
	);
}


