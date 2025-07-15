import { createBrowserRouter } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { HomePage } from '@/pages/HomePage'
import { SimpleHome } from '@/pages/SimpleHome'
import { AIGeneratorPage } from '@/pages/AIGeneratorPage'
import { ComponentsPage } from '@/pages/ComponentsPage'
import { ChartsPage } from '@/pages/ChartsPage'
import { EnhancedChartsPage } from '@/pages/EnhancedChartsPage'
import ProfessionalInstrumentsPage from '@/pages/ProfessionalInstrumentsPage'
import { ProjectDeveloperPage } from '@/pages/ProjectDeveloperPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'simple', element: <SimpleHome /> },
      { path: 'ai-generator', element: <AIGeneratorPage /> },
      { path: 'project-developer', element: <ProjectDeveloperPage /> },
      { path: 'components', element: <ComponentsPage /> },
      { path: 'charts', element: <ChartsPage /> },
      { path: 'enhanced-charts', element: <EnhancedChartsPage /> },
      { path: 'professional-instruments', element: <ProfessionalInstrumentsPage /> },
    ],
  },
])
