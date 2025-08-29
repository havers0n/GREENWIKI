import React, { useState } from 'react';
import { Card, Typography, Button, Tooltip } from 'shared/ui/atoms';
import { useFavorites } from 'shared/hooks/useFavorites';
import { ComponentIcon, StarIconComponent } from './ComponentIcon';
import type { BlockSpec } from 'shared/config/blockRegistry';

interface ComponentCardProps {
	spec: BlockSpec<any>;
	onAdd?: () => void;
	disabled?: boolean;
	creating?: boolean;
}

const ComponentCard: React.FC<ComponentCardProps> = ({
	spec,
	onAdd,
	disabled = false,
	creating = false
}) => {
	const [isHovered, setIsHovered] = useState(false);
	const { isFavorite, toggleFavorite } = useFavorites();

	// console.log('ComponentCard: Rendering for spec:', spec.name, 'with onAdd:', !!onAdd);

	const tooltipContent = (
		<div className="space-y-2">
			<div className="font-semibold text-blue-100">{spec.name}</div>
			{spec.description && (
				<div className="text-sm text-blue-50/90">{spec.description}</div>
			)}
			{spec.tags && spec.tags.length > 0 && (
				<div className="flex flex-wrap gap-1 mt-2">
					{spec.tags.slice(0, 3).map((tag, index) => (
						<span
							key={index}
							className="px-2 py-1 text-xs bg-blue-500/20 text-blue-100 rounded-full"
						>
							{tag}
						</span>
					))}
				</div>
			)}
			<div className="text-xs text-blue-200/70 mt-2">
				Тип: {spec.type}
			</div>
		</div>
	);

	return (
		<Tooltip content={tooltipContent} position="top" delay={500}>
			<Card
				className={`
					group relative p-4 transition-all duration-200 ease-out cursor-pointer
					hover:shadow-lg hover:scale-[1.02] hover:-translate-y-0.5
					${disabled ? 'opacity-50 cursor-not-allowed' : ''}
					border-2 hover:border-blue-200 dark:hover:border-blue-700
					${isHovered ? 'ring-2 ring-blue-100 dark:ring-blue-800' : ''}
				`}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
				onClick={(e) => {
					console.log('🎯 CARD: Clicked on card for:', spec.name);
					e.stopPropagation();
					if (!disabled && !creating) {
						console.log('🎯 CARD: Calling onAdd for:', spec.name);
						onAdd?.();
					} else {
						console.log('🎯 CARD: Click ignored - disabled:', disabled, 'creating:', creating);
					}
				}}
			>
			{/* Иконка и основная информация */}
			<div className="flex items-start gap-3 mb-3">
				{/* Иконка */}
				<div className={`
					flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-colors duration-200
					${isHovered ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-gray-50 dark:bg-gray-800'}
					group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50
				`}>
					<ComponentIcon
						name={spec.icon}
						className="w-6 h-6 text-gray-700 dark:text-gray-300"
						fallback={
							<div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded flex items-center justify-center text-xs text-gray-600 dark:text-gray-400">
								{spec.name.charAt(0).toUpperCase()}
							</div>
						}
					/>
				</div>

				{/* Заголовок и описание */}
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 mb-1">
						<Typography
							as="h3"
							variant="h4"
							className="font-semibold text-gray-900 dark:text-gray-100 truncate flex-1"
						>
							{spec.name}
						</Typography>

						{/* Кнопка избранного */}
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								toggleFavorite(spec.type);
							}}
							className={`
								p-1 rounded-md transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700
								${isFavorite(spec.type)
									? 'text-yellow-500 hover:text-yellow-600'
									: 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
								}
							`}
							aria-label={isFavorite(spec.type) ? 'Удалить из избранного' : 'Добавить в избранное'}
						>
							<StarIconComponent
								className={`w-4 h-4 ${isFavorite(spec.type) ? 'text-yellow-500' : 'text-gray-400'}`}
								filled={isFavorite(spec.type)}
							/>
						</button>
					</div>
					{spec.description && (
						<p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
							{spec.description}
						</p>
					)}
				</div>

				{/* Категория */}
				<div className="flex-shrink-0">
					<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
						{spec.category}
					</span>
				</div>
			</div>

			{/* Кнопка "Добавить" - появляется при наведении */}
			<div className={`
				flex justify-end transition-opacity duration-200
				${isHovered ? 'opacity-100' : 'opacity-0'}
			`}>
				<Button
					size="sm"
					disabled={creating || disabled}
					onClick={async (e) => {
						e.stopPropagation();
						console.log('🔘 BUTTON: Add clicked for:', spec.name);
						console.log('🔘 BUTTON: onAdd exists:', !!onAdd);
						if (onAdd) {
							console.log('🔘 BUTTON: Calling onAdd...');
							try {
								await onAdd();
								console.log('✅ BUTTON: Block added successfully');
							} catch (error) {
								console.error('❌ BUTTON: Failed to add block:', error);
							}
						} else {
							console.warn('❌ BUTTON: onAdd function not provided');
						}
					}}
					className="shadow-sm hover:shadow-md transition-shadow duration-200"
				>
					{creating ? 'Добавление…' : 'Добавить'}
				</Button>
			</div>

			{/* Эффект свечения при наведении */}
			<div className={`
				absolute inset-0 rounded-lg pointer-events-none transition-opacity duration-200
				${isHovered ? 'opacity-100' : 'opacity-0'}
				shadow-[0_0_0_1px_rgba(59,130,246,0.1)] dark:shadow-[0_0_0_1px_rgba(59,130,246,0.3)]
			`} />
		</Card>
		</Tooltip>
	);
};

export default ComponentCard;
