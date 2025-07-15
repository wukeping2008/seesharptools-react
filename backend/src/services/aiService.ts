import { v4 as uuidv4 } from 'uuid'
import { AIControlRequest, AIControlResponse, ValidationResult } from '../types'
import { dataService } from './dataService'
import { volcesDeepSeekClient } from './volcesDeepSeekClient'

class AIService {
  // 使用真实AI生成控件
  async generateControl(request: AIControlRequest): Promise<AIControlResponse> {
    const controlId = uuidv4()
    const now = new Date().toISOString()

    try {
      console.log(`🚀 开始使用DeepSeek AI生成控件: ${request.description}`)
      
      // 使用DeepSeek AI生成真实的React组件
      const generatedControl = await volcesDeepSeekClient.generateReactComponent(
        request.description,
        request.language
      )

      console.log(`✅ DeepSeek AI生成成功: ${generatedControl.name}`)

      const response: AIControlResponse = {
        id: controlId,
        code: generatedControl.code,
        preview: generatedControl.preview,
        metadata: {
          name: generatedControl.name,
          description: request.description,
          props: generatedControl.props.map(prop => ({
            name: prop.name,
            type: prop.type,
            required: prop.required,
            description: prop.description,
            defaultValue: prop.defaultValue
          })),
          dependencies: ['react', '@types/react'],
          complexity: this.estimateComplexity(request.description),
          estimatedTime: 5000 // AI生成通常需要更多时间
        },
        createdAt: now,
        status: 'success'
      }

      // 保存到数据库
      await dataService.saveControl({
        description: request.description,
        code: response.code,
        preview: response.preview,
        metadata: response.metadata
      })

      return response
    } catch (error) {
      console.error('❌ DeepSeek AI生成失败，回退到模拟生成:', error)
      
      // 如果AI生成失败，回退到模拟生成
      const fallbackControl = this.generateControlByDescription(request.description, request.language)
      
      const response: AIControlResponse = {
        id: controlId,
        code: fallbackControl.code,
        preview: fallbackControl.preview,
        metadata: {
          name: `${fallbackControl.name} (模拟)`,
          description: request.description,
          props: fallbackControl.props,
          dependencies: ['react', '@types/react'],
          complexity: this.estimateComplexity(request.description),
          estimatedTime: 2000
        },
        createdAt: now,
        status: 'success'
      }

      // 保存到数据库
      await dataService.saveControl({
        description: request.description,
        code: response.code,
        preview: response.preview,
        metadata: response.metadata
      })

      return response
    }
  }

  // 使用AI验证描述
  async validateDescription(description: string, language: 'zh-CN' | 'en-US'): Promise<ValidationResult> {
    try {
      console.log(`🔍 使用DeepSeek AI验证描述: ${description}`)
      
      // 使用DeepSeek AI进行智能验证
      const aiValidation = await volcesDeepSeekClient.validateDescription(description, language)
      
      console.log(`✅ DeepSeek AI验证完成`)

      return {
        isValid: aiValidation.isValid,
        suggestions: aiValidation.suggestions,
        estimatedComplexity: aiValidation.estimatedComplexity,
        estimatedTime: this.getEstimatedTime(aiValidation.estimatedComplexity),
        requiredFeatures: aiValidation.requiredFeatures
      }
    } catch (error) {
      console.error('❌ DeepSeek AI验证失败，回退到本地验证:', error)
      
      // 如果AI验证失败，回退到本地验证
      const complexity = this.estimateComplexity(description)
      const isValid = description.length >= 10 && description.length <= 500
      const suggestions: string[] = []

      if (description.length < 10) {
        suggestions.push(language === 'zh-CN' ? '描述太短，请提供更多细节' : 'Description too short, please provide more details')
      }

      if (description.length > 500) {
        suggestions.push(language === 'zh-CN' ? '描述太长，请简化描述' : 'Description too long, please simplify')
      }

      // 检查是否包含控件类型关键词
      const controlKeywords = ['button', 'input', 'chart', 'gauge', 'meter', 'display', 'indicator', 'progress', 'slider', 'switch', 'led', 'thermometer', '按钮', '输入', '图表', '仪表', '显示', '指示', '进度', '滑块', '开关', '温度计']
      const hasControlKeyword = controlKeywords.some(keyword => description.toLowerCase().includes(keyword))

      if (!hasControlKeyword) {
        suggestions.push(language === 'zh-CN' ? '建议明确指定控件类型，如：按钮、仪表、图表等' : 'Suggest specifying control type, such as: button, gauge, chart, etc.')
      }

      return {
        isValid,
        suggestions: suggestions.length > 0 ? suggestions : undefined,
        estimatedComplexity: complexity,
        estimatedTime: this.getEstimatedTime(complexity),
        requiredFeatures: this.extractRequiredFeatures(description)
      }
    }
  }

