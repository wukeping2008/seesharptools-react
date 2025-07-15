# 🔄 组件迁移指南 - Vue to React

## 📋 组件迁移策略

基于对Vue版本的深入分析，本文档提供详细的组件迁移指南，包括具体的代码示例和最佳实践。

### 🎯 迁移原则

1. **保持功能一致性** - 确保React版本具有相同的功能特性
2. **优化性能** - 利用React的优化特性提升性能
3. **改善开发体验** - 使用现代React模式和最佳实践
4. **保持API兼容** - 尽可能保持相似的组件API

## 🔧 核心组件迁移

### 1. 简单控件迁移

#### SimpleButton 组件

**Vue版本分析：**
```vue
<!-- frontend/src/components/simple/SimpleButton.vue -->
<template>
  <button 
    :class="buttonClass" 
    :disabled="disabled"
    @click="handleClick"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  type?: 'primary' | 'secondary' | 'danger'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'primary',
  size: 'medium',
  disabled: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonClass = computed(() => [
  'simple-button',
  `simple-button--${props.type}`,
  `simple-button--${props.size}`,
  { 'simple-button--disabled': props.disabled }
])

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>
```

**React版本实现：**
```typescript
// src/components/simple/SimpleButton.tsx
import React, { memo } from 'react'
import styled, { css } from 'styled-components'

interface SimpleButtonProps {
  type?: 'primary' | 'secondary' | 'danger'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  children: React.ReactNode
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  className?: string
}

const StyledButton = styled.button<SimpleButtonProps>`
  /* 基础样式 */
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  
  /* 尺寸样式 */
  ${props => props.size === 'small' && css`
    padding: 6px 12px;
    font-size: 12px;
    height: 28px;
  `}
  
  ${props => props.size === 'medium' && css`
    padding: 8px 16px;
    font-size: 14px;
    height: 36px;
  `}
  
  ${props => props.size === 'large' && css`
    padding: 12px 24px;
    font-size: 16px;
    height: 44px;
  `}
  
  /* 类型样式 */
  ${props => props.type === 'primary' && css`
    background: #2E86AB;
    color: white;
    
    &:hover:not(:disabled) {
      background: #1F5F7A;
    }
  `}
  
  ${props => props.type === 'secondary' && css`
    background: #f5f5f5;
    color: #333;
    border: 1px solid #d9d9d9;
    
    &:hover:not(:disabled) {
      background: #e6f7ff;
      border-color: #2E86AB;
    }
  `}
  
  ${props => props.type === 'danger' && css`
    background: #ff4d4f;
    color: white;
    
    &:hover:not(:disabled) {
      background: #ff7875;
    }
  `}
  
  /* 禁用状态 */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

export const SimpleButton: React.FC<SimpleButtonProps> = memo(({
  type = 'primary',
  size = 'medium',
  disabled = false,
  children,
  onClick,
  className
}) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && onClick) {
      onClick(event)
    }
  }

  return (
    <StyledButton
      type={type}
      size={size}
      disabled={disabled}
      onClick={handleClick}
      className={className}
    >
      {children}
    </StyledButton>
  )
})

SimpleButton.displayName = 'SimpleButton'
```

#### SimpleCircularGauge 组件

**Vue版本分析：**
```vue
<!-- 基于Vue版本的圆形仪表组件 -->
<template>
  <div class="circular-gauge">
    <svg :width="size" :height="size">
      <!-- 背景圆弧 -->
      <path :d="backgroundPath" :stroke="backgroundColor" />
      <!-- 数值圆弧 -->
      <path :d="valuePath" :stroke="valueColor" />
      <!-- 指针 -->
      <line :x1="centerX" :y1="centerY" :x2="pointerX" :y2="pointerY" />
      <!-- 中心文本 -->
      <text :x="centerX" :y="centerY" text-anchor="middle">
        {{ displayValue }}
      </text>
    </svg>
  </div>
</template>
```

**React版本实现：**
```typescript
// src/components/simple/SimpleCircularGauge.tsx
import React, { memo, useMemo } from 'react'
import styled from 'styled-components'

interface SimpleCircularGaugeProps {
  value: number
  min?: number
  max?: number
  size?: number
  unit?: string
  title?: string
  backgroundColor?: string
  valueColor?: string
  showPointer?: boolean
  precision?: number
}

