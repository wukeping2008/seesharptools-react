import React, { useEffect, useMemo, useCallback, useState } from 'react'
import { EChartsOption } from 'echarts'
import { BaseChart, ChartDataManager, ChartTheme } from './core'
import { useTranslation } from 'react-i18next'

/**
 * 增强版StripChart属性接口
 */
export interface EnhancedStripChartProps {
  /** 图表宽度 */
  width?: string
  /** 图表高度 */
  height?: string
  /** 图表标题 */
  title?: string
  /** 主题 */
  theme?: ChartTheme
  /** 最大数据点数 */
  maxDataPoints?: number
  /** 更新间隔（毫秒） */
  updateInterval?: number
  /** 线条颜色 */
  lineColor?: string
  /** 线条宽度 */
  lineWidth?: number
  /** 是否显示网格 */
  showGrid?: boolean
  /** 是否显示工具栏 */
  showToolbox?: boolean
  /** 是否启用缩放 */
  enableZoom?: boolean
  /** Y轴范围 */
  yAxisRange?: [number, number]
  /** X轴标签 */
  xAxisLabel?: string
  /** Y轴标签 */
  yAxisLabel?: string
  /** 是否自动开始 */
  autoStart?: boolean
  /** 外部数据 */
  data?: number[]
  /** 数据更新回调 */
  onDataUpdate?: (data: number[]) => void
  /** 自定义样式 */
  style?: React.CSSProperties
}

/**
 * EnhancedStripChart - 基于新架构的增强版实时数据条带图
 * 
 * 特点：
 * - 基于统一的BaseChart架构
 * - 支持多种专业主题
 * - 统一的数据管理
 * - 更好的性能和扩展性
 */
export const EnhancedStripChart: React.FC<EnhancedStripChartProps> = ({
  width,
  height,
  title,
  theme = 'default',
  maxDataPoints = 300,
  updateInterval = 100,
  lineColor = '#1890ff',
  lineWidth = 2,
  showGrid = true,
  showToolbox = false,
  enableZoom = false,
  yAxisRange,
  xAxisLabel,
  yAxisLabel,
  autoStart = false,
  data,
  onDataUpdate,
  style
}) => {
  const { t } = useTranslation()
  const [chartData, setChartData] = useState<Array<[string, number]>>([])

  // 创建数据管理器
  const dataManager = useMemo(() => {
    return new ChartDataManager({
      maxDataPoints,
      realTimeMode: false, // 我们手动管理实时更新
      updateInterval,
      autoCleanup: true
    })
  }, [maxDataPoints, updateInterval])

  // 生成模拟数据
  const generateSimulatedData = useCallback(() => {
    const time = Date.now() / 1000
    const sineWave = Math.sin(time * 0.5) * 30
    const noise = (Math.random() - 0.5) * 10
    const baseValue = yAxisRange ? (yAxisRange[0] + yAxisRange[1]) / 2 : 50
    return sineWave + noise + baseValue
  }, [yAxisRange])

  // 实时数据更新
  useEffect(() => {
    if (!autoStart || data?.length) return

    // 初始化数据系列
    if (dataManager.getData().length === 0) {
      dataManager.addSeries([])
    }

    const timer = setInterval(() => {
      const newValue = generateSimulatedData()
      const timestamp = Date.now()
      const timeString = new Date(timestamp).toLocaleTimeString('en-US', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
      
      // 添加数据点到数据管理器
      dataManager.appendToSeries(0, [timestamp, newValue])
      
      // 更新本地状态以触发重新渲染
      setChartData(prev => {
        const newData: Array<[string, number]> = [...prev, [timeString, newValue]]
        // 保持最大数据点数限制
        if (newData.length > maxDataPoints) {
          return newData.slice(-maxDataPoints) as Array<[string, number]>
        }
        return newData
      })
      
      // 触发回调
      if (onDataUpdate) {
        const currentData = dataManager.getSeriesData(0).map(point => 
          Array.isArray(point) ? point[1] as number : point as number
        )
        onDataUpdate(currentData)
      }
    }, updateInterval)

    return () => {
      clearInterval(timer)
    }
  }, [autoStart, data?.length]) // 移除不必要的依赖，避免重复创建

  // 自定义ECharts配置
  const customOption = useMemo((): Partial<EChartsOption> => {
    // 优先使用本地状态的数据，如果没有则使用数据管理器的数据
    let displayData = chartData
    
    if (displayData.length === 0) {
      const seriesData = dataManager.getSeriesData(0)
      displayData = seriesData.map((point, index) => {
        if (Array.isArray(point)) {
          const timestamp = point[0] as number
          const value = point[1] as number
          const time = new Date(timestamp)
          return [time.toLocaleTimeString('en-US', { 
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }), value] as [string, number]
        } else {
          return [index.toString(), point] as [string, number]
        }
      })
    }

    return {
      xAxis: {
        type: 'category',
        name: xAxisLabel || t('charts.time'),
        nameLocation: 'middle',
        nameGap: 30,
        data: displayData.map(item => item[0]),
        axisLabel: {
          rotate: 45,
          fontSize: 10
        }
      },
      yAxis: {
        type: 'value',
        name: yAxisLabel || t('charts.sensorValue'),
        nameLocation: 'middle',
        nameGap: 50,
        min: yAxisRange?.[0],
        max: yAxisRange?.[1]
      },
      series: [
        {
          name: yAxisLabel || t('charts.sensorValue'),
          type: 'line',
          data: displayData.map(item => item[1]),
          lineStyle: {
            color: lineColor,
            width: lineWidth
          },
          symbol: 'none',
          animation: false,
          smooth: false
        }
      ]
    }
  }, [chartData, dataManager, lineColor, lineWidth, yAxisRange, xAxisLabel, yAxisLabel, t])

  // 处理外部数据
  useEffect(() => {
    if (data && data.length > 0) {
      // 清空现有数据
      dataManager.clear()
      setChartData([])
      
      // 添加新数据系列
      const timeSeriesData = data.map((value, index) => [Date.now() - (data.length - 1 - index) * updateInterval, value] as [number, number])
      dataManager.addSeries(timeSeriesData)
      
      // 更新本地状态
      const displayData = data.map((value, index) => [
        index.toString(),
        value
      ] as [string, number])
      setChartData(displayData)
    }
  }, [data, dataManager, updateInterval])

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      dataManager.destroy()
    }
  }, [dataManager])

  // 获取最终标题
  const finalTitle = useMemo(() => {
    if (title) return title
    return t('charts.stripChartTitle')
  }, [title, t])

  return (
    <BaseChart
      width={width}
      height={height}
      title={finalTitle}
      theme={theme}
      showGrid={showGrid}
      showToolbox={showToolbox}
      enableZoom={enableZoom}
      style={style}
      dataManager={dataManager}
      customOption={customOption}
      onReady={(chart) => {
        console.log('Enhanced StripChart ready:', chart)
      }}
    />
  )
}

export default EnhancedStripChart
