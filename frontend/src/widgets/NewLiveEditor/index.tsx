import React, { useEffect, useState } from 'react';
import type { Database, TablesInsert } from '@my-forum/db-types';
import { Card, Spinner } from 'shared/ui/atoms';
import BlockRenderer from 'widgets/BlockRenderer';
import EditorToolbar from 'widgets/EditorToolbar';
import ContextualInspector from 'widgets/ContextualInspector';
import { fetchAdminLayoutByPage, createLayoutBlock, updateLayoutBlock, deleteLayoutBlock, updateLayoutPositions, fetchLayoutRevisions, createLayoutRevision, revertToLayoutRevision } from 'shared/api/layout';
import { blockRegistry } from 'shared/config/blockRegistry';
import { DndContext, PointerSensor, KeyboardSensor, useSensor, useSensors, useDroppable, type DragEndEvent } from '@dnd-kit/core';
// import { fetchTemplates, createTemplate } from 'shared/api/templates';
import { fetchAdminPages } from 'shared/api/pages';
// import type { PageTemplate } from 'shared/api/templates';
import { useParams } from 'react-router-dom';

type LayoutBlock = Database['public']['Tables']['layout_blocks']['Row'];
type PageRow = Database['public']['Tables']['pages']['Row'];

interface LiveEditorProps {
  pageSlug: string;
}

