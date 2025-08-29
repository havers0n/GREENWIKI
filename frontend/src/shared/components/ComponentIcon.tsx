// Статические импорты всех иконок как URL
import React from 'react';

// Импорт иконок как URL строк
const headerIcon = new URL('../../assets/icons/components/header.svg', import.meta.url).href;
const paragraphIcon = new URL('../../assets/icons/components/paragraph.svg', import.meta.url).href;
const imageIcon = new URL('../../assets/icons/components/image.svg', import.meta.url).href;
const buttonIcon = new URL('../../assets/icons/components/button.svg', import.meta.url).href;
const spacerIcon = new URL('../../assets/icons/components/spacer.svg', import.meta.url).href;
const tabsIcon = new URL('../../assets/icons/components/tabs.svg', import.meta.url).href;
const accordionIcon = new URL('../../assets/icons/components/accordion.svg', import.meta.url).href;
const containerIcon = new URL('../../assets/icons/components/container.svg', import.meta.url).href;
const categoriesIcon = new URL('../../assets/icons/components/categories.svg', import.meta.url).href;
const buttonGroupIcon = new URL('../../assets/icons/components/button-group.svg', import.meta.url).href;
const controlsIcon = new URL('../../assets/icons/components/controls.svg', import.meta.url).href;
const propertiesIcon = new URL('../../assets/icons/components/properties.svg', import.meta.url).href;
const animationsIcon = new URL('../../assets/icons/components/animations.svg', import.meta.url).href;
const changelogIcon = new URL('../../assets/icons/components/changelog.svg', import.meta.url).href;
const starIcon = new URL('../../assets/icons/components/star.svg', import.meta.url).href;

// Маппинг имен иконок на URL
const iconMap: Record<string, string> = {
	'header': headerIcon,
	'paragraph': paragraphIcon,
	'image': imageIcon,
	'button': buttonIcon,
	'spacer': spacerIcon,
	'tabs': tabsIcon,
	'accordion': accordionIcon,
	'container': containerIcon,
	'categories': categoriesIcon,
	'button-group': buttonGroupIcon,
	'controls': controlsIcon,
	'properties': propertiesIcon,
	'animations': animationsIcon,
	'changelog': changelogIcon,
	'star': starIcon,
};

interface ComponentIconProps {
	name: string;
	className?: string;
	fallback?: React.ReactNode;
}

export const ComponentIcon: React.FC<ComponentIconProps> = ({
	name,
	className = '',
	fallback
}) => {
	const iconUrl = iconMap[name];

	if (!iconUrl) {
		return fallback ? (
			<>{fallback}</>
		) : (
			<div className={`w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded flex items-center justify-center text-xs text-gray-600 dark:text-gray-400 ${className}`}>
				?
			</div>
		);
	}

	return (
		<img
			src={iconUrl}
			alt={`${name} icon`}
			className={`w-6 h-6 ${className}`}
			loading="lazy"
		/>
	);
};

// Специальный компонент для звездочки избранного
export const StarIconComponent: React.FC<{ className?: string; filled?: boolean }> = ({
	className = '',
	filled = false
}) => {
	return (
		<img
			src={starIcon}
			alt="star icon"
			className={`w-4 h-4 ${filled ? '' : 'opacity-50'} ${className}`}
			style={{
				filter: filled
					? 'brightness(0) saturate(100%) invert(81%) sepia(81%) saturate(1184%) hue-rotate(358deg) brightness(106%) contrast(108%)'
					: 'brightness(0) saturate(100%) invert(62%) sepia(8%) saturate(0%) hue-rotate(0deg) brightness(96%) contrast(91%)'
			}}
			loading="lazy"
		/>
	);
};
