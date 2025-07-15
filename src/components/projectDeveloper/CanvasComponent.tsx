import React, { useRef, useCallback } from 'react'
import { useDrag } from 'react-dnd'
import { ComponentConfig, ComponentLibraryItem, DragTypes } from '@/types/projectDeveloper'
import { useProjectDeveloperStore } from '@/stores/useProjectDeveloperStore'
import { useAppStore } from '@/stores/useAppStore'

interface CanvasComponentProps {
  config: ComponentConfig
  libraryItem: ComponentLibraryItem
  isSelected: boolean
  onSelect: () => void
}

export const CanvasComponent: React.FC<CanvasComponentProps> = ({
  config,
  libraryItem,
  isSelected,
  onSelect
}) => {
  const { theme } = useAppStore()
  const { updateComponentStyle } = useProjectDeveloperStore()
  const elementRef = useRef<HTMLDivElement>(null)

  const [{ isDragging }, drag] = useDrag(() => ({
    type: DragTypes.EXISTING_COMPONENT,
    item: { 
      type: DragTypes.EXISTING_COMPONENT, 
      componentType: config.type,
      id: config.id,
      isNew: false 
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }))

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect()
  }, [onSelect])

  const Component = libraryItem.component

  return (
    <div
      ref={(node) => {
        elementRef.current = node
        drag(node)
      }}
      style={{
        position: 'absolute',
        left: config.style.position.x,
        top: config.style.position.y,
        width: config.style.size.width,
        height: config.style.size.height,
        zIndex: config.style.zIndex,
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        border: isSelected 
          ? `2px solid ${theme === 'dark' ? '#1890ff' : '#1890ff'}`
          : '2px solid transparent',
        borderRadius: '4px',
        transition: 'border-color 0.2s ease'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* 选中状态的控制点 */}
      {isSelected && (
        <>
          {/* 四个角的调整点 */}
          <div
            style={{
              position: 'absolute',
              top: -4,
              left: -4,
              width: 8,
              height: 8,
              backgroundColor: '#1890ff',
              border: '1px solid #fff',
              borderRadius: '50%',
              cursor: 'nw-resize'
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              width: 8,
              height: 8,
              backgroundColor: '#1890ff',
              border: '1px solid #fff',
              borderRadius: '50%',
              cursor: 'ne-resize'
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -4,
              left: -4,
              width: 8,
              height: 8,
              backgroundColor: '#1890ff',
              border: '1px solid #fff',
              borderRadius: '50%',
              cursor: 'sw-resize'
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -4,
              right: -4,
              width: 8,
              height: 8,
              backgroundColor: '#1890ff',
              border: '1px solid #fff',
              borderRadius: '50%',
              cursor: 'se-resize'
            }}
          />
          
          {/* 组件名称标签 */}
          <div
            style={{
              position: 'absolute',
              top: -24,
              left: 0,
              backgroundColor: '#1890ff',
              color: '#fff',
              padding: '2px 6px',
              fontSize: '12px',
              borderRadius: '2px',
              whiteSpace: 'nowrap',
              pointerEvents: 'none'
            }}
          >
            {config.name}
          </div>
        </>
      )}

      {/* 渲染实际组件 */}
      <div
        style={{
          width: '100%',
          height: '100%',
          pointerEvents: isSelected ? 'none' : 'auto'
        }}
      >
        <Component {...config.props} />
      </div>
    </div>
  )
}
