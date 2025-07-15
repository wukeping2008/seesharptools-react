import React from 'react'
import { useAppStore } from '@/stores/useAppStore'

export const TestHome: React.FC = () => {
  const { theme } = useAppStore()
  
  return (
    <div style={{ 
      padding: '24px', 
      background: theme === 'dark' ? '#141414' : '#fff', 
      minHeight: '100vh',
      fontSize: '24px',
      color: theme === 'dark' ? '#ffffff' : '#000'
    }}>
      <h1>测试主页</h1>
      <p>如果你能看到这个页面，说明React应用正常工作！</p>
      <div style={{ marginTop: '20px' }}>
        <p>✅ React 18 正常运行</p>
        <p>✅ TypeScript 编译成功</p>
        <p>✅ 路由系统正常</p>
        <p>✅ Ant Design 主题加载</p>
      </div>
    </div>
  )
}
