import React, { useMemo } from 'react'
import styled from 'styled-components'

export interface SimpleCircularGaugeProps {
  /** 当前值 */
  value?: number
  /** 最小值 */
  min?: number
  /** 最大值 */
  max?: number
  /** 仪表盘大小 */
  size?: number
  /** 仪表盘颜色 */
  color?: string
  /** 背景颜色 */
  backgroundColor?: string
  /** 指针颜色 */
  needleColor?: string
  /** 是否显示数值 */
  showValue?: boolean
  /** 数值格式化函数 */
  valueFormatter?: (value: number) => string
  /** 单位 */
  unit?: string
  /** 标题 */
  title?: string
  /** 起始角度（度） */
  startAngle?: number
  /** 结束角度（度） */
  endAngle?: number
  /** 刻度线数量 */
  tickCount?: number
  /** 是否显示刻度 */
  showTicks?: boolean
  /** 是否显示刻度标签 */
  showTickLabels?: boolean
  /** 警告阈值 */
  warningThreshold?: number
  /** 危险阈值 */
  dangerThreshold?: number
  /** 警告颜色 */
  warningColor?: string
  /** 危险颜色 */
  dangerColor?: string
  /** 自定义样式 */
  style?: React.CSSProperties
  /** 自定义类名 */
  className?: string
}

const Container = styled.div<{ $size: number }>`
  display: inline-block;
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  position: relative;
`

const SVGContainer = styled.svg`
  width: 100%;
  height: 100%;
`

const ValueDisplay = styled.div`
  position: absolute;
  top: 65%;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  font-size: 14px;
  font-weight: bold;
  color: #333;
`

const TitleDisplay = styled.div`
  position: absolute;
  top: 80%;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  font-size: 12px;
  color: #666;
`

/**
 * 简单圆形仪表盘控件
 * 支持自定义范围、颜色、警告阈值等功能
 */
export const SimpleCircularGauge: React.FC<SimpleCircularGaugeProps> = ({
  value = 0,
  min = 0,
  max = 100,
  size = 200,
  color = '#1890ff',
  backgroundColor = '#f0f0f0',
  needleColor = '#ff4d4f',
  showValue = true,
  valueFormatter,
  unit = '',
  title,
  startAngle = -135,
  endAngle = 135,
  tickCount = 5,
  showTicks = true,
  showTickLabels = true,
  warningThreshold,
  dangerThreshold,
  warningColor = '#faad14',
  dangerColor = '#ff4d4f',
  style,
  className,
}) => {
  const center = size / 2
  const radius = size * 0.35
  const needleLength = radius * 0.8

  // 计算角度范围
  const angleRange = endAngle - startAngle
  
  // 计算当前值对应的角度
  const valueAngle = useMemo(() => {
    const normalizedValue = Math.max(min, Math.min(max, value))
    const percentage = (normalizedValue - min) / (max - min)
    return startAngle + angleRange * percentage
  }, [value, min, max, startAngle, angleRange])

  // 角度转弧度
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180

  // 生成圆弧路径
  const generateArcPath = (startAngle: number, endAngle: number, radius: number) => {
    const start = toRadians(startAngle)
    const end = toRadians(endAngle)
    
    const x1 = center + radius * Math.cos(start)
    const y1 = center + radius * Math.sin(start)
    const x2 = center + radius * Math.cos(end)
    const y2 = center + radius * Math.sin(end)
    
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0
    
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`
  }

  // 生成刻度线
  const generateTicks = () => {
    const ticks = []
    for (let i = 0; i <= tickCount; i++) {
      const angle = startAngle + (angleRange * i) / tickCount
      const radian = toRadians(angle)
      const innerRadius = radius * 0.9
      const outerRadius = radius * 1.05
      
      const x1 = center + innerRadius * Math.cos(radian)
      const y1 = center + innerRadius * Math.sin(radian)
      const x2 = center + outerRadius * Math.cos(radian)
      const y2 = center + outerRadius * Math.sin(radian)
      
      ticks.push(
        <line
          key={`tick-${i}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#666"
          strokeWidth="1"
        />
      )
      
      // 刻度标签
      if (showTickLabels) {
        const labelRadius = radius * 1.15
        const labelX = center + labelRadius * Math.cos(radian)
        const labelY = center + labelRadius * Math.sin(radian)
        const tickValue = min + ((max - min) * i) / tickCount
        
        ticks.push(
          <text
            key={`tick-label-${i}`}
            x={labelX}
            y={labelY}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="10"
            fill="#666"
          >
            {Math.round(tickValue)}
          </text>
        )
      }
    }
    return ticks
  }

  // 计算当前值的颜色
  const getCurrentColor = () => {
    if (dangerThreshold && value >= dangerThreshold) return dangerColor
    if (warningThreshold && value >= warningThreshold) return warningColor
    return color
  }

  // 格式化显示值
  const formatValue = (val: number) => {
    if (valueFormatter) return valueFormatter(val)
    return `${val.toFixed(1)}${unit}`
  }

  return (
    <Container $size={size} style={style} className={className}>
      <SVGContainer>
        {/* 背景圆弧 */}
        <path
          d={generateArcPath(startAngle, endAngle, radius)}
          fill="none"
          stroke={backgroundColor}
          strokeWidth="8"
          strokeLinecap="round"
        />
        
        {/* 值圆弧 */}
        <path
          d={generateArcPath(startAngle, valueAngle, radius)}
          fill="none"
          stroke={getCurrentColor()}
          strokeWidth="8"
          strokeLinecap="round"
        />
        
        {/* 刻度线 */}
        {showTicks && generateTicks()}
        
        {/* 中心圆 */}
        <circle
          cx={center}
          cy={center}
          r="6"
          fill={needleColor}
        />
        
        {/* 指针 */}
        <line
          x1={center}
          y1={center}
          x2={center + needleLength * Math.cos(toRadians(valueAngle))}
          y2={center + needleLength * Math.sin(toRadians(valueAngle))}
          stroke={needleColor}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </SVGContainer>
      
      {/* 数值显示 */}
      {showValue && (
        <ValueDisplay>
          {formatValue(value)}
        </ValueDisplay>
      )}
      
      {/* 标题显示 */}
      {title && (
        <TitleDisplay>
          {title}
        </TitleDisplay>
      )}
    </Container>
  )
}

export default SimpleCircularGauge
