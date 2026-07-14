import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import { PollHistoryProvider } from './context/PollHistoryContext';
import { ThemeToggle } from './components/ThemeToggle';
import AppRoutes from './Routes';
import './styles/global.css';

const App = () => (
  <ThemeProvider>
    <PollHistoryProvider>
      <SocketProvider>
        <Router>
          <div className="app-container">
            <div className="global-theme-toggle">
              <ThemeToggle />
            </div>
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
          </div>
        </Router>
      </SocketProvider>
    </PollHistoryProvider>
  </ThemeProvider>
);

export default App;
