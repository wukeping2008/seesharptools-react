import React from 'react'
import { Card, Form, Input, InputNumber, Switch, Select, ColorPicker, Typography, Space, Button, Divider } from 'antd'
import { DeleteOutlined, CopyOutlined } from '@ant-design/icons'
import { useProjectDeveloperStore } from '@/stores/useProjectDeveloperStore'
import { useAppStore } from '@/stores/useAppStore'
import { getComponentLibraryItem } from './ComponentLibrary'
import { PropValue } from '@/types/projectDeveloper'

const { Title, Text } = Typography
const { Option } = Select

interface PropertyPanelProps {
  width: number
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({ width }) => {
  const { theme } = useAppStore()
  const { 
    currentProject, 
    selectedComponentId, 
    updateComponentProps,
    updateComponentStyle,
    removeComponent,
    duplicateComponent
  } = useProjectDeveloperStore()

  const selectedComponent = currentProject?.components.find(c => c.id === selectedComponentId)
  const libraryItem = selectedComponent ? getComponentLibraryItem(selectedComponent.type) : null

  const handlePropChange = (key: string, value: PropValue) => {
    if (selectedComponentId) {
      updateComponentProps(selectedComponentId, { [key]: value })
    }
  }

  const handleStyleChange = (key: string, value: number) => {
    if (selectedComponentId) {
      if (key === 'x' || key === 'y') {
        updateComponentStyle(selectedComponentId, {
          position: {
            ...selectedComponent!.style.position,
            [key]: value
          }
        })
      } else if (key === 'width' || key === 'height') {
        updateComponentStyle(selectedComponentId, {
          size: {
            ...selectedComponent!.style.size,
            [key]: value
          }
        })
      }
    }
  }

  const handleDelete = () => {
    if (selectedComponentId) {
      removeComponent(selectedComponentId)
    }
  }

  const handleDuplicate = () => {
    if (selectedComponentId) {
      duplicateComponent(selectedComponentId)
    }
  }

  const renderPropertyEditor = (key: string, value: PropValue, defaultValue: PropValue) => {
    // 根据默认值类型推断输入组件
    if (typeof defaultValue === 'boolean') {
      return (
        <Switch
          checked={value as boolean}
          onChange={(checked) => handlePropChange(key, checked)}
        />
      )
    }

    if (typeof defaultValue === 'number') {
      return (
        <InputNumber
          value={value as number}
          onChange={(val) => handlePropChange(key, val || 0)}
          style={{ width: '100%' }}
        />
      )
    }

    if (key.toLowerCase().includes('color')) {
      return (
        <ColorPicker
          value={value as string}
          onChange={(color) => handlePropChange(key, color.toHexString())}
          showText
        />
      )
    }

    if (key === 'type' || key === 'size' || key === 'shape') {
      // 预定义选项
      const options: Record<string, string[]> = {
        type: ['primary', 'default', 'dashed', 'link', 'text'],
        size: ['small', 'medium', 'large'],
        shape: ['circle', 'square', 'diamond']
      }

      return (
        <Select
          value={value as string}
          onChange={(val) => handlePropChange(key, val)}
          style={{ width: '100%' }}
        >
          {(options[key] || []).map(option => (
            <Option key={option} value={option}>{option}</Option>
          ))}
        </Select>
      )
    }

    return (
      <Input
        value={value as string}
        onChange={(e) => handlePropChange(key, e.target.value)}
      />
    )
  }

  if (!selectedComponent || !libraryItem) {
    return (
      <div
        style={{
          width: `${width}px`,
          height: '100%',
          borderLeft: `1px solid ${theme === 'dark' ? '#434343' : '#f0f0f0'}`,
          backgroundColor: theme === 'dark' ? '#141414' : '#fff',
          padding: '16px'
        }}
      >
        <Text type="secondary" style={{ color: theme === 'dark' ? 'rgba(255, 255, 255, 0.65)' : undefined }}>
          请选择一个组件来编辑属性
        </Text>
      </div>
    )
  }

  return (
    <div
      style={{
        width: `${width}px`,
        height: '100%',
        borderLeft: `1px solid ${theme === 'dark' ? '#434343' : '#f0f0f0'}`,
        backgroundColor: theme === 'dark' ? '#141414' : '#fff',
        overflow: 'auto'
      }}
    >
      <Card
        title="属性面板"
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
          padding: '16px',
          height: 'calc(100% - 57px)',
          overflow: 'auto'
        }}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {/* 组件信息 */}
          <div>
            <Title level={5} style={{ margin: 0, color: theme === 'dark' ? '#fff' : 'inherit' }}>
              {libraryItem.name}
            </Title>
            <Text type="secondary" style={{ color: theme === 'dark' ? 'rgba(255, 255, 255, 0.65)' : undefined }}>
              {selectedComponent.name}
            </Text>
          </div>

          {/* 操作按钮 */}
          <Space>
            <Button 
              icon={<CopyOutlined />} 
              onClick={handleDuplicate}
              size="small"
            >
              复制
            </Button>
            <Button 
              icon={<DeleteOutlined />} 
              danger 
              onClick={handleDelete}
              size="small"
            >
              删除
            </Button>
          </Space>

          <Divider style={{ margin: '8px 0' }} />

          {/* 位置和大小 */}
          <div>
            <Title level={5} style={{ margin: '0 0 8px 0', color: theme === 'dark' ? '#fff' : 'inherit' }}>
              位置和大小
            </Title>
            <Form layout="vertical" size="small">
              <Space.Compact style={{ width: '100%' }}>
                <Form.Item label="X" style={{ flex: 1, marginBottom: 8 }}>
                  <InputNumber
                    value={selectedComponent.style.position.x}
                    onChange={(val) => handleStyleChange('x', val || 0)}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
                <Form.Item label="Y" style={{ flex: 1, marginBottom: 8 }}>
                  <InputNumber
                    value={selectedComponent.style.position.y}
                    onChange={(val) => handleStyleChange('y', val || 0)}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Space.Compact>
              <Space.Compact style={{ width: '100%' }}>
                <Form.Item label="宽度" style={{ flex: 1, marginBottom: 8 }}>
                  <InputNumber
                    value={selectedComponent.style.size.width}
                    onChange={(val) => handleStyleChange('width', val || 0)}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
                <Form.Item label="高度" style={{ flex: 1, marginBottom: 8 }}>
                  <InputNumber
                    value={selectedComponent.style.size.height}
                    onChange={(val) => handleStyleChange('height', val || 0)}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Space.Compact>
            </Form>
          </div>

          <Divider style={{ margin: '8px 0' }} />

          {/* 组件属性 */}
          <div>
            <Title level={5} style={{ margin: '0 0 8px 0', color: theme === 'dark' ? '#fff' : 'inherit' }}>
              组件属性
            </Title>
            <Form layout="vertical" size="small">
              {Object.entries(selectedComponent.props).map(([key, value]) => {
                const defaultValue = libraryItem.defaultProps[key]
                return (
                  <Form.Item 
                    key={key} 
                    label={key}
                    style={{ marginBottom: 12 }}
                  >
                    {renderPropertyEditor(key, value, defaultValue)}
                  </Form.Item>
                )
              })}
            </Form>
          </div>
        </Space>
      </Card>
    </div>
  )
}
