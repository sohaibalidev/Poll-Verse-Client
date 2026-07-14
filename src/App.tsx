import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import AppRoutes from './Routes';
import './styles/global.css';

const App = () => (
  <ThemeProvider>
    <SocketProvider>
      <Router>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a1a',
              color: '#f5f5f5',
              border: '1px solid rgba(255,255,255,0.15)',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#4caf50',
                secondary: '#f5f5f5',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef5350',
                secondary: '#f5f5f5',
              },
            },
          }}
        />
      </Router>
    </SocketProvider>
  </ThemeProvider>
);

export default App;
