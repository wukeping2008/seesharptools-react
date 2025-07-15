import React from 'react'
import { Layout as AntLayout, Menu, Button, Switch, Dropdown } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  RobotOutlined,
  ToolOutlined,
  ExperimentOutlined,
  BarChartOutlined,
  BulbOutlined,
  GlobalOutlined,
} from '@ant-design/icons'
import { useAppStore } from '@stores/useAppStore'

const { Header, Sider, Content } = AntLayout

export const Layout: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const { theme, language, sidebarCollapsed, setTheme, setLanguage, setSidebarCollapsed } =
    useAppStore()

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: t('common.home'),
    },
    {
      key: '/ai-generator',
      icon: <RobotOutlined />,
      label: t('common.aiGenerator'),
    },
    {
      key: '/project-developer',
      icon: <ToolOutlined />,
      label: t('common.projectDeveloper'),
    },
    {
      key: '/components',
      icon: <ExperimentOutlined />,
      label: t('common.components'),
    },
    {
      key: '/charts',
      icon: <BarChartOutlined />,
      label: t('common.charts'),
    },
    {
      key: '/enhanced-charts',
      icon: <BarChartOutlined />,
      label: t('common.enhancedCharts'),
    },
  ]

  const languageItems = [
    {
      key: 'zh-CN',
      label: t('common.chinese'),
    },
    {
      key: 'en-US',
      label: t('common.english'),
    },
  ]

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={sidebarCollapsed} theme={theme}>
        <div
          style={{
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: theme === 'dark' ? '#fff' : '#000',
            fontSize: '18px',
            fontWeight: 'bold',
            borderBottom: `1px solid ${theme === 'dark' ? '#303030' : '#f0f0f0'}`,
          }}
        >
          {sidebarCollapsed ? 'SST' : 'SeeSharpTools'}
        </div>
        <Menu
          theme={theme}
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <AntLayout>
        <Header
          style={{
            padding: '0 16px',
            background: theme === 'dark' ? '#141414' : '#fff',
            borderBottom: `1px solid ${theme === 'dark' ? '#303030' : '#f0f0f0'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Button
            type="text"
            icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BulbOutlined />
              <Switch
                checked={theme === 'dark'}
                onChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                checkedChildren="🌙"
                unCheckedChildren="☀️"
              />
            </div>
            <Dropdown
              menu={{
                items: languageItems,
                onClick: ({ key }) => setLanguage(key as 'zh-CN' | 'en-US'),
                selectedKeys: [language],
              }}
              placement="bottomRight"
            >
              <Button type="text" icon={<GlobalOutlined />}>
                {language === 'zh-CN' ? '中文' : 'English'}
              </Button>
            </Dropdown>
          </div>
        </Header>
        <Content
          style={{
            margin: 0,
            padding: 0,
            minHeight: 'calc(100vh - 64px)',
            background: theme === 'dark' ? '#141414' : '#f5f5f5',
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  )
}
