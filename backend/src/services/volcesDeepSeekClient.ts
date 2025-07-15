import axios, { AxiosInstance } from 'axios'
import dotenv from 'dotenv'

// 加载环境变量
dotenv.config()

interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface DeepSeekRequest {
  model: string
  messages: DeepSeekMessage[]
  temperature?: number
  max_tokens?: number
  top_p?: number
  frequency_penalty?: number
  presence_penalty?: number
  stream?: boolean
}

interface DeepSeekChoice {
  index: number
  message: {
    role: string
    content: string
  }
  finish_reason: string
}

interface DeepSeekResponse {
  id: string
  object: string
  created: number
  model: string
  choices: DeepSeekChoice[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

class VolcesDeepSeekClient {
  private client: AxiosInstance
  private apiKey: string
  private baseURL: string
  private model: string
  private maxTokens: number

  constructor() {
    this.apiKey = process.env.VOLCES_DEEPSEEK_API_KEY || ''
    this.baseURL = process.env.VOLCES_DEEPSEEK_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3/chat/completions'
    this.model = process.env.VOLCES_DEEPSEEK_MODEL || 'deepseek-r1-250528'
    this.maxTokens = parseInt(process.env.VOLCES_DEEPSEEK_MAX_TOKENS || '16191')

    if (!this.apiKey) {
      throw new Error('VOLCES_DEEPSEEK_API_KEY is required')
    }

    this.client = axios.create({
      baseURL: '', // 使用完整URL，不需要baseURL
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 60000, // 60秒超时
    })

    // 请求拦截器
    this.client.interceptors.request.use(
      (config) => {
        console.log(`🤖 DeepSeek API Request: ${config.method?.toUpperCase()} ${config.url}`)
        return config
      },
      (error) => {
        console.error('❌ DeepSeek API Request Error:', error)
        return Promise.reject(error)
      }
    )

    // 响应拦截器
    this.client.interceptors.response.use(
      (response) => {
        console.log(`✅ DeepSeek API Response: ${response.status}`)
        return response
      },
      (error) => {
        console.error('❌ DeepSeek API Response Error:', error.response?.data || error.message)
        return Promise.reject(error)
      }
    )
  }

  /**
   * 调用DeepSeek聊天完成API
   */
  async chatCompletion(request: DeepSeekRequest): Promise<DeepSeekResponse> {
    try {
      const requestData = {
        ...request,
        model: request.model || this.model, // 使用配置的模型
        temperature: request.temperature ?? 0.7,
        max_tokens: request.max_tokens ?? this.maxTokens,
        top_p: request.top_p ?? 0.9,
        frequency_penalty: request.frequency_penalty ?? 0,
        presence_penalty: request.presence_penalty ?? 0,
        stream: request.stream ?? false,
      }

      console.log('🤖 DeepSeek API Request Data:', {
        url: this.baseURL,
        model: requestData.model,
        max_tokens: requestData.max_tokens,
        messages: requestData.messages.length + ' messages'
      })

      const response = await this.client.post<DeepSeekResponse>(this.baseURL, requestData)

      return response.data
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: { message?: string } } }; message?: string }
      console.error('DeepSeek API调用失败:', axiosError.response?.data || axiosError.message)
      throw new Error(`DeepSeek API调用失败: ${axiosError.response?.data?.error?.message || axiosError.message}`)
    }
  }

  /**
   * 生成React控件代码
   */
  async generateReactComponent(description: string, language: 'zh-CN' | 'en-US' = 'zh-CN'): Promise<{
    name: string
    code: string
    preview: string
    props: Array<{
      name: string
      type: string
      required: boolean
      description: string
      defaultValue?: unknown
    }>
  }> {
    const systemPrompt = language === 'zh-CN' 
      ? `你是一个专业的React组件开发专家，专门为测试测量仪器控件库开发高质量的React组件。

请根据用户的描述生成一个完整的React组件，要求：

1. **组件结构**：
   - 使用TypeScript和React 18
   - 组件必须是函数式组件，使用React.FC类型
   - 包含完整的Props接口定义
   - 代码要有良好的类型安全性

2. **样式要求**：
   - 使用内联样式（style属性），不要使用CSS类
   - 样式要现代化、美观，适合测试测量仪器界面
   - 支持响应式设计
   - 颜色搭配要专业，建议使用蓝色系（#1890ff）作为主色调

3. **功能特性**：
   - 组件要有实际的功能性，不只是静态展示
   - 支持属性配置，如颜色、大小、数值范围等
   - 如果是数值显示类控件，要支持数值格式化
   - 如果是交互类控件，要有hover、active等状态

4. **输出格式**：
请严格按照以下JSON格式输出，不要添加任何其他文字：

\`\`\`json
{
  "name": "组件名称（中文）",
  "code": "完整的React组件代码，包含import语句和export",
  "preview": "HTML预览代码，用于在页面中展示组件效果",
  "props": [
    {
      "name": "属性名",
      "type": "TypeScript类型",
      "required": true/false,
      "description": "属性描述",
      "defaultValue": "默认值（可选）"
    }
  ]
}
\`\`\``
      : `You are a professional React component developer specializing in high-quality React components for test and measurement instrument control libraries.

Please generate a complete React component based on the user's description with the following requirements:

1. **Component Structure**:
   - Use TypeScript and React 18
   - Component must be a functional component using React.FC type
   - Include complete Props interface definition
   - Code should have good type safety

2. **Styling Requirements**:
   - Use inline styles (style attribute), no CSS classes
   - Modern, beautiful styling suitable for test and measurement instrument interfaces
   - Support responsive design
   - Professional color scheme, recommend using blue (#1890ff) as primary color

3. **Functional Features**:
   - Component should have actual functionality, not just static display
   - Support property configuration like colors, sizes, value ranges, etc.
   - For numeric display controls, support value formatting
   - For interactive controls, include hover, active states

4. **Output Format**:
Please output strictly in the following JSON format, do not add any other text:

\`\`\`json
{
  "name": "Component Name (English)",
  "code": "Complete React component code including import and export statements",
  "preview": "HTML preview code for displaying component effect on page",
  "props": [
    {
      "name": "property name",
      "type": "TypeScript type",
      "required": true/false,
      "description": "property description",
      "defaultValue": "default value (optional)"
    }
  ]
}
\`\`\``

    const userPrompt = `请生成一个React控件：${description}`

    try {
      const response = await this.chatCompletion({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: this.maxTokens,
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('DeepSeek API返回空内容')
      }

      // 提取JSON内容
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/)
      if (!jsonMatch) {
        throw new Error('无法从DeepSeek响应中提取JSON格式的组件定义')
      }

      const componentData = JSON.parse(jsonMatch[1])
      
      // 验证返回的数据结构
      if (!componentData.name || !componentData.code || !componentData.preview || !componentData.props) {
        throw new Error('DeepSeek返回的组件数据结构不完整')
      }

      return componentData
    } catch (error: unknown) {
      const errorObj = error as { message?: string }
      console.error('生成React组件失败:', error)
      throw new Error(`生成React组件失败: ${errorObj.message}`)
    }
  }

  /**
   * 验证组件描述
   */
  async validateDescription(description: string, language: 'zh-CN' | 'en-US' = 'zh-CN'): Promise<{
    isValid: boolean
    suggestions?: string[]
    estimatedComplexity: 'simple' | 'medium' | 'complex'
    requiredFeatures: string[]
  }> {
    const systemPrompt = language === 'zh-CN'
      ? `你是一个React组件开发顾问，专门评估用户对测试测量仪器控件的需求描述。

请分析用户的描述并返回评估结果，要求：

1. 判断描述是否足够清晰和具体
2. 评估实现复杂度（simple/medium/complex）
3. 识别需要的技术特性
4. 提供改进建议

请严格按照以下JSON格式输出：

\`\`\`json
{
  "isValid": true/false,
  "suggestions": ["建议1", "建议2"],
  "estimatedComplexity": "simple/medium/complex",
  "requiredFeatures": ["特性1", "特性2"]
}
\`\`\``
      : `You are a React component development consultant specializing in evaluating user requirements for test and measurement instrument controls.

Please analyze the user's description and return evaluation results with requirements:

1. Determine if the description is clear and specific enough
2. Assess implementation complexity (simple/medium/complex)
3. Identify required technical features
4. Provide improvement suggestions

Please output strictly in the following JSON format:

\`\`\`json
{
  "isValid": true/false,
  "suggestions": ["suggestion1", "suggestion2"],
  "estimatedComplexity": "simple/medium/complex",
  "requiredFeatures": ["feature1", "feature2"]
}
\`\`\``

    try {
      const response = await this.chatCompletion({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `请评估这个控件描述：${description}` }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('DeepSeek API返回空内容')
      }

      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/)
      if (!jsonMatch) {
        throw new Error('无法从DeepSeek响应中提取JSON格式的验证结果')
      }

      return JSON.parse(jsonMatch[1])
    } catch (error: unknown) {
      console.error('验证描述失败:', error)
      // 返回默认验证结果
      return {
        isValid: description.length >= 10,
        suggestions: description.length < 10 ? ['描述太短，请提供更多细节'] : undefined,
        estimatedComplexity: 'medium' as const,
        requiredFeatures: []
      }
    }
  }
}

export const volcesDeepSeekClient = new VolcesDeepSeekClient()