  // 根据描述生成控件
  private generateControlByDescription(description: string, language: 'zh-CN' | 'en-US') {
    const lowerDesc = description.toLowerCase()

    // 温度计相关
    if (lowerDesc.includes('温度') || lowerDesc.includes('thermometer') || lowerDesc.includes('temperature')) {
      return this.generateThermometer(description, language)
    }

    // 进度条相关
    if (lowerDesc.includes('进度') || lowerDesc.includes('progress') || lowerDesc.includes('bar')) {
      return this.generateProgressBar(description, language)
    }

    // LED相关
    if (lowerDesc.includes('led') || lowerDesc.includes('指示灯') || lowerDesc.includes('indicator')) {
      return this.generateLEDArray(description, language)
    }

    // 数字显示器相关
    if (lowerDesc.includes('数字') || lowerDesc.includes('digital') || lowerDesc.includes('display')) {
      return this.generateDigitalDisplay(description, language)
    }

    // 仪表盘相关
    if (lowerDesc.includes('仪表') || lowerDesc.includes('gauge') || lowerDesc.includes('meter')) {
      return this.generateGauge(description, language)
    }

    // 默认生成一个通用控件
    return this.generateGenericControl(description, language)
  }

  private generateThermometer(description: string, language: 'zh-CN' | 'en-US') {
    const name = language === 'zh-CN' ? '温度计控件' : 'Thermometer Control'
    
    return {
      name,
      preview: `<div style="display:flex;align-items:center;justify-content:center;width:120px;height:120px;border-radius:50%;border:4px solid #ff4d4f;background:conic-gradient(#ff4d4f 0% 25%, #faad14 25% 50%, #52c41a 50% 75%, #1890ff 75% 100%);position:relative;">
        <div style="width:80px;height:80px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;font-weight:bold;color:#ff4d4f;font-size:16px;">
          25°C
        </div>
        <div style="position:absolute;top:-10px;right:10px;width:20px;height:20px;border-radius:50%;background:#ff4d4f;"></div>
      </div>`,
      props: [
        { name: 'value', type: 'number', required: true, description: language === 'zh-CN' ? '当前温度值' : 'Current temperature value', defaultValue: 25 },
        { name: 'minValue', type: 'number', required: false, description: language === 'zh-CN' ? '最小值' : 'Minimum value', defaultValue: 0 },
        { name: 'maxValue', type: 'number', required: false, description: language === 'zh-CN' ? '最大值' : 'Maximum value', defaultValue: 100 },
        { name: 'unit', type: 'string', required: false, description: language === 'zh-CN' ? '温度单位' : 'Temperature unit', defaultValue: '°C' },
        { name: 'warningThreshold', type: 'number', required: false, description: language === 'zh-CN' ? '警告阈值' : 'Warning threshold', defaultValue: 80 }
      ],
      code: `import React from 'react';

interface ThermometerProps {
  value: number;
  minValue?: number;
  maxValue?: number;
  unit?: string;
  warningThreshold?: number;
}

export const Thermometer: React.FC<ThermometerProps> = ({
  value,
  minValue = 0,
  maxValue = 100,
  unit = '°C',
  warningThreshold = 80
}) => {
  const percentage = Math.min(100, Math.max(0, ((value - minValue) / (maxValue - minValue)) * 100));
  const isWarning = value >= warningThreshold;
  
  const getColor = () => {
    if (isWarning) return '#ff4d4f';
    if (percentage > 75) return '#faad14';
    if (percentage > 50) return '#52c41a';
    return '#1890ff';
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '120px',
      height: '120px',
      borderRadius: '50%',
      border: \`4px solid \${getColor()}\`,
      background: \`conic-gradient(\${getColor()} 0% \${percentage}%, #f0f0f0 \${percentage}% 100%)\`,
      position: 'relative'
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        color: getColor(),
        fontSize: '16px'
      }}>
        {value}{unit}
      </div>
      {isWarning && (
        <div style={{
          position: 'absolute',
          top: '-10px',
          right: '10px',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: '#ff4d4f',
          animation: 'pulse 1s infinite'
        }} />
      )}
    </div>
  );
};`
    }
  }

