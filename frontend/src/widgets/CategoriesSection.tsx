import React, { useState, useEffect } from 'react';
import { Typography, Card } from '@my-forum/ui';
import { CategoryCard } from 'entities/category';
import { fetchCategories } from 'shared/api/categories';
import { fetchSectionsByCategoryId } from 'shared/api/sections';
import type { Database } from '@my-forum/db-types';

type Category = Database['public']['Tables']['categories']['Row'];
type Section = Database['public']['Tables']['sections']['Row'];

interface CategoriesSectionProps {
  title?: string;
  description?: string;
}

const LoadingState = {
  Loading: 'loading',
  Loaded: 'loaded',
  Error: 'error',
  Empty: 'empty',
} as const;

type LoadingState = typeof LoadingState[keyof typeof LoadingState];

const CategoriesSection: React.FC<CategoriesSectionProps> = ({
  title = "Общие категории",
  description = "Здесь вы можете найти любую информацию о серверах Majestic и его системах"
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [sectionsByCategory, setSectionsByCategory] = useState<Record<number, Section[]>>({});
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.Loading);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingState(LoadingState.Loading);
        const categoriesData = await fetchCategories();

        if (categoriesData.length === 0) {
          setLoadingState(LoadingState.Empty);
          return;
        }

        setCategories(categoriesData);

        // Загружаем секции для каждой категории
        const sectionsPromises = categoriesData.map(async (category) => {
          try {
            const sections = await fetchSectionsByCategoryId(category.id);
            return { categoryId: category.id, sections };
          } catch (error) {
            console.error(`Failed to load sections for category ${category.id}:`, error);
            return { categoryId: category.id, sections: [] };
          }
        });

        const sectionsResults = await Promise.all(sectionsPromises);
        const sectionsMap: Record<number, Section[]> = {};
        sectionsResults.forEach(({ categoryId, sections }) => {
          sectionsMap[categoryId] = sections;
        });

        setSectionsByCategory(sectionsMap);
        setLoadingState(LoadingState.Loaded);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoadingState(LoadingState.Error);
      }
    };

    loadCategories();
  }, []);

  const getIconName = (iconSvg: string | null): string => {
    if (!iconSvg) return 'folder';
    // Простое преобразование SVG в имя иконки
    // В реальном проекте здесь может быть более сложная логика
    if (iconSvg.includes('server')) return 'server';
    if (iconSvg.includes('map')) return 'map';
    if (iconSvg.includes('history')) return 'history';
    if (iconSvg.includes('male')) return 'male';
    if (iconSvg.includes('female')) return 'female';
    if (iconSvg.includes('garage')) return 'garage';
    return 'folder';
  };

  if (loadingState === LoadingState.Loading) {
    return <div>Loading...</div>;
  }

  if (loadingState === LoadingState.Error) {
    return <div>Error fetching data: {error}</div>;
  }

  if (loadingState === LoadingState.Empty) {
    return <div>No categories available.</div>;
  }

  return (
    <section className="space-y-8">
      <div className="space-y-4">
        <Typography as="h1" variant="h1">{title}</Typography>
        <Typography as="p" variant="body">{description}</Typography>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            icon={getIconName(category.icon_svg)}
            title={category.name}
            description={`Категория: ${category.name}`}
          />
        ))}
      </div>

      {/* Category Sections */}
      {Object.entries(sectionsByCategory).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(sectionsByCategory).map(([categoryId, sections]) => {
            const category = categories.find(cat => cat.id === parseInt(categoryId));
            if (!category || sections.length === 0) return null;

            return (
              <Card key={categoryId}>
                <div className="p-6">
                  <Typography as="h3" variant="h3" className="mb-3">{category.name}</Typography>
                  <ul className="space-y-2">
                    {sections.map(section => (
                      <li key={section.id}>
                        <Typography as="a" href={section.external_url || '#'} variant="link" className="text-majestic-dark hover:text-majestic-pink">
                          {section.name}
                        </Typography>
                        {section.description && (
                          <Typography as="p" variant="small" className="text-majestic-gray-300 mt-1">
                            {section.description}
                          </Typography>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default CategoriesSection;
