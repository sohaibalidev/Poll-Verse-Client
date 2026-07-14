import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Home from './pages/Home/Home';

const CreatePoll = lazy(() => import('./pages/CreatePoll/CreatePoll'));
const Poll = lazy(() => import('./pages/Poll/Poll'));

const AppRoutes = () => (
  <Suspense fallback={<div className="loading">Loading...</div>}>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/create" element={<CreatePoll />} />
      <Route path="/poll/:code" element={<Poll />} />
      <Route path="*" element={<Home />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;
