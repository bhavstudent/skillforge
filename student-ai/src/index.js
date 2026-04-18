import { Toaster } from 'react-hot-toast';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>

  <AuthProvider>

    <App />
    <Toaster
      position='top-right'
      toastOptions={{ 
        duration: 3000,
        style: {
          background: 'rgba(20,20,25,0.95)',
          color: '#ffffff',
          border: '1px solid rgba(255,123,0,0.3)',
          borderRadius: '12px',
          backdropFilter: 'blur(20px)',
          fontsize: '14px',
        },
        success: {
          iconTheme: {
            primary: '#4ade80',
            secondary: '#030305',
          },
        },
        error: {
          iconTheme: {
            primary: '#f87171',
            secondary: '030305',
          },
        },
       }}
      />
    
  </AuthProvider>

  </BrowserRouter>
);


