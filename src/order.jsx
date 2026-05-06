import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import OrderApp from './components/order/OrderApp';
import './styles/globals.css';
import './styles/components.css';
import './styles/order.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <OrderApp />
  </StrictMode>,
);
