// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from 'app/App'
import { AuthProvider } from 'shared/contexts'
import { ReduxProvider } from 'app/providers/ReduxProvider'
import { AppThemeProvider } from 'app/providers/ThemeProvider'
import { NotificationProvider } from 'shared/contexts/NotificationContext'
import 'app/styles/index.css'
import 'shared/styles/animations.css'


createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <ReduxProvider>
      <AppThemeProvider>
        <NotificationProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </NotificationProvider>
      </AppThemeProvider>
    </ReduxProvider>
  </BrowserRouter>
)
