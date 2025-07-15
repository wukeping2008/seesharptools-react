import React, { useRef, useEffect, useCallback, useMemo } from 'react'
import * as echarts from 'echarts'
import { EChartsOption, ECharts } from 'echarts'
import styled from 'styled-components'
import { ChartDataManager } from './ChartDataManager'
import { ChartTheme, getTheme } from './ChartTheme'

const ChartContainer = styled.div<{ width?: string; height?: string }>`
  width: ${props => props.width || '100%'};
  height: ${props => props.height || '400px'};
  position: relative;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  overflow: hidden;
  background: #fff;
`

/**
 * 图表基础配置接口
 */
export interface BaseChartConfig {
  /** 图表宽度 */
  width?: string
  /** 图表高度 */
  height?: string
  /** 图表标题 */
  title?: string
  /** 主题名称 */
  theme?: ChartTheme
  /** 是否显示网格 */
  showGrid?: boolean
  /** 是否显示工具栏 */
  showToolbox?: boolean
  /** 是否启用缩放 */
  enableZoom?: boolean
  /** 背景颜色 */
  backgroundColor?: string
  /** 自定义样式 */
  style?: React.CSSProperties
}

/**
 * 图表事件接口
 */
export interface ChartEvents {
  /** 图表就绪回调 */
  onReady?: (chart: ECharts) => void
  /** 点击事件 */
  onClick?: (params: echarts.ECElementEvent) => void
  /** 数据缩放事件 */
  onDataZoom?: (params: echarts.ECElementEvent) => void
  /** 图例选择事件 */
  onLegendSelect?: (params: echarts.ECElementEvent) => void
}

/**
 * 基础图表属性接口
 */
export interface BaseChartProps extends BaseChartConfig, ChartEvents {
  /** 数据管理器 */
  dataManager: ChartDataManager
  /** 自定义ECharts配置 */
  customOption?: Partial<EChartsOption>
  /** 渲染器类型 */
  renderer?: 'canvas' | 'svg'
}

/**
 * BaseChart - 统一图表基类
 * 
 * 提供所有图表组件的共同基础功能：
 * - 统一的配置管理
 * - 主题系统支持
 * - 数据管理集成
 * - 事件处理机制
 * - 性能优化
 */
export const BaseChart: React.FC<BaseChartProps> = ({
  width,
  height,
  title,
  theme = 'default',
  showGrid = true,
  showToolbox = false,
  enableZoom = false,
  backgroundColor,
  style,
  dataManager,
  customOption = {},
  renderer = 'canvas',
  onReady,
  onClick,
  onDataZoom,
  onLegendSelect
}) => {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<ECharts | null>(null)

  // 获取主题配置
  const themeConfig = useMemo(() => getTheme(theme), [theme])

  // 生成基础ECharts配置
  const baseOption = useMemo((): EChartsOption => {
    return {
      backgroundColor: backgroundColor || themeConfig.backgroundColor,
      
      title: title ? {
        text: title,
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'normal',
          color: themeConfig.textColor
        }
      } : undefined,

      tooltip: {
        trigger: 'axis',
        backgroundColor: themeConfig.tooltipBg,
        borderColor: themeConfig.borderColor,
        textStyle: {
          color: themeConfig.textColor
        },
        axisPointer: {
          type: 'cross',
          lineStyle: {
            color: themeConfig.axisPointerColor
          }
        }
      },

      grid: {
        left: '10%',
        right: '10%',
        bottom: enableZoom ? '15%' : '10%',
        top: title ? '15%' : '10%',
        containLabel: true,
        backgroundColor: themeConfig.gridBg,
        borderColor: themeConfig.borderColor,
        show: showGrid
      },

      toolbox: showToolbox ? {
        feature: {
          saveAsImage: { 
            title: '保存图片',
            iconStyle: { color: themeConfig.textColor }
          },
          restore: { 
            title: '重置',
            iconStyle: { color: themeConfig.textColor }
          },
          dataZoom: enableZoom ? { 
            title: { zoom: '区域缩放', back: '缩放还原' },
            iconStyle: { color: themeConfig.textColor }
          } : undefined
        },
        iconStyle: {
          borderColor: themeConfig.textColor
        }
      } : undefined,

      dataZoom: enableZoom ? [
        {
          type: 'inside',
          xAxisIndex: 0,
          filterMode: 'none'
        },
        {
          type: 'slider',
          xAxisIndex: 0,
          filterMode: 'none',
          backgroundColor: themeConfig.sliderBg,
          borderColor: themeConfig.borderColor,
          handleStyle: {
            color: themeConfig.primaryColor
          }
        }
      ] : undefined,

      animation: true,
      animationDuration: 300,
      animationEasing: 'cubicOut'
    }
  }, [
    title, theme, themeConfig, showGrid, showToolbox, 
    enableZoom, backgroundColor
  ])

  // 合并最终配置
  const finalOption = useMemo(() => {
    return {
      ...baseOption,
      ...customOption
    }
  }, [baseOption, customOption])

  // 初始化图表
  const initChart = useCallback(() => {
    if (!chartRef.current) return

    // 销毁现有实例
    if (chartInstance.current) {
      chartInstance.current.dispose()
    }

    // 创建新实例
    chartInstance.current = echarts.init(chartRef.current, undefined, {
      renderer
    })

    // 设置配置
    chartInstance.current.setOption(finalOption)

    // 绑定事件
    if (onClick) {
      chartInstance.current.on('click', (params: unknown) => {
        onClick(params as echarts.ECElementEvent)
      })
    }
    if (onDataZoom) {
      chartInstance.current.on('datazoom', (params: unknown) => {
        onDataZoom(params as echarts.ECElementEvent)
      })
    }
    if (onLegendSelect) {
      chartInstance.current.on('legendselectchanged', (params: unknown) => {
        onLegendSelect(params as echarts.ECElementEvent)
      })
    }

    // 处理窗口大小变化
    const handleResize = () => {
      chartInstance.current?.resize()
    }
    window.addEventListener('resize', handleResize)

    // 触发就绪回调
    if (onReady) {
      onReady(chartInstance.current)
    }

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [finalOption, renderer, onClick, onDataZoom, onLegendSelect, onReady])

  // 更新图表配置
  const updateChart = useCallback(() => {
    if (chartInstance.current) {
      chartInstance.current.setOption(finalOption, true)
    }
  }, [finalOption])

  // 初始化图表
  useEffect(() => {
    const cleanup = initChart()
    return cleanup
  }, [initChart])

  // 监听配置变化
  useEffect(() => {
    updateChart()
  }, [updateChart])

  // 监听数据管理器变化
  useEffect(() => {
    const unsubscribe = dataManager.subscribe(() => {
      updateChart()
    })
    return unsubscribe
  }, [dataManager, updateChart])

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose()
      }
    }
  }, [])

  // 暴露图表实例方法
  const getChartInstance = useCallback(() => {
    return chartInstance.current
  }, [])

  // 暴露图表实例的引用
  const chartRefHandle = useRef<{
    getChartInstance: () => ECharts | null
    updateChart: () => void
  }>(null)

  // 将方法暴露给父组件
  React.useImperativeHandle(chartRefHandle, () => ({
    getChartInstance,
    updateChart
  }))

  return (
    <ChartContainer width={width} height={height} style={style}>
      <div ref={chartRef} style={{ width: '100%', height: '100%' }} />
    </ChartContainer>
  )
}

export default BaseChart
