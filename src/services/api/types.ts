// API响应基础类型
export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
  code?: number
}

// 分页响应类型
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// API错误类型
export interface ApiError {
  code: number
  message: string
  details?: any
}

// 请求配置类型
export interface RequestConfig {
  timeout?: number
  retries?: number
  headers?: Record<string, string>
}

// AI控件生成相关类型
export interface AIControlRequest {
  description: string
  language: 'zh-CN' | 'en-US'
  controlType?: string
  parameters?: Record<string, any>
}

export interface AIControlResponse {
  id: string
  code: string
  preview: string
  metadata: {
    name: string
    description: string
    props: Array<{
      name: string
      type: string
      description: string
      default?: any
    }>
  }
}

// 项目相关类型
export interface Project {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
  components: ProjectComponent[]
}

export interface ProjectComponent {
  id: string
  type: string
  name: string
  props: Record<string, any>
  position: { x: number; y: number }
  size: { width: number; height: number }
}

// 硬件设备相关类型
export interface Device {
  id: string
  name: string
  type: string
  status: 'connected' | 'disconnected' | 'error'
  properties: Record<string, any>
}

// 数据采集相关类型
export interface DataPoint {
  timestamp: number
  value: number
  channel?: string
}

export interface DataSeries {
  name: string
  data: DataPoint[]
  unit?: string
  color?: string
}
