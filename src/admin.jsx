import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './contexts/AuthContext';
import AdminApp from './components/admin/AdminApp';
import './styles/globals.css';
import './styles/admin.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <AdminApp />
    </AuthProvider>
  </StrictMode>,
);
