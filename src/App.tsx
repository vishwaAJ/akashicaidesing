import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AskAI } from './pages/AskAI';
import { Dashboard } from './pages/Dashboard';
import { DataModel } from './pages/DataModel';
import { Landing } from './pages/Landing';
import { NarrativeGallery } from './pages/NarrativeGallery';
import { Screens } from './pages/Screens';
import { StoreProvider } from './store';

export default function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/ask" element={<AskAI />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/:slug" element={<Dashboard />} />
          <Route path="/data-model" element={<DataModel />} />
          <Route path="/narrative" element={<NarrativeGallery />} />
          <Route path="/screens" element={<Screens />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </StoreProvider>
  );
}