  private generateProgressBar(description: string, language: 'zh-CN' | 'en-US') {
    const name = language === 'zh-CN' ? '进度条控件' : 'Progress Bar Control'
    
    return {
      name,
      preview: `<div style="width:250px;position:relative;">
        <div style="width:100%;height:24px;background:#f0f0f0;border-radius:12px;overflow:hidden;box-shadow:inset 0 2px 4px rgba(0,0,0,0.1);">
          <div style="width:65%;height:100%;background:linear-gradient(90deg,#1890ff,#52c41a);border-radius:12px;position:relative;overflow:hidden;">
            <div style="position:absolute;top:0;left:0;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent);animation:shimmer 2s infinite;"></div>
          </div>
        </div>
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:12px;font-weight:bold;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,0.5);">65%</div>
      </div>`,
      props: [
        { name: 'percentage', type: 'number', required: true, description: language === 'zh-CN' ? '进度百分比' : 'Progress percentage', defaultValue: 0 },
        { name: 'showText', type: 'boolean', required: false, description: language === 'zh-CN' ? '显示百分比文字' : 'Show percentage text', defaultValue: true },
        { name: 'animated', type: 'boolean', required: false, description: language === 'zh-CN' ? '启用动画效果' : 'Enable animation', defaultValue: true },
        { name: 'color', type: 'string', required: false, description: language === 'zh-CN' ? '进度条颜色' : 'Progress bar color', defaultValue: '#1890ff' }
      ],
      code: `import React from 'react';

interface ProgressBarProps {
  percentage: number;
  showText?: boolean;
  animated?: boolean;
  color?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  showText = true,
  animated = true,
  color = '#1890ff'
}) => {
  const clampedPercentage = Math.min(100, Math.max(0, percentage));

  return (
    <div style={{ width: '250px', position: 'relative' }}>
      <div style={{
        width: '100%',
        height: '24px',
        background: '#f0f0f0',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          width: \`\${clampedPercentage}%\`,
          height: '100%',
          background: \`linear-gradient(90deg, \${color}, #52c41a)\`,
          borderRadius: '12px',
          position: 'relative',
          overflow: 'hidden',
          transition: 'width 0.3s ease'
        }}>
          {animated && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              animation: 'shimmer 2s infinite'
            }} />
          )}
        </div>
      </div>
      {showText && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '12px',
          fontWeight: 'bold',
          color: clampedPercentage > 50 ? '#fff' : '#333',
          textShadow: clampedPercentage > 50 ? '0 1px 2px rgba(0,0,0,0.5)' : 'none'
        }}>
          {Math.round(clampedPercentage)}%
        </div>
      )}
    </div>
  );
};`
    }
  }

  private generateLEDArray(description: string, language: 'zh-CN' | 'en-US') {
    const name = language === 'zh-CN' ? 'LED指示灯阵列' : 'LED Indicator Array'
    
    return {
      name,
      preview: `<div style="display:grid;grid-template-columns:repeat(8,1fr);gap:4px;width:200px;padding:8px;background:#1f1f1f;border-radius:8px;">
        ${Array.from({ length: 64 }, () => {
          const isOn = Math.random() > 0.7
          const colors = ['#ff4d4f', '#52c41a', '#1890ff', '#faad14']
          const color = colors[Math.floor(Math.random() * colors.length)]
          return `<div style="width:20px;height:20px;border-radius:50%;background:${isOn ? color : '#333'};box-shadow:${isOn ? `0 0 8px ${color}` : 'none'};"></div>`
        }).join('')}
      </div>`,
      props: [
        { name: 'rows', type: 'number', required: false, description: language === 'zh-CN' ? '行数' : 'Number of rows', defaultValue: 8 },
        { name: 'cols', type: 'number', required: false, description: language === 'zh-CN' ? '列数' : 'Number of columns', defaultValue: 8 },
        { name: 'data', type: 'number[][]', required: true, description: language === 'zh-CN' ? 'LED状态数据' : 'LED state data', defaultValue: [] },
        { name: 'colors', type: 'string[]', required: false, description: language === 'zh-CN' ? '颜色数组' : 'Color array', defaultValue: ['#ff4d4f', '#52c41a', '#1890ff'] }
      ],
      code: `import React from 'react';

interface LEDArrayProps {
  rows?: number;
  cols?: number;
  data: number[][];
  colors?: string[];
}

export const LEDArray: React.FC<LEDArrayProps> = ({
  rows = 8,
  cols = 8,
  data,
  colors = ['#ff4d4f', '#52c41a', '#1890ff', '#faad14']
}) => {
  const getLEDStyle = (value: number) => {
    const isOn = value > 0;
    const colorIndex = Math.min(value - 1, colors.length - 1);
    const color = isOn ? colors[colorIndex] : '#333';
    
    return {
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      background: color,
      boxShadow: isOn ? \`0 0 8px \${color}\` : 'none',
      transition: 'all 0.3s ease'
    };
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: \`repeat(\${cols}, 1fr)\`,
      gap: '4px',
      width: \`\${cols * 24}px\`,
      padding: '8px',
      background: '#1f1f1f',
      borderRadius: '8px'
    }}>
      {Array.from({ length: rows }, (_, row) =>
        Array.from({ length: cols }, (_, col) => (
          <div
            key={\`\${row}-\${col}\`}
            style={getLEDStyle(data[row]?.[col] || 0)}
          />
        ))
      )}
    </div>
  );
};`
    }
  }

