import { useState, useEffect } from 'react';

const FAVORITES_KEY = 'block-library-favorites';

export const useFavorites = () => {
	const [favorites, setFavorites] = useState<Set<string>>(new Set());

	useEffect(() => {
		// Загружаем избранное из localStorage
		const saved = localStorage.getItem(FAVORITES_KEY);
		if (saved) {
			try {
				const parsed = JSON.parse(saved);
				setFavorites(new Set(parsed));
			} catch (error) {
				console.warn('Failed to parse favorites from localStorage:', error);
			}
		}
	}, []);

	const toggleFavorite = (blockType: string) => {
		setFavorites(prev => {
			const newFavorites = new Set(prev);
			if (newFavorites.has(blockType)) {
				newFavorites.delete(blockType);
			} else {
				newFavorites.add(blockType);
			}

			// Сохраняем в localStorage
			localStorage.setItem(FAVORITES_KEY, JSON.stringify([...newFavorites]));
			return newFavorites;
		});
	};

	const isFavorite = (blockType: string) => {
		return favorites.has(blockType);
	};

	const getFavorites = () => {
		return Array.from(favorites);
	};

	return {
		favorites: getFavorites(),
		isFavorite,
		toggleFavorite,
	};
};