const GaugeContainer = styled.div<{ size: number }>`
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`

const GaugeSvg = styled.svg`
  transform: rotate(-90deg);
`

const GaugeText = styled.div`
  position: absolute;
  text-align: center;
  font-weight: 600;
  color: #333;
`

const GaugeValue = styled.div`
  font-size: 24px;
  line-height: 1;
`

const GaugeUnit = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 4px;
`

const GaugeTitle = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
`

export const SimpleCircularGauge: React.FC<SimpleCircularGaugeProps> = memo(({
  value,
  min = 0,
  max = 100,
  size = 200,
  unit = '',
  title = '',
  backgroundColor = '#e6f7ff',
  valueColor = '#2E86AB',
  showPointer = true,
  precision = 1
}) => {
  const radius = size / 2 - 20
  const centerX = size / 2
  const centerY = size / 2
  const startAngle = 0
  const endAngle = 270 // 3/4 圆
  
  const { backgroundPath, valuePath, pointerCoords } = useMemo(() => {
    // 计算背景路径
    const backgroundPath = describeArc(centerX, centerY, radius, startAngle, endAngle)
    
    // 计算数值路径
    const percentage = Math.min(Math.max((value - min) / (max - min), 0), 1)
    const valueAngle = startAngle + (endAngle - startAngle) * percentage
    const valuePath = describeArc(centerX, centerY, radius, startAngle, valueAngle)
    
    // 计算指针坐标
    const pointerAngle = (startAngle + valueAngle) * Math.PI / 180
    const pointerX = centerX + (radius - 10) * Math.cos(pointerAngle)
    const pointerY = centerY + (radius - 10) * Math.sin(pointerAngle)
    
    return {
      backgroundPath,
      valuePath,
      pointerCoords: { x: pointerX, y: pointerY }
    }
  }, [value, min, max, centerX, centerY, radius, startAngle, endAngle])
  
  const displayValue = value.toFixed(precision)
  
  return (
    <GaugeContainer size={size}>
      <GaugeSvg width={size} height={size}>
        {/* 背景圆弧 */}
        <path
          d={backgroundPath}
          stroke={backgroundColor}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
        />
        
        {/* 数值圆弧 */}
        <path
          d={valuePath}
          stroke={valueColor}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
        />
        
        {/* 指针 */}
        {showPointer && (
          <line
            x1={centerX}
            y1={centerY}
            x2={pointerCoords.x}
            y2={pointerCoords.y}
            stroke="#333"
            strokeWidth="2"
            strokeLinecap="round"
          />
        )}
        
        {/* 中心点 */}
        <circle
          cx={centerX}
          cy={centerY}
          r="4"
          fill="#333"
        />
      </GaugeSvg>
      
      <GaugeText>
        {title && <GaugeTitle>{title}</GaugeTitle>}
        <GaugeValue>{displayValue}</GaugeValue>
        {unit && <GaugeUnit>{unit}</GaugeUnit>}
      </GaugeText>
    </GaugeContainer>
  )
})

// 辅助函数：生成SVG弧形路径
function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(x, y, radius, endAngle)
  const end = polarToCartesian(x, y, radius, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"
  
  return [
    "M", start.x, start.y, 
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(" ")
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  }
}

SimpleCircularGauge.displayName = 'SimpleCircularGauge'
```

### 2. 高性能图表组件迁移

#### EnhancedStripChart 组件

**React版本实现：**
```typescript
// src/components/charts/EnhancedStripChart.tsx
import React, { useRef, useEffect, memo, useCallback } from 'react'
import styled from 'styled-components'
import { useWebGLRenderer } from '@/hooks/useWebGLRenderer'
import { useVirtualScroll } from '@/hooks/useVirtualScroll'
import { useDataBuffer } from '@/hooks/useDataBuffer'

interface DataPoint {
  timestamp: number
  values: number[]
}

interface EnhancedStripChartProps {
  data: DataPoint[]
  channels: number
  samplingRate: number
  bufferSize?: number
  enableWebGL?: boolean
  width?: number
  height?: number
  colors?: string[]
  onDataUpdate?: (data: DataPoint[]) => void
}

