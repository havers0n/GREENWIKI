// Утилита для загрузки иконок компонентов
// Используем URL-подход вместо динамических импортов SVG как компонентов
export const loadIconUrl = (iconName: string): string => {
	try {
		return new URL(`../../assets/icons/components/${iconName}.svg`, import.meta.url).href;
	} catch (error) {
		console.warn(`Icon ${iconName} not found, falling back to default`);
		return '';
	}
};

// Кэш URL иконок
const iconUrlCache = new Map<string, string>();

export const getCachedIconUrl = (iconName: string): string => {
	if (iconUrlCache.has(iconName)) {
		return iconUrlCache.get(iconName)!;
	}

	const iconUrl = loadIconUrl(iconName);
	if (iconUrl) {
		iconUrlCache.set(iconName, iconUrl);
	}
	return iconUrl;
};

// Устаревшие функции - оставлены для совместимости, но не рекомендуются к использованию
export const loadIcon = async (_iconName: string): Promise<React.ComponentType<any> | null> => {
	console.warn('loadIcon is deprecated. Use ComponentIcon component instead.');
	return null;
};

export const getCachedIcon = async (_iconName: string): Promise<React.ComponentType<any> | null> => {
	console.warn('getCachedIcon is deprecated. Use ComponentIcon component instead.');
	return null;
};
