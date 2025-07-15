// API响应类型
export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
  timestamp: string
}

// AI控件请求类型
export interface AIControlRequest {
  description: string
  language: 'zh-CN' | 'en-US'
  controlType: 'react-component' | 'vue-component' | 'angular-component'
  complexity?: 'simple' | 'medium' | 'complex'
  framework?: string
  styleLibrary?: string
}

// AI控件响应类型
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
      required: boolean
      description?: string
      defaultValue?: any
    }>
    dependencies: string[]
    complexity: 'simple' | 'medium' | 'complex'
    estimatedTime: number // 生成耗时（毫秒）
  }
  createdAt: string
  status: 'success' | 'failed' | 'pending'
}

// 控件模板类型
export interface ControlTemplate {
  id: string
  name: string
  description: string
  category: string
  preview: string
  parameters: Array<{
    name: string
    type: string
    required: boolean
    description: string
    defaultValue?: any
    options?: any[]
  }>
  code: string
  createdAt: string
}

// 描述验证结果
export interface ValidationResult {
  isValid: boolean
  suggestions?: string[]
  estimatedComplexity?: 'simple' | 'medium' | 'complex'
  estimatedTime?: number
  requiredFeatures?: string[]
}

// 生成历史记录
export interface GenerationHistory {
  id: string
  description: string
  controlId?: string
  status: 'success' | 'failed' | 'pending'
  createdAt: string
  completedAt?: string
  errorMessage?: string
}

// 错误类型
export interface ApiError {
  code: number
  message: string
  details?: any
  timestamp: string
}

// 数据库模型类型
export interface ControlModel {
  id: string
  description: string
  code: string
  preview: string
  metadata: AIControlResponse['metadata']
  createdAt: string
  updatedAt: string
}

export interface TemplateModel {
  id: string
  name: string
  description: string
  category: string
  preview: string
  parameters: ControlTemplate['parameters']
  code: string
  createdAt: string
  updatedAt: string
}

export interface HistoryModel {
  id: string
  description: string
  controlId?: string
  status: 'success' | 'failed' | 'pending'
  createdAt: string
  completedAt?: string
  errorMessage?: string
}
