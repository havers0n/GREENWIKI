import { useState, useCallback } from 'react';
import type { Database } from '@my-forum/db-types';

type PageTemplate = Database['public']['Tables']['page_templates']['Row'];

interface CreateTemplateData {
  title: string;
  description?: string;
  blocks: any[];
}

export const useTemplates = () => {
  const [templates, setTemplates] = useState<PageTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/templates');
      if (!response.ok) throw new Error('Failed to load templates');

      const result = await response.json();
      setTemplates(result.data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTemplate = useCallback(async (data: CreateTemplateData) => {
    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to create template');

      const result = await response.json();
      setTemplates(prev => [result.data, ...prev]);
      return result.data;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  }, []);

  const deleteTemplate = useCallback(async (templateId: string) => {
    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete template');

      setTemplates(prev => prev.filter(template => template.id !== templateId));
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  }, []);

  return {
    templates,
    loading,
    loadTemplates,
    createTemplate,
    deleteTemplate,
  };
};
