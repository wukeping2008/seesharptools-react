import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Select, Switch, Slider, ColorPicker, Typography } from 'antd'
import { EasyChart, StripChart } from '../components/charts'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const { Title, Text } = Typography
const { Option } = Select

const PageContainer = styled.div`
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
`

const ControlPanel = styled(Card)`
  margin-bottom: 24px;
  
  .ant-card-body {
    padding: 16px;
  }
`

const ChartCard = styled(Card)`
  margin-bottom: 24px;
  
  .ant-card-body {
    padding: 16px;
  }
`

const ControlRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 16px;
  
  .control-label {
    min-width: 100px;
    font-weight: 500;
  }
`

/**
 * 图表展示页面
 */
export const ChartsPage: React.FC = () => {
  const { t } = useTranslation()
  
  // 图表配置状态
  const [chartType, setChartType] = useState<'line' | 'bar' | 'scatter' | 'area'>('line')
  const [showGrid, setShowGrid] = useState(true)
  const [showLegend, setShowLegend] = useState(false)
  const [showToolbox, setShowToolbox] = useState(true)
  const [showDataZoom, setShowDataZoom] = useState(false)
  const [smooth, setSmooth] = useState(false)
  const [lineWidth, setLineWidth] = useState(2)
  const [lineColor, setLineColor] = useState('#1890ff')
  const [animationDuration, setAnimationDuration] = useState(1000)
  
  // 示例数据
  const [data1, setData1] = useState<number[]>([])
  const [data2, setData2] = useState<number[][]>([])
  const [data3, setData3] = useState<number[]>([])
  
  // 生成示例数据
  useEffect(() => {
    // 正弦波数据
    const sineData = Array.from({ length: 100 }, (_, i) => 
      Math.sin(i * 0.1) * 50 + Math.random() * 10
    )
    setData1(sineData)
    
    // 散点数据
    const scatterData = Array.from({ length: 50 }, () => [
      Math.random() * 100,
      Math.random() * 100
    ])
    setData2(scatterData)
    
    // 随机数据
    const randomData = Array.from({ length: 20 }, () => 
      Math.random() * 100
    )
    setData3(randomData)
  }, [])
  
  // 处理颜色变化
  const handleColorChange = (color: string | { toHexString: () => string }) => {
    if (typeof color === 'string') {
      setLineColor(color)
    } else if (color && color.toHexString) {
      setLineColor(color.toHexString())
    }
  }

  return (
    <PageContainer>
      <Title level={2}>{t('charts.title', '图表组件')}</Title>
      
      {/* 控制面板 */}
      <ControlPanel title={t('charts.controls', '图表控制')}>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <ControlRow>
              <Text className="control-label">{t('charts.type', '图表类型')}:</Text>
              <Select
                value={chartType}
                onChange={setChartType}
                style={{ width: 120 }}
              >
                <Option value="line">{t('charts.line', '线图')}</Option>
                <Option value="bar">{t('charts.bar', '柱状图')}</Option>
                <Option value="scatter">{t('charts.scatter', '散点图')}</Option>
                <Option value="area">{t('charts.area', '面积图')}</Option>
              </Select>
            </ControlRow>
            
            <ControlRow>
              <Text className="control-label">{t('charts.lineWidth', '线条宽度')}:</Text>
              <Slider
                min={1}
                max={10}
                value={lineWidth}
                onChange={setLineWidth}
                style={{ width: 120 }}
              />
              <Text>{lineWidth}px</Text>
            </ControlRow>
            
            <ControlRow>
              <Text className="control-label">{t('charts.color', '线条颜色')}:</Text>
              <ColorPicker
                value={lineColor}
                onChange={handleColorChange}
                showText
              />
            </ControlRow>
            
            <ControlRow>
              <Text className="control-label">{t('charts.animation', '动画时长')}:</Text>
              <Slider
                min={0}
                max={3000}
                step={100}
                value={animationDuration}
                onChange={setAnimationDuration}
                style={{ width: 120 }}
              />
              <Text>{animationDuration}ms</Text>
            </ControlRow>
          </Col>
          
          <Col span={12}>
            <ControlRow>
              <Text className="control-label">{t('charts.showGrid', '显示网格')}:</Text>
              <Switch checked={showGrid} onChange={setShowGrid} />
            </ControlRow>
            
            <ControlRow>
              <Text className="control-label">{t('charts.showLegend', '显示图例')}:</Text>
              <Switch checked={showLegend} onChange={setShowLegend} />
            </ControlRow>
            
            <ControlRow>
              <Text className="control-label">{t('charts.showToolbox', '显示工具栏')}:</Text>
              <Switch checked={showToolbox} onChange={setShowToolbox} />
            </ControlRow>
            
            <ControlRow>
              <Text className="control-label">{t('charts.showDataZoom', '数据缩放')}:</Text>
              <Switch checked={showDataZoom} onChange={setShowDataZoom} />
            </ControlRow>
            
            <ControlRow>
              <Text className="control-label">{t('charts.smooth', '平滑曲线')}:</Text>
              <Switch checked={smooth} onChange={setSmooth} />
            </ControlRow>
          </Col>
        </Row>
      </ControlPanel>
      
      {/* 图表展示 */}
      <Row gutter={[24, 24]}>
        <Col span={12}>
          <ChartCard title={t('charts.sineWave', '正弦波图表')}>
            <EasyChart
              data={data1}
              title={t('charts.sineWaveTitle', '正弦波数据')}
              xAxisLabel={t('charts.time', '时间')}
              yAxisLabel={t('charts.amplitude', '幅度')}
              chartType={chartType}
              lineColor={lineColor}
              lineWidth={lineWidth}
              showGrid={showGrid}
              showLegend={showLegend}
              showToolbox={showToolbox}
              showDataZoom={showDataZoom}
              smooth={smooth}
              animationDuration={animationDuration}
              height={300}
              onClick={(params) => {
                console.log('图表点击事件:', params)
              }}
            />
          </ChartCard>
        </Col>
        
        <Col span={12}>
          <ChartCard title={t('charts.scatterPlot', '散点图')}>
            <EasyChart
              data={data2}
              title={t('charts.scatterTitle', '随机散点数据')}
              xAxisLabel={t('charts.xValue', 'X值')}
              yAxisLabel={t('charts.yValue', 'Y值')}
              chartType="scatter"
              lineColor="#ff6b6b"
              showGrid={showGrid}
              showLegend={showLegend}
              showToolbox={showToolbox}
              showDataZoom={showDataZoom}
              animationDuration={animationDuration}
              height={300}
            />
          </ChartCard>
        </Col>
        
        <Col span={12}>
          <ChartCard title={t('charts.barChart', '柱状图')}>
            <EasyChart
              data={data3}
              title={t('charts.barTitle', '随机数据柱状图')}
              xAxisLabel={t('charts.category', '类别')}
              yAxisLabel={t('charts.value', '数值')}
              chartType="bar"
              lineColor="#52c41a"
              showGrid={showGrid}
              showLegend={showLegend}
              showToolbox={showToolbox}
              showDataZoom={showDataZoom}
              animationDuration={animationDuration}
              height="400px"
            />
          </ChartCard>
        </Col>
        
        <Col span={12}>
          <ChartCard title={t('charts.stripChart', 'StripChart 实时数据监控')}>
            <StripChart
              title={t('charts.stripChartTitle', '实时数据监控')}
              xAxisLabel={t('charts.time', '时间')}
              yAxisLabel={t('charts.sensorValue', '数值')}
              lineColor="#722ed1"
              lineWidth={lineWidth}
              showGrid={showGrid}
              autoStart={true}
              updateInterval={200}
              maxDataPoints={100}
              height="400px"
              onDataUpdate={(data) => {
                console.log('StripChart数据更新:', data.length, '个数据点')
              }}
            />
          </ChartCard>
        </Col>
      </Row>
    </PageContainer>
  )
}

export default ChartsPage
