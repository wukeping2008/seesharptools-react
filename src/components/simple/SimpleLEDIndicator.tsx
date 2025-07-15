import React from 'react'
import styled, { keyframes, css } from 'styled-components'

export interface SimpleLEDIndicatorProps {
  /** LED状态 */
  isOn?: boolean
  /** LED颜色 */
  color?: string
  /** LED大小 */
  size?: number
  /** 是否启用闪烁效果 */
  blinking?: boolean
  /** 闪烁频率（毫秒） */
  blinkInterval?: number
  /** LED形状 */
  shape?: 'circle' | 'square'
  /** 标签文本 */
  label?: string
  /** 标签位置 */
  labelPosition?: 'top' | 'bottom' | 'left' | 'right'
  /** 是否显示光晕效果 */
  glowEffect?: boolean
  /** 自定义样式 */
  style?: React.CSSProperties
  /** 自定义类名 */
  className?: string
}

// 闪烁动画
const blinkAnimation = keyframes`
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0.3;
  }
`

const Container = styled.div<{
  $labelPosition: 'top' | 'bottom' | 'left' | 'right'
}>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  
  ${props => {
    switch (props.$labelPosition) {
      case 'top':
        return css`
          flex-direction: column;
        `
      case 'bottom':
        return css`
          flex-direction: column-reverse;
        `
      case 'left':
        return css`
          flex-direction: row;
        `
      case 'right':
        return css`
          flex-direction: row-reverse;
        `
      default:
        return css`
          flex-direction: row;
        `
    }
  }}
`

const LEDElement = styled.div<{
  $isOn: boolean
  $color: string
  $size: number
  $shape: 'circle' | 'square'
  $blinking: boolean
  $blinkInterval: number
  $glowEffect: boolean
}>`
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  background-color: ${props => props.$isOn ? props.$color : '#333'};
  border: 2px solid ${props => props.$isOn ? props.$color : '#666'};
  border-radius: ${props => props.$shape === 'circle' ? '50%' : '4px'};
  transition: all 0.3s ease;
  position: relative;
  
  ${props => props.$isOn && props.$glowEffect && css`
    box-shadow: 
      0 0 10px ${props.$color},
      0 0 20px ${props.$color},
      0 0 30px ${props.$color};
  `}
  
  ${props => props.$blinking && props.$isOn && css`
    animation: ${blinkAnimation} ${props.$blinkInterval}ms infinite;
  `}
  
  /* 内部高光效果 */
  &::before {
    content: '';
    position: absolute;
    top: 15%;
    left: 15%;
    width: 30%;
    height: 30%;
    background: rgba(255, 255, 255, 0.6);
    border-radius: ${props => props.$shape === 'circle' ? '50%' : '2px'};
    opacity: ${props => props.$isOn ? 1 : 0};
    transition: opacity 0.3s ease;
  }
`

const Label = styled.span`
  font-size: 14px;
  color: #666;
  user-select: none;
  white-space: nowrap;
`

/**
 * 简单LED指示灯控件
 * 支持多种颜色、形状、闪烁效果和光晕效果
 */
export const SimpleLEDIndicator: React.FC<SimpleLEDIndicatorProps> = ({
  isOn = false,
  color = '#00ff00',
  size = 20,
  blinking = false,
  blinkInterval = 1000,
  shape = 'circle',
  label,
  labelPosition = 'right',
  glowEffect = true,
  style,
  className,
}) => {
  return (
    <Container 
      $labelPosition={labelPosition}
      style={style}
      className={className}
    >
      <LEDElement
        $isOn={isOn}
        $color={color}
        $size={size}
        $shape={shape}
        $blinking={blinking}
        $blinkInterval={blinkInterval}
        $glowEffect={glowEffect}
      />
      {label && <Label>{label}</Label>}
    </Container>
  )
}

export default SimpleLEDIndicator
