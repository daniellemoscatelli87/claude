import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ProjectsPage from './pages/ProjectsPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import CatalogPage from './pages/CatalogPage'
import GuidePage from './pages/GuidePage'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<ProjectsPage />} />
        <Route path="/projetos/:projectId" element={<ProjectDetailPage />} />
        <Route path="/catalogo" element={<CatalogPage />} />
        <Route path="/guia" element={<GuidePage />} />
      </Route>
    </Routes>
  )
}

export default App
