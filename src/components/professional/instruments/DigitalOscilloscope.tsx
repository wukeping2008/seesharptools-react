import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Card, Button, Select, Slider, InputNumber, Switch, Space, Row, Col, Divider } from 'antd'
import { PlayCircleOutlined, PauseOutlined, StopOutlined, SettingOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { useWebGLRenderer } from '../../../hooks/useWebGLRenderer'
import { generateSine, generateSquare, generateTriangle, generateSawtooth } from '../../../utils/math/signal'
import { powerSpectralDensity } from '../../../utils/math/fft'
import { createLowpassFilter } from '../../../utils/math/filters'

const { Option } = Select

interface OscilloscopeProps {
  width?: number
  height?: number
  channels?: number
  className?: string
}

interface ChannelConfig {
  enabled: boolean
  coupling: 'AC' | 'DC' | 'GND'
  scale: number // V/div
  offset: number // V
  color: string
  bandwidth: number // MHz
  probe: number // 1x, 10x, 100x
}

interface TriggerConfig {
  source: string
  type: 'edge' | 'pulse' | 'video'
  slope: 'rising' | 'falling'
  level: number // V
  mode: 'auto' | 'normal' | 'single'
}

interface TimebaseConfig {
  scale: number // s/div
  position: number // %
  mode: 'normal' | 'roll' | 'xy'
}

interface MeasurementResult {
  channel: number
  type: string
  value: number
  unit: string
}

const OscilloscopeContainer = styled(Card)<{ triggered?: boolean }>`
  .oscilloscope-display {
    background: #0a0a0a;
    border: 2px solid #333;
    border-radius: 4px;
    position: relative;
    overflow: hidden;
  }

  .oscilloscope-grid {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    opacity: 0.3;
  }

  .oscilloscope-controls {
    background: #f5f5f5;
    padding: 16px;
    border-top: 1px solid #d9d9d9;
  }

  .channel-controls {
    background: #fafafa;
    padding: 12px;
    border-radius: 6px;
    margin-bottom: 8px;
  }

  .measurement-display {
    background: #001529;
    color: #fff;
    padding: 8px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 12px;
  }

  .trigger-indicator {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${props => props.triggered ? '#52c41a' : '#ff4d4f'};
  }

  .status-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.8);
    color: #fff;
    padding: 4px 8px;
    font-size: 11px;
    font-family: 'Courier New', monospace;
  }
`

export const DigitalOscilloscope: React.FC<OscilloscopeProps> = ({
  width = 800,
  height = 600,
  channels = 4,
  className
}) => {
  const { t } = useTranslation()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [triggered, setTriggered] = useState(false)
  
  // 通道配置
  const [channelConfigs, setChannelConfigs] = useState<ChannelConfig[]>(() =>
    Array.from({ length: channels }, (_, i) => ({
      enabled: i < 2, // 默认启用前两个通道
      coupling: 'DC' as const,
      scale: 1, // 1V/div
      offset: 0,
      color: ['#00ff00', '#ffff00', '#ff00ff', '#00ffff'][i] || '#ffffff',
      bandwidth: 100, // 100MHz
      probe: 1
    }))
  )

  // 触发配置
  const [triggerConfig, setTriggerConfig] = useState<TriggerConfig>({
    source: 'CH1',
    type: 'edge',
    slope: 'rising',
    level: 0,
    mode: 'auto'
  })

  // 时基配置
  const [timebaseConfig, setTimebaseConfig] = useState<TimebaseConfig>({
    scale: 0.001, // 1ms/div
    position: 50, // 50%
    mode: 'normal'
  })

  // 测量结果
  const [measurements, setMeasurements] = useState<MeasurementResult[]>([])

  // 数据缓冲区
  const [dataBuffers, setDataBuffers] = useState<number[][]>(() =>
    Array.from({ length: channels }, () => [])
  )

  // WebGL渲染器
  const webglRenderer = useWebGLRenderer({
    width,
    height: height - 200, // 减去控制面板高度
    backgroundColor: '#0a0a0a',
    antialias: true
  })

  // 生成测试信号
  const generateTestSignal = useCallback((channelIndex: number): number[] => {
    const sampleRate = 1000000 // 1MHz采样率
    const duration = 0.01 // 10ms
    
    switch (channelIndex) {
      case 0:
        return generateSine({
          sampleRate,
          duration,
          frequency: 1000, // 1kHz
          amplitude: 2,
          offset: 0
        })
      case 1:
        return generateSquare({
          sampleRate,
          duration,
          frequency: 500, // 500Hz
          amplitude: 1.5,
          offset: 0.5
        })
      case 2:
        return generateTriangle({
          sampleRate,
          duration,
          frequency: 2000, // 2kHz
          amplitude: 1,
          offset: 0
        })
      case 3:
        return generateSawtooth({
          sampleRate,
          duration,
          frequency: 750, // 750Hz
          amplitude: 1.2,
          offset: -0.2
        })
      default:
        return []
    }
  }, [])

  // 应用通道滤波和处理
  const processChannelData = useCallback((data: number[], config: ChannelConfig): number[] => {
    let processedData = [...data]

    // 应用耦合
    if (config.coupling === 'AC') {
      // AC耦合：移除直流分量
      const mean = processedData.reduce((sum, val) => sum + val, 0) / processedData.length
      processedData = processedData.map(val => val - mean)
    } else if (config.coupling === 'GND') {
      // 接地：所有值为0
      processedData = new Array(data.length).fill(0)
    }

    // 应用带宽限制
    if (config.bandwidth < 100) {
      const filter = createLowpassFilter(config.bandwidth * 1000000, 1000000) // MHz to Hz
      processedData = filter.processData(processedData)
    }

    // 应用探头衰减
    processedData = processedData.map(val => val / config.probe)

    // 应用垂直缩放和偏移
    processedData = processedData.map(val => (val / config.scale) + config.offset)

    return processedData
  }, [])

  // 触发检测
  const detectTrigger = useCallback((data: number[], config: TriggerConfig): boolean => {
    if (config.mode === 'auto') return true
    
    // 简化的边沿触发检测
    for (let i = 1; i < data.length; i++) {
      const prev = data[i - 1]
      const curr = data[i]
      
      if (config.slope === 'rising' && prev < config.level && curr >= config.level) {
        return true
      } else if (config.slope === 'falling' && prev > config.level && curr <= config.level) {
        return true
      }
    }
    
    return false
  }, [])

  // 计算测量值
  const calculateMeasurements = useCallback((data: number[], channelIndex: number): MeasurementResult[] => {
    if (data.length === 0) return []

    const results: MeasurementResult[] = []
    
    // 峰峰值
    const max = Math.max(...data)
    const min = Math.min(...data)
    const peakToPeak = max - min
    
    results.push({
      channel: channelIndex + 1,
      type: 'Vpp',
      value: peakToPeak,
      unit: 'V'
    })

    // RMS值
    const rms = Math.sqrt(data.reduce((sum, val) => sum + val * val, 0) / data.length)
    results.push({
      channel: channelIndex + 1,
      type: 'Vrms',
      value: rms,
      unit: 'V'
    })

    // 平均值
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length
    results.push({
      channel: channelIndex + 1,
      type: 'Vmean',
      value: mean,
      unit: 'V'
    })

    // 频率测量 (简化)
    // 这里应该使用更复杂的频率检测算法
    const sampleRate = 1000000
    const fftResult = powerSpectralDensity(data, sampleRate)
    const maxIndex = fftResult.magnitudes.indexOf(Math.max(...fftResult.magnitudes))
    const frequency = fftResult.frequencies[maxIndex]
    
    results.push({
      channel: channelIndex + 1,
      type: 'Freq',
      value: frequency,
      unit: 'Hz'
    })

    return results
  }, [])

  // 渲染网格
  const renderGrid = useCallback((ctx: CanvasRenderingContext2D) => {
    const gridSize = 50 // 每格50像素
    
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 1
    
    // 垂直网格线
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height - 200)
      ctx.stroke()
    }
    
    // 水平网格线
    for (let y = 0; y <= height - 200; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
    
    // 中心线
    ctx.strokeStyle = '#666'
    ctx.lineWidth = 2
    
    // 垂直中心线
    ctx.beginPath()
    ctx.moveTo(width / 2, 0)
    ctx.lineTo(width / 2, height - 200)
    ctx.stroke()
    
    // 水平中心线
    ctx.beginPath()
    ctx.moveTo(0, (height - 200) / 2)
    ctx.lineTo(width, (height - 200) / 2)
    ctx.stroke()
  }, [width, height])

  // 渲染波形
  const renderWaveforms = useCallback(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 清除画布
    ctx.clearRect(0, 0, width, height - 200)
    
    // 渲染网格
    renderGrid(ctx)

    // 渲染每个通道的波形
    channelConfigs.forEach((config, channelIndex) => {
      if (!config.enabled || dataBuffers[channelIndex].length === 0) return

      const data = dataBuffers[channelIndex]
      const processedData = processChannelData(data, config)

      ctx.strokeStyle = config.color
      ctx.lineWidth = 2
      ctx.beginPath()

      const xScale = width / processedData.length
      const yScale = (height - 200) / 10 // 10个垂直格
      const yOffset = (height - 200) / 2

      processedData.forEach((value, index) => {
        const x = index * xScale
        const y = yOffset - (value * yScale)
        
        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })

      ctx.stroke()
    })
  }, [channelConfigs, dataBuffers, processChannelData, renderGrid, width, height])

  // 数据采集循环
  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      const newBuffers = channelConfigs.map((config, index) => {
        if (!config.enabled) return []
        return generateTestSignal(index)
      })

      setDataBuffers(newBuffers)

      // 检测触发
      const triggerChannelIndex = parseInt(triggerConfig.source.replace('CH', '')) - 1
      if (triggerChannelIndex >= 0 && triggerChannelIndex < newBuffers.length) {
        const triggerData = newBuffers[triggerChannelIndex]
        const isTriggered = detectTrigger(triggerData, triggerConfig)
        setTriggered(isTriggered)
      }

      // 计算测量值
      const allMeasurements: MeasurementResult[] = []
      newBuffers.forEach((data, index) => {
        if (channelConfigs[index].enabled && data.length > 0) {
          const channelMeasurements = calculateMeasurements(data, index)
          allMeasurements.push(...channelMeasurements)
        }
      })
      setMeasurements(allMeasurements)

    }, 100) // 10Hz刷新率

    return () => clearInterval(interval)
  }, [isRunning, channelConfigs, triggerConfig, generateTestSignal, detectTrigger, calculateMeasurements])

  // 渲染波形
  useEffect(() => {
    renderWaveforms()
  }, [renderWaveforms])

  // 控制函数
  const handleStart = () => setIsRunning(true)
  const handleStop = () => {
    setIsRunning(false)
    setTriggered(false)
  }
  const handleSingleShot = () => {
    // 单次触发逻辑
    setIsRunning(false)
    // 这里应该实现单次采集
  }

  // 更新通道配置
  const updateChannelConfig = (channelIndex: number, updates: Partial<ChannelConfig>) => {
    setChannelConfigs(prev => prev.map((config, index) => 
      index === channelIndex ? { ...config, ...updates } : config
    ))
  }

  return (
    <OscilloscopeContainer 
      className={className}
      title={t('professionalInstruments.oscilloscope.name')}
      triggered={triggered}
      extra={
        <Space>
          <Button 
            type={isRunning ? "default" : "primary"} 
            icon={<PlayCircleOutlined />}
            onClick={handleStart}
            disabled={isRunning}
          >
            {t('professionalInstruments.oscilloscope.run')}
          </Button>
          <Button 
            type={isRunning ? "primary" : "default"}
            icon={<PauseOutlined />}
            onClick={() => setIsRunning(!isRunning)}
          >
            {isRunning ? t('professionalInstruments.oscilloscope.pause') : t('professionalInstruments.oscilloscope.continue')}
          </Button>
          <Button 
            icon={<StopOutlined />}
            onClick={handleStop}
          >
            {t('professionalInstruments.oscilloscope.stop')}
          </Button>
          <Button 
            icon={<SettingOutlined />}
            onClick={handleSingleShot}
          >
            {t('professionalInstruments.oscilloscope.single')}
          </Button>
        </Space>
      }
    >
      <div className="oscilloscope-display" style={{ width, height: height - 200 }}>
        <canvas
          ref={canvasRef}
          width={width}
          height={height - 200}
          style={{ display: 'block' }}
        />
        <div className="trigger-indicator" />
        <div className="status-bar">
          时基: {timebaseConfig.scale * 1000}ms/div | 
          触发: {triggerConfig.source} {triggerConfig.slope} {triggerConfig.level}V |
          采样率: 1MS/s
        </div>
      </div>

      <div className="oscilloscope-controls">
        <Row gutter={16}>
          {/* 通道控制 */}
          <Col span={12}>
            <h4>通道设置</h4>
            {channelConfigs.map((config, index) => (
              <div key={index} className="channel-controls">
                <Row align="middle" gutter={8}>
                  <Col span={3}>
                    <Switch
                      checked={config.enabled}
                      onChange={(enabled) => updateChannelConfig(index, { enabled })}
                    />
                    <span style={{ marginLeft: 4, color: config.color }}>
                      CH{index + 1}
                    </span>
                  </Col>
                  <Col span={4}>
                    <Select
                      value={config.coupling}
                      onChange={(coupling) => updateChannelConfig(index, { coupling })}
                      size="small"
                    >
                      <Option value="DC">DC</Option>
                      <Option value="AC">AC</Option>
                      <Option value="GND">GND</Option>
                    </Select>
                  </Col>
                  <Col span={6}>
                    <span>V/div:</span>
                    <InputNumber
                      value={config.scale}
                      onChange={(scale) => updateChannelConfig(index, { scale: scale || 1 })}
                      min={0.001}
                      max={10}
                      step={0.001}
                      size="small"
                      style={{ width: '100%' }}
                    />
                  </Col>
                  <Col span={6}>
                    <span>偏移:</span>
                    <InputNumber
                      value={config.offset}
                      onChange={(offset) => updateChannelConfig(index, { offset: offset || 0 })}
                      min={-5}
                      max={5}
                      step={0.1}
                      size="small"
                      style={{ width: '100%' }}
                    />
                  </Col>
                  <Col span={5}>
                    <span>探头:</span>
                    <Select
                      value={config.probe}
                      onChange={(probe) => updateChannelConfig(index, { probe })}
                      size="small"
                    >
                      <Option value={1}>1x</Option>
                      <Option value={10}>10x</Option>
                      <Option value={100}>100x</Option>
                    </Select>
                  </Col>
                </Row>
              </div>
            ))}
          </Col>

          {/* 触发和时基控制 */}
          <Col span={6}>
            <h4>触发设置</h4>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <span>源:</span>
                <Select
                  value={triggerConfig.source}
                  onChange={(source) => setTriggerConfig(prev => ({ ...prev, source }))}
                  style={{ width: '100%' }}
                >
                  {Array.from({ length: channels }, (_, i) => (
                    <Option key={i} value={`CH${i + 1}`}>CH{i + 1}</Option>
                  ))}
                </Select>
              </div>
              <div>
                <span>斜率:</span>
                <Select
                  value={triggerConfig.slope}
                  onChange={(slope) => setTriggerConfig(prev => ({ ...prev, slope }))}
                  style={{ width: '100%' }}
                >
                  <Option value="rising">上升沿</Option>
                  <Option value="falling">下降沿</Option>
                </Select>
              </div>
              <div>
                <span>电平:</span>
                <InputNumber
                  value={triggerConfig.level}
                  onChange={(level) => setTriggerConfig(prev => ({ ...prev, level: level || 0 }))}
                  min={-10}
                  max={10}
                  step={0.1}
                  style={{ width: '100%' }}
                />
              </div>
            </Space>

            <Divider />

            <h4>时基设置</h4>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <span>时间/格:</span>
                <Select
                  value={timebaseConfig.scale}
                  onChange={(scale) => setTimebaseConfig(prev => ({ ...prev, scale }))}
                  style={{ width: '100%' }}
                >
                  <Option value={0.000001}>1μs</Option>
                  <Option value={0.00001}>10μs</Option>
                  <Option value={0.0001}>100μs</Option>
                  <Option value={0.001}>1ms</Option>
                  <Option value={0.01}>10ms</Option>
                  <Option value={0.1}>100ms</Option>
                  <Option value={1}>1s</Option>
                </Select>
              </div>
              <div>
                <span>位置:</span>
                <Slider
                  value={timebaseConfig.position}
                  onChange={(position) => setTimebaseConfig(prev => ({ ...prev, position }))}
                  min={0}
                  max={100}
                  style={{ width: '100%' }}
                />
              </div>
            </Space>
          </Col>

          {/* 测量显示 */}
          <Col span={6}>
            <h4>测量结果</h4>
            <div className="measurement-display">
              {measurements.map((measurement, index) => (
                <div key={index}>
                  CH{measurement.channel} {measurement.type}: {measurement.value.toFixed(3)} {measurement.unit}
                </div>
              ))}
            </div>
          </Col>
        </Row>
      </div>
    </OscilloscopeContainer>
  )
}

export default DigitalOscilloscope