  private generateDigitalDisplay(description: string, language: 'zh-CN' | 'en-US') {
    const name = language === 'zh-CN' ? '数字显示器' : 'Digital Display'
    
    return {
      name,
      preview: `<div style="background:#000;color:#00ff00;font-family:monospace;font-size:32px;font-weight:bold;padding:16px 24px;border-radius:8px;border:2px solid #333;box-shadow:inset 0 0 20px rgba(0,255,0,0.3);text-align:center;min-width:200px;">
        88.8°C
      </div>`,
      props: [
        { name: 'value', type: 'number', required: true, description: language === 'zh-CN' ? '显示值' : 'Display value', defaultValue: 0 },
        { name: 'unit', type: 'string', required: false, description: language === 'zh-CN' ? '单位' : 'Unit', defaultValue: '' },
        { name: 'precision', type: 'number', required: false, description: language === 'zh-CN' ? '小数位数' : 'Decimal places', defaultValue: 1 },
        { name: 'color', type: 'string', required: false, description: language === 'zh-CN' ? '显示颜色' : 'Display color', defaultValue: '#00ff00' }
      ],
      code: `import React from 'react';

interface DigitalDisplayProps {
  value: number;
  unit?: string;
  precision?: number;
  color?: string;
}

export const DigitalDisplay: React.FC<DigitalDisplayProps> = ({
  value,
  unit = '',
  precision = 1,
  color = '#00ff00'
}) => {
  const formatValue = (val: number) => {
    return val.toFixed(precision);
  };

  return (
    <div style={{
      background: '#000',
      color: color,
      fontFamily: 'monospace',
      fontSize: '32px',
      fontWeight: 'bold',
      padding: '16px 24px',
      borderRadius: '8px',
      border: '2px solid #333',
      boxShadow: \`inset 0 0 20px \${color}33\`,
      textAlign: 'center',
      minWidth: '200px',
      textShadow: \`0 0 10px \${color}\`
    }}>
      {formatValue(value)}{unit}
    </div>
  );
};`
    }
  }

  private generateGauge(description: string, language: 'zh-CN' | 'en-US') {
    const name = language === 'zh-CN' ? '仪表盘控件' : 'Gauge Control'
    
    return {
      name,
      preview: `<div style="position:relative;width:150px;height:150px;">
        <svg width="150" height="150" viewBox="0 0 150 150">
          <circle cx="75" cy="75" r="60" fill="none" stroke="#f0f0f0" stroke-width="8"/>
          <circle cx="75" cy="75" r="60" fill="none" stroke="#1890ff" stroke-width="8" stroke-dasharray="251.2" stroke-dashoffset="125.6" stroke-linecap="round" transform="rotate(-90 75 75)"/>
          <circle cx="75" cy="75" r="8" fill="#1890ff"/>
        </svg>
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:18px;font-weight:bold;color:#1890ff;">50%</div>
      </div>`,
      props: [
        { name: 'value', type: 'number', required: true, description: language === 'zh-CN' ? '当前值' : 'Current value', defaultValue: 0 },
        { name: 'min', type: 'number', required: false, description: language === 'zh-CN' ? '最小值' : 'Minimum value', defaultValue: 0 },
        { name: 'max', type: 'number', required: false, description: language === 'zh-CN' ? '最大值' : 'Maximum value', defaultValue: 100 },
        { name: 'unit', type: 'string', required: false, description: language === 'zh-CN' ? '单位' : 'Unit', defaultValue: '%' }
      ],
      code: `import React from 'react';

interface GaugeProps {
  value: number;
  min?: number;
  max?: number;
  unit?: string;
}

export const Gauge: React.FC<GaugeProps> = ({
  value,
  min = 0,
  max = 100,
  unit = '%'
}) => {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  const circumference = 2 * Math.PI * 60;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  return (
    <div style={{ position: 'relative', width: '150px', height: '150px' }}>
      <svg width="150" height="150" viewBox="0 0 150 150">
        <circle
          cx="75"
          cy="75"
          r="60"
          fill="none"
          stroke="#f0f0f0"
          strokeWidth="8"
        />
        <circle
          cx="75"
          cy="75"
          r="60"
          fill="none"
          stroke="#1890ff"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 75 75)"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
        <circle cx="75" cy="75" r="8" fill="#1890ff" />
      </svg>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#1890ff',
        textAlign: 'center'
      }}>
        {value}{unit}
      </div>
    </div>
  );
};`
    }
  }

