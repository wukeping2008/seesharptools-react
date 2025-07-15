import { Router, Request, Response } from 'express'
import { aiService } from '../services/aiService'
import { dataService } from '../services/dataService'
import { ApiResponse, AIControlRequest } from '../types'
import Joi from 'joi'

const router = Router()

// 请求验证模式
const generateControlSchema = Joi.object({
  description: Joi.string().min(10).max(500).required(),
  language: Joi.string().valid('zh-CN', 'en-US').required(),
  controlType: Joi.string().valid('react-component', 'vue-component', 'angular-component').required(),
  complexity: Joi.string().valid('simple', 'medium', 'complex').optional(),
  framework: Joi.string().optional(),
  styleLibrary: Joi.string().optional()
})

const validateDescriptionSchema = Joi.object({
  description: Joi.string().min(1).max(1000).required(),
  language: Joi.string().valid('zh-CN', 'en-US').required()
})

// 生成AI控件
router.post('/generate-control', async (req: Request, res: Response) => {
  try {
    // 验证请求数据
    const { error, value } = generateControlSchema.validate(req.body)
    if (error) {
      const response: ApiResponse = {
        success: false,
        data: null,
        message: `参数验证失败: ${error.details[0].message}`,
        timestamp: new Date().toISOString()
      }
      return res.status(400).json(response)
    }

    const request: AIControlRequest = value

    // 记录生成历史
    const historyRecord = await dataService.saveHistory({
      description: request.description,
      status: 'pending'
    })

    try {
      // 生成控件
      const result = await aiService.generateControl(request)

      // 更新历史记录
      await dataService.updateHistory(historyRecord.id, {
        controlId: result.id,
        status: 'success',
        completedAt: new Date().toISOString()
      })

      const response: ApiResponse = {
        success: true,
        data: result,
        message: '控件生成成功',
        timestamp: new Date().toISOString()
      }

      res.json(response)
    } catch (generateError) {
      // 更新历史记录为失败状态
      await dataService.updateHistory(historyRecord.id, {
        status: 'failed',
        completedAt: new Date().toISOString(),
        errorMessage: generateError instanceof Error ? generateError.message : '生成失败'
      })

      throw generateError
    }
  } catch (error) {
    console.error('Generate control error:', error)
    const response: ApiResponse = {
      success: false,
      data: null,
      message: error instanceof Error ? error.message : '服务器内部错误',
      timestamp: new Date().toISOString()
    }
    res.status(500).json(response)
  }
})

// 验证控件描述
router.post('/validate-description', async (req: Request, res: Response) => {
  try {
    const { error, value } = validateDescriptionSchema.validate(req.body)
    if (error) {
      const response: ApiResponse = {
        success: false,
        data: null,
        message: `参数验证失败: ${error.details[0].message}`,
        timestamp: new Date().toISOString()
      }
      return res.status(400).json(response)
    }

    const { description, language } = value
    const result = await aiService.validateDescription(description, language)

    const response: ApiResponse = {
      success: true,
      data: result,
      message: '描述验证完成',
      timestamp: new Date().toISOString()
    }

    res.json(response)
  } catch (error) {
    console.error('Validate description error:', error)
    const response: ApiResponse = {
      success: false,
      data: null,
      message: error instanceof Error ? error.message : '服务器内部错误',
      timestamp: new Date().toISOString()
    }
    res.status(500).json(response)
  }
})

// 获取控件预览
router.get('/control/:id/preview', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const control = await dataService.getControlById(id)

    if (!control) {
      const response: ApiResponse = {
        success: false,
        data: null,
        message: '控件不存在',
        timestamp: new Date().toISOString()
      }
      return res.status(404).json(response)
    }

    const response: ApiResponse = {
      success: true,
      data: { preview: control.preview },
      message: '获取预览成功',
      timestamp: new Date().toISOString()
    }

    res.json(response)
  } catch (error) {
    console.error('Get preview error:', error)
    const response: ApiResponse = {
      success: false,
      data: null,
      message: error instanceof Error ? error.message : '服务器内部错误',
      timestamp: new Date().toISOString()
    }
    res.status(500).json(response)
  }
})

