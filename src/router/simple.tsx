import { createBrowserRouter } from 'react-router-dom'

const SimpleTest = () => (
  <div style={{ 
    padding: '24px', 
    background: '#fff', 
    minHeight: '100vh',
    fontSize: '24px',
    color: '#000'
  }}>
    <h1>简单测试页面</h1>
    <p>如果你能看到这个页面，说明React路由正常工作！</p>
    <div style={{ marginTop: '20px' }}>
      <p>✅ React 18 正常运行</p>
      <p>✅ TypeScript 编译成功</p>
      <p>✅ 路由系统正常</p>
    </div>
  </div>
)

export const simpleRouter = createBrowserRouter([
  {
    path: '/',
    element: <SimpleTest />,
  },
])
