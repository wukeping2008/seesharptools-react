import React from 'react'
import { useDrag } from 'react-dnd'
import { Card, Collapse, Typography, Space } from 'antd'
import { DragTypes } from '@/types/projectDeveloper'
import { componentsByCategory, getCategoryName } from './ComponentLibrary'
import { useAppStore } from '@/stores/useAppStore'

const { Panel } = Collapse
const { Text } = Typography

interface DraggableComponentProps {
  id: string
  name: string
  icon: string
  description: string
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({ id, name, icon, description }) => {
  const { theme } = useAppStore()
  
  const [{ isDragging }, drag] = useDrag(() => ({
    type: DragTypes.COMPONENT,
    item: { type: DragTypes.COMPONENT, componentType: id, isNew: true },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }))

  return (
    <div
      ref={drag as any}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
        padding: '8px',
        margin: '4px 0',
        border: `1px solid ${theme === 'dark' ? '#434343' : '#d9d9d9'}`,
        borderRadius: '4px',
        backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fafafa',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = theme === 'dark' ? '#262626' : '#f0f0f0'
        e.currentTarget.style.borderColor = theme === 'dark' ? '#595959' : '#40a9ff'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1f1f1f' : '#fafafa'
        e.currentTarget.style.borderColor = theme === 'dark' ? '#434343' : '#d9d9d9'
      }}
    >
      <Space direction="vertical" size={4} style={{ width: '100%' }}>
        <Space>
          <span style={{ fontSize: '16px' }}>{icon}</span>
          <Text strong style={{ color: theme === 'dark' ? '#fff' : 'inherit' }}>
            {name}
          </Text>
        </Space>
        <Text 
          type="secondary" 
          style={{ 
            fontSize: '12px',
            color: theme === 'dark' ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.65)'
          }}
        >
          {description}
        </Text>
      </Space>
    </div>
  )
}

interface ComponentLibraryPanelProps {
  width: number
}

export const ComponentLibraryPanel: React.FC<ComponentLibraryPanelProps> = ({ width }) => {
  const { theme } = useAppStore()

  return (
    <div
      style={{
        width: `${width}px`,
        height: '100%',
        borderRight: `1px solid ${theme === 'dark' ? '#434343' : '#f0f0f0'}`,
        backgroundColor: theme === 'dark' ? '#141414' : '#fff',
        overflow: 'auto'
      }}
    >
      <Card
        title="组件库"
        size="small"
        style={{
          height: '100%',
          backgroundColor: theme === 'dark' ? '#141414' : '#fff',
          border: 'none'
        }}
        headStyle={{
          borderBottom: `1px solid ${theme === 'dark' ? '#434343' : '#f0f0f0'}`,
          color: theme === 'dark' ? '#fff' : 'inherit'
        }}
        bodyStyle={{
          padding: '8px',
          height: 'calc(100% - 57px)',
          overflow: 'auto'
        }}
      >
        <Collapse
          defaultActiveKey={Object.keys(componentsByCategory)}
          ghost
          size="small"
          style={{
            backgroundColor: 'transparent'
          }}
        >
          {Object.entries(componentsByCategory).map(([category, components]) => (
            <Panel
              header={
                <Text strong style={{ color: theme === 'dark' ? '#fff' : 'inherit' }}>
                  {getCategoryName(category)} ({components.length})
                </Text>
              }
              key={category}
              style={{
                backgroundColor: 'transparent',
                border: 'none'
              }}
            >
              {components.map((component) => (
                <DraggableComponent
                  key={component.id}
                  id={component.id}
                  name={component.name}
                  icon={component.icon}
                  description={component.description}
                />
              ))}
            </Panel>
          ))}
        </Collapse>
      </Card>
    </div>
  )
}