  private generateGenericControl(description: string, language: 'zh-CN' | 'en-US') {
    const name = language === 'zh-CN' ? '通用控件' : 'Generic Control'
    
    return {
      name,
      preview: `<div style="padding:16px;border:2px solid #1890ff;border-radius:8px;background:#f0f8ff;text-align:center;min-width:150px;">
        <div style="font-size:16px;font-weight:bold;color:#1890ff;margin-bottom:8px;">${language === 'zh-CN' ? '自定义控件' : 'Custom Control'}</div>
        <div style="font-size:12px;color:#666;">${description.substring(0, 30)}...</div>
      </div>`,
      props: [
        { name: 'title', type: 'string', required: false, description: language === 'zh-CN' ? '标题' : 'Title', defaultValue: 'Custom Control' },
        { name: 'description', type: 'string', required: false, description: language === 'zh-CN' ? '描述' : 'Description', defaultValue: description }
      ],
      code: `import React from 'react';

interface GenericControlProps {
  title?: string;
  description?: string;
}

export const GenericControl: React.FC<GenericControlProps> = ({
  title = 'Custom Control',
  description = '${description}'
}) => {
  return (
    <div style={{
      padding: '16px',
      border: '2px solid #1890ff',
      borderRadius: '8px',
      background: '#f0f8ff',
      textAlign: 'center',
      minWidth: '150px'
    }}>
      <div style={{
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#1890ff',
        marginBottom: '8px'
      }}>
        {title}
      </div>
      <div style={{
        fontSize: '12px',
        color: '#666'
      }}>
        {description}
      </div>
    </div>
  );
};`
    }
  }

  private estimateComplexity(description: string): 'simple' | 'medium' | 'complex' {
    const complexKeywords = ['animation', 'interactive', 'real-time', 'chart', 'graph', 'dynamic', '动画', '交互', '实时', '图表', '动态']
    const mediumKeywords = ['color', 'style', 'theme', 'responsive', '颜色', '样式', '主题', '响应式']
    
    const hasComplex = complexKeywords.some(keyword => description.toLowerCase().includes(keyword))
    const hasMedium = mediumKeywords.some(keyword => description.toLowerCase().includes(keyword))
    
    if (hasComplex) return 'complex'
    if (hasMedium || description.length > 100) return 'medium'
    return 'simple'
  }

  private getEstimatedTime(complexity: 'simple' | 'medium' | 'complex'): number {
    switch (complexity) {
      case 'simple': return 2000
      case 'medium': return 5000
      case 'complex': return 10000
      default: return 3000
    }
  }

  private extractRequiredFeatures(description: string): string[] {
    const features: string[] = []
    const lowerDesc = description.toLowerCase()

    if (lowerDesc.includes('animation') || lowerDesc.includes('动画')) {
      features.push('Animation')
    }
    if (lowerDesc.includes('interactive') || lowerDesc.includes('交互')) {
      features.push('Interactivity')
    }
    if (lowerDesc.includes('responsive') || lowerDesc.includes('响应式')) {
      features.push('Responsive Design')
    }
    if (lowerDesc.includes('real-time') || lowerDesc.includes('实时')) {
      features.push('Real-time Updates')
    }

    return features
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export const aiService = new AIService()
