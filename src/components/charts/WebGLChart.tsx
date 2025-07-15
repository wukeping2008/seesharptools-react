import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Card, Button, Space, Slider, InputNumber, Select, Row, Col, Typography, Statistic } from 'antd'
import { PlayCircleOutlined, PauseCircleOutlined, ClearOutlined, ThunderboltOutlined } from '@ant-design/icons'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { useWebGLRenderer, RenderData } from '../../hooks/useWebGLRenderer'

const { Text } = Typography

const ChartContainer = styled.div`
  width: 100%;
  height: 400px;
  position: relative;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  overflow: hidden;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #2a2a2a 100%);
`

const CanvasWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`

const ControlPanel = styled.div`
  margin-top: 16px;
  padding: 16px;
  background: ${props => props.theme.mode === 'dark' ? '#1f1f1f' : '#ffffff'};
  border-radius: 8px;
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#434343' : '#d9d9d9'};
`

const PerformancePanel = styled.div`
  margin-top: 16px;
  padding: 16px;
  background: ${props => props.theme.mode === 'dark' 
    ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' 
    : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)'};
  border-radius: 8px;
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#0ea5e9' : '#0ea5e9'};
`

const ControlRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
  flex-wrap: wrap;

  &:last-child {
    margin-bottom: 0;
  }
`

const Label = styled.span`
  min-width: 80px;
  font-weight: 500;
  color: ${props => props.theme.mode === 'dark' ? '#ffffff' : '#1f2937'};
`

interface WebGLChartProps {
  width?: number
  height?: number
}

/**
 * WebGL高性能图表组件
 * 演示WebGL渲染引擎的能力，支持大数据量实时渲染
 */