const ChartContainer = styled.div<{ width: number; height: number }>`
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  position: relative;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  overflow: hidden;
`

const ChartCanvas = styled.canvas`
  width: 100%;
  height: 100%;
  display: block;
`

const ChartControls = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 8px;
  background: rgba(255, 255, 255, 0.9);
  padding: 4px 8px;
  border-radius: 4px;
`

const ControlButton = styled.button`
  padding: 4px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 12px;
  
  &:hover {
    background: #f5f5f5;
  }
`

export const EnhancedStripChart: React.FC<EnhancedStripChartProps> = memo(({
  data,
  channels,
  samplingRate,
  bufferSize = 10000,
  enableWebGL = true,
  width = 800,
  height = 400,
  colors = ['#2E86AB', '#F24236', '#F6AE2D', '#2F9B69'],
  onDataUpdate
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { renderChart, isWebGLSupported } = useWebGLRenderer(canvasRef, enableWebGL)
  const { bufferedData, addData, clearBuffer } = useDataBuffer(bufferSize)
  const { visibleData, scrollPosition, onScroll } = useVirtualScroll(bufferedData, width)
  
  // 数据更新处理
  useEffect(() => {
    if (data.length > 0) {
      addData(data)
      if (onDataUpdate) {
        onDataUpdate(bufferedData)
      }
    }
  }, [data, addData, bufferedData, onDataUpdate])
  
  // 渲染图表
  useEffect(() => {
    if (visibleData.length > 0 && canvasRef.current) {
      renderChart(visibleData, {
        width,
        height,
        channels,
        colors,
        samplingRate
      })
    }
  }, [visibleData, renderChart, width, height, channels, colors, samplingRate])
  
  const handleClear = useCallback(() => {
    clearBuffer()
  }, [clearBuffer])
  
  const handlePause = useCallback(() => {
    // 暂停数据采集逻辑
  }, [])
  
  return (
    <ChartContainer width={width} height={height}>
      <ChartCanvas
        ref={canvasRef}
        width={width}
        height={height}
        onScroll={onScroll}
      />
      
      <ChartControls>
        <ControlButton onClick={handlePause}>
          暂停
        </ControlButton>
        <ControlButton onClick={handleClear}>
          清除
        </ControlButton>
        <span style={{ fontSize: '12px', color: '#666' }}>
          {isWebGLSupported ? 'WebGL' : 'Canvas'} | {bufferedData.length} 点
        </span>
      </ChartControls>
    </ChartContainer>
  )
})

EnhancedStripChart.displayName = 'EnhancedStripChart'
```

### 3. AI控件生成器迁移

#### AIControlGenerator 页面

**React版本实现：**
```typescript
// src/pages/AIControlGenerator.tsx
import React, { useState, useCallback } from 'react'
import { Card, Input, Button, Alert, Space, Typography, Row, Col } from 'antd'
import { RobotOutlined, CodeOutlined, EyeOutlined } from '@ant-design/icons'
import styled from 'styled-components'
import { useAIControl } from '@/hooks/useAIControl'
import { useAIStore } from '@/stores/useAIStore'
import { AIInputSection } from '@/components/ai/AIInputSection'
import { AIPreviewSection } from '@/components/ai/AIPreviewSection'
import { AITemplateSection } from '@/components/ai/AITemplateSection'

const { Title, Paragraph } = Typography
const { TextArea } = Input

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
`

const StatusAlert = styled(Alert)`
  margin-bottom: 24px;
`

const GenerateSection = styled(Card)`
  margin-bottom: 24px;
`

const PreviewSection = styled(Card)`
  margin-bottom: 24px;
`

const CodeSection = styled.div`
  background: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
`

const CodeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #e8e8e8;
  border-bottom: 1px solid #d0d0d0;
`

const CodeBlock = styled.pre`
  margin: 0;
  padding: 16px;
  overflow-x: auto;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  background: #f8f8f8;
