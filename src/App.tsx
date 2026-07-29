import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext';
import { HomePage } from './pages/HomePage';
import { CaseDetailPage } from './pages/CaseDetailPage';

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cases/:slug" element={<CaseDetailPage />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}