const WebGLChart: React.FC<WebGLChartProps> = ({
  width = 800,
  height = 400
}) => {
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | undefined>(undefined)
  const frameCountRef = useRef<number>(0)
  const fpsUpdateTimeRef = useRef<number>(0)
  
  // WebGL渲染器
  const webglRenderer = useWebGLRenderer({
    width,
    height,
    backgroundColor: '#0f172a',
    antialias: true,
    powerPreference: 'high-performance'
  })

  // 状态管理
  const [isPlaying, setIsPlaying] = useState(false)
  const [dataPoints, setDataPoints] = useState(1000)
  const [frequency, setFrequency] = useState(2)
  const [amplitude, setAmplitude] = useState(100)
  const [speed, setSpeed] = useState(1)
  const [waveType, setWaveType] = useState<'sine' | 'cosine' | 'square' | 'sawtooth'>('sine')
  const [lineWidth, setLineWidth] = useState(2)

  // 性能监控状态
  const [fps, setFps] = useState(0)
  const [renderTime, setRenderTime] = useState(0)
  const [memoryUsage, setMemoryUsage] = useState(0)

  // 时间变量
  const timeRef = useRef(0)

  // 生成波形数据
  const generateWaveData = useCallback((time: number): RenderData => {
    const startTime = performance.now()
    
    const vertices = new Float32Array(dataPoints * 2)
    const colors = new Float32Array(dataPoints * 3)

    for (let i = 0; i < dataPoints; i++) {
      const x = (i / dataPoints) * width
      const normalizedX = (i / dataPoints) * Math.PI * 4 * frequency
      
      let y: number
      switch (waveType) {
        case 'sine':
          y = Math.sin(normalizedX + time * speed) * amplitude + height / 2
          break
        case 'cosine':
          y = Math.cos(normalizedX + time * speed) * amplitude + height / 2
          break
        case 'square':
          y = (Math.sin(normalizedX + time * speed) > 0 ? 1 : -1) * amplitude + height / 2
          break
        case 'sawtooth':
          y = ((normalizedX + time * speed) % (Math.PI * 2) - Math.PI) / Math.PI * amplitude + height / 2
          break
        default:
          y = height / 2
      }

      vertices[i * 2] = x
      vertices[i * 2 + 1] = y

      // 更亮的彩虹色彩
      const normalizedY = (y - height / 2 + amplitude) / (amplitude * 2)
      const hue = (normalizedY * 300 + time * 50) % 360 // 动态色相变化
      const rgb = hslToRgb(hue / 360, 0.9, 0.6) // 更高的饱和度和亮度
      
      colors[i * 3] = rgb[0]
      colors[i * 3 + 1] = rgb[1]
      colors[i * 3 + 2] = rgb[2]
    }

    const endTime = performance.now()
    setRenderTime(endTime - startTime)

    return {
      vertices,
      colors,
      lineWidth
    }
  }, [dataPoints, width, height, frequency, amplitude, speed, waveType, lineWidth])

  // HSL转RGB（更亮的颜色）
  const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
    const c = (1 - Math.abs(2 * l - 1)) * s
    const x = c * (1 - Math.abs((h * 6) % 2 - 1))
    const m = l - c / 2

    let r = 0, g = 0, b = 0

    if (0 <= h && h < 1/6) {
      r = c; g = x; b = 0
    } else if (1/6 <= h && h < 2/6) {
      r = x; g = c; b = 0
    } else if (2/6 <= h && h < 3/6) {
      r = 0; g = c; b = x
    } else if (3/6 <= h && h < 4/6) {
      r = 0; g = x; b = c
    } else if (4/6 <= h && h < 5/6) {
      r = x; g = 0; b = c
    } else if (5/6 <= h && h < 1) {
      r = c; g = 0; b = x
    }

    return [r + m, g + m, b + m]
  }

  // 计算FPS
  const updateFPS = useCallback((currentTime: number) => {
    frameCountRef.current++
    
    // 如果是第一次调用，初始化时间
    if (fpsUpdateTimeRef.current === 0) {
      fpsUpdateTimeRef.current = currentTime
      return
    }
    
    const deltaTime = currentTime - fpsUpdateTimeRef.current
    
    // 更频繁地更新FPS显示（每500ms而不是1000ms）
    if (deltaTime >= 500) {
      const calculatedFps = Math.round((frameCountRef.current * 1000) / deltaTime)
      setFps(calculatedFps)
      frameCountRef.current = 0
      fpsUpdateTimeRef.current = currentTime
    }
  }, [])

  // 动画循环
  const animate = useCallback((currentTime: number) => {
    if (!isPlaying) {
      return
    }

    // 总是更新FPS，即使WebGL没有准备好
    updateFPS(currentTime)
    
    // 更新时间（使用实际时间而不是固定增量）
    timeRef.current = currentTime * 0.001 // 转换为秒

    // 只有WebGL准备好时才进行渲染
    if (webglRenderer.isReady) {
      // 清除画布
      webglRenderer.clear()

      // 生成并渲染线条数据
      const data = generateWaveData(timeRef.current)
      webglRenderer.render(data)

    }

    // 更新内存使用情况（估算）
    const estimatedMemory = (dataPoints * 5 * 4) / 1024 // KB
    setMemoryUsage(estimatedMemory)

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate)
    }
  }, [isPlaying, webglRenderer, generateWaveData, updateFPS, dataPoints])

  // 开始/停止动画
  const toggleAnimation = () => {
    setIsPlaying(!isPlaying)
  }

  // 清除画布
  const clearCanvas = () => {
    setIsPlaying(false)
    timeRef.current = 0
    webglRenderer.clear()
    // 清除时重置所有性能指标
    setFps(0)
    setRenderTime(0)
    setMemoryUsage(0)
    frameCountRef.current = 0
    fpsUpdateTimeRef.current = 0
  }

  // 渲染静态图像
  const renderStatic = useCallback(() => {
    if (!webglRenderer.isReady) return

    webglRenderer.clear()
    const data = generateWaveData(timeRef.current)
    webglRenderer.render(data)
  }, [webglRenderer, generateWaveData])

  // 监听动画状态
  useEffect(() => {
    if (isPlaying) {
      // 重置FPS计算
      fpsUpdateTimeRef.current = 0
      frameCountRef.current = 0
      
      animationRef.current = requestAnimationFrame(animate)
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = undefined
      }
      // 停止时保持最后的FPS值，不重置为0
      // setFps(0) // 注释掉这行
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = undefined
      }
    }
  }, [isPlaying, animate])

  // 监听参数变化，重新渲染静态图像
  useEffect(() => {
    if (!isPlaying) {
      renderStatic()
    }
  }, [dataPoints, frequency, amplitude, waveType, lineWidth, renderStatic])

  // 将canvas添加到DOM
  useEffect(() => {
    if (webglRenderer.canvas && containerRef.current) {
      containerRef.current.appendChild(webglRenderer.canvas)
      
      return () => {
        if (webglRenderer.canvas && containerRef.current) {
          try {
            containerRef.current.removeChild(webglRenderer.canvas)
          } catch {
            // Canvas可能已经被移除
          }
        }
      }
    }
  }, [webglRenderer.canvas])

  return (
    <Card title={t('charts.webglChart')} style={{ width: '100%' }}>
      <ChartContainer>
        <CanvasWrapper ref={containerRef} />
      </ChartContainer>

      {/* 性能监控面板 */}
      <PerformancePanel>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title={`${t('charts.performance.fps')} (${t('charts.performance.fps')})`}
              value={fps}
              suffix="fps"
              prefix={<ThunderboltOutlined style={{ color: '#10b981' }} />}
              valueStyle={{ color: fps > 50 ? '#10b981' : fps > 30 ? '#f59e0b' : '#ef4444' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title={t('charts.performance.renderTime')}
              value={renderTime}
              suffix="ms"
              precision={2}
              valueStyle={{ color: renderTime < 5 ? '#10b981' : renderTime < 10 ? '#f59e0b' : '#ef4444' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title={t('charts.performance.dataPoints')}
              value={dataPoints}
              suffix="pts"
              valueStyle={{ color: '#3b82f6' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title={t('charts.performance.memoryUsage')}
              value={memoryUsage}
              suffix="KB"
              precision={1}
              valueStyle={{ color: '#8b5cf6' }}
            />
          </Col>
        </Row>
        <div style={{ marginTop: 8 }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            💡 {t('charts.performance.tips')}
          </Text>
        </div>
      </PerformancePanel>

      <ControlPanel>
        <ControlRow>
          <Space>
            <Button
              type="primary"
              icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={toggleAnimation}
              size="large"
            >
              {isPlaying ? t('common.pause') : t('common.play')}
            </Button>
            <Button
              icon={<ClearOutlined />}
              onClick={clearCanvas}
              size="large"
            >
              {t('common.clear')}
            </Button>
          </Space>
        </ControlRow>

        <ControlRow>
          <Label>{t('charts.waveType')}:</Label>
          <Select
            value={waveType}
            onChange={setWaveType}
            style={{ width: 120 }}
            options={[
              { label: t('charts.sine'), value: 'sine' },
              { label: t('charts.cosine'), value: 'cosine' },
              { label: t('charts.square'), value: 'square' },
              { label: t('charts.sawtooth'), value: 'sawtooth' }
            ]}
          />

          <Label>{t('charts.dataPoints')}:</Label>
          <Slider
            min={100}
            max={10000}
            step={100}
            value={dataPoints}
            onChange={setDataPoints}
            style={{ width: 200 }}
          />
          <InputNumber
            min={100}
            max={10000}
            value={dataPoints}
            onChange={(value) => setDataPoints(value ?? 1000)}
            style={{ width: 80 }}
          />
        </ControlRow>

        <ControlRow>
          <Label>{t('charts.frequency')}:</Label>
          <Slider
            min={0.1}
            max={10}
            step={0.1}
            value={frequency}
            onChange={setFrequency}
            style={{ width: 200 }}
          />
          <InputNumber
            min={0.1}
            max={10}
            step={0.1}
            value={frequency}
            onChange={(value) => setFrequency(value || 2)}
            style={{ width: 80 }}
          />

          <Label>{t('charts.amplitude')}:</Label>
          <Slider
            min={10}
            max={180}
            value={amplitude}
            onChange={setAmplitude}
            style={{ width: 200 }}
          />
          <InputNumber
            min={10}
            max={180}
            value={amplitude}
            onChange={(value) => setAmplitude(value || 100)}
            style={{ width: 80 }}
          />
        </ControlRow>

        <ControlRow>
          <Label>{t('charts.speed')}:</Label>
          <Slider
            min={0.1}
            max={5}
            step={0.1}
            value={speed}
            onChange={setSpeed}
            style={{ width: 200 }}
          />
          <InputNumber
            min={0.1}
            max={5}
            step={0.1}
            value={speed}
            onChange={(value) => setSpeed(value || 1)}
            style={{ width: 80 }}
          />

          <Label>{t('charts.lineWidth')}:</Label>
          <Slider
            min={1}
            max={10}
            value={lineWidth}
            onChange={setLineWidth}
            style={{ width: 200 }}
          />
          <InputNumber
            min={1}
            max={10}
            value={lineWidth}
            onChange={(value) => setLineWidth(value || 2)}
            style={{ width: 80 }}
          />
        </ControlRow>

      </ControlPanel>
    </Card>
  )
}

export default WebGLChart
