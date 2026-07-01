import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { DataProvider } from './context/DataContext.jsx'
import { ToastProvider } from './components/UI/Toast.jsx'
import { initializeStore } from './data/store.js'
import './index.css'
import App from './App.jsx'

// Initialize localStorage defaults on first load
initializeStore();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
