import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface DragState {
  isDragging: boolean;
  draggedItem?: {
    id: string;
    type: string;
    data?: any;
  };
  dropTarget?: {
    id: string;
    type: 'container' | 'slot';
    slotName?: string;
  };
}

interface EditorState {
  // Выбранные элементы
  selectedBlockId: string | null;
  selectedBlocks: string[];

  // Режим редактора
  mode: 'edit' | 'preview' | 'template';

  // Drag & Drop состояние
  dragState: DragState;

  // История действий (для undo/redo)
  history: {
    past: any[];
    present: any;
    future: any[];
  };

  // Инструменты редактора
  toolbar: {
    visible: boolean;
    tools: string[];
    activeTool: string | null;
  };

  // Свойства редактора
  properties: {
    showGrid: boolean;
    snapToGrid: boolean;
    gridSize: number;
    zoom: number;
  };

  // Контекст редактора
  context: {
    currentPage: string;
    currentTemplate: string | null;
    clipboard: any[];
    searchQuery: string;
  };

  // Флаги состояния
  isDirty: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  lastSaved: Date | null;
  lastPublished: Date | null;
}

const initialState: EditorState = {
  selectedBlockId: null,
  selectedBlocks: [],

  mode: 'edit',

  dragState: {
    isDragging: false,
  },

  history: {
    past: [],
    present: null,
    future: [],
  },

  toolbar: {
    visible: true,
    tools: ['select', 'text', 'image', 'container', 'template'],
    activeTool: 'select',
  },

  properties: {
    showGrid: true,
    snapToGrid: true,
    gridSize: 20,
    zoom: 1,
  },

  context: {
    currentPage: '',
    currentTemplate: null,
    clipboard: [],
    searchQuery: '',
  },

  isDirty: false,
  isSaving: false,
  isPublishing: false,
  lastSaved: null,
  lastPublished: null,
};

const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    // Управление выбором блоков
    selectBlock: (state, action: PayloadAction<string>) => {
      state.selectedBlockId = action.payload;
      state.selectedBlocks = [action.payload];
    },

    selectMultipleBlocks: (state, action: PayloadAction<string[]>) => {
      state.selectedBlocks = action.payload;
      state.selectedBlockId = action.payload.length === 1 ? action.payload[0] : null;
    },

    deselectBlocks: (state) => {
      state.selectedBlockId = null;
      state.selectedBlocks = [];
    },

    addToSelection: (state, action: PayloadAction<string>) => {
      if (!state.selectedBlocks.includes(action.payload)) {
        state.selectedBlocks.push(action.payload);
      }
    },

    removeFromSelection: (state, action: PayloadAction<string>) => {
      state.selectedBlocks = state.selectedBlocks.filter(id => id !== action.payload);
      if (state.selectedBlockId === action.payload) {
        state.selectedBlockId = state.selectedBlocks.length > 0 ? state.selectedBlocks[0] : null;
      }
    },

    // Управление режимом редактора
    setEditorMode: (state, action: PayloadAction<EditorState['mode']>) => {
      state.mode = action.payload;
    },

    // Управление Drag & Drop
    startDrag: (state, action: PayloadAction<{ id: string; type: string; data?: any }>) => {
      state.dragState = {
        isDragging: true,
        draggedItem: action.payload,
      };
    },

    setDropTarget: (state, action: PayloadAction<DragState['dropTarget']>) => {
      state.dragState.dropTarget = action.payload;
    },

    endDrag: (state) => {
      state.dragState = {
        isDragging: false,
      };
    },

    // История действий
    pushToHistory: (state, action: PayloadAction<any>) => {
      state.history.past.push(state.history.present);
      state.history.present = action.payload;
      state.history.future = [];
      state.isDirty = true;
    },

    undo: (state) => {
      if (state.history.past.length > 0) {
        const previous = state.history.past[state.history.past.length - 1];
        state.history.future.unshift(state.history.present);
        state.history.present = previous;
        state.history.past.pop();
        state.isDirty = true;
      }
    },

    redo: (state) => {
      if (state.history.future.length > 0) {
        const next = state.history.future[0];
        state.history.past.push(state.history.present);
        state.history.present = next;
        state.history.future.shift();
        state.isDirty = true;
      }
    },

    clearHistory: (state) => {
      state.history = {
        past: [],
        present: null,
        future: [],
      };
    },

    // Управление тулбаром
    setActiveTool: (state, action: PayloadAction<string>) => {
      state.toolbar.activeTool = action.payload;
    },

    toggleToolbar: (state) => {
      state.toolbar.visible = !state.toolbar.visible;
    },

    // Управление свойствами редактора
    updateProperties: (state, action: PayloadAction<Partial<EditorState['properties']>>) => {
      state.properties = { ...state.properties, ...action.payload };
    },

    // Управление контекстом
    setCurrentPage: (state, action: PayloadAction<string>) => {
      state.context.currentPage = action.payload;
    },

    setCurrentTemplate: (state, action: PayloadAction<string | null>) => {
      state.context.currentTemplate = action.payload;
    },

    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.context.searchQuery = action.payload;
    },

    // Работа с буфером обмена
    copyToClipboard: (state, action: PayloadAction<any>) => {
      state.context.clipboard.push(action.payload);
    },

    clearClipboard: (state) => {
      state.context.clipboard = [];
    },

    // Управление состоянием сохранения
    setDirty: (state, action: PayloadAction<boolean>) => {
      state.isDirty = action.payload;
    },

    setSaving: (state, action: PayloadAction<boolean>) => {
      state.isSaving = action.payload;
    },

    setPublishing: (state, action: PayloadAction<boolean>) => {
      state.isPublishing = action.payload;
    },

    setLastSaved: (state, action: PayloadAction<Date>) => {
      state.lastSaved = action.payload;
      state.isDirty = false;
    },

    setLastPublished: (state, action: PayloadAction<Date>) => {
      state.lastPublished = action.payload;
    },

    // Сброс состояния редактора
    resetEditorState: (state) => {
      Object.assign(state, initialState);
    },
  },
});

export const {
  selectBlock,
  selectMultipleBlocks,
  deselectBlocks,
  addToSelection,
  removeFromSelection,
  setEditorMode,
  startDrag,
  setDropTarget,
  endDrag,
  pushToHistory,
  undo,
  redo,
  clearHistory,
  setActiveTool,
  toggleToolbar,
  updateProperties,
  setCurrentPage,
  setCurrentTemplate,
  setSearchQuery,
  copyToClipboard,
  clearClipboard,
  setDirty,
  setSaving,
  setPublishing,
  setLastSaved,
  setLastPublished,
  resetEditorState,
} = editorSlice.actions;

export default editorSlice.reducer;
