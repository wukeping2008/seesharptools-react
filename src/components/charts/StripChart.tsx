import React, { useEffect, useRef, useState, useCallback } from 'react'
import * as echarts from 'echarts'
import styled from 'styled-components'

const ChartContainer = styled.div<{ width?: string; height?: string }>`
  width: ${props => props.width || '100%'};
  height: ${props => props.height || '400px'};
  position: relative;
`

export interface StripChartProps {
  /** 数据数组 */
  data?: number[]
  /** 时间窗口（秒） - 暂未使用，预留给未来功能 */
  timeWindow?: number
  /** 更新间隔（毫秒） */
  updateInterval?: number
  /** 最大数据点数 */
  maxDataPoints?: number
  /** 线条颜色 */
  lineColor?: string
  /** 线条宽度 */
  lineWidth?: number
  /** 显示网格 */
  showGrid?: boolean
  /** Y轴范围 */
  yAxisRange?: [number, number]
  /** 图表标题 */
  title?: string
  /** X轴标签 */
  xAxisLabel?: string
  /** Y轴标签 */
  yAxisLabel?: string
  /** 图表宽度 */
  width?: string
  /** 图表高度 */
  height?: string
  /** 是否自动开始 */
  autoStart?: boolean
  /** 数据更新回调 */
  onDataUpdate?: (data: number[]) => void
  /** 点击事件回调 */
  onClick?: (params: echarts.ECElementEvent) => void
}

/**
 * StripChart 实时数据条带图组件
 * 
 * 特点：
 * - 实时数据流显示
 * - 滚动显示（新数据从右侧进入，旧数据从左侧滚出）
 * - 固定时间窗口
 * - 高频更新支持
 * 
 * 适用场景：
 * - PXI模块仪器数据监控
 * - 实时传感器数据显示
 * - 过程监控
 * - 信号分析
 */
