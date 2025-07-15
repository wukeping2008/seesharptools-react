import React from 'react'
import { Button } from 'antd'
import type { ButtonProps } from 'antd'
import styled from 'styled-components'

// 扩展Ant Design Button的属性
export interface SimpleButtonProps extends Omit<ButtonProps, 'children'> {
  /** 按钮文本 */
  text?: string
  /** 按钮宽度 */
  width?: number | string
  /** 按钮高度 */
  height?: number | string
  /** 自定义背景色 */
  backgroundColor?: string
  /** 自定义文字颜色 */
  textColor?: string
  /** 边框圆角 */
  borderRadius?: number
  /** 是否启用悬停效果 */
  enableHover?: boolean
  /** 悬停时的背景色 */
  hoverBackgroundColor?: string
  /** 悬停时的文字颜色 */
  hoverTextColor?: string
  /** 点击回调 */
  onButtonClick?: () => void
}

const StyledButton = styled(Button)<{
  $width?: number | string
  $height?: number | string
  $backgroundColor?: string
  $textColor?: string
  $borderRadius?: number
  $enableHover?: boolean
  $hoverBackgroundColor?: string
  $hoverTextColor?: string
}>`
  width: ${props => typeof props.$width === 'number' ? `${props.$width}px` : props.$width || 'auto'};
  height: ${props => typeof props.$height === 'number' ? `${props.$height}px` : props.$height || 'auto'};
  background-color: ${props => props.$backgroundColor || undefined} !important;
  color: ${props => props.$textColor || undefined} !important;
  border-radius: ${props => props.$borderRadius ? `${props.$borderRadius}px` : undefined} !important;
  border-color: ${props => props.$backgroundColor || undefined} !important;
  
  ${props => props.$enableHover && `
    &:hover {
      background-color: ${props.$hoverBackgroundColor || props.$backgroundColor} !important;
      color: ${props.$hoverTextColor || props.$textColor} !important;
      border-color: ${props.$hoverBackgroundColor || props.$backgroundColor} !important;
      opacity: ${props.$hoverBackgroundColor ? 1 : 0.8};
    }
  `}
  
  &:focus {
    background-color: ${props => props.$backgroundColor || undefined} !important;
    color: ${props => props.$textColor || undefined} !important;
    border-color: ${props => props.$backgroundColor || undefined} !important;
  }
`

/**
 * 简单按钮控件
 * 基于Ant Design Button封装，提供更简单的API和自定义样式支持
 */
export const SimpleButton: React.FC<SimpleButtonProps> = ({
  text = '按钮',
  width,
  height,
  backgroundColor,
  textColor,
  borderRadius,
  enableHover = true,
  hoverBackgroundColor,
  hoverTextColor,
  onButtonClick,
  onClick,
  ...restProps
}) => {
  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    // 优先调用自定义的onButtonClick
    if (onButtonClick) {
      onButtonClick()
    }
    // 然后调用原生的onClick
    if (onClick) {
      onClick(e)
    }
  }

  return (
    <StyledButton
      $width={width}
      $height={height}
      $backgroundColor={backgroundColor}
      $textColor={textColor}
      $borderRadius={borderRadius}
      $enableHover={enableHover}
      $hoverBackgroundColor={hoverBackgroundColor}
      $hoverTextColor={hoverTextColor}
      onClick={handleClick}
      {...restProps}
    >
      {text}
    </StyledButton>
  )
}

export default SimpleButton
