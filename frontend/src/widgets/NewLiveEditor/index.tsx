import React, { useEffect, useState, useCallback } from 'react';
import type { Database, TablesInsert } from '@my-forum/db-types';
import { Card, Spinner } from '@my-forum/ui';
import BlockRenderer from '../BlockRenderer';
import { VirtualizedCanvas } from '../VirtualizedCanvas';
import EditorToolbar from '../EditorToolbar';
import { UnifiedSidebar, type SidebarView } from '../UnifiedSidebar';
import { fetchAdminLayoutByPage, createLayoutBlock, updateLayoutBlock, deleteLayoutBlock, updateLayoutPositions, fetchLayoutRevisions, createLayoutRevision, revertToLayoutRevision } from '../../shared/api/layout';
import { blockRegistry } from '../../shared/config/blockRegistry';
import { DndContext, PointerSensor, KeyboardSensor, useSensor, useSensors, useDroppable, DragOverlay, type DragEndEvent, type DragStartEvent, pointerWithin, closestCenter } from '@dnd-kit/core';
import { rectSortingStrategy } from '@dnd-kit/sortable';
import { useParams } from 'react-router-dom';
import { fetchAdminPages } from '../../shared/api/pages';
import OnboardingTutorial from '../OnboardingTutorial';

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

/**
 * Вспомогательная функция для безопасного чтения истории из localStorage
 */
const getInitialHistory = (key: string): BlockNode[][] => {
  try {
    const savedHistory = window.localStorage.getItem(key);
    // Если история есть, парсим ее, иначе возвращаем пустой массив
    return savedHistory ? JSON.parse(savedHistory) : [];
  } catch (error) {
    console.error(`Failed to parse history from localStorage for key: ${key}`, error);
    // В случае ошибки парсинга, возвращаем пустой массив для безопасности
    return [];
  }
};

