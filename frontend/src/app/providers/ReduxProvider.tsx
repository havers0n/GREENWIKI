import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../../store';
import { hydrateUIState } from '../../store/slices/uiSlice';
import { hydrateUserState } from '../../store/slices/userSlice';

interface ReduxProviderProps {
  children: React.ReactNode;
}

const ReduxProvider: React.FC<ReduxProviderProps> = ({ children }) => {
  // Гидратация состояния при инициализации
  React.useEffect(() => {
    store.dispatch(hydrateUIState());
    store.dispatch(hydrateUserState());
  }, []);

  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
};

export default ReduxProvider;