const LiveEditor: React.FC<LiveEditorProps> = ({ pageSlug }) => {
  const { pageSlug: urlPageSlug } = useParams<{ pageSlug: string }>();

  	// console.log('NewLiveEditor: Initialized with pageSlug:', pageSlug);

	// Используем pageSlug из URL как источник правды
	const currentPageSlug = urlPageSlug || pageSlug || 'home';

  // Canvas drop zone для сброса элементов из библиотеки
  const { setNodeRef: setCanvasRef, isOver: isCanvasOver } = useDroppable({
    id: 'canvas-dropzone',
  });
  const [blocks, setBlocks] = useState<LayoutBlock[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [adding, setAdding] = useState<boolean>(false);
  
  // Confirm-сценарий
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [changed, setChanged] = useState<Record<string, LayoutBlock>>({});
  const [saving, setSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState<boolean>(false);
  
  // Templates - temporarily disabled
  // const [templates, setTemplates] = useState<PageTemplate[]>([]);
  // const [templatesLoading, setTemplatesLoading] = useState<boolean>(false);
  // const [applyingTemplate, setApplyingTemplate] = useState<boolean>(false);
  
  // Revisions
  const [revisions, setRevisions] = useState<Array<{ id: string; created_at: string }>>([]);
  const [revisionsLoading, setRevisionsLoading] = useState<boolean>(false);
  const [reverting, setReverting] = useState<boolean>(false);

  // Pages navigation
  const [pages, setPages] = useState<PageRow[]>([]);
  const [pagesLoading, setPagesLoading] = useState<boolean>(false);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  // Load blocks
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchAdminLayoutByPage(currentPageSlug);
        const ordered = data
          .slice()
          .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
        if (!isMounted) return;
        setBlocks(ordered);
        setSelectedBlockId((prev) => (ordered.some((b) => b.id === prev) ? prev : null));
        setIsDirty(false);
        setChanged({});
      } catch (e: unknown) {
        if (!isMounted) return;
        const message = e instanceof Error ? e.message : 'Не удалось загрузить блоки';
        setError(message);
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };
    void load();
    return () => {
      isMounted = false;
    };
  }, [currentPageSlug]);

  // Load pages for navigation
  useEffect(() => {
    let isMounted = true;
    const loadPages = async () => {
      try {
        setPagesLoading(true);
        const data = await fetchAdminPages();
        if (!isMounted) return;
        setPages(data);
      } catch (e: unknown) {
        // Silently handle pages loading error - navigation can still work without it
        console.warn('Failed to load pages for navigation:', e);
      } finally {
        if (!isMounted) return;
        setPagesLoading(false);
      }
    };
    void loadPages();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle page change


  // Load templates - temporarily disabled
  // useEffect(() => {
  //   let mounted = true;
  //   (async () => {
  //     try {
  //       setTemplatesLoading(true);
  //       const list = await fetchTemplates();
  //       if (!mounted) return;
  //       setTemplates(list);
  //     } catch {
  //       console.warn('Не удалось загрузить шаблоны');
  //     } finally {
  //       if (!mounted) return;
  //       setTemplatesLoading(false);
  //     }
  //   })();
  //   return () => { mounted = false; };
  // }, []);

  // Load revisions
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setRevisionsLoading(true);
        const list = await fetchLayoutRevisions(currentPageSlug);
        if (!mounted) return;
        setRevisions(list.map((r) => ({ id: r.id, created_at: r.created_at })));
      } catch (error) {
        console.warn('Не удалось загрузить ревизии:', error);
        if (!mounted) return;
        setRevisions([]);
      } finally {
        if (!mounted) return;
        setRevisionsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [currentPageSlug]);

  const handleSelectBlock = (id: string | null) => {
    console.log('🎯 SELECT: Block selected, ID:', id);
    setSelectedBlockId(id);
  };

  // Обработчик клавиш для перемещения блоков
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedBlockId) return;

      // Только если фокус не в поле ввода
      const activeElement = document.activeElement;
      const isInputFocused = activeElement instanceof HTMLInputElement ||
                           activeElement instanceof HTMLTextAreaElement ||
                           activeElement instanceof HTMLSelectElement ||
                           (activeElement as HTMLElement)?.contentEditable === 'true';

      if (isInputFocused) return;

      // Обработка стрелок
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        moveBlockLeft(selectedBlockId);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        moveBlockRight(selectedBlockId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBlockId, blocks]);

  const handleBlockChange = (updatedBlock: LayoutBlock) => {
    setBlocks((prev) => prev.map((b) => (b.id === updatedBlock.id ? updatedBlock : b)));
    setChanged((prev) => ({ ...prev, [updatedBlock.id]: updatedBlock }));
    setIsDirty(true);
  };

  // Перемещение блока влево
  const moveBlockLeft = async (blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    // Получить все блоки той же страницы
    const allPageBlocks = blocks
      .filter(b => b.page_identifier === currentPageSlug)
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

    const currentIndex = allPageBlocks.findIndex(b => b.id === blockId);
    if (currentIndex <= 0) return; // Уже первый блок

    const previousBlock = allPageBlocks[currentIndex - 1];
    const currentPosition = block.position ?? 0;
    const previousPosition = previousBlock.position ?? 0;

    try {
      // Обновляем позиции на сервере
      await updateLayoutPositions([
        { id: block.id, position: previousPosition },
        { id: previousBlock.id, position: currentPosition }
      ]);

      // Обновляем локальное состояние
      setBlocks(prev => prev.map(b => {
        if (b.id === block.id) {
          return { ...b, position: previousPosition };
        } else if (b.id === previousBlock.id) {
          return { ...b, position: currentPosition };
        }
        return b;
      }));

      setIsDirty(true);
    } catch (error) {
      console.error('Не удалось переместить блок влево:', error);
    }
  };

  // Перемещение блока вправо
  const moveBlockRight = async (blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    // Получить все блоки той же страницы
    const allPageBlocks = blocks
      .filter(b => b.page_identifier === currentPageSlug)
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

    const currentIndex = allPageBlocks.findIndex(b => b.id === blockId);
    if (currentIndex === -1 || currentIndex >= allPageBlocks.length - 1) return; // Уже последний блок

    const nextBlock = allPageBlocks[currentIndex + 1];
    const currentPosition = block.position ?? 0;
    const nextPosition = nextBlock.position ?? 0;

    try {
      // Обновляем позиции на сервере
      await updateLayoutPositions([
        { id: block.id, position: nextPosition },
        { id: nextBlock.id, position: currentPosition }
      ]);

      // Обновляем локальное состояние
      setBlocks(prev => prev.map(b => {
        if (b.id === block.id) {
          return { ...b, position: nextPosition };
        } else if (b.id === nextBlock.id) {
          return { ...b, position: currentPosition };
        }
        return b;
      }));

      setIsDirty(true);
    } catch (error) {
      console.error('Не удалось переместить блок вправо:', error);
    }
  };

  const handleAddBlockOfType = async (type: string) => {
    console.log('🏗️ EDITOR: handleAddBlockOfType called with type:', type);
    const spec = blockRegistry[type];
    if (!spec) {
      console.error('❌ EDITOR: Block spec not found for type:', type);
      return;
    }

    try {
      setAdding(true);
      console.log('🏗️ EDITOR: Creating block...');
      const nextPosition = (blocks.reduce((max, b) => Math.max(max, b.position ?? 0), 0) || 0) + 1;
      const payload: TablesInsert<'layout_blocks'> = {
        block_type: type,
        page_identifier: currentPageSlug,
        position: nextPosition,
        content: (spec.defaultData() as any),
        status: 'draft' as any,
      };

      console.log('🏗️ EDITOR: Sending payload to API');
      const created = await createLayoutBlock(payload);
      console.log('✅ EDITOR: Block created successfully, ID:', created.id);

      setBlocks((prev) => [...prev, created]);
      setSelectedBlockId(created.id);
      console.log('✅ EDITOR: Block added to UI');
    } catch (e) {
      console.error('❌ EDITOR: Failed to create block:', e);
    } finally {
      setAdding(false);
    }
  };

  const handleSave = async () => {
    const changes = Object.values(changed);
    if (changes.length === 0) return;
    setSaving(true);
    setSaveError(null);
    try {
      const results = await Promise.allSettled(
        changes.map(async (blk) => updateLayoutBlock(blk.id, { content: blk.content }))
      );
      const failures = results.filter((r) => r.status === 'rejected') as PromiseRejectedResult[];
      if (failures.length > 0) {
        throw new Error(`Не удалось сохранить ${failures.length} блок(ов)`);
      }
      const updatedBlocks = results
        .filter((r): r is PromiseFulfilledResult<LayoutBlock> => r.status === 'fulfilled')
        .map((r) => r.value);
      if (updatedBlocks.length > 0) {
        setBlocks((prev) => {
          const byId = new Map(prev.map((b) => [b.id, b] as const));
          for (const ub of updatedBlocks) byId.set(ub.id, ub);
          return Array.from(byId.values()).sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
        });
      }
      setChanged({});
      setIsDirty(false);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Ошибка сохранения изменений';
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAdminLayoutByPage(currentPageSlug);
      const ordered = data
        .slice()
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
      setBlocks(ordered);
      setSelectedBlockId((prev) => (ordered.some((b) => b.id === prev) ? prev : null));
      setChanged({});
      setIsDirty(false);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Не удалось перезагрузить блоки';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRevision = async () => {
    try {
      await createLayoutRevision(currentPageSlug);
      const list = await fetchLayoutRevisions(currentPageSlug);
      setRevisions(list.map((r) => ({ id: r.id, created_at: r.created_at })));
    } catch (e) {
      console.error('Не удалось создать ревизию:', e);
    }
  };

  const handleRevertRevision = async (revisionId: string) => {
    try {
      setReverting(true);
      await revertToLayoutRevision(currentPageSlug, revisionId);
      const data = await fetchAdminLayoutByPage(currentPageSlug);
      const ordered = data
        .slice()
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
      setBlocks(ordered);
    } catch (e) {
      console.error('Не удалось откатить ревизию:', e);
    } finally {
      setReverting(false);
    }
  };

  // const handleApplyTemplate = async (templateId: string) => {
  //   const template = templates.find((t) => t.id === templateId);
  //   if (!template) return;
  //   const list = Array.isArray(template.blocks) ? (template.blocks as Array<{ block_type?: string; content?: unknown }>) : [];
  //   if (list.length === 0) return;
  //   try {
  //     setApplyingTemplate(true);
  //     const start = (blocks.reduce((max, b) => Math.max(max, b.position ?? 0), 0) || 0) + 1;
  //     const created: LayoutBlock[] = [] as unknown as LayoutBlock[];
  //     for (let i = 0; i < list.length; i++) {
  //       const item = list[i];
  //       if (!item?.block_type) continue;
  //       const spec = blockRegistry[item.block_type];
  //       if (!spec) continue;
  //       const payload: TablesInsert<'layout_blocks'> = {
  //         block_type: item.block_type,
  //         page_identifier: currentPageSlug,
  //         position: start + i,
  //         content: (item.content as any) ?? (spec.defaultData() as any),
  //         status: 'draft' as any,
  //       };
  //       const c = await createLayoutBlock(payload);
  //       const created: LayoutBlock[] = [] as unknown as LayoutBlock[];
  //       for (let i = 0; i < list.length; i++) {
  //         const item = list[i];
  //         if (!item?.block_type) continue;
  //         const spec = blockRegistry[item.block_type];
  //         if (!spec) continue;
  //         const payload: TablesInsert<'layout_blocks'> = {
  //           block_type: item.block_type,
  //           page_identifier: currentPageSlug,
  //           position: start + i,
  //           content: (item.content as any) ?? (spec.defaultData() as any),
  //           status: 'draft' as any,
  //         };
  //         const c = await createLayoutBlock(payload);
  //         created.push(c);
  //       }
  //       if (created.length > 0) {
  //         setBlocks((prev) => {
  //           const next = [...prev, ...created].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  //           return next;
  //         });
  //         setSelectedBlockId(created[0].id);
  //       }
  //     } catch (e) {
  //       console.error('Не удалось применить шаблон', e);
  //     } finally {
  //       setApplyingTemplate(false);
  //     }
  //   };

  const handlePublishToggle = async (blockId: string) => {
    const blk = blocks.find((b) => b.id === blockId);
    if (!blk) return;

    const isPublished = blk.status === 'published';
    const nextStatus = isPublished ? 'draft' : 'published';
    setPublishing(true);
    setBlocks((cur) => cur.map((b) => (b.id === blk.id ? { ...b, status: nextStatus } : b)));

    try {
      const updated = await updateLayoutBlock(blk.id, { status: nextStatus as any });
      setBlocks((cur) => cur.map((b) => (b.id === updated.id ? updated : b)));
    } catch (err) {
      setBlocks((cur) => cur.map((b) => (b.id === blk.id ? blk : b)));
      console.error('Не удалось изменить статус публикации', err);
    } finally {
      setPublishing(false);
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    try {
      // Удаляем блок из базы данных
      await deleteLayoutBlock(blockId);

      // Обновляем локальное состояние, удаляя блок из массива
      setBlocks((prevBlocks) => prevBlocks.filter(b => b.id !== blockId));

      // Если удаленный блок был выбран, очищаем выбор
      if (selectedBlockId === blockId) {
        setSelectedBlockId(null);
      }

      // Удаляем блок из списка измененных, если он там был
      setChanged((prevChanged) => {
        const updated = { ...prevChanged };
        delete updated[blockId];
        return updated;
      });
    } catch (error) {
      console.error('Не удалось удалить блок:', error);
      // В будущем можно добавить уведомление об ошибке
    }
  };



  // Обработчик клика вне блоков для закрытия инспектора
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    console.log('NewLiveEditor: Canvas clicked');
    // Проверяем, что клик был именно по канвасу, а не по блоку
    const target = e.target as HTMLElement;
    const blockElement = target.closest('[data-block-id]');
    console.log('NewLiveEditor: Canvas click target:', target, 'blockElement:', blockElement);
    if (!blockElement) {
      console.log('NewLiveEditor: Deselecting block');
      setSelectedBlockId(null);
    }
  };

  const handleDndEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      const activeId = String(active.id ?? '');
      if (activeId.startsWith('block-type:')) {
        const type = activeId.substring('block-type:'.length);
        console.log('🎯 DnD: No drop target (modal open). Fallback: create at root');
        await handleAddBlockOfType(type);
      } else {
        console.log('❌ DnD: No drop target for existing block');
      }
      return;
    }

    const activeId = String(active.id ?? '');
    const overId = String(over.id ?? '');

    // Создание нового блока из библиотеки
    if (activeId.startsWith('block-type:')) {
      console.log('🎯 DnD: Block drag from library, type:', activeId.replace('block-type:', ''));
      const type = activeId.substring('block-type:'.length);
      const spec = blockRegistry[type];
      if (!spec) return;
      
      try {
        setAdding(true);
        
                // Дроп в слот контейнера: slot:parentBlockId:slotName:position
        if (overId.startsWith('slot:')) {
          const slotMatch = overId.match(/^slot:(.+):(.+):(-?\d+)$/);
          if (!slotMatch) return;

          const [, parentBlockId, slotName] = slotMatch;

          // Проверяем, разрешен ли этот тип блока в контейнере
          const parentBlock = blocks.find(b => b.id === parentBlockId);
          const parentSpec = parentBlock ? blockRegistry[parentBlock.block_type] : null;

          if (parentSpec?.allowedChildren && !parentSpec.allowedChildren.includes(type)) {
            console.warn(`Блок типа ${type} не разрешен в контейнере ${parentBlock?.block_type}`);
            return;
          }

          // Вычисляем глобальную позицию для нового блока
          const maxGlobalPosition = blocks.reduce((max, b) => Math.max(max, b.position ?? 0), 0);
          const newPosition = maxGlobalPosition + 1;

          // Создаем новый вложенный блок
          const payload: TablesInsert<'layout_blocks'> = {
            block_type: type,
            page_identifier: currentPageSlug,
            parent_block_id: parentBlockId,
            slot: slotName,
            position: newPosition,
            content: (spec.defaultData() as any),
            status: 'draft' as any,
          };

          console.log('🏗️ DnD: Creating nested block, parent:', parentBlock?.block_type);
          const created = await createLayoutBlock(payload);
          setBlocks((prev) => [...prev, created]);
          setSelectedBlockId(created.id);
          return;
        }
        
        // Дроп на корневой уровень: canvas-slot:position
        if (overId.startsWith('canvas-slot:')) {
          const index = Number(overId.substring('canvas-slot:'.length));
          if (Number.isNaN(index)) return;

          // Вычисляем глобальную позицию для нового блока
          const maxGlobalPosition = blocks.reduce((max, b) => Math.max(max, b.position ?? 0), 0);
          const newPosition = maxGlobalPosition + 1;

          const payload: TablesInsert<'layout_blocks'> = {
            block_type: type,
            page_identifier: currentPageSlug,
            position: newPosition,
            content: (spec.defaultData() as any),
            status: 'draft' as any,
          };

          console.log('🏗️ DnD: Creating root level block');
          const created = await createLayoutBlock(payload);
          setBlocks((prev) => [...prev, created]);
          setSelectedBlockId(created.id);
          return;
        }
        
        // Фолбэк: дроп на общий канвас
        if (overId === 'canvas-dropzone') {
          console.log('🎯 DnD: Dropping on canvas, calling handleAddBlockOfType');
          await handleAddBlockOfType(type);
        } else if (overId.startsWith('slot:') || overId.startsWith('canvas-slot:')) {
          console.log('🎯 DnD: Dropping in slot:', overId);
          // Обработка дропа в слот будет обработана выше в коде
        } else {
          console.log('❌ DnD: Unknown drop target:', overId);
        }
      } finally {
        setAdding(false);
      }
      return;
    }
    
    // Перемещение существующего блока
    if (activeId.startsWith('canvas-block:')) {
      console.log('DnD: Detected canvas-block drag');
      const blockId = activeId.substring('canvas-block:'.length);
      const movingBlock = blocks.find(b => b.id === blockId);
      if (!movingBlock) {
        console.log('DnD: Moving block not found:', blockId);
        return;
      }
      console.log('DnD: Moving block:', movingBlock);
      
      try {
        // Перемещение в слот контейнера
        if (overId.startsWith('slot:')) {
          const slotMatch = overId.match(/^slot:(.+):(.+):(-?\d+)$/);
          if (!slotMatch) return;
          
          const [, parentBlockId, slotName, positionStr] = slotMatch;
          const position = Number(positionStr);
          
          // Проверяем разрешения
          const parentBlock = blocks.find(b => b.id === parentBlockId);
          const parentSpec = parentBlock ? blockRegistry[parentBlock.block_type] : null;
          
          if (parentSpec?.allowedChildren && !parentSpec.allowedChildren.includes(movingBlock.block_type)) {
            console.warn(`Блок типа ${movingBlock.block_type} не разрешен в контейнере ${parentBlock?.block_type}`);
            return;
          }
          
          // Обновляем блок
          const updatedBlock = {
            ...movingBlock,
            parent_block_id: parentBlockId,
            slot: slotName,
            position: position >= 0 ? position + 1 : 1,
          };
          
          await updateLayoutBlock(blockId, {
            parent_block_id: parentBlockId,
            slot: slotName,
            position: updatedBlock.position,
          });
          
          setBlocks(prev => prev.map(b => b.id === blockId ? updatedBlock : b));
          return;
        }
        
        // Перемещение на корневой уровень
        if (overId.startsWith('canvas-slot:')) {
          const index = Number(overId.substring('canvas-slot:'.length));
          if (Number.isNaN(index)) return;

          // Получить все корневые блоки для правильного пересчета позиций
          const rootBlocks = blocks.filter(b => !b.parent_block_id || b.parent_block_id === '');
          const ordered = rootBlocks.slice().sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

          // Если блок уже на корневом уровне, просто переместить его
          if (!movingBlock.parent_block_id || movingBlock.parent_block_id === '') {
            const currentIndex = ordered.findIndex(b => b.id === blockId);
            if (currentIndex === -1) return;

            // Удаляем блок из текущей позиции
            ordered.splice(currentIndex, 1);

            // Вставляем на новую позицию
            const newPosition = index >= currentIndex ? index : index + 1;
            ordered.splice(newPosition, 0, movingBlock);

            // Пересчитываем позиции
            const updates = ordered.map((b, idx) => ({
              id: b.id,
              position: idx + 1
            }));

            // Обновляем позиции на сервере
            if (updates.length > 0) {
              await updateLayoutPositions(updates);
            }

            // Обновляем локальное состояние
            setBlocks(prev => {
              const updated = prev.map(b => {
                const update = updates.find(u => u.id === b.id);
                return update ? { ...b, position: update.position } : b;
              });
              return updated.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
            });
          } else {
            // Блок перемещается из контейнера на корневой уровень
            const updatedBlock = {
              ...movingBlock,
              parent_block_id: null,
              slot: null,
              position: index + 1,
            };

            await updateLayoutBlock(blockId, {
              parent_block_id: null,
              slot: null,
              position: updatedBlock.position,
            });

            setBlocks(prev => prev.map(b => b.id === blockId ? updatedBlock : b));
          }
          return;
        }
        
      } catch (e) {
        console.error('Не удалось переместить блок:', e);
      }
    }
  };

  const selectedBlock = selectedBlockId ? blocks.find(b => b.id === selectedBlockId) : null;

  return (
    <DndContext sensors={sensors} onDragEnd={handleDndEnd}>
      <div className="h-screen flex flex-col">
        {/* Верхняя панель */}
        <EditorToolbar
          pageIdentifier={currentPageSlug}
          isDirty={isDirty}
          saving={saving}
          saveError={saveError}
          onSave={handleSave}
          onCancel={handleCancel}
          onAddBlock={handleAddBlockOfType}
          adding={adding}
          revisions={revisions}
          revisionsLoading={revisionsLoading}
          reverting={reverting}
          onCreateRevision={handleCreateRevision}
          onRevertRevision={handleRevertRevision}
          pages={pages}
          pagesLoading={pagesLoading}
        />

        {/* Основная область с превью */}
        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-y-auto pr-96">
            <div className="p-6" onClick={handleCanvasClick}>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Spinner />
                </div>
              ) : error ? (
                <Card className="p-6 text-center">
                  <div className="text-red-600 dark:text-red-400">
                    Ошибка: {error}
                  </div>
                </Card>
              ) : (
                <div
                  ref={setCanvasRef}
                  className={`
                    min-h-full p-4 transition-colors duration-200
                    ${isCanvasOver
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-400 rounded-lg'
                      : 'border-2 border-transparent'
                    }
                  `}
                >
                  {blocks.length === 0 && !isCanvasOver ? (
                    <div className="flex items-center justify-center h-64 text-center text-gray-500 dark:text-gray-400">
                      <div>
                        <div className="text-4xl mb-4">📄</div>
                        <h3 className="text-lg font-medium mb-2">Пустая страница</h3>
                        <p className="text-sm">Перетащите блоки из библиотеки сюда или нажмите "➕ Добавить блок"</p>
                      </div>
                    </div>
                  ) : (
                    <BlockRenderer
                      pageIdentifier={currentPageSlug}
                      blocks={blocks}
                      editorMode
                      selectedBlockId={selectedBlockId ?? undefined}
                      onSelectBlock={handleSelectBlock}
                      onUpdateBlock={(updated) => {
                        setBlocks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
                        setChanged((prev) => ({ ...prev, [updated.id]: updated }));
                        setIsDirty(true);
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          </main>

          {/* Контекстный инспектор */}
          {selectedBlockId ? (
            <ContextualInspector
              block={selectedBlock || null}
              isOpen={!!selectedBlockId}
              onClose={() => setSelectedBlockId(null)}
              onBlockChange={handleBlockChange}
              onPublishToggle={handlePublishToggle}
              publishing={publishing}
              onBlockDelete={handleDeleteBlock}
              allBlocks={blocks}
              onMoveLeft={moveBlockLeft}
              onMoveRight={moveBlockRight}
            />
          ) : (
            <div className="w-96 bg-gray-50 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-6 flex items-center justify-center">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <div className="text-3xl mb-2">👆</div>
                <p className="text-sm">Выберите блок для редактирования</p>
                <p className="text-xs mt-1 opacity-75">Кликните на любой блок слева</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DndContext>
  );
};

export default LiveEditor;
