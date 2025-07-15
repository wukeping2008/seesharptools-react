import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import aiRoutes from './routes/aiRoutes'

const app = express()
const PORT = process.env.PORT || 5001

// 中间件配置
app.use(helmet()) // 安全头
app.use(compression()) // 压缩响应
app.use(morgan('combined')) // 日志记录

// CORS配置
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] // 生产环境域名
    : ['http://localhost:3000', 'http://127.0.0.1:3000'], // 开发环境
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}))

// 解析JSON请求体
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// API路由
app.use('/api/ai', aiRoutes)

// 根路径
app.get('/', (req, res) => {
  res.json({
    name: 'SeeSharpTools Backend API',
    version: '1.0.0',
    description: 'AI控件生成器后端服务',
    endpoints: {
      health: '/health',
      ai: '/api/ai'
    },
    timestamp: new Date().toISOString()
  })
})

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `路径 ${req.originalUrl} 不存在`,
    timestamp: new Date().toISOString()
  })
})

// 全局错误处理
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', error)
  
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? '服务器内部错误' 
      : error.message,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
  })
})

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 SeeSharpTools Backend API Server`)
  console.log(`📍 Server running on port ${PORT}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🔗 Health check: http://localhost:${PORT}/health`)
  console.log(`🤖 AI API: http://localhost:${PORT}/api/ai`)
  console.log(`📚 API Documentation: http://localhost:${PORT}`)
  console.log(`⏰ Started at: ${new Date().toISOString()}`)
})

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...')
  process.exit(0)
})

// 未捕获异常处理
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

export default app
