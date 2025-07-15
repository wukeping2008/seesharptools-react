import { apiClient } from '../api/client'
import { AIControlRequest, AIControlResponse } from '../api/types'

export class AIControlService {
  // 生成AI控件
  async generateControl(request: AIControlRequest): Promise<AIControlResponse> {
    const response = await apiClient.post<AIControlResponse>('/ai/generate-control', request)
    return response.data
  }

  // 获取控件预览
  async getControlPreview(controlId: string): Promise<string> {
    const response = await apiClient.get<{ preview: string }>(`/ai/control/${controlId}/preview`)
    return response.data.preview
  }

  // 获取控件代码
  async getControlCode(controlId: string): Promise<string> {
    const response = await apiClient.get<{ code: string }>(`/ai/control/${controlId}/code`)
    return response.data.code
  }

  // 下载控件文件
  async downloadControl(controlId: string, filename?: string): Promise<void> {
    await apiClient.download(`/ai/control/${controlId}/download`, filename)
  }

  // 获取控件模板列表
  async getControlTemplates(): Promise<Array<{ id: string; name: string; description: string; preview: string }>> {
    const response = await apiClient.get<Array<{ id: string; name: string; description: string; preview: string }>>('/ai/templates')
    return response.data
  }

  // 基于模板生成控件
  async generateFromTemplate(templateId: string, parameters: Record<string, unknown>): Promise<AIControlResponse> {
    const response = await apiClient.post<AIControlResponse>(`/ai/template/${templateId}/generate`, parameters)
    return response.data
  }

  // 验证控件描述
  async validateDescription(description: string, language: 'zh-CN' | 'en-US'): Promise<{
    isValid: boolean
    suggestions?: string[]
    estimatedComplexity?: 'simple' | 'medium' | 'complex'
  }> {
    const response = await apiClient.post<{
      isValid: boolean
      suggestions?: string[]
      estimatedComplexity?: 'simple' | 'medium' | 'complex'
    }>('/ai/validate-description', { description, language })
    return response.data
  }

  // 获取生成历史
  async getGenerationHistory(): Promise<Array<{
    id: string
    description: string
    createdAt: string
    status: 'success' | 'failed' | 'pending'
  }>> {
    const response = await apiClient.get<Array<{
      id: string
      description: string
      createdAt: string
      status: 'success' | 'failed' | 'pending'
    }>>('/ai/history')
    return response.data
  }
}

// 创建默认实例
export const aiControlService = new AIControlService()
