import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
	children: React.ReactNode;
	content: React.ReactNode;
	position?: 'top' | 'bottom' | 'left' | 'right';
	delay?: number;
	className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
	children,
	content,
	position = 'top',
	delay = 300,
	className = ''
}) => {
	const [isVisible, setIsVisible] = useState(false);
	const [coords, setCoords] = useState({ x: 0, y: 0 });
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const tooltipRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	const showTooltip = (event: React.MouseEvent) => {
		const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
		setCoords({
			x: rect.left + rect.width / 2,
			y: rect.top + rect.height / 2
		});

		timeoutRef.current = setTimeout(() => {
			setIsVisible(true);
		}, delay);
	};

	const hideTooltip = () => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}
		setIsVisible(false);
	};

	const getTooltipPosition = () => {
		switch (position) {
			case 'top':
				return {
					bottom: window.innerHeight - coords.y + 8,
					left: coords.x,
					transform: 'translateX(-50%)'
				};
			case 'bottom':
				return {
				top: coords.y + 8,
				left: coords.x,
				transform: 'translateX(-50%)'
				};
			case 'left':
				return {
				top: coords.y,
				right: window.innerWidth - coords.x + 8,
				transform: 'translateY(-50%)'
				};
			case 'right':
				return {
				top: coords.y,
				left: coords.x + 8,
				transform: 'translateY(-50%)'
				};
			default:
				return {};
		}
	};

	return (
		<>
			<div
				ref={triggerRef}
				onMouseEnter={showTooltip}
				onMouseLeave={hideTooltip}
				className="inline-block"
			>
				{children}
			</div>

			{isVisible && (
				<div
					ref={tooltipRef}
					className={`
						fixed z-50 px-3 py-2 text-sm text-white bg-gray-900 dark:bg-gray-700
						rounded-lg shadow-lg pointer-events-none transition-opacity duration-200
						max-w-xs text-center ${className}
					`}
					style={getTooltipPosition()}
				>
					{content}

					{/* Стрелка */}
					<div
						className={`
							absolute w-2 h-2 bg-gray-900 dark:bg-gray-700 transform rotate-45
							${position === 'top' ? '-bottom-1 left-1/2 -translate-x-1/2' : ''}
							${position === 'bottom' ? '-top-1 left-1/2 -translate-x-1/2' : ''}
							${position === 'left' ? '-right-1 top-1/2 -translate-y-1/2' : ''}
							${position === 'right' ? '-left-1 top-1/2 -translate-y-1/2' : ''}
						`}
					/>
				</div>
			)}
		</>
	);
};

export default Tooltip;
