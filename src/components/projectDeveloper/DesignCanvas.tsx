import React, { useRef, useCallback } from 'react'
import { useDrop } from 'react-dnd'
import { DragTypes, DragItem } from '@/types/projectDeveloper'
import { useProjectDeveloperStore } from '@/stores/useProjectDeveloperStore'
import { useAppStore } from '@/stores/useAppStore'
import { getComponentLibraryItem } from './ComponentLibrary'
import { CanvasComponent } from './CanvasComponent'

interface DesignCanvasProps {
  width: number
  height: number
}

export const DesignCanvas: React.FC<DesignCanvasProps> = ({ width, height }) => {
  const { theme } = useAppStore()
  const { 
    currentProject, 
    canvasSettings, 
    addComponent,
    selectComponent,
    selectedComponentId 
  } = useProjectDeveloperStore()
  
  const canvasRef = useRef<HTMLDivElement>(null)

  const [{ isOver }, drop] = useDrop(() => ({
    accept: DragTypes.COMPONENT,
    drop: (item: DragItem, monitor) => {
      if (!monitor.didDrop()) {
        const offset = monitor.getClientOffset()
        const canvasRect = canvasRef.current?.getBoundingClientRect()
        
        if (offset && canvasRect) {
          const x = offset.x - canvasRect.left
          const y = offset.y - canvasRect.top
          
          if (item.isNew) {
            addComponent(item.componentType, { x, y })
          }
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  }))

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      selectComponent(null)
    }
  }, [selectComponent])

  const renderGrid = () => {
    if (!canvasSettings.showGrid) return null

    const gridSize = canvasSettings.gridSize
    const lines = []

    // 垂直线
    for (let x = 0; x <= width; x += gridSize) {
      lines.push(
        <line
          key={`v-${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={height}
          stroke={theme === 'dark' ? '#434343' : '#f0f0f0'}
          strokeWidth={0.5}
        />
      )
    }

    // 水平线
    for (let y = 0; y <= height; y += gridSize) {
      lines.push(
        <line
          key={`h-${y}`}
          x1={0}
          y1={y}
          x2={width}
          y2={y}
          stroke={theme === 'dark' ? '#434343' : '#f0f0f0'}
          strokeWidth={0.5}
        />
      )
    }

    return (
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0
        }}
      >
        {lines}
      </svg>
    )
  }

  return (
    <div
      ref={(node) => {
        canvasRef.current = node
        drop(node)
      }}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: isOver 
          ? (theme === 'dark' ? '#1a1a1a' : '#f8f8f8')
          : (theme === 'dark' ? '#0f0f0f' : '#ffffff'),
        position: 'relative',
        overflow: 'hidden',
        border: `1px solid ${theme === 'dark' ? '#434343' : '#d9d9d9'}`,
        transition: 'background-color 0.2s ease'
      }}
      onClick={handleCanvasClick}
    >
      {renderGrid()}
      
      {/* 渲染组件 */}
      {currentProject?.components.map((component) => {
        const libraryItem = getComponentLibraryItem(component.type)
        if (!libraryItem) return null

        return (
          <CanvasComponent
            key={component.id}
            config={component}
            libraryItem={libraryItem}
            isSelected={selectedComponentId === component.id}
            onSelect={() => selectComponent(component.id)}
          />
        )
      })}

      {/* 拖拽提示 */}
      {isOver && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '20px',
            backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            border: `2px dashed ${theme === 'dark' ? '#595959' : '#40a9ff'}`,
            borderRadius: '8px',
            color: theme === 'dark' ? '#fff' : '#666',
            fontSize: '16px',
            fontWeight: 'bold',
            pointerEvents: 'none',
            zIndex: 1000
          }}
        >
          释放以添加组件
        </div>
      )}
    </div>
  )
}
