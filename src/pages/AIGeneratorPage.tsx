import React, { useState, useEffect } from 'react'
import { 
  Card, 
  Input, 
  Button, 
  Alert, 
  Spin, 
  Typography, 
  Row, 
  Col, 
  Divider,
  Tag,
  Space,
  message,
  Modal,
  Tabs
} from 'antd'
import { 
  RobotOutlined, 
  SendOutlined, 
  DownloadOutlined, 
  EyeOutlined,
  CodeOutlined,
  HistoryOutlined,
  BulbOutlined
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/stores/useAppStore'
import { useAIControl } from '@/hooks/useAIControl'
import styled from 'styled-components'

const { TextArea } = Input
const { Title, Paragraph, Text } = Typography
const { TabPane } = Tabs

const PageContainer = styled.div<{ $isDark: boolean }>`
  padding: 24px;
  min-height: 100vh;
  background: ${props => props.$isDark ? '#141414' : '#f5f5f5'};
  color: ${props => props.$isDark ? '#fff' : '#000'};
`

const GeneratorCard = styled(Card)<{ $isDark: boolean }>`
  margin-bottom: 24px;
  .ant-card-body {
    background: ${props => props.$isDark ? '#1f1f1f' : '#fff'};
  }
`

const PreviewContainer = styled.div<{ $isDark: boolean }>`
  border: 1px solid ${props => props.$isDark ? '#434343' : '#d9d9d9'};
  border-radius: 8px;
  padding: 16px;
  background: ${props => props.$isDark ? '#262626' : '#fafafa'};
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
`

const CodeContainer = styled.pre<{ $isDark: boolean }>`
  background: ${props => props.$isDark ? '#1e1e1e' : '#f6f8fa'};
  border: 1px solid ${props => props.$isDark ? '#434343' : '#d9d9d9'};
  border-radius: 8px;
  padding: 16px;
  overflow-x: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.5;
  color: ${props => props.$isDark ? '#e1e4e8' : '#24292e'};
  max-height: 400px;
`

export const AIGeneratorPage: React.FC = () => {
  const { t } = useTranslation()
  const { theme, language } = useAppStore()
  const isDark = theme === 'dark'
  
  const {
    loading,
    error,
    currentControl,
    history,
    generateControl,
    getCode,
    downloadControl,
    validateDescription,
    loadHistory,
    clearError,
    clearCurrentControl
  } = useAIControl()

  const [description, setDescription] = useState('')
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean
    suggestions?: string[]
    estimatedComplexity?: 'simple' | 'medium' | 'complex'
  } | null>(null)
  const [showCode, setShowCode] = useState(false)
  const [controlCode, setControlCode] = useState('')
  const [activeTab, setActiveTab] = useState('generator')

  // 加载历史记录
  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory()
    }
  }, [activeTab, loadHistory])

  // 示例描述
  const exampleDescriptions = [
    t('aiGenerator.examples.thermometer'),
    t('aiGenerator.examples.progressBar'),
    t('aiGenerator.examples.ledArray'),
    t('aiGenerator.examples.digitalDisplay')
  ]

  // 处理生成控件
  const handleGenerate = async () => {
    if (!description.trim()) {
      message.warning(t('aiGenerator.pleaseEnterDescription'))
      return
    }

    try {
      clearError()
      await generateControl({
        description: description.trim(),
        language,
        controlType: 'react-component'
      })
      message.success(t('aiGenerator.generateSuccess'))
    } catch (err) {
      message.error(t('aiGenerator.generateFailed'))
    }
  }

  // 验证描述
  const handleValidateDescription = async () => {
    if (!description.trim()) return

    try {
      const result = await validateDescription(description.trim(), language)
      setValidationResult(result)
    } catch (err) {
      console.error('Validation failed:', err)
    }
  }

  // 查看代码
  const handleViewCode = async () => {
    if (!currentControl) return

    try {
      const code = await getCode(currentControl.id)
      setControlCode(code)
      setShowCode(true)
    } catch (err) {
      message.error(t('aiGenerator.getCodeFailed'))
    }
  }

  // 下载控件
  const handleDownload = async () => {
    if (!currentControl) return

    try {
      await downloadControl(currentControl.id, `${currentControl.metadata.name}.tsx`)
      message.success(t('aiGenerator.downloadSuccess'))
    } catch (err) {
      message.error(t('aiGenerator.downloadFailed'))
    }
  }

  // 使用示例描述
  const handleUseExample = (example: string) => {
    setDescription(example.replace(/"/g, ''))
    setValidationResult(null)
  }

  return (
    <PageContainer $isDark={isDark}>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Title level={2} style={{ color: isDark ? '#fff' : 'inherit' }}>
            <RobotOutlined style={{ marginRight: 8 }} />
            {t('aiGenerator.title')}
          </Title>
          <Paragraph style={{ color: isDark ? 'rgba(255, 255, 255, 0.85)' : 'inherit' }}>{t('aiGenerator.subtitle')}</Paragraph>
        </Col>

        <Col span={24}>
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab={t('aiGenerator.generator')} key="generator">
              <Row gutter={[24, 24]}>
                {/* 输入区域 */}
                <Col xs={24} lg={12}>
                  <GeneratorCard $isDark={isDark} title={t('aiGenerator.inputDescription')}>
                    <Space direction="vertical" style={{ width: '100%' }} size="large">
                      <TextArea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={t('aiGenerator.descriptionPlaceholder')}
                        rows={6}
                        onBlur={handleValidateDescription}
                      />
                      
                      {validationResult && (
                        <Alert
                          type={validationResult.isValid ? 'success' : 'warning'}
                          message={validationResult.isValid ? t('aiGenerator.descriptionValid') : t('aiGenerator.descriptionInvalid')}
                          description={
                            <div>
                              {validationResult.estimatedComplexity && (
                                <Tag color={
                                  validationResult.estimatedComplexity === 'simple' ? 'green' :
                                  validationResult.estimatedComplexity === 'medium' ? 'orange' : 'red'
                                }>
                                  {t(`aiGenerator.complexity.${validationResult.estimatedComplexity}`)}
                                </Tag>
                              )}
                              {validationResult.suggestions && (
                                <div style={{ marginTop: 8 }}>
                                  <Text strong>{t('aiGenerator.suggestions')}:</Text>
                                  <ul>
                                    {validationResult.suggestions.map((suggestion, index) => (
                                      <li key={index}>{suggestion}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          }
                        />
                      )}

                      <Button
                        type="primary"
                        icon={<SendOutlined />}
                        onClick={handleGenerate}
                        loading={loading}
                        size="large"
                        block
                      >
                        {t('aiGenerator.generateControl')}
                      </Button>
                    </Space>
                  </GeneratorCard>

                  {/* 示例描述 */}
                  <GeneratorCard $isDark={isDark} title={t('aiGenerator.examples.title')}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      {exampleDescriptions.map((example, index) => (
                        <Card
                          key={index}
                          size="small"
                          hoverable
                          onClick={() => handleUseExample(example)}
                          style={{ cursor: 'pointer' }}
                        >
                          <Text>{example}</Text>
                        </Card>
                      ))}
                    </Space>
                  </GeneratorCard>
                </Col>

                {/* 预览区域 */}
                <Col xs={24} lg={12}>
                  <GeneratorCard $isDark={isDark} title={t('aiGenerator.preview')}>
                    {error && (
                      <Alert
                        type="error"
                        message={t('aiGenerator.error')}
                        description={error.message}
                        closable
                        onClose={clearError}
                        style={{ marginBottom: 16 }}
                      />
                    )}

                    <PreviewContainer $isDark={isDark}>
                      {loading ? (
                        <Spin size="large" tip={t('aiGenerator.generating')} />
                      ) : currentControl ? (
                        <div style={{ textAlign: 'center', width: '100%' }}>
                          <div
                            dangerouslySetInnerHTML={{ __html: currentControl.preview }}
                            style={{ marginBottom: 16 }}
                          />
                          <Space>
                            <Button
                              icon={<EyeOutlined />}
                              onClick={handleViewCode}
                            >
                              {t('aiGenerator.viewCode')}
                            </Button>
                            <Button
                              type="primary"
                              icon={<DownloadOutlined />}
                              onClick={handleDownload}
                            >
                              {t('aiGenerator.download')}
                            </Button>
                          </Space>
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center' }}>
                          <BulbOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
                          <Text type="secondary">{t('aiGenerator.noPreview')}</Text>
                        </div>
                      )}
                    </PreviewContainer>

                    {currentControl && (
                      <div style={{ marginTop: 16 }}>
                        <Title level={5}>{currentControl.metadata.name}</Title>
                        <Paragraph>{currentControl.metadata.description}</Paragraph>
                        <Divider />
                        <Text strong>{t('aiGenerator.props')}:</Text>
                        <div style={{ marginTop: 8 }}>
                          {currentControl.metadata.props.map((prop, index) => (
                            <Tag key={index} style={{ margin: '4px 4px 4px 0' }}>
                              {prop.name}: {prop.type}
                            </Tag>
                          ))}
                        </div>
                      </div>
                    )}
                  </GeneratorCard>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab={t('aiGenerator.history')} key="history">
              <GeneratorCard $isDark={isDark} title={t('aiGenerator.generationHistory')}>
                {history.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <HistoryOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
                    <Text type="secondary">{t('aiGenerator.noHistory')}</Text>
                  </div>
                ) : (
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {history.map((item) => (
                      <Card key={item.id} size="small">
                        <Row justify="space-between" align="middle">
                          <Col flex="auto">
                            <Text>{item.description}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {new Date(item.createdAt).toLocaleString()}
                            </Text>
                          </Col>
                          <Col>
                            <Tag color={
                              item.status === 'success' ? 'green' :
                              item.status === 'failed' ? 'red' : 'orange'
                            }>
                              {t(`aiGenerator.status.${item.status}`)}
                            </Tag>
                          </Col>
                        </Row>
                      </Card>
                    ))}
                  </Space>
                )}
              </GeneratorCard>
            </TabPane>
          </Tabs>
        </Col>
      </Row>

      {/* 代码查看模态框 */}
      <Modal
        title={
          <Space>
            <CodeOutlined />
            {t('aiGenerator.generatedCode')}
          </Space>
        }
        open={showCode}
        onCancel={() => setShowCode(false)}
        footer={[
          <Button key="close" onClick={() => setShowCode(false)}>
            {t('common.close')}
          </Button>,
          <Button
            key="copy"
            type="primary"
            onClick={() => {
              navigator.clipboard.writeText(controlCode)
              message.success(t('aiGenerator.codeCopied'))
            }}
          >
            {t('aiGenerator.copyCode')}
          </Button>
        ]}
        width={800}
      >
        <CodeContainer $isDark={isDark}>
          {controlCode}
        </CodeContainer>
      </Modal>
    </PageContainer>
  )
}
