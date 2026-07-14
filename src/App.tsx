import { BrowserRouter as Router } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import AppRoutes from './Routes';
import './styles/global.css';

const App = () => (
  <SocketProvider>
    <Router>
      <AppRoutes />
    </Router>
  </SocketProvider>
);

export default App;
