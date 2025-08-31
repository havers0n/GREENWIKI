import uiReducer, {
  setTheme,
  toggleSidebar,
  setNotification,
  clearNotification,
  setLoading,
  initialState
} from './uiSlice';

describe('uiSlice', () => {
  it('должен возвращать initial state', () => {
    expect(uiReducer(undefined, { type: undefined })).toEqual(initialState);
  });

  describe('setTheme', () => {
    it('должен устанавливать тему', () => {
      const action = setTheme('dark');
      const result = uiReducer(initialState, action);

      expect(result.theme).toBe('dark');
    });

    it('должен переключать тему с light на dark', () => {
      const action = setTheme('dark');
      const result = uiReducer({ ...initialState, theme: 'light' }, action);

      expect(result.theme).toBe('dark');
    });
  });

  describe('toggleSidebar', () => {
    it('должен переключать состояние sidebar с false на true', () => {
      const result = uiReducer(initialState, toggleSidebar());

      expect(result.sidebar.open).toBe(true);
    });

    it('должен переключать состояние sidebar с true на false', () => {
      const stateWithOpenSidebar = {
        ...initialState,
        sidebar: { ...initialState.sidebar, open: true }
      };

      const result = uiReducer(stateWithOpenSidebar, toggleSidebar());

      expect(result.sidebar.open).toBe(false);
    });
  });

  describe('setNotification', () => {
    it('должен добавлять уведомление', () => {
      const notification = {
        id: '1',
        type: 'success' as const,
        title: 'Test',
        message: 'Test message'
      };

      const action = setNotification(notification);
      const result = uiReducer(initialState, action);

      expect(result.notifications).toHaveLength(1);
      expect(result.notifications[0]).toEqual(notification);
    });

    it('должен добавлять несколько уведомлений', () => {
      const notification1 = {
        id: '1',
        type: 'success' as const,
        title: 'Test 1',
        message: 'Test message 1'
      };

      const notification2 = {
        id: '2',
        type: 'error' as const,
        title: 'Test 2',
        message: 'Test message 2'
      };

      let result = uiReducer(initialState, setNotification(notification1));
      result = uiReducer(result, setNotification(notification2));

      expect(result.notifications).toHaveLength(2);
      expect(result.notifications).toEqual([notification1, notification2]);
    });
  });

  describe('clearNotification', () => {
    it('должен удалять уведомление по id', () => {
      const notification1 = {
        id: '1',
        type: 'success' as const,
        title: 'Test 1',
        message: 'Test message 1'
      };

      const notification2 = {
        id: '2',
        type: 'error' as const,
        title: 'Test 2',
        message: 'Test message 2'
      };

      // Добавляем два уведомления
      let state = uiReducer(initialState, setNotification(notification1));
      state = uiReducer(state, setNotification(notification2));

      // Удаляем первое уведомление
      const result = uiReducer(state, clearNotification('1'));

      expect(result.notifications).toHaveLength(1);
      expect(result.notifications[0]).toEqual(notification2);
    });

    it('не должен изменять состояние если уведомление не найдено', () => {
      const notification = {
        id: '1',
        type: 'success' as const,
        title: 'Test',
        message: 'Test message'
      };

      const state = uiReducer(initialState, setNotification(notification));
      const result = uiReducer(state, clearNotification('nonexistent'));

      expect(result.notifications).toEqual(state.notifications);
    });
  });

  describe('setLoading', () => {
    it('должен устанавливать глобальное состояние загрузки', () => {
      const result = uiReducer(initialState, setLoading({ global: true }));

      expect(result.loading.global).toBe(true);
    });

    it('должен устанавливать локальное состояние загрузки', () => {
      const result = uiReducer(initialState, setLoading({
        components: { 'button': true }
      }));

      expect(result.loading.components['button']).toBe(true);
    });

    it('должен сбрасывать состояние загрузки', () => {
      const stateWithLoading = {
        ...initialState,
        loading: {
          ...initialState.loading,
          global: true,
          components: { 'button': true }
        }
      };

      const result = uiReducer(stateWithLoading, setLoading({
        global: false,
        components: { 'button': false }
      }));

      expect(result.loading.global).toBe(false);
      expect(result.loading.components['button']).toBe(false);
    });
  });

  describe('initialState', () => {
    it('должен иметь правильную структуру initial state', () => {
      expect(initialState).toEqual({
        theme: 'light',
        sidebar: {
          open: false,
          width: 280,
          collapsed: false
        },
        notifications: [],
        loading: {
          global: false,
          components: {}
        }
      });
    });
  });
});
