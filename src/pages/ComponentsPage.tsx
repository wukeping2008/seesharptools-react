import React, { useState, useEffect } from 'react'
import { Typography, Card, Row, Col, Space, Divider, Switch, Slider, InputNumber } from 'antd'
import { useTranslation } from 'react-i18next'
import { SimpleButton, SimpleLEDIndicator, SimpleCircularGauge } from '@/components/simple'

const { Title, Paragraph } = Typography

export const ComponentsPage: React.FC = () => {
  const { t } = useTranslation()
  
  // 控件状态
  const [ledStates, setLedStates] = useState({
    led1: true,
    led2: false,
    led3: true,
    led4: false,
  })
  
  const [gaugeValue, setGaugeValue] = useState(65)
  const [gaugeValue2, setGaugeValue2] = useState(30)
  const [gaugeValue3, setGaugeValue3] = useState(85)
  
  // 自动更新仪表值
  useEffect(() => {
    const interval = setInterval(() => {
      setGaugeValue(prev => {
        const newValue = prev + (Math.random() - 0.5) * 10
        return Math.max(0, Math.min(100, newValue))
      })
      
      setGaugeValue2(prev => {
        const newValue = prev + (Math.random() - 0.5) * 8
        return Math.max(0, Math.min(100, newValue))
      })
    }, 2000)
    
    return () => clearInterval(interval)
  }, [])

  const handleButtonClick = (buttonName: string) => {
    console.log(`${buttonName} 被点击了！`)
  }

  const toggleLED = (ledKey: keyof typeof ledStates) => {
    setLedStates(prev => ({
      ...prev,
      [ledKey]: !prev[ledKey]
    }))
  }

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <Title level={2}>{t('components.title')}</Title>
      <Paragraph>
        {t('components.subtitle')}
      </Paragraph>

      {/* 简单按钮组件 */}
      <Card title={t('components.simpleButton.title')} style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Space direction="vertical" align="center">
              <SimpleButton
                text={t('components.simpleButton.default')}
                onButtonClick={() => handleButtonClick(t('components.simpleButton.default'))}
              />
              <Paragraph>{t('components.simpleButton.defaultDesc')}</Paragraph>
            </Space>
          </Col>
          <Col span={6}>
            <Space direction="vertical" align="center">
              <SimpleButton
                text={t('components.simpleButton.custom')}
                width={120}
                height={40}
                backgroundColor="#52c41a"
                textColor="#fff"
                borderRadius={8}
                onButtonClick={() => handleButtonClick(t('components.simpleButton.custom'))}
              />
              <Paragraph>{t('components.simpleButton.customDesc')}</Paragraph>
            </Space>
          </Col>
          <Col span={6}>
            <Space direction="vertical" align="center">
              <SimpleButton
                text="悬停效果"
                backgroundColor="#1890ff"
                textColor="#fff"
                hoverBackgroundColor="#40a9ff"
                hoverTextColor="#fff"
                onButtonClick={() => handleButtonClick('悬停效果按钮')}
              />
              <Paragraph>悬停效果</Paragraph>
            </Space>
          </Col>
          <Col span={6}>
            <Space direction="vertical" align="center">
              <SimpleButton
                text="危险按钮"
                backgroundColor="#ff4d4f"
                textColor="#fff"
                width={100}
                height={35}
                onButtonClick={() => handleButtonClick('危险按钮')}
              />
              <Paragraph>危险样式</Paragraph>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* LED指示灯组件 */}
      <Card title="💡 SimpleLEDIndicator - LED指示灯" style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Space direction="vertical" align="center">
              <SimpleLEDIndicator
                isOn={ledStates.led1}
                color="#00ff00"
                size={24}
                label="运行状态"
                labelPosition="bottom"
              />
              <Switch 
                checked={ledStates.led1}
                onChange={() => toggleLED('led1')}
                checkedChildren="开"
                unCheckedChildren="关"
              />
            </Space>
          </Col>
          <Col span={6}>
            <Space direction="vertical" align="center">
              <SimpleLEDIndicator
                isOn={ledStates.led2}
                color="#ff4d4f"
                size={20}
                shape="square"
                label="报警"
                labelPosition="right"
                blinking={ledStates.led2}
                blinkInterval={500}
              />
              <Switch 
                checked={ledStates.led2}
                onChange={() => toggleLED('led2')}
                checkedChildren="开"
                unCheckedChildren="关"
              />
            </Space>
          </Col>
          <Col span={6}>
            <Space direction="vertical" align="center">
              <SimpleLEDIndicator
                isOn={ledStates.led3}
                color="#faad14"
                size={28}
                label="警告"
                labelPosition="left"
                glowEffect={true}
              />
              <Switch 
                checked={ledStates.led3}
                onChange={() => toggleLED('led3')}
                checkedChildren="开"
                unCheckedChildren="关"
              />
            </Space>
          </Col>
          <Col span={6}>
            <Space direction="vertical" align="center">
              <SimpleLEDIndicator
                isOn={ledStates.led4}
                color="#1890ff"
                size={22}
                label="通信"
                labelPosition="top"
                blinking={ledStates.led4}
                blinkInterval={800}
              />
              <Switch 
                checked={ledStates.led4}
                onChange={() => toggleLED('led4')}
                checkedChildren="开"
                unCheckedChildren="关"
              />
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 圆形仪表组件 */}
      <Card title="📊 SimpleCircularGauge - 圆形仪表" style={{ marginBottom: '24px' }}>
        <Row gutter={[24, 24]}>
          <Col span={8}>
            <Space direction="vertical" align="center" style={{ width: '100%' }}>
              <SimpleCircularGauge
                value={gaugeValue}
                min={0}
                max={100}
                size={180}
                title="温度监控"
                unit="°C"
                warningThreshold={70}
                dangerThreshold={85}
                showTicks={true}
                showTickLabels={true}
              />
              <div style={{ width: '100%', padding: '0 20px' }}>
                <Paragraph>实时温度（自动更新）</Paragraph>
                <Slider
                  min={0}
                  max={100}
                  value={gaugeValue}
                  onChange={setGaugeValue}
                  tooltip={{ formatter: (value) => `${value}°C` }}
                />
              </div>
            </Space>
          </Col>
          <Col span={8}>
            <Space direction="vertical" align="center" style={{ width: '100%' }}>
              <SimpleCircularGauge
                value={gaugeValue2}
                min={0}
                max={100}
                size={180}
                title="压力监控"
                unit="bar"
                color="#52c41a"
                warningThreshold={60}
                dangerThreshold={80}
                showTicks={true}
                showTickLabels={true}
              />
              <div style={{ width: '100%', padding: '0 20px' }}>
                <Paragraph>系统压力（自动更新）</Paragraph>
                <Slider
                  min={0}
                  max={100}
                  value={gaugeValue2}
                  onChange={setGaugeValue2}
                  tooltip={{ formatter: (value) => `${value}bar` }}
                />
              </div>
            </Space>
          </Col>
          <Col span={8}>
            <Space direction="vertical" align="center" style={{ width: '100%' }}>
              <SimpleCircularGauge
                value={gaugeValue3}
                min={0}
                max={100}
                size={180}
                title="湿度监控"
                unit="%"
                color="#722ed1"
                needleColor="#eb2f96"
                warningThreshold={80}
                dangerThreshold={90}
                showTicks={true}
                showTickLabels={true}
                valueFormatter={(value) => `${value.toFixed(1)}%`}
              />
              <div style={{ width: '100%', padding: '0 20px' }}>
                <Paragraph>环境湿度</Paragraph>
                <InputNumber
                  min={0}
                  max={100}
                  value={gaugeValue3}
                  onChange={(value) => setGaugeValue3(value || 0)}
                  style={{ width: '100%' }}
                  addonAfter="%"
                />
              </div>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 组合示例 */}
      <Card title="🎛️ 组合控件示例" style={{ marginBottom: '24px' }}>
        <Row gutter={[24, 24]}>
          <Col span={12}>
            <Card size="small" title="设备控制面板">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Row gutter={16} align="middle">
                  <Col span={8}>
                    <SimpleLEDIndicator
                      isOn={true}
                      color="#00ff00"
                      label="电源"
                      labelPosition="right"
                    />
                  </Col>
                  <Col span={8}>
                    <SimpleLEDIndicator
                      isOn={false}
                      color="#ff4d4f"
                      label="故障"
                      labelPosition="right"
                    />
                  </Col>
                  <Col span={8}>
                    <SimpleLEDIndicator
                      isOn={true}
                      color="#1890ff"
                      label="通信"
                      labelPosition="right"
                      blinking={true}
                    />
                  </Col>
                </Row>
                <Divider />
                <Row gutter={16}>
                  <Col span={12}>
                    <SimpleButton
                      text="启动设备"
                      backgroundColor="#52c41a"
                      textColor="#fff"
                      width="100%"
                      onButtonClick={() => handleButtonClick('启动设备')}
                    />
                  </Col>
                  <Col span={12}>
                    <SimpleButton
                      text="停止设备"
                      backgroundColor="#ff4d4f"
                      textColor="#fff"
                      width="100%"
                      onButtonClick={() => handleButtonClick('停止设备')}
                    />
                  </Col>
                </Row>
              </Space>
            </Card>
          </Col>
          <Col span={12}>
            <Card size="small" title="监控仪表">
              <SimpleCircularGauge
                value={75}
                min={0}
                max={100}
                size={160}
                title="系统负载"
                unit="%"
                color="#faad14"
                warningThreshold={70}
                dangerThreshold={85}
                showTicks={true}
                showTickLabels={true}
              />
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  )
}

export default ComponentsPage