// 获取控件代码
router.get('/control/:id/code', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const control = await dataService.getControlById(id)

    if (!control) {
      const response: ApiResponse = {
        success: false,
        data: null,
        message: '控件不存在',
        timestamp: new Date().toISOString()
      }
      return res.status(404).json(response)
    }

    const response: ApiResponse = {
      success: true,
      data: { code: control.code },
      message: '获取代码成功',
      timestamp: new Date().toISOString()
    }

    res.json(response)
  } catch (error) {
    console.error('Get code error:', error)
    const response: ApiResponse = {
      success: false,
      data: null,
      message: error instanceof Error ? error.message : '服务器内部错误',
      timestamp: new Date().toISOString()
    }
    res.status(500).json(response)
  }
})

// 下载控件文件
router.get('/control/:id/download', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const control = await dataService.getControlById(id)

    if (!control) {
      return res.status(404).json({
        success: false,
        message: '控件不存在'
      })
    }

    // 设置下载头
    const filename = `${control.metadata.name.replace(/[^a-zA-Z0-9]/g, '_')}.tsx`
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.setHeader('Content-Type', 'text/plain')

    res.send(control.code)
  } catch (error) {
    console.error('Download error:', error)
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '服务器内部错误'
    })
  }
})

// 获取控件模板列表
router.get('/templates', async (req: Request, res: Response) => {
  try {
    const templates = await dataService.getTemplates()
    
    const response: ApiResponse = {
      success: true,
      data: templates.map(template => ({
        id: template.id,
        name: template.name,
        description: template.description,
        preview: template.preview
      })),
      message: '获取模板列表成功',
      timestamp: new Date().toISOString()
    }

    res.json(response)
  } catch (error) {
    console.error('Get templates error:', error)
    const response: ApiResponse = {
      success: false,
      data: null,
      message: error instanceof Error ? error.message : '服务器内部错误',
      timestamp: new Date().toISOString()
    }
    res.status(500).json(response)
  }
})

// 基于模板生成控件
router.post('/template/:id/generate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const parameters = req.body

    const template = await dataService.getTemplateById(id)
    if (!template) {
      const response: ApiResponse = {
        success: false,
        data: null,
        message: '模板不存在',
        timestamp: new Date().toISOString()
      }
      return res.status(404).json(response)
    }

    // 这里可以根据模板和参数生成控件
    // 暂时返回模板的代码
    const result = {
      id: `template_${id}_${Date.now()}`,
      code: template.code,
      preview: template.preview,
      metadata: {
        name: template.name,
        description: template.description,
        props: template.parameters.map(param => ({
          name: param.name,
          type: param.type,
          required: param.required,
          description: param.description,
          defaultValue: param.defaultValue
        })),
        dependencies: ['react', '@types/react'],
        complexity: 'simple' as const,
        estimatedTime: 1000
      },
      createdAt: new Date().toISOString(),
      status: 'success' as const
    }

    const response: ApiResponse = {
      success: true,
      data: result,
      message: '基于模板生成控件成功',
      timestamp: new Date().toISOString()
    }

    res.json(response)
  } catch (error) {
    console.error('Generate from template error:', error)
    const response: ApiResponse = {
      success: false,
      data: null,
      message: error instanceof Error ? error.message : '服务器内部错误',
      timestamp: new Date().toISOString()
    }
    res.status(500).json(response)
  }
})

// 获取生成历史
router.get('/history', async (req: Request, res: Response) => {
  try {
    const history = await dataService.getHistory()
    
    const response: ApiResponse = {
      success: true,
      data: history,
      message: '获取历史记录成功',
      timestamp: new Date().toISOString()
    }

    res.json(response)
  } catch (error) {
    console.error('Get history error:', error)
    const response: ApiResponse = {
      success: false,
      data: null,
      message: error instanceof Error ? error.message : '服务器内部错误',
      timestamp: new Date().toISOString()
    }
    res.status(500).json(response)
  }
})

export default router
