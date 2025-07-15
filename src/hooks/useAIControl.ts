import { useState, useCallback } from 'react'
import { aiControlService } from '@/services/ai/aiControlService'
import { AIControlRequest, AIControlResponse, ApiError } from '@/services/api/types'

interface UseAIControlState {
  loading: boolean
  error: ApiError | null
  currentControl: AIControlResponse | null
  history: Array<{
    id: string
    description: string
    createdAt: string
    status: 'success' | 'failed' | 'pending'
  }>
}

export const useAIControl = () => {
  const [state, setState] = useState<UseAIControlState>({
    loading: false,
    error: null,
    currentControl: null,
    history: [],
  })

  // 生成控件
  const generateControl = useCallback(async (request: AIControlRequest) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const control = await aiControlService.generateControl(request)
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        currentControl: control,
        error: null 
      }))
      return control
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error as ApiError 
      }))
      throw error
    }
  }, [])

  // 获取控件预览
  const getPreview = useCallback(async (controlId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const preview = await aiControlService.getControlPreview(controlId)
      setState(prev => ({ ...prev, loading: false, error: null }))
      return preview
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error as ApiError 
      }))
      throw error
    }
  }, [])

  // 获取控件代码
  const getCode = useCallback(async (controlId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const code = await aiControlService.getControlCode(controlId)
      setState(prev => ({ ...prev, loading: false, error: null }))
      return code
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error as ApiError 
      }))
      throw error
    }
  }, [])

  // 下载控件
  const downloadControl = useCallback(async (controlId: string, filename?: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      await aiControlService.downloadControl(controlId, filename)
      setState(prev => ({ ...prev, loading: false, error: null }))
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error as ApiError 
      }))
      throw error
    }
  }, [])

  // 验证描述
  const validateDescription = useCallback(async (description: string, language: 'zh-CN' | 'en-US') => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const result = await aiControlService.validateDescription(description, language)
      setState(prev => ({ ...prev, loading: false, error: null }))
      return result
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error as ApiError 
      }))
      throw error
    }
  }, [])

  // 获取生成历史
  const loadHistory = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const history = await aiControlService.getGenerationHistory()
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        history,
        error: null 
      }))
      return history
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error as ApiError 
      }))
      throw error
    }
  }, [])

  // 清除错误
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  // 清除当前控件
  const clearCurrentControl = useCallback(() => {
    setState(prev => ({ ...prev, currentControl: null }))
  }, [])

  return {
    // 状态
    loading: state.loading,
    error: state.error,
    currentControl: state.currentControl,
    history: state.history,
    
    // 方法
    generateControl,
    getPreview,
    getCode,
    downloadControl,
    validateDescription,
    loadHistory,
    clearError,
    clearCurrentControl,
  }
}
