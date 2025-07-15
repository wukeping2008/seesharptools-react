import { createBrowserRouter } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { SimpleHome } from '@/pages/SimpleHome'

// 临时占位组件
const AIControlGenerator = () => (
  <Layout>
    <div style={{ padding: '24px', textAlign: 'center', background: '#fff', color: '#000' }}>
      <h2>AI控件生成器</h2>
      <p>功能开发中...</p>
    </div>
  </Layout>
)

const ProjectDeveloper = () => (
  <Layout>
    <div style={{ padding: '24px', textAlign: 'center', background: '#fff', color: '#000' }}>
      <h2>项目开发器</h2>
      <p>功能开发中...</p>
    </div>
  </Layout>
)

const ComponentShowcase = () => (
  <Layout>
    <div style={{ padding: '24px', textAlign: 'center', background: '#fff', color: '#000' }}>
      <h2>组件展示</h2>
      <p>功能开发中...</p>
    </div>
  </Layout>
)

const ChartsPage = () => (
  <Layout>
    <div style={{ padding: '24px', textAlign: 'center', background: '#fff', color: '#000' }}>
      <h2>图表组件</h2>
      <p>功能开发中...</p>
    </div>
  </Layout>
)

const HomePage = () => (
  <Layout>
    <SimpleHome />
  </Layout>
)

export const flatRouter = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/ai-generator', element: <AIControlGenerator /> },
  { path: '/project-developer', element: <ProjectDeveloper /> },
  { path: '/components', element: <ComponentShowcase /> },
  { path: '/charts', element: <ChartsPage /> },
])
