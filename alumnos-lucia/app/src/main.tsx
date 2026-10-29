import { createRoot } from 'react-dom/client';
import { PortalErrorBoundary } from './communication/PortalErrorBoundary';
import App from './App.tsx';
import './index.css';
createRoot(document.getElementById('root')!).render(<PortalErrorBoundary><App /></PortalErrorBoundary>);
