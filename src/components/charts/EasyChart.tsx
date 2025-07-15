import React, { useRef, useEffect, useState, useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { EChartsOption } from 'echarts'
import styled from 'styled-components'

/**
 * EasyChart组件属性接口
 */
export interface EasyChartProps {
  /** 图表数据 */
  data: number[] | number[][]
  /** 图表宽度 */
  width?: number | string
  /** 图表高度 */
  height?: number | string
  /** 图表标题 */
  title?: string
  /** X轴标签 */
  xAxisLabel?: string
  /** Y轴标签 */
  yAxisLabel?: string
  /** 图表类型 */
  chartType?: 'line' | 'bar' | 'scatter' | 'area'
  /** 线条颜色 */
  lineColor?: string | string[]
  /** 线条宽度 */
  lineWidth?: number
  /** 是否显示网格 */
  showGrid?: boolean
  /** 是否显示图例 */
  showLegend?: boolean
  /** 是否显示工具栏 */
  showToolbox?: boolean
  /** 是否显示数据缩放 */
  showDataZoom?: boolean
  /** 是否平滑曲线 */
  smooth?: boolean
  /** 动画持续时间 */
  animationDuration?: number
  /** 背景颜色 */
  backgroundColor?: string
  /** 自定义样式 */
  style?: React.CSSProperties
  /** 图表配置更新回调 */
  onChartReady?: () => void
  /** 点击事件回调 */
  onClick?: (params: Record<string, unknown>) => void
}

const ChartContainer = styled.div<{ width?: number | string; height?: number | string }>`
  width: ${props => typeof props.width === 'number' ? `${props.width}px` : props.width || '100%'};
  height: ${props => typeof props.height === 'number' ? `${props.height}px` : props.height || '400px'};
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  overflow: hidden;
  background: #fff;
  
  .echarts-for-react {
    width: 100% !important;
    height: 100% !important;
  }
`

/**
 * EasyChart - 基础图表组件
 * 
 * 基于ECharts的React封装，提供简单易用的图表功能
 * 支持线图、柱状图、散点图等多种图表类型
 * 
 * @param props - 组件属性
 * @returns React组件
 */
export const EasyChart: React.FC<EasyChartProps> = ({
  data,
  width = '100%',
  height = 400,
  title,
  xAxisLabel,
  yAxisLabel,
  chartType = 'line',
  lineColor = '#1890ff',
  lineWidth = 2,
  showGrid = true,
  showLegend = false,
  showToolbox = false,
  showDataZoom = false,
  smooth = false,
  animationDuration = 1000,
  backgroundColor = '#fff',
  style,
  onChartReady,
  onClick
}) => {
  const chartRef = useRef<ReactECharts>(null)
  const [isReady, setIsReady] = useState(false)

  // 处理数据格式
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return []
    
    // 如果是二维数组，直接返回
    if (Array.isArray(data[0])) {
      return data as number[][]
    }
    
    // 如果是一维数组，转换为二维数组
    return (data as number[]).map((value, index) => [index, value])
  }, [data])

  // 生成图表配置
  const option: EChartsOption = useMemo(() => {
    const colors = Array.isArray(lineColor) ? lineColor : [lineColor]
    
    const baseOption: EChartsOption = {
      backgroundColor,
      title: title ? {
        text: title,
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold'
        }
      } : undefined,
      
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        }
      },
      
      legend: showLegend ? {
        data: ['数据'],
        bottom: 10
      } : undefined,
      
      toolbox: showToolbox ? {
        feature: {
          saveAsImage: { title: '保存为图片' },
          restore: { title: '重置' },
          dataZoom: { title: { zoom: '区域缩放', back: '缩放还原' } }
        }
      } : undefined,
      
      grid: {
        left: '3%',
        right: '4%',
        bottom: showDataZoom ? '15%' : '3%',
        containLabel: true
      },
      
      xAxis: {
        type: 'value',
        name: xAxisLabel,
        nameLocation: 'middle',
        nameGap: 30,
        splitLine: {
          show: showGrid
        }
      },
      
      yAxis: {
        type: 'value',
        name: yAxisLabel,
        nameLocation: 'middle',
        nameGap: 50,
        splitLine: {
          show: showGrid
        }
      },
      
      dataZoom: showDataZoom ? [
        {
          type: 'inside',
          xAxisIndex: 0,
          filterMode: 'none'
        },
        {
          type: 'slider',
          xAxisIndex: 0,
          filterMode: 'none'
        }
      ] : undefined,
      
      animation: true,
      animationDuration,
      
      series: [{
        name: '数据',
        type: chartType === 'area' ? 'line' : chartType,
        data: processedData,
        smooth,
        lineStyle: {
          width: lineWidth,
          color: colors[0]
        },
        itemStyle: {
          color: colors[0]
        },
        areaStyle: chartType === 'area' ? {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0,
              color: colors[0] + '80'
            }, {
              offset: 1,
              color: colors[0] + '20'
            }]
          }
        } : undefined,
        symbol: chartType === 'scatter' ? 'circle' : 'none',
        symbolSize: chartType === 'scatter' ? 6 : 4
      }]
    }
    
    return baseOption
  }, [
    data, processedData, title, xAxisLabel, yAxisLabel, chartType,
    lineColor, lineWidth, showGrid, showLegend, showToolbox,
    showDataZoom, smooth, animationDuration, backgroundColor
  ])

  // 图表就绪回调
  useEffect(() => {
    if (isReady && onChartReady) {
      onChartReady()
    }
  }, [isReady, onChartReady])

  // 处理点击事件
  const handleChartClick = (params: Record<string, unknown>) => {
    if (onClick) {
      onClick(params)
    }
  }

  return (
    <ChartContainer width={width} height={height} style={style}>
      <ReactECharts
        ref={chartRef}
        option={option}
        style={{ width: '100%', height: '100%' }}
        onChartReady={() => setIsReady(true)}
        onEvents={{
          click: handleChartClick
        }}
        opts={{
          renderer: 'canvas'
        }}
      />
    </ChartContainer>
  )
}

export default EasyChart