export const StripChart: React.FC<StripChartProps> = ({
  data = [],
  timeWindow = 30, // eslint-disable-line @typescript-eslint/no-unused-vars
  updateInterval = 100,
  maxDataPoints = 300,
  lineColor = '#1890ff',
  lineWidth = 2,
  showGrid = true,
  yAxisRange,
  title = '实时数据监控',
  xAxisLabel = '时间',
  yAxisLabel = '数值',
  width,
  height,
  autoStart = false,
  onDataUpdate,
  onClick
}) => {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)
  const dataBuffer = useRef<number[]>([])
  const timeBuffer = useRef<string[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const [, setIsRunning] = useState(autoStart)

  // 生成时间标签
  const generateTimeLabel = useCallback(() => {
    const now = new Date()
    return now.toLocaleTimeString('zh-CN', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }, [])

  // 初始化图表
  const initChart = useCallback(() => {
    if (!chartRef.current) return

    chartInstance.current = echarts.init(chartRef.current)

    const option: echarts.EChartsOption = {
      title: {
        text: title,
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'normal'
        }
      },
      tooltip: {
        trigger: 'axis',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        formatter: (params: any) => {
          const param = Array.isArray(params) ? params[0] : params
          return `${param.name}<br/>${param.seriesName}: ${param.value}`
        }
      },
      grid: {
        left: '10%',
        right: '10%',
        bottom: '15%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        name: xAxisLabel,
        nameLocation: 'middle',
        nameGap: 30,
        data: [],
        axisLine: {
          show: true
        },
        axisTick: {
          show: true
        },
        axisLabel: {
          rotate: 45,
          fontSize: 10
        },
        splitLine: {
          show: showGrid,
          lineStyle: {
            color: '#f0f0f0'
          }
        }
      },
      yAxis: {
        type: 'value',
        name: yAxisLabel,
        nameLocation: 'middle',
        nameGap: 50,
        min: yAxisRange?.[0],
        max: yAxisRange?.[1],
        axisLine: {
          show: true
        },
        axisTick: {
          show: true
        },
        splitLine: {
          show: showGrid,
          lineStyle: {
            color: '#f0f0f0'
          }
        }
      },
      series: [
        {
          name: yAxisLabel,
          type: 'line',
          data: [],
          lineStyle: {
            color: lineColor,
            width: lineWidth
          },
          symbol: 'none',
          animation: false
        }
      ],
      animation: false
    }

    chartInstance.current.setOption(option)

    // 绑定点击事件
    if (onClick) {
      chartInstance.current.on('click', onClick)
    }

    // 处理窗口大小变化
    const handleResize = () => {
      chartInstance.current?.resize()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [title, xAxisLabel, yAxisLabel, showGrid, yAxisRange, lineColor, lineWidth, onClick])

  // 添加数据点
  const addDataPoint = useCallback((value: number) => {
    const timeLabel = generateTimeLabel()
    
    // 添加到缓冲区
    dataBuffer.current.push(value)
    timeBuffer.current.push(timeLabel)

    // 保持缓冲区大小
    if (dataBuffer.current.length > maxDataPoints) {
      dataBuffer.current.shift()
      timeBuffer.current.shift()
    }

    // 更新图表
    if (chartInstance.current) {
      chartInstance.current.setOption({
        xAxis: {
          data: timeBuffer.current
        },
        series: [
          {
            data: dataBuffer.current
          }
        ]
      })
    }

    // 触发回调
    if (onDataUpdate) {
      onDataUpdate([...dataBuffer.current])
    }
  }, [generateTimeLabel, maxDataPoints, onDataUpdate])

  // 生成模拟数据
  const generateSimulatedData = useCallback(() => {
    // 生成正弦波 + 噪声
    const time = Date.now() / 1000
    const sineWave = Math.sin(time * 0.5) * 50
    const noise = (Math.random() - 0.5) * 20
    return sineWave + noise + 50 // 偏移到正值范围
  }, [])

  // 启动实时更新
  const startRealTimeUpdate = useCallback(() => {
    if (intervalRef.current) return

    intervalRef.current = setInterval(() => {
      const newValue = generateSimulatedData()
      addDataPoint(newValue)
    }, updateInterval)

    setIsRunning(true)
  }, [generateSimulatedData, addDataPoint, updateInterval])

  // 停止实时更新
  const stopRealTimeUpdate = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsRunning(false)
  }, [])


  // 初始化图表
  useEffect(() => {
    const cleanup = initChart()
    return cleanup
  }, [initChart])

  // 处理外部数据更新
  useEffect(() => {
    if (data && data.length > 0) {
      // 如果有外部数据，使用外部数据
      const currentTime = Date.now()
      const timeLabels = data.map((_, index) => {
        const time = new Date(currentTime - (data.length - 1 - index) * updateInterval)
        return time.toLocaleTimeString('zh-CN', { 
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      })

      dataBuffer.current = [...data]
      timeBuffer.current = timeLabels

      if (chartInstance.current) {
        chartInstance.current.setOption({
          xAxis: {
            data: timeLabels
          },
          series: [
            {
              data: data
            }
          ]
        })
      }
    }
  }, [data, updateInterval])

  // 自动开始
  useEffect(() => {
    if (autoStart && !data?.length) {
      startRealTimeUpdate()
    }

    return () => {
      stopRealTimeUpdate()
    }
  }, [autoStart, data, startRealTimeUpdate, stopRealTimeUpdate])

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      stopRealTimeUpdate()
      if (chartInstance.current) {
        chartInstance.current.dispose()
      }
    }
  }, [stopRealTimeUpdate])

  // 注意：isRunning状态可以通过props传递给父组件
  // 控制方法可以通过回调函数实现

  return (
    <ChartContainer width={width} height={height}>
      <div ref={chartRef} style={{ width: '100%', height: '100%' }} />
    </ChartContainer>
  )
}

export default StripChart
