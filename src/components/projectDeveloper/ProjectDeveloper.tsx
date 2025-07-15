import React, { useState, useEffect } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Layout, Button, Space, Typography, Tooltip, message } from 'antd'
import { 
  SaveOutlined, 
  FolderOpenOutlined, 
  PlayCircleOutlined,
  SettingOutlined,
  AppstoreOutlined,
  EyeOutlined
} from '@ant-design/icons'
import { useProjectDeveloperStore } from '@/stores/useProjectDeveloperStore'
import { useAppStore } from '@/stores/useAppStore'
import { ComponentLibraryPanel } from './ComponentLibraryPanel'
import { DesignCanvas } from './DesignCanvas'
import { PropertyPanel } from './PropertyPanel'

const { Header, Content } = Layout
const { Title } = Typography

interface ProjectDeveloperProps {
  onPreview?: () => void
}

export const ProjectDeveloper: React.FC<ProjectDeveloperProps> = ({ onPreview }) => {
  const { theme } = useAppStore()
  const { 
    currentProject, 
    canvasSettings,
    saveProject,
    loadProject,
    createNewProject,
    toggleGrid,
    toggleSnapToGrid
  } = useProjectDeveloperStore()

  const [leftPanelWidth] = useState(280)
  const [rightPanelWidth] = useState(320)
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })

  useEffect(() => {
    // 初始化时创建新项目
    if (!currentProject) {
      createNewProject('新项目', '项目描述')
    }
  }, [currentProject, createNewProject])

  useEffect(() => {
    // 计算画布大小
    const updateCanvasSize = () => {
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight
      const headerHeight = 64
      const availableWidth = windowWidth - leftPanelWidth - rightPanelWidth - 40
      const availableHeight = windowHeight - headerHeight - 40
      
      setCanvasSize({
        width: Math.max(800, availableWidth),
        height: Math.max(600, availableHeight)
      })
    }

    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)
    return () => window.removeEventListener('resize', updateCanvasSize)
  }, [leftPanelWidth, rightPanelWidth])

  const handleSave = async () => {
    try {
      await saveProject()
      message.success('项目保存成功')
    } catch (error) {
      message.error('项目保存失败')
    }
  }

  const handleLoad = async () => {
    try {
      // 这里可以添加文件选择逻辑
      message.info('加载项目功能待实现')
    } catch (error) {
      message.error('项目加载失败')
    }
  }

  const handlePreview = () => {
    if (onPreview) {
      onPreview()
    } else {
      message.info('预览功能待实现')
    }
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <Layout style={{ height: '100vh', backgroundColor: theme === 'dark' ? '#000' : '#f5f5f5' }}>
        {/* 顶部工具栏 */}
        <Header
          style={{
            backgroundColor: theme === 'dark' ? '#141414' : '#fff',
            borderBottom: `1px solid ${theme === 'dark' ? '#434343' : '#f0f0f0'}`,
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Title 
              level={4} 
              style={{ 
                margin: 0, 
                marginRight: 24,
                color: theme === 'dark' ? '#fff' : 'inherit' 
              }}
            >
              项目开发器
            </Title>
            {currentProject && (
              <span style={{ color: theme === 'dark' ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.65)' }}>
                {currentProject.name}
              </span>
            )}
          </div>

          <Space>
            <Tooltip title="保存项目">
              <Button 
                icon={<SaveOutlined />} 
                onClick={handleSave}
                type="text"
              >
                保存
              </Button>
            </Tooltip>
            
            <Tooltip title="加载项目">
              <Button 
                icon={<FolderOpenOutlined />} 
                onClick={handleLoad}
                type="text"
              >
                加载
              </Button>
            </Tooltip>

            <Tooltip title={canvasSettings.showGrid ? '隐藏网格' : '显示网格'}>
              <Button 
                icon={<AppstoreOutlined />} 
                onClick={toggleGrid}
                type={canvasSettings.showGrid ? 'primary' : 'text'}
              />
            </Tooltip>

            <Tooltip title={canvasSettings.snapToGrid ? '关闭网格吸附' : '开启网格吸附'}>
              <Button 
                icon={<SettingOutlined />} 
                onClick={toggleSnapToGrid}
                type={canvasSettings.snapToGrid ? 'primary' : 'text'}
              />
            </Tooltip>

            <Tooltip title="预览">
              <Button 
                icon={<EyeOutlined />} 
                onClick={handlePreview}
                type="text"
              >
                预览
              </Button>
            </Tooltip>

            <Tooltip title="运行">
              <Button 
                icon={<PlayCircleOutlined />} 
                onClick={handlePreview}
                type="primary"
              >
                运行
              </Button>
            </Tooltip>
          </Space>
        </Header>

        {/* 主要内容区域 */}
        <Content style={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
          {/* 左侧组件库面板 */}
          <ComponentLibraryPanel width={leftPanelWidth} />

          {/* 中间设计画布 */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '20px',
              backgroundColor: theme === 'dark' ? '#0f0f0f' : '#f5f5f5',
              overflow: 'auto'
            }}
          >
            <DesignCanvas 
              width={canvasSize.width} 
              height={canvasSize.height} 
            />
          </div>

          {/* 右侧属性面板 */}
          <PropertyPanel width={rightPanelWidth} />
        </Content>
      </Layout>
    </DndProvider>
  )
}
