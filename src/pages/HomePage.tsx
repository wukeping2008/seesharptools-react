import React from 'react'
import { Typography, Card, Row, Col, Button } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/stores/useAppStore'
import {
  ExperimentOutlined,
  BarChartOutlined,
  RobotOutlined,
  ToolOutlined,
} from '@ant-design/icons'

const { Title, Paragraph } = Typography

export const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { theme } = useAppStore()

  const features = [
    {
      title: t('common.aiGenerator'),
      description: t('home.features.aiGenerator'),
      icon: <RobotOutlined style={{ fontSize: '48px', color: '#2E86AB' }} />,
      path: '/ai-generator',
    },
    {
      title: t('common.projectDeveloper'),
      description: t('home.features.projectDeveloper'),
      icon: <ToolOutlined style={{ fontSize: '48px', color: '#52c41a' }} />,
      path: '/project-developer',
    },
    {
      title: t('common.components'),
      description: t('home.features.components'),
      icon: <ExperimentOutlined style={{ fontSize: '48px', color: '#faad14' }} />,
      path: '/components',
    },
    {
      title: t('common.charts'),
      description: t('home.features.charts'),
      icon: <BarChartOutlined style={{ fontSize: '48px', color: '#ff4d4f' }} />,
      path: '/charts',
    },
  ]

  return (
    <div style={{ 
      padding: '24px', 
      background: theme === 'dark' ? '#141414' : '#fff', 
      minHeight: '100vh' 
    }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <Title level={1} style={{ color: theme === 'dark' ? '#fff' : 'inherit' }}>{t('home.title')}</Title>
        <Paragraph style={{ 
          fontSize: '18px', 
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.85)' : '#666' 
        }}>
          {t('home.subtitle')}
        </Paragraph>
        <Paragraph style={{ 
          fontSize: '16px',
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.85)' : 'inherit'
        }}>
          {t('home.description')}{t('common.aiGenerator') === 'AI Generator' ? ', providing rich professional measurement and control components, supporting AI generation and visual development' : '，提供丰富的专业测控控件，支持AI生成和可视化开发'}
        </Paragraph>
      </div>

      <Row gutter={[24, 24]}>
        {features.map((feature, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card
              hoverable
              style={{ height: '100%', textAlign: 'center' }}
              bodyStyle={{ padding: '32px 24px' }}
              onClick={() => navigate(feature.path)}
            >
              <div style={{ marginBottom: '16px' }}>{feature.icon}</div>
              <Title level={4}>{feature.title}</Title>
              <Paragraph style={{ 
                color: theme === 'dark' ? 'rgba(255, 255, 255, 0.65)' : '#666', 
                marginBottom: '24px' 
              }}>
                {feature.description}
              </Paragraph>
              <Button type="primary" size="large">
                {t('common.aiGenerator') === 'AI Generator' ? 'Try Now' : '立即体验'}
              </Button>
            </Card>
          </Col>
        ))}
      </Row>

      <div style={{ marginTop: '64px', textAlign: 'center' }}>
        <Title level={3} style={{ color: theme === 'dark' ? '#fff' : 'inherit' }}>{t('home.techFeatures.title')}</Title>
        <Row gutter={[24, 24]} style={{ marginTop: '32px' }}>
          <Col xs={24} md={8}>
            <Card>
              <Title level={4}>🚀 {t('common.aiGenerator') === 'AI Generator' ? 'High Performance' : '高性能'}</Title>
              <Paragraph>
                {t('home.techFeatures.performance')}
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card>
              <Title level={4}>🎨 {t('common.aiGenerator') === 'AI Generator' ? 'Modern UI' : '现代化UI'}</Title>
              <Paragraph>
                {t('home.techFeatures.modernUI')}
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card>
              <Title level={4}>🤖 {t('common.aiGenerator') === 'AI Generator' ? 'AI-Driven' : 'AI驱动'}</Title>
              <Paragraph>
                {t('home.techFeatures.aiDriven')}
              </Paragraph>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}