`

export const AIControlGenerator: React.FC = () => {
  const [description, setDescription] = useState('')
  const { generateControl, isGenerating, error } = useAIControl()
  const { templates, generatedCode, hasApiKey } = useAIStore()
  
  const handleGenerate = useCallback(async () => {
    if (!description.trim()) return
    
    try {
      await generateControl({ description })
    } catch (err) {
      console.error('生成失败:', err)
    }
  }, [description, generateControl])
  
  const handleTemplateSelect = useCallback((template: any) => {
    setDescription(template.description)
  }, [])
  
  const handleCopyCode = useCallback(async () => {
    if (generatedCode) {
      try {
        await navigator.clipboard.writeText(generatedCode)
        // 显示成功消息
      } catch (err) {
        console.error('复制失败:', err)
      }
    }
  }, [generatedCode])
  
  return (
    <PageContainer>
      <Title level={1}>
        <RobotOutlined /> AI控件生成器
      </Title>
      
      <Paragraph>
        使用自然语言描述您需要的控件，AI将为您生成完整的React组件代码。
      </Paragraph>
      
      {/* API状态提示 */}
      <StatusAlert
        message={hasApiKey ? '✅ 已配置AI API，将使用真实AI生成控件' : '⚠️ 未配置AI API，将使用预定义模板'}
        type={hasApiKey ? 'success' : 'warning'}
        showIcon
        closable={false}
      />
      
      {/* 输入区域 */}
      <GenerateSection
        title="描述您需要的控件"
        extra={<CodeOutlined />}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <TextArea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="例如：创建一个显示温度的圆形仪表盘，范围0-100°C，带有红色警告区域"
            rows={4}
            maxLength={500}
            showCount
          />
          
          <Button
            type="primary"
            size="large"
            icon={<RobotOutlined />}
            loading={isGenerating}
            disabled={!description.trim()}
            onClick={handleGenerate}
          >
            生成控件
          </Button>
        </Space>
      </GenerateSection>
      
      {/* 模板选择 */}
      <AITemplateSection
        templates={templates}
        onTemplateSelect={handleTemplateSelect}
      />
      
      {/* 生成结果 */}
      {generatedCode && (
        <Row gutter={24}>
          <Col span={12}>
            {/* 代码显示 */}
            <Card
              title="生成的组件代码"
              extra={
                <Button
                  size="small"
                  onClick={handleCopyCode}
                >
                  复制代码
                </Button>
              }
            >
              <CodeSection>
                <CodeHeader>
                  <span>React组件代码</span>
                </CodeHeader>
                <CodeBlock>
                  <code>{generatedCode}</code>
                </CodeBlock>
              </CodeSection>
            </Card>
          </Col>
          
          <Col span={12}>
            {/* 预览区域 */}
            <PreviewSection
              title="控件预览"
              extra={<EyeOutlined />}
            >
              <AIPreviewSection code={generatedCode} />
            </PreviewSection>
          </Col>
        </Row>
      )}
      
      {/* 错误提示 */}
      {error && (
        <Alert
          message="生成失败"
          description={error}
          type="error"
          closable
          onClose={() => {/* 清除错误 */}}
        />
      )}
    </PageContainer>
  )
}
```

### 4. 自定义Hooks实现

#### useWebGLRenderer Hook

