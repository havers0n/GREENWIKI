import React, { useState, useEffect } from 'react';
import { Modal, TextInput, Textarea, Card, Text, Group, ActionIcon, Tooltip } from '@mantine/core';
import { Button } from 'shared/ui/atoms';
// Используем эмодзи вместо @tabler/icons-react для простоты
import { useTemplates } from './useTemplates';
import type { Database } from '@my-forum/db-types';

type PageTemplate = Database['public']['Tables']['page_templates']['Row'];

interface TemplatesManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate: (blocks: any[]) => void;
  currentBlocks: any[];
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

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen, loadTemplates]);

  const handleCreateTemplate = async () => {
    if (!newTemplateTitle.trim()) return;

    await createTemplate({
      title: newTemplateTitle.trim(),
      description: newTemplateDescription.trim() || undefined,
      blocks: currentBlocks,
    });

    setNewTemplateTitle('');
    setNewTemplateDescription('');
    setShowCreateModal(false);
  };

  const handleApplyTemplate = (template: PageTemplate) => {
    if (template.blocks && Array.isArray(template.blocks)) {
      onApplyTemplate(template.blocks);
      onClose();
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    await deleteTemplate(templateId);
  };

  return (
    <>
      <Modal
        opened={isOpen}
        onClose={onClose}
        title="Шаблоны страниц"
        size="lg"
        centered
      >
        <div className="space-y-4">
          {/* Кнопка создания нового шаблона */}
          <Button
            leftIcon={<span>➕</span>}
            onClick={() => setShowCreateModal(true)}
            fullWidth
            variant="secondary"
          >
            Сохранить текущую страницу как шаблон
          </Button>

          {/* Список шаблонов */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8">
                <Text size="sm" color="dimmed">Загрузка шаблонов...</Text>
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📄</div>
                <Text size="sm" color="dimmed">Шаблоны не найдены</Text>
                <Text size="xs" color="dimmed" mt="xs">
                  Создайте свой первый шаблон из текущей страницы
                </Text>
              </div>
            ) : (
              templates.map((template) => (
                <Card key={template.id} shadow="sm" padding="sm" withBorder>
                  <Group justify="space-between" align="flex-start">
                    <div className="flex-1">
                      <Text fw={500} size="sm" lineClamp={1}>
                        {template.title}
                      </Text>
                      {template.description && (
                        <Text size="xs" color="dimmed" lineClamp={2} mt="xs">
                          {template.description}
                        </Text>
                      )}
                      <Text size="xs" color="dimmed" mt="xs">
                        Создан: {new Date(template.created_at).toLocaleDateString('ru-RU')}
                      </Text>
                    </div>
                    <Group gap="xs">
                      <Tooltip label="Применить шаблон">
                        <ActionIcon
                          variant="light"
                          color="blue"
                          onClick={() => handleApplyTemplate(template)}
                        >
                          📄
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Удалить шаблон">
                        <ActionIcon
                          variant="light"
                          color="red"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          🗑️
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Group>
                </Card>
              ))
            )}
          </div>
        </div>
      </Modal>

      {/* Модальное окно создания шаблона */}
      <Modal
        opened={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Создать шаблон"
        size="md"
        centered
      >
        <div className="space-y-4">
          <TextInput
            label="Название шаблона"
            placeholder="Введите название шаблона"
            value={newTemplateTitle}
            onChange={(e) => setNewTemplateTitle(e.target.value)}
            required
          />
          <Textarea
            label="Описание"
            placeholder="Краткое описание шаблона (необязательно)"
            value={newTemplateDescription}
            onChange={(e) => setNewTemplateDescription(e.target.value)}
            minRows={3}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
              Отмена
            </Button>
            <Button onClick={handleCreateTemplate} disabled={!newTemplateTitle.trim()}>
              Создать шаблон
            </Button>
          </Group>
        </div>
      </Modal>
    </>
  );
};
