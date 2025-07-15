import React from 'react'

export const TestHome: React.FC = () => {
  return (
    <div style={{ 
      padding: '24px', 
      background: '#fff', 
      minHeight: '100vh',
      fontSize: '24px',
      color: '#000'
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