```typescript
// src/hooks/useWebGLRenderer.ts
import { useRef, useEffect, useCallback, useState } from 'react'

interface RenderOptions {
  width: number
  height: number
  channels: number
  colors: string[]
  samplingRate: number
}

export const useWebGLRenderer = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  enableWebGL: boolean = true
) => {
  const [gl, setGL] = useState<WebGLRenderingContext | null>(null)
  const [program, setProgram] = useState<WebGLProgram | null>(null)
  const [isWebGLSupported, setIsWebGLSupported] = useState(false)
  
  // 初始化WebGL
  useEffect(() => {
    if (!canvasRef.current || !enableWebGL) return
    
    const canvas = canvasRef.current
    const context = canvas.getContext('webgl')
    
    if (context) {
      setGL(context)
      setIsWebGLSupported(true)
      
      // 创建着色器程序
      const vertexShader = createShader(context, context.VERTEX_SHADER, vertexShaderSource)
      const fragmentShader = createShader(context, context.FRAGMENT_SHADER, fragmentShaderSource)
      
      if (vertexShader && fragmentShader) {
        const shaderProgram = createProgram(context, vertexShader, fragmentShader)
        setProgram(shaderProgram)
      }
    } else {
      setIsWebGLSupported(false)
    }
  }, [canvasRef, enableWebGL])
  
  // 渲染函数
  const renderChart = useCallback((data: any[], options: RenderOptions) => {
    if (!gl || !program || !data.length) return
    
    // WebGL渲染逻辑
    gl.useProgram(program)
    gl.viewport(0, 0, options.width, options.height)
    gl.clearColor(1.0, 1.0, 1.0, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    
    // 处理数据并渲染
    for (let channel = 0; channel < options.channels; channel++) {
      renderChannel(gl, program, data, channel, options)
    }
  }, [gl, program])
  
  // 降级到Canvas 2D渲染
  const renderWithCanvas2D = useCallback((data: any[], options: RenderOptions) => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Canvas 2D渲染逻辑
    ctx.clearRect(0, 0, options.width, options.height)
    
    for (let channel = 0; channel < options.channels; channel++) {
      ctx.strokeStyle = options.colors[channel % options.colors.length]
      ctx.lineWidth = 2
      ctx.beginPath()
      
      // 绘制波形
      data.forEach((point, index) => {
        const x = (index / data.length) * options.width
        const y = options.height / 2 - (point.values[channel] || 0) * options.height / 4
        
        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      
      ctx.stroke()
    }
  }, [canvasRef])
  
  const render = useCallback((data: any[], options: RenderOptions) => {
    if (isWebGLSupported && gl && program) {
      renderChart(data, options)
    } else {
      renderWithCanvas2D(data, options)
    }
  }, [isWebGLSupported, gl, program, renderChart, renderWithCanvas2D])
  
  return {
    renderChart: render,
    isWebGLSupported
  }
}

// WebGL辅助函数
function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compilation error:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  
  return shader
}

function createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
  const program = gl.createProgram()
  if (!program) return null
  
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program linking error:', gl.getProgramInfoLog(program))
    gl.deleteProgram(program)
    return null
  }
  
  return program
}

function renderChannel(gl: WebGLRenderingContext, program: WebGLProgram, data: any[], channel: number, options: RenderOptions) {
  // 具体的通道渲染逻辑
  // 1. 准备顶点数据
  // 2. 创建缓冲区
  // 3. 绑定属性
  // 4. 绘制
}

// 着色器源码
const vertexShaderSource = `
  attribute vec2 a_position;
  uniform vec2 u_resolution;
  
  void main() {
    vec2 zeroToOne = a_position / u_resolution;
    vec2 zeroToTwo = zeroToOne * 2.0;
    vec2 clipSpace = zeroToTwo - 1.0;
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
  }
`

const fragmentShaderSource = `
  precision mediump float;
  uniform vec4 u_color;
  
  void main() {
    gl_FragColor = u_color;
  }
`
```

## 🎯 迁移检查清单

### ✅ 组件迁移完成标准

每个组件迁移完成后，需要满足以下标准：

1. **功能完整性**
   - [ ] 所有Props都已正确迁移
   - [ ] 所有事件处理都已实现
   - [ ] 所有样式都已适配
   - [ ] 所有动画效果都已保留

2. **性能优化**
   - [ ] 使用React.memo优化渲染
   - [ ] 使用useCallback优化函数
   - [ ] 使用useMemo优化计算
   - [ ] 避免不必要的重渲染

3. **类型安全**
   - [ ] 完整的TypeScript类型定义
   - [ ] Props接口定义
   - [ ] 事件处理类型
   - [ ] 返回值类型

4. **测试覆盖**
   - [ ] 单元测试编写
   - [ ] 快照测试
   - [ ] 交互测试
   - [ ] 性能测试

5. **文档完善**
   - [ ] 组件使用文档
   - [ ] Props说明
   - [ ] 示例代码
   - [ ] 最佳实践

### 📋 迁移进度跟踪

| 组件类别 | 组件名称 | 迁移状态 | 测试状态 | 文档状态 |
|---------|---------|---------|---------|---------|
| 简单控件 | SimpleButton | ✅ | ⏳ | ⏳ |
| 简单控件 | SimpleCircularGauge | ✅ | ⏳ | ⏳ |
| 简单控件 | SimpleLinearGauge | ⏳ | ❌ |
