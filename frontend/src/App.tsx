import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { KanbanBoard } from './components/KanbanBoard';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';


function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<KanbanBoard />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <ReactQueryDevtools initialIsOpen={false} />
    </BrowserRouter>
  );
}
