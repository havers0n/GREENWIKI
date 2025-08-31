import React, { useState, useEffect, useMemo } from 'react';
import { Plus } from 'lucide-react';
import {
  Modal,
  Button,
  Input,
  Textarea,
  Card,
  ActionIcon,
  Tooltip
} from '@my-forum/ui';
import { useTemplates } from './useTemplates';
import type { Database } from '@my-forum/db-types';
import type { BlockNode } from '../../types/api';

type PageTemplate = Database['public']['Tables']['page_templates']['Row'];

interface TemplatesManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate: (blocks: BlockNode[]) => void;
  currentBlocks: BlockNode[];
}

export const TemplatesManager: React.FC<TemplatesManagerProps> = ({
  isOpen,
  onClose,
  onApplyTemplate,
  currentBlocks,
}) => {
  const { templates, loading, createTemplate, deleteTemplate, loadTemplates } = useTemplates();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTemplateTitle, setNewTemplateTitle] = useState('');
  const [newTemplateDescription, setNewTemplateDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen, loadTemplates]);

  // Валидация полей формы
  const validateField = (fieldName: string, value: string) => {
    const newErrors = { ...errors };

    switch (fieldName) {
      case 'title':
        if (!value.trim()) {
          newErrors.title = 'Название шаблона обязательно для заполнения';
        } else if (value.trim().length < 2) {
          newErrors.title = 'Название должно содержать минимум 2 символа';
        } else if (value.trim().length > 100) {
          newErrors.title = 'Название не может превышать 100 символов';
        } else {
          delete newErrors.title;
        }
        break;

      case 'description':
        if (value.length > 500) {
          newErrors.description = 'Описание не может превышать 500 символов';
        } else {
          delete newErrors.description;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    validateField(fieldName, value);
  };

  const canCreate = useMemo(() => {
    return Object.keys(errors).length === 0 &&
           newTemplateTitle.trim().length >= 2 &&
           newTemplateTitle.trim().length <= 100;
  }, [errors, newTemplateTitle]);

  const handleCreateTemplate = async () => {
    // Финальная валидация перед отправкой
    validateField('title', newTemplateTitle);
    validateField('description', newTemplateDescription);

    if (!canCreate || Object.keys(errors).length > 0) {
      return;
    }

    setCreating(true);
    try {
      await createTemplate({
        title: newTemplateTitle.trim(),
        description: newTemplateDescription.trim() || undefined,
        blocks: currentBlocks,
      });

      setNewTemplateTitle('');
      setNewTemplateDescription('');
      setErrors({});
      setShowCreateModal(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Не удалось создать шаблон. Попробуйте еще раз.';
      setErrors({
        submit: errorMessage
      });
    } finally {
      setCreating(false);
    }
  };

  const handleApplyTemplate = (template: PageTemplate) => {
    if (template.blocks && Array.isArray(template.blocks)) {
      onApplyTemplate(template.blocks as unknown as BlockNode[]);
      onClose();
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    await deleteTemplate(templateId);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Шаблоны страниц"
        size="lg"
        centered
      >
        <div className="space-y-6">
          {/* Кнопка создания нового шаблона */}
          <Button
            onClick={() => setShowCreateModal(true)}
            fullWidth
            variant="secondary"
            leftIcon={Plus as any}
            size="md"
          >
            Сохранить текущую страницу как шаблон
          </Button>

          {/* Список шаблонов */}
          <div className="max-h-96 overflow-y-auto space-y-3">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--color-majestic-pink)]"></div>
                  <p className="text-[var(--color-text-secondary)]">Загрузка шаблонов...</p>
                </div>
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">📄</div>
                <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">
                  Шаблоны не найдены
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Создайте свой первый шаблон из текущей страницы
                </p>
              </div>
            ) : (
              templates.map((template) => (
                <Card key={template.id} shadow="sm" padding="md">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-[var(--color-text-primary)] text-sm line-clamp-1">
                        {template.title}
                      </h4>
                      {template.description && (
                        <p className="text-xs text-[var(--color-text-secondary)] mt-1 line-clamp-2">
                          {template.description}
                        </p>
                      )}
                      <p className="text-xs text-[var(--color-text-muted)] mt-2">
                        Создан: {new Date(template.created_at).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Tooltip content="Применить шаблон">
                        <ActionIcon
                          variant="light"
                          color="primary"
                          aria-label="Применить шаблон"
                          onClick={() => handleApplyTemplate(template)}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <path
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip content="Удалить шаблон">
                        <ActionIcon
                          variant="light"
                          color="danger"
                          aria-label="Удалить шаблон"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <path
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </ActionIcon>
                      </Tooltip>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </Modal>

      {/* Модальное окно создания шаблона */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setErrors({});
          setNewTemplateTitle('');
          setNewTemplateDescription('');
        }}
        title="Создать шаблон"
        size="md"
        centered
      >
        <div className="space-y-6">
          {errors.submit && (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                {errors.submit}
              </p>
            </div>
          )}

          <Input
            label="Название шаблона"
            type="text"
            placeholder="Введите название шаблона"
            value={newTemplateTitle}
            onChange={(e) => {
              setNewTemplateTitle(e.target.value);
              handleFieldChange('title', e.target.value);
            }}
            error={errors.title}
            hint="Название должно содержать от 2 до 100 символов"
            required
            disabled={creating}
          />

          <Textarea
            label="Описание"
            placeholder="Краткое описание шаблона (необязательно)"
            value={newTemplateDescription}
            onChange={(e) => {
              setNewTemplateDescription(e.target.value);
              handleFieldChange('description', e.target.value);
            }}
            error={errors.description}
            hint="Максимум 500 символов"
            rows={4}
            disabled={creating}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border-default)]">
            <Button
              variant="ghost"
              onClick={() => {
                setShowCreateModal(false);
                setErrors({});
                setNewTemplateTitle('');
                setNewTemplateDescription('');
              }}
              disabled={creating}
              size="sm"
            >
              Отмена
            </Button>
            <Button
              onClick={handleCreateTemplate}
              loading={creating}
              disabled={!canCreate || creating}
              size="sm"
            >
              {creating ? 'Создание...' : 'Создать шаблон'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