const LiveEditor = ({ pageSlug }: LiveEditorProps) => {
  // Основная логика компонента
  const { pageSlug: urlPageSlug } = useParams<{ pageSlug: string }>();
  const dispatch = useAppDispatch();

  // Получаем состояние из Redux
  const blockTree = useAppSelector(state => {
    console.log('🔄 NewLiveEditor: blockTree from Redux:', state.content.blockTree.map(b => ({
      id: b.id,
      parent: b.parent_block_id,
      position: b.position,
      children: b.children?.length || 0
    })));
    return state.content.blockTree;
  });

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
  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>([]);
  const [isShiftPressed, setIsShiftPressed] = useState<boolean>(false);
  const [adding, setAdding] = useState<boolean>(false);
  const [activeBlock, setActiveBlock] = useState<BlockNode | null>(null);

  // Состояние для UnifiedSidebar
  const [sidebarActiveView, setSidebarActiveView] = useState<SidebarView>('PAGE_SETTINGS');

  // Confirm-сценарий
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [changed, setChanged] = useState<Record<string, LayoutBlock>>({});
  const [saving, setSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState<boolean>(false);

  // Onboarding tutorial
  const [showTutorial, setShowTutorial] = useState<boolean>(() => {
    // Показываем туториал только при первом запуске
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    return !hasSeenTutorial;
  });
  
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

  // Undo/Redo history stacks for blockTree snapshots
  const [historyPast, setHistoryPast] = useState<BlockNode[][]>(() => getInitialHistory('editorHistoryPast'));
  const [historyFuture, setHistoryFuture] = useState<BlockNode[][]>(() => getInitialHistory('editorHistoryFuture'));
  const HISTORY_LIMIT = 50;

  const deepCloneTree = (tree: BlockNode[]): BlockNode[] => JSON.parse(JSON.stringify(tree)) as BlockNode[];

  // Tutorial handlers
  const handleTutorialComplete = () => {
    setShowTutorial(false);
    localStorage.setItem('hasSeenTutorial', 'true');
  };

  const handleTutorialSkip = () => {
    setShowTutorial(false);
    localStorage.setItem('hasSeenTutorial', 'true');
  };
  const pushHistoryBeforeChange = () => {
    setHistoryPast(prev => {
      const next = [...prev, deepCloneTree(blockTree)];
      // Ограничиваем историю последними HISTORY_LIMIT состояниями
      return next.length > HISTORY_LIMIT ? next.slice(next.length - HISTORY_LIMIT) : next;
    });
    // сбрасываем redo после нового действия
    setHistoryFuture([]);
  };

  const handleUndo = () => {
    if (historyPast.length === 0) return;
    const prev = historyPast[historyPast.length - 1];
    const rest = historyPast.slice(0, -1);
    // Текущую версию отправляем в будущее для возможного redo (также ограничиваем объем)
    setHistoryPast(rest);
    setHistoryFuture(f => {
      const nf = [deepCloneTree(blockTree), ...f];
      return nf.length > HISTORY_LIMIT ? nf.slice(0, HISTORY_LIMIT) : nf;
    });
    dispatch(setLayoutFromApi({ pageId: 1, blocks: deepCloneTree(prev) }));
    setIsDirty(true);
  };

  const handleRedo = () => {
    if (historyFuture.length === 0) return;
    const [next, ...rest] = historyFuture;
    setHistoryFuture(rest);
    setHistoryPast(p => {
      const np = [...p, deepCloneTree(blockTree)];
      return np.length > HISTORY_LIMIT ? np.slice(np.length - HISTORY_LIMIT) : np;
    });
    dispatch(setLayoutFromApi({ pageId: 1, blocks: deepCloneTree(next) }));
    setIsDirty(true);
  };

  // Сохранение истории в localStorage при каждом изменении
  useEffect(() => {
    try {
      window.localStorage.setItem('editorHistoryPast', JSON.stringify(historyPast));
      window.localStorage.setItem('editorHistoryFuture', JSON.stringify(historyFuture));
    } catch (error) {
      console.error('Failed to save history to localStorage:', error);
    }
  }, [historyPast, historyFuture]);

  // DnD sensors с поддержкой виртуализации
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Минимальное расстояние для активации drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: (event, args) => {
        // Для клавиатурной навигации в виртуализированном списке
        const { currentCoordinates } = args;
        return {
          x: currentCoordinates.x,
          y: currentCoordinates.y,
        };
      },
    })
  );

  // Трекинг состояния Shift и горячие клавиши для Undo/Redo
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setIsShiftPressed(true);

      // Undo: Ctrl+Z или Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }

      // Redo: Ctrl+Y или Ctrl+Shift+Z или Cmd+Y или Cmd+Shift+Z
      if ((e.ctrlKey || e.metaKey) &&
          ((e.key === 'y') || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      }
    };

    const up = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setIsShiftPressed(false);
    };

    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);

    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [handleUndo, handleRedo]);

  // Load blocks using Redux
  useEffect(() => {
    let isMounted = true;
    // Сброс истории и локальных измененных данных при смене страницы
    setHistoryPast([]);
    setHistoryFuture([]);
    setChanged({});
    setIsDirty(false);
    setSelectedBlockId(null);

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
    console.log('🎯 SELECT: Block selected, ID:', id, 'shift:', isShiftPressed);
    if (!id) {
      setSelectedBlockId(null);
      setSelectedBlockIds([]);
      return;
    }
    if (isShiftPressed) {
      // Toggle поведение для Shift+клик
      setSelectedBlockIds(prev => {
        const exists = prev.includes(id);
        const next = exists ? prev.filter(x => x !== id) : [...prev, id];
        // Выставляем single-selected для инспектора, если остался один
        setSelectedBlockId(next.length === 1 ? next[0] : null);
        return next;
      });
    } else {
      setSelectedBlockIds([id]);
      setSelectedBlockId(id);
    }
  };

  // Обработчик клавиш для перемещения блоков и глобальных горячих клавиш
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Только если фокус не в поле ввода
      const activeElement = document.activeElement;
      const isInputFocused = activeElement instanceof HTMLInputElement ||
                           activeElement instanceof HTMLTextAreaElement ||
                           activeElement instanceof HTMLSelectElement ||
                           (activeElement as HTMLElement)?.contentEditable === 'true';
      if (isInputFocused) return;

      // Ctrl/Cmd + S — сохранить
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        void handleSave();
        return;
      }

      // Ctrl/Cmd + Z — undo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }

      // Ctrl/Cmd + Shift + Z или Ctrl/Cmd + Y — redo
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
        return;
      }

      // Delete — удалить выделенные блоки
      if (e.key === 'Delete' && selectedBlockIds.length > 0) {
        e.preventDefault();
        const confirmed = window.confirm(`Удалить выбранные блоки (${selectedBlockIds.length} шт.)? Действие необратимо.`);
        if (confirmed) void handleDeleteSelected();
        return;
      }

      // Обработка стрелок (позиционирование)
      if (!selectedBlockId) return;
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
  }, [selectedBlockId, selectedBlockIds, blockTree]);

  const handleBlockChange = (updatedBlock: LayoutBlock) => {
    // Обновляем блок в Redux store
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

      // Снимок для undo
      pushHistoryBeforeChange();

      // Находим ID текущей страницы
      const currentPage = pages.find(page => page.slug === currentPageSlug);
      const pageId = currentPage?.id || 1; // Fallback на 1 если страница не найдена

      console.log('🏗️ EDITOR: Using page ID:', pageId, 'for page slug:', currentPageSlug);

      // Создаем блок в базе данных
      const newBlockData = await createLayoutBlock({
        block_type: type,
        content: spec.defaultData ? spec.defaultData() : {},
        metadata: {},
        page_id: pageId,
        position: blockTree.length,
        status: 'draft'
      });

      console.log('✅ EDITOR: Block created in database with ID:', newBlockData.id);

      // Создаем BlockNode для Redux с реальным ID из базы данных
      const newBlockNode: BlockNode = {
        id: newBlockData.id, // Используем реальный ID из базы данных
        block_type: type,
        content: (newBlockData.content as Record<string, any>) || {},
        depth: 0,
        instance_id: newBlockData.instance_id,
        metadata: (newBlockData.metadata as Record<string, any>) || {},
        page_id: newBlockData.page_id,
        position: newBlockData.position,
        slot: newBlockData.slot,
        status: newBlockData.status,
        children: []
      };

      // Добавляем в Redux дерево с реальным ID
      dispatch(addBlockToTree({
        block: newBlockNode,
        parentId: null,
        position: blockTree.length
      }));

      setSelectedBlockId(newBlockNode.id);
      console.log('✅ EDITOR: Block added to Redux tree with persistent ID');
    } catch (e) {
      console.error('❌ EDITOR: Failed to create block:', e);
      // Откатываем снимок в случае ошибки
      if (historyPast.length > 0) {
        const prev = historyPast[historyPast.length - 1];
        dispatch(setLayoutFromApi({ pageId: 1, blocks: deepCloneTree(prev) }));
      }
    } finally {
      setAdding(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveError(null);

      // 1) Обновляем позиции блоков для всех узлов дерева
      const positionUpdates: Array<{ id: string; position: number }> = [];
      const collectPositions = (nodes: BlockNode[]) => {
        nodes.forEach((node, index) => {
          // позиция считаем 1-базной для согласованности с API
          positionUpdates.push({ id: node.id, position: index + 1 });
          if (node.children && node.children.length > 0) {
            collectPositions(node.children);
          }
        });
      };
      // Собираем позиции постранично (по каждому корневому списку — это разные уровни, но API ожидает просто id+position)
      blockTree.forEach((root, rootIndex) => {
        positionUpdates.push({ id: root.id, position: rootIndex + 1 });
        if (root.children && root.children.length > 0) collectPositions(root.children);
      });

      if (positionUpdates.length > 0) {
        await updateLayoutPositions(positionUpdates);
      }

      // 2) Обновляем измененные блоки (контент/метаданные/статус)
      const changedBlocks = Object.values(changed);
      if (changedBlocks.length > 0) {
        await Promise.all(
          changedBlocks.map((blk) =>
            updateLayoutBlock(blk.id, {
              // сохраняем только валидируемые поля
              content: blk.content as any,
              metadata: blk.metadata as any,
              status: blk.status as any,
              slot: blk.slot as any,
            })
          )
        );
      }

      setIsDirty(false);
      setChanged({});
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Не удалось сохранить изменения';
      setSaveError(message);
      console.error('SAVE ERROR:', e);
    } finally {
      setSaving(false);
    }
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
      setSelectedBlockIds([]);
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
      // Снимок для undo
      pushHistoryBeforeChange();

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
      const ok = window.confirm('Вы уверены, что хотите удалить блок и все его дочерние элементы? Это действие необратимо.');
      if (!ok) return;
      pushHistoryBeforeChange();
      await deleteLayoutBlock(blockId);
      dispatch(removeBlockFromTree(blockId));
      if (selectedBlockId === blockId) {
        setSelectedBlockId(null);
      }
      setSelectedBlockIds(prev => prev.filter(id => id !== blockId));
      setChanged((prevChanged) => {
        const updated = { ...prevChanged };
        delete updated[blockId];
        return updated;
      });
      setIsDirty(true);
    } catch (error) {
      console.error('Не удалось удалить блок:', error);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedBlockIds.length === 0) return;
    try {
      pushHistoryBeforeChange();
      // Удаляем последовательно, чтобы не перегрузить API
      for (const id of selectedBlockIds) {
        try {
          await deleteLayoutBlock(id);
        } catch (e) {
          console.warn('Не удалось удалить блок:', id, e);
        }
        dispatch(removeBlockFromTree(id));
        setChanged(prev => {
          const copy = { ...prev } as Record<string, LayoutBlock>;
          delete copy[id];
          return copy;
        });
      }
      setSelectedBlockIds([]);
      setSelectedBlockId(null);
      setIsDirty(true);
    } catch (e) {
      console.error('Массовое удаление не удалось:', e);
    }
  };

  const handleGroupSelectedIntoContainer = async () => {
    if (selectedBlockIds.length < 2) return;
    try {
      pushHistoryBeforeChange();
      // Создаем контейнер в корне
      const payload: TablesInsert<'layout_blocks'> = {
        block_type: 'container_section',
        content: { layout: 'vertical', gap: 'medium', padding: 'medium' } as any,
        metadata: {},
        page_id: 1,
        position: blockTree.length + 1,
        parent_block_id: null,
        slot: null,
        status: 'draft'
      };
      const container = await createLayoutBlock(payload);

      // Перемещаем выделенные блоки внутрь контейнера
      let pos = 1;
      for (const id of selectedBlockIds) {
        dispatch(moveBlockInTree({ blockId: id, newParentId: container.id, newPosition: pos - 1 }));
        // Синхронизация с сервером
        try {
          await updateLayoutBlock(id, { parent_block_id: container.id, position: pos } as any);
        } catch (e) {
          console.warn('Не удалось синхронизировать перемещение блока:', id, e);
        }
        pos += 1;
      }

      // Выбираем новый контейнер
      setSelectedBlockIds([container.id]);
      setSelectedBlockId(container.id);
      setIsDirty(true);
    } catch (e) {
      console.error('Не удалось сгруппировать блоки в контейнер:', e);
    }
  };

  // Обработчик клика вне блоков для закрытия инспектора
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    console.log('NewLiveEditor: Canvas clicked');
    const target = e.target as HTMLElement;
    const blockElement = target.closest('[data-block-id]');
    console.log('NewLiveEditor: Canvas click target:', target, 'blockElement:', blockElement);
    if (!blockElement) {
      console.log('NewLiveEditor: Deselecting blocks');
      setSelectedBlockId(null);
      setSelectedBlockIds([]);
    }
  };

  const handleDndEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      console.log('❌ DnD: No drop target');
      return;
    }

    const activeId = String(active.id ?? '');
    const overId = String(over.id ?? '');

    console.log('🎯 DnD: Drag end event:', { activeId, overId });

    // === СЛУЧАЙ 1: Перетаскивание нового блока из библиотеки ===
    if (activeId.startsWith('block-type:')) {
      await handleNewBlockDrop(activeId, overId);
      return;
    }

    // === СЛУЧАЙ 2: Перетаскивание переиспользуемого блока ===
    if (activeId.startsWith('reusable-')) {
      await handleReusableBlockDrop(activeId, overId);
      return;
    }

    // === СЛУЧАЙ 3: Перемещение существующего блока ===
    if (activeId.startsWith('canvas-block:')) {
      await handleExistingBlockMove(activeId, overId);
      return;
    }

    console.log('❌ DnD: Unknown drag source:', activeId);
  };

  // Обработка дропа нового блока из библиотеки
  const handleNewBlockDrop = async (activeId: string, overId: string) => {
    const blockType = activeId.substring('block-type:'.length);
    console.log('🆕 DnD: Creating new block from library:', blockType);

    if (overId.startsWith('dropzone-')) {
      await handleNewBlockInDropZone(blockType, overId);
    } else {
      // Создание в корне, если нет цели
      await handleAddBlockOfType(blockType);
    }
  };

  // Обработка дропа переиспользуемого блока
  const handleReusableBlockDrop = async (activeId: string, overId: string) => {
    const reusableBlockId = activeId.substring('reusable-'.length);
    console.log('🔄 REUSABLE: Dropping reusable block:', reusableBlockId);

    if (overId.startsWith('dropzone-')) {
      await handleReusableBlockInDropZone(reusableBlockId, overId);
    } else {
      // Создание в корне
      await handleReusableBlockAtRoot(reusableBlockId);
    }
  };

  // Обработка перемещения существующего блока
  const handleExistingBlockMove = async (activeId: string, overId: string) => {
    const blockId = activeId.substring('canvas-block:'.length);
    console.log('📦 DnD: Moving existing block:', blockId);

    if (overId.startsWith('dropzone-')) {
      await handleExistingBlockToDropZone(blockId, overId);
    } else if (overId.startsWith('canvas-block:')) {
      await handleExistingBlockToBlock(blockId, overId);
    } else if (overId === 'canvas-dropzone') {
      await handleExistingBlockToCanvas(blockId);
    }
  };

  // Создание нового блока в DropZone
  const handleNewBlockInDropZone = async (blockType: string, overId: string) => {
    const dropZoneMatch = overId.match(/^dropzone-(.+)-(\d+)-(.+)$/);
    if (!dropZoneMatch) {
      console.log('❌ DnD: Invalid dropzone format:', overId);
      return;
    }

    const [, parentIdRaw, positionStr, slotName] = dropZoneMatch;
    const parentId = parentIdRaw === 'root' ? undefined : parentIdRaw;
    const position = Number(positionStr);

    console.log('🎯 DnD: Creating new block in dropzone:', { blockType, parentId, position, slotName });

    try {
      setAdding(true);

      // Снимок для undo
      pushHistoryBeforeChange();

      // Создаем новый блок
      const payload: TablesInsert<'layout_blocks'> = {
        block_type: blockType,
        content: {},
        metadata: {},
        page_id: 1, // TODO: получить реальный pageId
        position: position + 1,
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
        parentId: parentId || null,
        position
      }));

      setSelectedBlockId(created.id);
      console.log('✅ DnD: New block created successfully in dropzone');
    } catch (error) {
      console.error('❌ DnD: Failed to create block in dropzone:', error);
    } finally {
      setAdding(false);
    }
  };

  // Создание переиспользуемого блока в DropZone
  const handleReusableBlockInDropZone = async (reusableBlockId: string, overId: string) => {
    const dropZoneMatch = overId.match(/^dropzone-(.+)-(\d+)-(.+)$/);
    if (!dropZoneMatch) {
      console.log('❌ DnD: Invalid dropzone format:', overId);
      return;
    }

    const [, parentIdRaw, positionStr, slotName] = dropZoneMatch;
    const parentId = parentIdRaw === 'root' ? undefined : parentIdRaw;
    const position = Number(positionStr);

    console.log('🔄 REUSABLE: Creating instance in dropzone:', { reusableBlockId, parentId, position, slotName });

    try {
      const newInstanceTree = await dispatch(instantiateReusableBlock({
        reusableBlockId,
        pageId: currentPageSlug,
        parentId,
        position: position + 1,
        slot: slotName,
      })).unwrap();

      if (newInstanceTree) {
        // Снимок для undo
        pushHistoryBeforeChange();
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
  };

  // Создание переиспользуемого блока в корне
  const handleReusableBlockAtRoot = async (reusableBlockId: string) => {
    console.log('🔄 REUSABLE: Creating instance at root:', reusableBlockId);

    try {
      const newInstanceTree = await dispatch(instantiateReusableBlock({
        reusableBlockId,
        pageId: currentPageSlug,
        parentId: undefined,
        position: blockTree.length,
        slot: undefined,
      })).unwrap();

      if (newInstanceTree) {
        // Снимок для undo
        pushHistoryBeforeChange();
        dispatch(addBlockToTree(newInstanceTree));
        console.log('✅ REUSABLE: Block instantiated successfully at root');
      }
    } catch (error) {
      console.error('❌ REUSABLE: Failed to instantiate block at root:', error);
    }
  };

  // Перемещение существующего блока в DropZone
  const handleExistingBlockToDropZone = async (blockId: string, overId: string) => {
    const dropZoneMatch = overId.match(/^dropzone-(.+)-(\d+)-(.+)$/);
    if (!dropZoneMatch) {
      console.log('❌ DnD: Invalid dropzone format:', overId);
      return;
    }

    const [, parentIdRaw, positionStr, slotName] = dropZoneMatch;
    const newParentId = parentIdRaw === 'root' ? null : parentIdRaw;
    const newPosition = Number(positionStr);

    console.log('📦 DnD: Moving existing block to dropzone:', { blockId, newParentId, newPosition, slotName });

    // Снимок для undo
    pushHistoryBeforeChange();

    // Оптимистичное обновление UI
    dispatch(moveBlockInTree({
      blockId,
      newParentId,
      newPosition
    }));

    // Синхронизация с сервером
    try {
      console.log('📡 DnD: Updating block on server:', {
        blockId,
        parent_block_id: newParentId,
        position: newPosition + 1,
        slot: slotName
      });

      const updatedBlock = await updateLayoutBlock(blockId, {
        parent_block_id: newParentId,
        position: newPosition + 1,
        slot: slotName
      });

      console.log('✅ DnD: Block moved successfully:', {
        blockId,
        newParentId: updatedBlock.parent_block_id,
        newPosition: updatedBlock.position,
        slot: updatedBlock.slot
      });

      setIsDirty(true);
    } catch (error) {
      console.error('❌ DnD: Failed to move block:', error);

      // Откат изменений
      const prevState = historyPast[historyPast.length - 1];
      if (prevState) {
        console.log('🔄 DnD: Rolling back UI changes');
        dispatch(setLayoutFromApi({
          pageId: 1,
          blocks: deepCloneTree(prevState)
        }));
        setHistoryPast(prev => prev.slice(0, -1));
      }

      setError('Не удалось переместить блок. Изменения отменены.');
    }
  };

  // Перемещение блока на другой блок (вложенность)
  const handleExistingBlockToBlock = async (blockId: string, overId: string) => {
    const targetBlockId = overId.substring('canvas-block:'.length);
    console.log('📦 DnD: Moving block onto another block:', { blockId, targetBlockId });

    // Находим target блок
    const targetBlock = findBlockInTree(blockTree, targetBlockId);
    if (!targetBlock) {
      console.error('❌ DnD: Target block not found:', targetBlockId);
      return;
    }

    // Проверяем, может ли target блок содержать дочерние блоки
    const blockSpec = blockRegistry[targetBlock.block_type];
    if (!blockSpec?.allowedChildren || blockSpec.allowedChildren.length === 0) {
      console.log('❌ DnD: Target block cannot have children:', targetBlock.block_type);
      return;
    }

    // Перемещаем блок как первого ребенка target блока
    await handleExistingBlockToDropZone(blockId, `dropzone-${targetBlockId}-0-default`);
  };

  // Перемещение блока на канвас (в корень)
  const handleExistingBlockToCanvas = async (blockId: string) => {
    console.log('📦 DnD: Moving block to canvas root:', blockId);

    // Перемещаем в конец корневого уровня
    await handleExistingBlockToDropZone(blockId, `dropzone-root-${blockTree.length}-default`);
  };








  return (
    <DndContext
      sensors={sensors}
      onDragEnd={handleDndEnd}
      onDragStart={handleDragStart}
      collisionDetection={pointerWithin}
    >
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
          onOpenBlockLibrary={() => setSidebarActiveView('BLOCK_LIBRARY')}
          onOpenReusableLibrary={() => setSidebarActiveView('REUSABLE_LIBRARY')}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={historyPast.length > 0}
          canRedo={historyFuture.length > 0}
        />

        {/* Основная область с превью */}
        <div className="flex-1 flex overflow-hidden">
          <main
            className="flex-1 overflow-y-auto pr-96"
            data-tutorial="canvas"
          >
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
                  {/* Панель групповых операций при множественном выделении */}
                  {selectedBlockIds.length > 1 && (
                    <div className="sticky top-2 z-20 mb-3 inline-flex items-center gap-2 bg-white/90 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-md shadow px-3 py-2">
                      <span className="text-sm text-gray-700 dark:text-gray-200">Выбрано: {selectedBlockIds.length}</span>
                      <button
                        className="text-sm px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
                        onClick={() => {
                          const confirmed = window.confirm(`Удалить выбранные блоки (${selectedBlockIds.length} шт.)?`);
                          if (confirmed) void handleDeleteSelected();
                        }}
                      >
                        Удалить выбранные
                      </button>
                      <button
                        className="text-sm px-2 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                        onClick={() => void handleGroupSelectedIntoContainer()}
                      >
                        Сгруппировать в контейнер
                      </button>
                    </div>
                  )}

                  {blockTree.length === 0 && !isCanvasOver ? (
                    <div className="flex items-center justify-center h-64 text-center text-gray-500 dark:text-gray-400">
                      <div>
                        <div className="text-4xl mb-4">📄</div>
                        <h3 className="text-lg font-medium mb-2">Пустая страница</h3>
                        <p className="text-sm">Перетащите блоки из библиотеки сюда или нажмите "➕ Добавить блок"</p>
                      </div>
                    </div>
                  ) : (
                    <VirtualizedCanvas
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
                          parent_block_id: null, // TODO: рассчитать parent_block_id
                          depth: updated.depth || 0
                        };

                        setChanged((prev) => ({ ...prev, [updated.id]: layoutBlock }));
                        setIsDirty(true);
                      }}
                      isCanvasOver={isCanvasOver}
                    />
                  )}
                </div>
              )}
            </div>
          </main>

          {/* Unified Sidebar */}
          <UnifiedSidebar
            selectedBlockId={selectedBlockId}
            selectedBlock={selectedBlock || null}
            onBlockChange={handleBlockChange}
            onPublishToggle={handlePublishToggle}
            publishing={publishing}
            onBlockDelete={handleDeleteBlock}
            allBlocks={blockTree.flatMap(node => [node, ...node.children])}
            onMoveLeft={moveBlockLeft}
            onMoveRight={moveBlockRight}
            onAddBlock={handleAddBlockOfType}
            adding={adding}
            pageIdentifier={currentPageSlug}
            externalActiveView={sidebarActiveView}
            onViewChange={setSidebarActiveView}
          />
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

      {/* Onboarding Tutorial */}
      <OnboardingTutorial
        isVisible={showTutorial}
        onComplete={handleTutorialComplete}
        onSkip={handleTutorialSkip}
      />
    </DndContext>
  );
};

export default LiveEditor;
