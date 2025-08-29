import React from 'react';
import { Input, Button } from 'shared/ui/atoms';

interface AccordionItem {
  id: string;
  title: string;
}

interface AccordionBlockData {
  sections: AccordionItem[];
  expandedSections?: string[];
}

interface AccordionEditorProps {
  data: AccordionBlockData;
  onChange: (data: AccordionBlockData) => void;
}

const AccordionEditor: React.FC<AccordionEditorProps> = ({ data, onChange }) => {
  const { sections = [], expandedSections = [] } = data;

  const handleAddSection = () => {
    const newId = `section${Date.now()}`;
    const newSection: AccordionItem = {
      id: newId,
      title: `Секция ${sections.length + 1}`
    };
    const newSections = [...sections, newSection];
    onChange({
      sections: newSections,
      expandedSections
    });
  };

  const handleRemoveSection = (index: number) => {
    const newSections = sections.filter((_, i) => i !== index);
    const newExpandedSections = expandedSections.filter(id => id !== sections[index].id);

    onChange({
      sections: newSections,
      expandedSections: newExpandedSections
    });
  };

  const handleUpdateSection = (index: number, updates: Partial<AccordionItem>) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], ...updates };

    // Если изменился ID секции, обновляем expandedSections
    let newExpandedSections = [...expandedSections];
    if (updates.id && expandedSections.includes(sections[index].id)) {
      newExpandedSections = newExpandedSections.filter(id => id !== sections[index].id);
      newExpandedSections.push(updates.id);
    }

    onChange({
      sections: newSections,
      expandedSections: newExpandedSections
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Настройка секций аккордеона</h3>
        <Button onClick={handleAddSection} variant="secondary" size="sm">
          + Добавить секцию
        </Button>
      </div>

      <div className="space-y-3">
        {sections.map((section, index) => (
          <div key={section.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Input
                  label={`Название секции ${index + 1}`}
                  value={section.title}
                  onChange={(e) => handleUpdateSection(index, { title: e.target.value })}
                  placeholder="Введите название секции"
                />
              </div>

              <div className="flex-shrink-0">
                <Input
                  label="ID секции"
                  value={section.id}
                  onChange={(e) => handleUpdateSection(index, { id: e.target.value })}
                  placeholder="section1"
                />
              </div>

              <Button
                onClick={() => handleRemoveSection(index)}
                variant="danger"
                size="sm"
                className="self-end"
              >
                Удалить
              </Button>
            </div>
          </div>
        ))}
      </div>

      {sections.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Совет:</strong> Перетащите блоки из библиотеки в области секций для создания вложенного контента.
          </div>
        </div>
      )}
    </div>
  );
};

export default AccordionEditor;
