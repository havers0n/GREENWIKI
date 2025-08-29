import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Spinner } from 'shared/ui/atoms';
import BlockLibrary from 'widgets/BlockLibrary';
import RevisionsModal from 'widgets/RevisionsModal';
import { Modal } from 'shared/ui/molecules';
import { ReusableBlocksLibrary } from 'features/ReusableBlocksLibrary';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { setLibraryOpen } from 'store/slices/reusableBlocksSlice';
import type { Database } from '@my-forum/db-types';

type PageRow = Database['public']['Tables']['pages']['Row'];

interface EditorToolbarProps {
  pageIdentifier: string;
  isDirty: boolean;
  saving: boolean;
  saveError: string | null;
  onSave: () => Promise<void>;
  onCancel: () => Promise<void>;
  onAddBlock: (type: string) => Promise<void>;
  adding: boolean;

  // Templates
  // Templates removed - will be implemented later
  // templates: Array<{ id: string; title: string; blocks: unknown[] }>;
  // templatesLoading: boolean;
  // onApplyTemplate: (templateId: string) => Promise<void>;
  // applyingTemplate: boolean;
  // currentBlocks: any[];

  // Revisions
  revisions: Array<{ id: string; created_at: string }>;
  revisionsLoading: boolean;
  reverting: boolean;
  onCreateRevision: () => Promise<void>;
  onRevertRevision: (revisionId: string) => Promise<void>;

  // Pages navigation
  pages: PageRow[];
  pagesLoading: boolean;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  pageIdentifier,
  isDirty,
  saving,
  saveError,
  onSave,
  onCancel,
  onAddBlock,
  adding,
  revisions,
  revisionsLoading,
  reverting,
  onCreateRevision,
  onRevertRevision,
  pages,
  pagesLoading,
}) => {
  console.log('EditorToolbar: Rendering with pageIdentifier:', pageIdentifier);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [showBlockLibrary, setShowBlockLibrary] = useState(false);
  // const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showRevisionsModal, setShowRevisionsModal] = useState(false);

  // Получаем состояние библиотеки переиспользуемых блоков
  const isReusableLibraryOpen = useAppSelector(state => state.reusableBlocks.isLibraryOpen);

  const handlePageChange = (pageSlug: string) => {
    if (pageSlug !== pageIdentifier) {
      // Проверяем на несохраненные изменения
      if (isDirty) {
        const confirmMessage = 'У вас есть несохраненные изменения. Вы действительно хотите перейти к другой странице? Все изменения будут потеряны.';
        if (!window.confirm(confirmMessage)) {
          return;
        }
      }
      navigate(`/admin/editor/${pageSlug}`);
    }
  };

  return (
    <>
      <Card className="p-4 border-b">
        <div className="flex items-center justify-between">
          {/* Левая часть - основные действия */}
          <div className="flex items-center gap-3">
            <Typography as="h1" variant="h1" className="text-xl font-bold">
              Редактор страницы
            </Typography>

            {/* Выбор страницы */}
            <div className="flex items-center gap-2">
              <select
                value={pageIdentifier}
                onChange={(e) => handlePageChange(e.target.value)}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                disabled={pagesLoading}
              >
                {pagesLoading ? (
                  <option disabled>Загрузка...</option>
                ) : (
                  pages.map((page) => (
                    <option key={page.id} value={page.slug}>
                      {page.title} ({page.slug})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                onClick={() => {
                  console.log('📚 LIBRARY: Opening block library');
                  setShowBlockLibrary(true);
                }}
                disabled={adding}
              >
                ➕ Добавить блок
              </Button>

              <Button
                variant="secondary"
                onClick={() => {
                  console.log('🔄 REUSABLE: Opening reusable blocks library');
                  dispatch(setLibraryOpen(true));
                }}
              >
                📚 Переиспользуемые блоки
              </Button>

              {/* <Button
                variant="secondary"
                onClick={() => setShowTemplatesModal(true)}
                disabled={templatesLoading}
              >
                📄 Шаблоны
              </Button> */}

              <Button
                variant="secondary"
                onClick={() => setShowRevisionsModal(true)}
                disabled={revisionsLoading}
              >
                🕒 Ревизии
              </Button>
            </div>
          </div>

          {/* Правая часть - статус сохранения */}
          <div className="flex items-center gap-3">
            {isDirty ? (
              <>
                <span className="text-sm text-orange-600 dark:text-orange-400 flex items-center gap-1">
                  <span className="animate-pulse">●</span>
                  Есть несохраненные изменения
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" disabled={saving} onClick={onCancel}>
                    Отменить
                  </Button>
                  <Button onClick={onSave} disabled={saving}>
                    {saving ? (
                      <>
                        <Spinner className="w-4 h-4 mr-1" />
                        Сохранение…
                      </>
                    ) : (
                      'Сохранить'
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                ✓ Все изменения сохранены
              </span>
            )}
          </div>
        </div>
        
        {saveError && (
          <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-300">
            {saveError}
          </div>
        )}
      </Card>

      {/* Модальное окно библиотеки блоков */}
      {showBlockLibrary && (
        <Modal
          isOpen={showBlockLibrary}
          onClose={() => {
            console.log('EditorToolbar: Modal closed');
            setShowBlockLibrary(false);
          }}
          title="Библиотека компонентов"
        >
          <BlockLibrary
            onAddBlock={async (type) => {
              console.log('📚 LIBRARY: onAddBlock called with type:', type);
              try {
                console.log('📚 LIBRARY: Calling onAddBlock...');
                await onAddBlock(type);
                console.log('✅ LIBRARY: Block added successfully');
                setShowBlockLibrary(false);
              } catch (error) {
                console.error('❌ LIBRARY: Error adding block:', error);
              }
            }}
            creating={adding}
          />
        </Modal>
      )}

      {/* Менеджер шаблонов - временно отключен */}
      {/* <TemplatesManager
        isOpen={showTemplatesModal}
        onClose={() => setShowTemplatesModal(false)}
        onApplyTemplate={(blocks) => {
          // Преобразуем блоки в формат, ожидаемый системой
          // Здесь можно добавить логику преобразования если нужно
          console.log('Applying template with blocks:', blocks);
          // Пока просто закрываем, реальная логика будет в родительском компоненте
          setShowTemplatesModal(false);
        }}
        currentBlocks={currentBlocks}
      /> */}

      {/* Модальное окно ревизий */}
      <RevisionsModal
        isOpen={showRevisionsModal}
        onClose={() => setShowRevisionsModal(false)}
        revisions={revisions}
        loading={revisionsLoading}
        reverting={reverting}
        onCreateRevision={onCreateRevision}
        onRevertRevision={onRevertRevision}
      />

      {/* Библиотека переиспользуемых блоков */}
      <ReusableBlocksLibrary
        isOpen={isReusableLibraryOpen}
        onClose={() => dispatch(setLibraryOpen(false))}
      />
    </>
  );
};

export default EditorToolbar;
