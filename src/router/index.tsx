import { createBrowserRouter } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/stores/useAppStore'
import { Layout } from '@/components/Layout'
import { HomePage } from '@/pages/HomePage'
import { SimpleHome } from '@/pages/SimpleHome'
import { AIGeneratorPage } from '@/pages/AIGeneratorPage'
import { ComponentsPage } from '@/pages/ComponentsPage'
import { ChartsPage } from '@/pages/ChartsPage'
import { EnhancedChartsPage } from '@/pages/EnhancedChartsPage'

const ProjectDeveloper = () => {
  const { t } = useTranslation()
  const { theme } = useAppStore()
  
  return (
    <div style={{ 
      padding: '24px', 
      textAlign: 'center',
      background: theme === 'dark' ? '#141414' : '#fff',
      minHeight: '100vh'
    }}>
      <h2 style={{ color: theme === 'dark' ? '#fff' : 'inherit' }}>{t('common.projectDeveloper')}</h2>
      <p style={{ color: theme === 'dark' ? 'rgba(255, 255, 255, 0.85)' : 'inherit' }}>{t('common.developing')}</p>
    </div>
  )
}



export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'simple', element: <SimpleHome /> },
      { path: 'ai-generator', element: <AIGeneratorPage /> },
      { path: 'project-developer', element: <ProjectDeveloper /> },
      { path: 'components', element: <ComponentsPage /> },
      { path: 'charts', element: <ChartsPage /> },
      { path: 'enhanced-charts', element: <EnhancedChartsPage /> },
    ],
  },
])
