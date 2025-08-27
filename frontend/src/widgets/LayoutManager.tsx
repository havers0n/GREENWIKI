import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { Database } from '@my-forum/db-types';
import { Button, Card, Typography, Tag, Select, Textarea, Spinner } from 'shared/ui/atoms';
import { Modal } from 'shared/ui/molecules';
import {
  fetchAdminLayoutByPage,
  createLayoutBlock,
  updateLayoutBlock,
  deleteLayoutBlock,
  updateLayoutPositions,
} from 'shared/api/layout';

// Types
 type LayoutBlock = Database['public']['Tables']['layout_blocks']['Row'];
 type Json = Database['public']['Tables']['layout_blocks']['Row']['content'];

 interface LayoutManagerProps {
   pageIdentifier: string;
 }

 const BLOCK_TYPES = [
   'header',
   'categories_section',
   'controls_section',
   'properties_section',
   'animations_section',
   'changelog_section',
] as const;
 type BlockType = typeof BLOCK_TYPES[number];

 const STATUSES = ['published', 'draft'] as const;
 type BlockStatus = typeof STATUSES[number];

 // Utils
 const safeStringify = (value: any) => {
   try { return JSON.stringify(value, null, 2); } catch { return ''; }
 };

 const ensureSequentialPositions = (blocks: LayoutBlock[]): LayoutBlock[] => {
   return blocks
     .slice()
     .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
     .map((b, idx) => ({ ...b, position: idx + 1 }));
 };

 // Internal UI Components
 interface LayoutBlockCardProps {
   block: LayoutBlock;
   onMoveUp: (id: string) => void;
   onMoveDown: (id: string) => void;
   onEdit: (block: LayoutBlock) => void;
   onDelete: (block: LayoutBlock) => void;
   isFirst: boolean;
   isLast: boolean;
 }

 const LayoutBlockCard: React.FC<LayoutBlockCardProps> = ({ block, onMoveUp, onMoveDown, onEdit, onDelete, isFirst, isLast }) => {
   const contentPreview = useMemo(() => {
     const c: any = block.content ?? {};
     if (typeof c === 'object' && c) {
       const title = c.title || c.subtitle || c.heading || '';
       if (title) return String(title);
       const keys = Object.keys(c);
       if (keys.length > 0) {
         const firstKey = keys[0];
         const val = c[firstKey];
         if (typeof val === 'string') return val.slice(0, 120);
       }
       return safeStringify(c).slice(0, 160);
     }
     return '';
   }, [block.content]);

   return (
     <Card className="p-4">
       <div className="flex items-start justify-between">
         <div className="flex-1 min-w-0">
           <div className="flex items-center gap-3">
             <Typography as="h3" variant="h3" className="truncate">
               #{block.position} — {block.block_type}
             </Typography>
             <Tag className={block.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'}>
               {block.status}
             </Tag>
           </div>
           {contentPreview && (
             <Typography variant="small" className="mt-2 text-gray-500 break-words">
               {contentPreview}
             </Typography>
           )}
         </div>
         <div className="flex items-center gap-2 ml-4">
           <Button onClick={() => onMoveUp(block.id)} disabled={isFirst} variant="secondary">Вверх</Button>
           <Button onClick={() => onMoveDown(block.id)} disabled={isLast} variant="secondary">Вниз</Button>
           <Button onClick={() => onEdit(block)} variant="primary">Редактировать</Button>
           <Button onClick={() => onDelete(block)} variant="ghost" className="text-red-600">Удалить</Button>
         </div>
       </div>
     </Card>
   );
 };

 // Create Modal
 interface CreateLayoutBlockModalProps {
   pageIdentifier: string;
   onSubmit: (data: { block_type: BlockType; status: BlockStatus; content: Json }) => Promise<void>;
   onClose: () => void;
 }

 const CreateLayoutBlockModal: React.FC<CreateLayoutBlockModalProps> = ({ pageIdentifier, onSubmit, onClose }) => {
   const [blockType, setBlockType] = useState<BlockType>('header');
   const [status, setStatus] = useState<BlockStatus>('published');
   const [contentText, setContentText] = useState<string>('{}');
   const [error, setError] = useState<string | null>(null);
   const [submitting, setSubmitting] = useState(false);

   const handleSubmit = async () => {
     setError(null);
     let parsed: any = {};
     try {
       parsed = contentText.trim() ? JSON.parse(contentText) : {};
     } catch (e: any) {
       setError(`Некорректный JSON: ${e.message}`);
       return;
     }

     try {
       setSubmitting(true);
       await onSubmit({ block_type: blockType, status, content: parsed });
       onClose();
     } catch (e: any) {
       setError(e.message || 'Не удалось создать блок');
     } finally {
       setSubmitting(false);
     }
   };

   return (
     <Modal title={`Добавить блок для «${pageIdentifier}»`} onClose={onClose}>
       {error && (
         <div className="mb-3 p-3 rounded-md text-sm bg-red-50 text-red-700 border border-red-200">{error}</div>
       )}
       <div className="space-y-4">
         <Select label="Тип блока" value={blockType} onChange={(e) => setBlockType(e.target.value as BlockType)}>
           {BLOCK_TYPES.map((t) => (
             <option key={t} value={t}>{t}</option>
           ))}
         </Select>
         <Select label="Статус" value={status} onChange={(e) => setStatus(e.target.value as BlockStatus)}>
           {STATUSES.map((s) => (
             <option key={s} value={s}>{s}</option>
           ))}
         </Select>
         <Textarea
           label="JSON контент"
           value={contentText}
           onChange={(e) => setContentText(e.target.value)}
           rows={8}
           className="font-mono text-sm"
           hint="Введите валидный JSON"
           placeholder='{"title":"..."}'
         />
         <div className="flex justify-end gap-2 pt-2">
           <Button onClick={onClose} variant="secondary">Отмена</Button>
           <Button onClick={handleSubmit} disabled={submitting} variant="primary">
             {submitting ? 'Сохранение...' : 'Сохранить'}
           </Button>
         </div>
       </div>
     </Modal>
   );
 };

 // Edit Modal
 interface EditLayoutBlockModalProps {
   block: LayoutBlock;
   onSubmit: (data: { block_type: BlockType; status: BlockStatus; content: Json }) => Promise<void>;
   onClose: () => void;
 }

 const EditLayoutBlockModal: React.FC<EditLayoutBlockModalProps> = ({ block, onSubmit, onClose }) => {
   const initialContent = useMemo(() => safeStringify(block.content ?? {}), [block.content]);
   const [blockType, setBlockType] = useState<BlockType>((block.block_type as BlockType) || 'header');
   const [status, setStatus] = useState<BlockStatus>((block.status as BlockStatus) || 'published');
   const [contentText, setContentText] = useState<string>(initialContent);
   const [error, setError] = useState<string | null>(null);
   const [submitting, setSubmitting] = useState(false);

   const handleSubmit = async () => {
     setError(null);
     let parsed: any = {};
     try {
       parsed = contentText.trim() ? JSON.parse(contentText) : {};
     } catch (e: any) {
       setError(`Некорректный JSON: ${e.message}`);
       return;
     }

     try {
       setSubmitting(true);
       await onSubmit({ block_type: blockType, status, content: parsed });
       onClose();
     } catch (e: any) {
       setError(e.message || 'Не удалось обновить блок');
     } finally {
       setSubmitting(false);
     }
   };

   return (
     <Modal title={`Редактировать блок #${block.position}`} onClose={onClose}>
       {error && (
         <div className="mb-3 p-3 rounded-md text-sm bg-red-50 text-red-700 border border-red-200">{error}</div>
       )}
       <div className="space-y-4">
         <Select label="Тип блока" value={blockType} onChange={(e) => setBlockType(e.target.value as BlockType)}>
           {BLOCK_TYPES.map((t) => (
             <option key={t} value={t}>{t}</option>
           ))}
         </Select>
         <Select label="Статус" value={status} onChange={(e) => setStatus(e.target.value as BlockStatus)}>
           {STATUSES.map((s) => (
             <option key={s} value={s}>{s}</option>
           ))}
         </Select>
         <Textarea
           label="JSON контент"
           value={contentText}
           onChange={(e) => setContentText(e.target.value)}
           rows={8}
           className="font-mono text-sm"
         />
         <div className="flex justify-end gap-2 pt-2">
           <Button onClick={onClose} variant="secondary">Отмена</Button>
           <Button onClick={handleSubmit} disabled={submitting} variant="primary">
             {submitting ? 'Сохранение...' : 'Сохранить'}
           </Button>
         </div>
       </div>
     </Modal>
   );
 };

 // Confirm Delete Modal
 interface ConfirmDeleteModalProps {
   block: LayoutBlock | null;
   onConfirm: () => Promise<void>;
   onClose: () => void;
   busy?: boolean;
 }

 const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ block, onConfirm, onClose, busy }) => {
   if (!block) return null;
   return (
     <Modal title="Подтвердите удаление" onClose={onClose}>
       <Typography>
         Вы уверены, что хотите удалить блок #{block.position} ({block.block_type})?
       </Typography>
       <div className="flex justify-end gap-2 pt-4">
         <Button onClick={onClose} variant="secondary">Отмена</Button>
         <Button onClick={onConfirm} disabled={!!busy} variant="danger">{busy ? 'Удаление...' : 'Удалить'}</Button>
       </div>
     </Modal>
   );
 };

 // Main widget
 const LayoutManager: React.FC<LayoutManagerProps> = ({ pageIdentifier }) => {
   const [blocks, setBlocks] = useState<LayoutBlock[]>([]);
   const [loading, setLoading] = useState<boolean>(true);
   const [error, setError] = useState<string | null>(null);

   const [showCreate, setShowCreate] = useState(false);
   const [editBlock, setEditBlock] = useState<LayoutBlock | null>(null);
   const [deleteBlockState, setDeleteBlockState] = useState<{ block: LayoutBlock | null; busy: boolean }>({ block: null, busy: false });

   const load = useCallback(async () => {
     setLoading(true);
     setError(null);
     try {
       const data = await fetchAdminLayoutByPage(pageIdentifier);
       const normalized = ensureSequentialPositions(data);
       setBlocks(normalized);
     } catch (e: any) {
       setError(e?.message || 'Не удалось загрузить блоки');
     } finally {
       setLoading(false);
     }
   }, [pageIdentifier]);

   useEffect(() => { load(); }, [load]);

   const handleCreate = async (data: { block_type: BlockType; status: BlockStatus; content: Json }) => {
     const nextPosition = (blocks.length || 0) + 1;
     const created = await createLayoutBlock({
       page_identifier: pageIdentifier,
       block_type: data.block_type,
       status: data.status,
       content: data.content,
       position: nextPosition,
     } as any);
     const next = ensureSequentialPositions([...blocks, created]);
     setBlocks(next);
   };

   const handleUpdate = async (id: string, data: { block_type: BlockType; status: BlockStatus; content: Json }) => {
     const updated = await updateLayoutBlock(id, {
       block_type: data.block_type,
       status: data.status,
       content: data.content,
     } as any);
     const next = blocks.map(b => (b.id === id ? { ...b, ...updated } : b));
     setBlocks(next);
   };

   const handleDelete = async (id: string) => {
     await deleteLayoutBlock(id);
     const next = ensureSequentialPositions(blocks.filter(b => b.id !== id));
     setBlocks(next);
   };

   const commitOrder = async (ordered: LayoutBlock[]) => {
     const updates = ordered.map((b, idx) => ({ id: b.id, position: idx + 1 }));
     await updateLayoutPositions(updates);
     setBlocks(ordered.map((b, idx) => ({ ...b, position: idx + 1 })));
   };

   const onMoveUp = async (id: string) => {
     const idx = blocks.findIndex(b => b.id === id);
     if (idx <= 0) return;
     const reordered = blocks.slice();
     const tmp = reordered[idx - 1];
     reordered[idx - 1] = reordered[idx];
     reordered[idx] = tmp;
     await commitOrder(reordered);
   };

   const onMoveDown = async (id: string) => {
     const idx = blocks.findIndex(b => b.id === id);
     if (idx < 0 || idx >= blocks.length - 1) return;
     const reordered = blocks.slice();
     const tmp = reordered[idx + 1];
     reordered[idx + 1] = reordered[idx];
     reordered[idx] = tmp;
     await commitOrder(reordered);
   };

   // Render
   return (
     <div className="space-y-6">
       <div className="flex items-start justify-between">
         <div>
           <Typography as="h1" variant="h1">Управление блоками</Typography>
           <Typography variant="small" className="mt-1 text-gray-500">Страница: {pageIdentifier}</Typography>
         </div>
         <div className="flex items-center gap-2">
           <Button onClick={() => setShowCreate(true)} variant="primary">Добавить новый блок</Button>
           <Button onClick={load} variant="secondary">Обновить</Button>
         </div>
       </div>

       {loading && (
         <Card className="p-6">
           <div className="flex items-center gap-3">
             <Spinner />
             <Typography>Загрузка...</Typography>
           </div>
         </Card>
       )}

       {!loading && error && (
         <Card className="p-6 border-red-200 bg-red-50"><Typography>Ошибка: {error}</Typography></Card>
       )}

       {!loading && !error && blocks.length === 0 && (
         <Card className="p-6"><Typography>Список блоков пуст.</Typography></Card>
       )}

       {!loading && !error && blocks.length > 0 && (
         <div className="space-y-3">
           {blocks
             .slice()
             .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
             .map((block, idx, arr) => (
               <LayoutBlockCard
                 key={block.id}
                 block={block}
                 onMoveUp={onMoveUp}
                 onMoveDown={onMoveDown}
                 onEdit={(b) => setEditBlock(b)}
                 onDelete={(b) => setDeleteBlockState({ block: b, busy: false })}
                 isFirst={idx === 0}
                 isLast={idx === arr.length - 1}
               />
             ))}
         </div>
       )}

       {showCreate && (
         <CreateLayoutBlockModal
           pageIdentifier={pageIdentifier}
           onClose={() => setShowCreate(false)}
           onSubmit={handleCreate}
         />
       )}

       {editBlock && (
         <EditLayoutBlockModal
           block={editBlock}
           onClose={() => setEditBlock(null)}
           onSubmit={async (data) => {
             await handleUpdate(editBlock.id, data);
           }}
         />
       )}

       {deleteBlockState.block && (
         <ConfirmDeleteModal
           block={deleteBlockState.block}
           busy={deleteBlockState.busy}
           onClose={() => setDeleteBlockState({ block: null, busy: false })}
           onConfirm={async () => {
             try {
               setDeleteBlockState((s) => ({ ...s, busy: true }));
               await handleDelete(deleteBlockState.block!.id);
               setDeleteBlockState({ block: null, busy: false });
             } catch (e) {
               setDeleteBlockState({ block: null, busy: false });
             }
           }}
         />
       )}
     </div>
   );
 };

 export default LayoutManager;
