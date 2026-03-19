import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
/* index.css 대신 globals.css는 App.jsx에서 로드 */
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
