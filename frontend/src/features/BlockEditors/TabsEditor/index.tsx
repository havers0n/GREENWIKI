import React from 'react';
import { Input, Button } from 'shared/ui/atoms';

interface TabItem {
  id: string;
  title: string;
}

interface TabsBlockData {
  tabs: TabItem[];
  activeTab?: string;
}

interface TabsEditorProps {
  data: TabsBlockData;
  onChange: (data: TabsBlockData) => void;
}

const TabsEditor: React.FC<TabsEditorProps> = ({ data, onChange }) => {
  const { tabs = [], activeTab } = data;

  const handleAddTab = () => {
    const newId = `tab${Date.now()}`;
    const newTab: TabItem = {
      id: newId,
      title: `Вкладка ${tabs.length + 1}`
    };
    const newTabs = [...tabs, newTab];
    onChange({
      tabs: newTabs,
      activeTab: activeTab || newTab.id
    });
  };

  const handleRemoveTab = (index: number) => {
    if (tabs.length <= 1) return; // Минимум одна вкладка

    const newTabs = tabs.filter((_, i) => i !== index);
    let newActiveTab = activeTab;

    // Если удалена активная вкладка, выбираем первую оставшуюся
    if (activeTab === tabs[index].id) {
      newActiveTab = newTabs.length > 0 ? newTabs[0].id : '';
    }

    onChange({
      tabs: newTabs,
      activeTab: newActiveTab
    });
  };

  const handleUpdateTab = (index: number, updates: Partial<TabItem>) => {
    const newTabs = [...tabs];
    newTabs[index] = { ...newTabs[index], ...updates };

    // Если изменился ID активной вкладки, обновляем activeTab
    let newActiveTab = activeTab;
    if (updates.id && activeTab === tabs[index].id) {
      newActiveTab = updates.id;
    }

    onChange({
      tabs: newTabs,
      activeTab: newActiveTab
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Настройка вкладок</h3>
        <Button onClick={handleAddTab} variant="secondary" size="sm">
          + Добавить вкладку
        </Button>
      </div>

      <div className="space-y-3">
        {tabs.map((tab, index) => (
          <div key={tab.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Input
                  label={`Название вкладки ${index + 1}`}
                  value={tab.title}
                  onChange={(e) => handleUpdateTab(index, { title: e.target.value })}
                  placeholder="Введите название вкладки"
                />
              </div>

              <div className="flex-shrink-0">
                <Input
                  label="ID вкладки"
                  value={tab.id}
                  onChange={(e) => handleUpdateTab(index, { id: e.target.value })}
                  placeholder="tab1"
                />
              </div>

              {tabs.length > 1 && (
                <Button
                  onClick={() => handleRemoveTab(index)}
                  variant="danger"
                  size="sm"
                  className="self-end"
                >
                  Удалить
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {tabs.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Совет:</strong> Перетащите блоки из библиотеки в области вкладок для создания вложенного контента.
          </div>
        </div>
      )}
    </div>
  );
};

export default TabsEditor;
