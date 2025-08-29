import React, { useEffect, useState, useCallback } from 'react';
import type { Database, TablesInsert } from '@my-forum/db-types';
import { Card, Spinner } from '../../shared/ui/atoms';
import BlockRenderer from '../BlockRenderer';
import EditorToolbar from '../EditorToolbar';
import { ContextualInspector } from '../ContextualInspector/indexNew';
import { fetchAdminLayoutByPage, createLayoutBlock, updateLayoutBlock, deleteLayoutBlock, updateLayoutPositions, fetchLayoutRevisions, createLayoutRevision, revertToLayoutRevision } from '../../shared/api/layout';
import { blockRegistry } from '../../shared/config/blockRegistry';
import { DndContext, PointerSensor, KeyboardSensor, useSensor, useSensors, useDroppable, DragOverlay, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core';
import { useParams } from 'react-router-dom';
import { fetchAdminPages } from '../../shared/api/pages';

// Redux imports
import { useAppDispatch, useAppSelector } from 'store/hooks';
import {
  setLayoutFromApi,
  addBlockToTree,
  updateBlockInTree,
  removeBlockFromTree,
  moveBlockInTree
} from 'store/slices/contentSlice';
import { instantiateReusableBlock } from 'store/slices/reusableBlocksSlice';
// import type { BlockNode } from '../../../types/api';

interface BlockNode {
  id: string;
  block_type: string;
  content: Record<string, any> | null;
  depth: number;
  instance_id: string | null;
  metadata: Record<string, any>;
  page_id: number;
  position: number | null;
  slot: string | null;
  status: string;
  children: BlockNode[];
}

type LayoutBlock = Database['public']['Tables']['layout_blocks']['Row'];
type PageRow = Database['public']['Tables']['pages']['Row'];

interface LiveEditorProps {
  pageSlug: string;
}

const LiveEditor = ({ pageSlug }: LiveEditorProps) => {
  // Основная логика компонента
  const { pageSlug: urlPageSlug } = useParams<{ pageSlug: string }>();
  const dispatch = useAppDispatch();

  // Получаем состояние из Redux
  const blockTree = useAppSelector(state => state.content.blockTree);

  // Локальное состояние для загрузки и ошибок
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  	// console.log('NewLiveEditor: Initialized with pageSlug:', pageSlug);

	// Используем pageSlug из URL как источник правды
	const currentPageSlug = urlPageSlug || pageSlug || 'home';

  // Canvas drop zone для сброса элементов из библиотеки
  const { setNodeRef: setCanvasRef, isOver: isCanvasOver } = useDroppable({
    id: 'canvas-dropzone',
  });

  // Локальное состояние для UI
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [adding, setAdding] = useState<boolean>(false);
  const [activeBlock, setActiveBlock] = useState<BlockNode | null>(null);
  
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

  // Load blocks using Redux
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        // Загружаем данные с API
        const data = await fetchAdminLayoutByPage(currentPageSlug);

        // Преобразуем плоский массив в древовидную структуру
        const treeData = buildTreeFromBlocks(data);

        if (!isMounted) return;

        // Сохраняем в Redux
        dispatch(setLayoutFromApi({
          pageId: 1, // TODO: получить реальный pageId
          blocks: treeData
        }));

        setSelectedBlockId((prev) => (treeData.some((b) => b.id === prev) ? prev : null));
      } catch (e: unknown) {
        if (!isMounted) return;
        console.error('Не удалось загрузить блоки:', e);
        // TODO: обработка ошибок через Redux
      }
    };
    void load();
    return () => {
      isMounted = false;
    };
  }, [currentPageSlug, dispatch]);

  // Helper function to convert flat blocks to tree structure
  const buildTreeFromBlocks = (flatBlocks: LayoutBlock[]): BlockNode[] => {
    // Сначала создаем все узлы
    const blockMap = new Map<string, BlockNode>();
    const rootBlocks: BlockNode[] = [];

    flatBlocks.forEach(block => {
      const node: BlockNode = {
        id: block.id,
        block_type: block.block_type,
        content: (block.content as Record<string, any>) || null,
        depth: 0,
        instance_id: block.instance_id,
        metadata: (block.metadata as Record<string, any>) || {},
        page_id: block.page_id,
        position: block.position,
        slot: block.slot,
        status: block.status,
        children: []
      };
      blockMap.set(block.id, node);
    });

    // Затем строим иерархию
    flatBlocks.forEach(block => {
      const node = blockMap.get(block.id)!;
      const parentId = block.parent_block_id;

      if (parentId && blockMap.has(parentId)) {
        const parent = blockMap.get(parentId)!;
        parent.children.push(node);
      } else {
        rootBlocks.push(node);
      }
    });

    // Сортируем дочерние элементы по позиции
    function sortChildren(nodes: BlockNode[]): void {
      nodes.forEach(node => {
        if (node.children.length > 0) {
          node.children.sort((a: BlockNode, b: BlockNode) => (a.position || 0) - (b.position || 0));
          sortChildren(node.children);
        }
      });
    }

    sortChildren(rootBlocks);
    return rootBlocks;
  };

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

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const activeId = String(active.id ?? '');

    // Находим активный блок для DragOverlay
    if (activeId.startsWith('canvas-block:')) {
      const blockId = activeId.substring('canvas-block:'.length);
      const block = findBlockInTree(blockTree, blockId);
      if (block) setActiveBlock(block);
    } else if (activeId.startsWith('block-type:')) {
      // Для новых блоков из библиотеки создаем временный блок для отображения
      const type = activeId.substring('block-type:'.length);
      const spec = blockRegistry[type];
      if (spec) {
        setActiveBlock({
          id: 'temp-block',
          block_type: type,
          content: {},
          depth: 0,
          instance_id: null,
          metadata: {},
          page_id: 1,
          position: 0,
          slot: null,
          status: 'draft',
          children: []
        });
      }
    }
  }, [blockTree]);

  const findBlockInTree = (nodes: BlockNode[], blockId: string): BlockNode | null => {
    for (const node of nodes) {
      if (node.id === blockId) return node;
      if (node.children && node.children.length > 0) {
        const found = findBlockInTree(node.children, blockId);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedBlock = React.useMemo(() =>
    selectedBlockId ? findBlockInTree(blockTree, selectedBlockId) : null,
    [selectedBlockId, blockTree]
  );

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
  }, [selectedBlockId]);

  const handleBlockChange = (updatedBlock: LayoutBlock) => {
    // Преобразуем LayoutBlock в BlockNode для Redux
    const blockNode: BlockNode = {
      id: updatedBlock.id,
      block_type: updatedBlock.block_type,
      content: (updatedBlock.content as Record<string, any>) || null,
      depth: 0, // TODO: рассчитать глубину
      instance_id: updatedBlock.instance_id,
      metadata: (updatedBlock.metadata as Record<string, any>) || {},
      page_id: updatedBlock.page_id,
      position: updatedBlock.position,
      slot: updatedBlock.slot,
      status: updatedBlock.status,
      children: [] // TODO: сохранить дочерние элементы
    };

    dispatch(updateBlockInTree({
      blockId: updatedBlock.id,
      updates: {
        content: (updatedBlock.content as Record<string, any>) || {},
        metadata: (updatedBlock.metadata as Record<string, any>) || {}
      }
    }));

    setChanged((prev) => ({ ...prev, [updatedBlock.id]: updatedBlock }));
    setIsDirty(true);
  };

  // Перемещение блока влево (упрощенная версия для Redux)
  const moveBlockLeft = async (blockId: string) => {
    // Для Redux версии эти функции нужно реализовать через tree operations
    // Пока оставим как заглушку
    console.log('Move block left:', blockId);
  };

  // Перемещение блока вправо (упрощенная версия для Redux)
  const moveBlockRight = async (blockId: string) => {
    // Для Redux версии эти функции нужно реализовать через tree operations
    // Пока оставим как заглушку
    console.log('Move block right:', blockId);
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

      // Создаем блок через Redux
      const newBlockNode: BlockNode = {
        id: `temp-${Date.now()}`, // Временный ID, будет заменен после создания
        block_type: type,
        content: spec.defaultData ? spec.defaultData() : {},
        depth: 0,
        instance_id: null,
        metadata: {},
        page_id: 1,
        position: blockTree.length,
        slot: null,
        status: 'draft',
        children: []
      };

      // Добавляем в Redux дерево
      dispatch(addBlockToTree({
        block: newBlockNode,
        parentId: null,
        position: blockTree.length
      }));

      setSelectedBlockId(newBlockNode.id);
      console.log('✅ EDITOR: Block added to Redux tree');
    } catch (e) {
      console.error('❌ EDITOR: Failed to create block:', e);
    } finally {
      setAdding(false);
    }
  };

  const handleSave = async () => {
    // Для Redux версии сохранение нужно реализовать через API вызовы для всего дерева
    console.log('Save functionality needs to be implemented for Redux tree structure');
    setIsDirty(false);
    setChanged({});
  };

  const handleCancel = async () => {
    try {
      setLoading(true);
      setError(null);
      // Перезагружаем данные из API
      const data = await fetchAdminLayoutByPage(currentPageSlug);
      // Создаем простое дерево для Redux (пока без buildTreeFromBlocks)
      const treeData = data.map(block => ({
        id: block.id,
        block_type: block.block_type,
        content: (block.content as Record<string, any>) || {},
        depth: 0,
        instance_id: block.instance_id,
        metadata: (block.metadata as Record<string, any>) || {},
        page_id: block.page_id,
        position: block.position,
        slot: block.slot,
        status: block.status,
        children: []
      }));

      // Обновляем Redux состояние
      dispatch(setLayoutFromApi({
        pageId: 1,
        blocks: treeData
      }));

      setSelectedBlockId(null);
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
      // Создаем простое дерево для Redux (пока без buildTreeFromBlocks)
      const treeData = data.map(block => ({
        id: block.id,
        block_type: block.block_type,
        content: (block.content as Record<string, any>) || {},
        depth: 0,
        instance_id: block.instance_id,
        metadata: (block.metadata as Record<string, any>) || {},
        page_id: block.page_id,
        position: block.position,
        slot: block.slot,
        status: block.status,
        children: []
      }));

      // Обновляем Redux состояние
      dispatch(setLayoutFromApi({
        pageId: 1,
        blocks: treeData
      }));

      setSelectedBlockId(null);
    } catch (e) {
      console.error('Не удалось откатить ревизию:', e);
    } finally {
      setReverting(false);
    }
  };



  const handlePublishToggle = async (blockId: string) => {
    // Находим блок в дереве
    const blockToUpdate = findBlockInTree(blockTree, blockId);
    if (!blockToUpdate) return;

    const isPublished = blockToUpdate.status === 'published';
    const nextStatus = isPublished ? 'draft' : 'published';

    try {
      setPublishing(true);
      // Обновляем через Redux
      dispatch(updateBlockInTree({
        blockId,
        updates: { status: nextStatus }
      }));

      // Синхронизируем с сервером
      await updateLayoutBlock(blockId, { status: nextStatus as any });
    } catch (err) {
      console.error('Не удалось изменить статус публикации', err);
    } finally {
      setPublishing(false);
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    try {
      // Удаляем блок из базы данных
      await deleteLayoutBlock(blockId);

      // Удаляем из Redux дерева
      dispatch(removeBlockFromTree(blockId));

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
      } else if (activeId.startsWith('reusable-')) {
        // Переиспользуемый блок без цели - создаем в корне
        const reusableBlockId = activeId.substring('reusable-'.length);
        console.log('🔄 REUSABLE: No drop target, creating at root:', reusableBlockId);

        try {
          const newInstanceTree = await dispatch(instantiateReusableBlock({
            reusableBlockId,
            pageId: currentPageSlug, // используем slug как идентификатор страницы
            parentId: null,
            position: blockTree.length,
            slot: null,
          })).unwrap();

          if (newInstanceTree) {
            dispatch(addBlockToTree(newInstanceTree));
            console.log('✅ REUSABLE: Block instantiated successfully at root');
          }
        } catch (error) {
          console.error('❌ REUSABLE: Failed to instantiate block at root:', error);
        }
      } else {
        console.log('❌ DnD: No drop target for existing block');
      }
      return;
    }

    const activeId = String(active.id ?? '');
    const overId = String(over.id ?? '');

    // Обработка дропа в наши новые DropZone
    if (overId.startsWith('dropzone-')) {
      const dropZoneMatch = overId.match(/^dropzone-(.+)-(\d+)-(.+)$/);
      if (!dropZoneMatch) {
        console.log('❌ DnD: Invalid dropzone format:', overId);
        return;
      }

      const [, parentIdRaw, positionStr, slotName] = dropZoneMatch;
      const parentId = parentIdRaw === 'root' ? null : parentIdRaw;
      const position = Number(positionStr);

      // Создание нового блока из библиотеки в DropZone
      if (activeId.startsWith('block-type:')) {
        const type = activeId.substring('block-type:'.length);
        console.log('🎯 DnD: Creating new block from library in dropzone:', { type, parentId, position });

        try {
          setAdding(true);

          // Создаем новый блок
          const nextPosition = position + 1;
          const payload: TablesInsert<'layout_blocks'> = {
            block_type: type,
            content: {},
            metadata: {},
            page_id: 1, // TODO: получить реальный pageId
            position: nextPosition,
            parent_block_id: parentId,
            slot: slotName,
            status: 'published'
          };

          const created = await createLayoutBlock(payload);

          // Добавляем в Redux дерево
          const newBlockNode: BlockNode = {
            id: created.id,
            block_type: created.block_type,
            content: (created.content as Record<string, any>) || null,
            depth: 0,
            instance_id: created.instance_id,
            metadata: (created.metadata as Record<string, any>) || {},
            page_id: created.page_id,
            position: created.position,
            slot: created.slot,
            status: created.status,
            children: []
          };

          dispatch(addBlockToTree({
            block: newBlockNode,
            parentId,
            position
          }));

          setSelectedBlockId(created.id);
        } catch (error) {
          console.error('Failed to create block:', error);
        } finally {
          setAdding(false);
        }
        return;
      }

      // Создание экземпляра переиспользуемого блока в DropZone
      if (activeId.startsWith('reusable-')) {
        const reusableBlockId = activeId.substring('reusable-'.length);
        console.log('🔄 REUSABLE: Creating instance from library in dropzone:', {
          reusableBlockId,
          parentId,
          position,
          slotName
        });

        try {
          const newInstanceTree = await dispatch(instantiateReusableBlock({
            reusableBlockId,
            pageId: currentPageSlug, // используем slug как идентификатор страницы
            parentId,
            position: position + 1, // API ожидает следующую позицию
            slot: slotName,
          })).unwrap();

          if (newInstanceTree) {
            dispatch(addBlockToTree(newInstanceTree));
            console.log('✅ REUSABLE: Block instantiated successfully in dropzone');

            // Выбираем первый блок из созданного дерева
            if (newInstanceTree.children && newInstanceTree.children.length > 0) {
              setSelectedBlockId(newInstanceTree.children[0].id);
            } else {
              setSelectedBlockId(newInstanceTree.id);
            }
          }
        } catch (error) {
          console.error('❌ REUSABLE: Failed to instantiate block in dropzone:', error);
        }
        return;
      }

      // Перемещение существующего блока
      if (activeId.startsWith('canvas-block:')) {
        const blockId = activeId.substring('canvas-block:'.length);
        console.log('🎯 DnD: Moving existing block to dropzone:', { blockId, parentId, position });

        // Используем Redux экшен для перемещения блока
        dispatch(moveBlockInTree({
          blockId,
          newParentId: parentId,
          newPosition: position
        }));

        // TODO: Синхронизировать с сервером
        // await updateLayoutBlock(blockId, {
        //   parent_block_id: parentId,
        //   position: position + 1,
        //   slot: slotName
        // });

        return;
      }
    }

    // Обработка старых форматов дропа (для обратной совместимости)
    if (overId === 'canvas-dropzone' && activeId.startsWith('block-type:')) {
      const type = activeId.substring('block-type:'.length);
      console.log('🎯 DnD: Fallback to canvas dropzone');
      await handleAddBlockOfType(type);
      return;
    }

    console.log('❌ DnD: Unhandled drop case:', { activeId, overId });
  };








  return (
    <DndContext sensors={sensors} onDragEnd={handleDndEnd} onDragStart={handleDragStart}>
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
                  {blockTree.length === 0 && !isCanvasOver ? (
                    <div className="flex items-center justify-center h-64 text-center text-gray-500 dark:text-gray-400">
                      <div>
                        <div className="text-4xl mb-4">📄</div>
                        <h3 className="text-lg font-medium mb-2">Пустая страница</h3>
                        <p className="text-sm">Перетащите блоки из библиотеки сюда или нажмите "➕ Добавить блок"</p>
                      </div>
                    </div>
                  ) : (
                    <BlockRenderer
                      blockTree={blockTree}
                      editorMode
                      selectedBlockId={selectedBlockId ?? undefined}
                      onSelectBlock={handleSelectBlock}
                      onUpdateBlock={(updated) => {
                        // Преобразуем BlockNode обратно в LayoutBlock для совместимости
                        const layoutBlock: LayoutBlock = {
                          id: updated.id,
                          block_type: updated.block_type,
                          content: updated.content || {},
                          metadata: updated.metadata,
                          page_id: updated.page_id,
                          position: updated.position,
                          slot: updated.slot,
                          status: updated.status,
                          instance_id: updated.instance_id,
                          created_at: new Date().toISOString(),
                          updated_at: new Date().toISOString(),
                          page_identifier: currentPageSlug,
                          parent_block_id: null // TODO: рассчитать parent_block_id
                        };

                        setChanged((prev) => ({ ...prev, [updated.id]: layoutBlock }));
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
              allBlocks={blockTree.flatMap(node => [node, ...node.children])}
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

      {/* Drag Overlay для визуальной обратной связи */}
      <DragOverlay>
        {activeBlock ? (
          <div className="bg-white dark:bg-gray-800 rounded-md shadow-lg border-2 border-blue-500 p-3 opacity-90 transform rotate-3">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {blockRegistry[activeBlock.block_type]?.name || activeBlock.block_type}
            </div>
            {activeBlock.id !== 'temp-block' && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Перетаскивание блока
              </div>
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default LiveEditor;
