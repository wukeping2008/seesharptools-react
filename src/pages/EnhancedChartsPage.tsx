import React, { useState } from 'react'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { EnhancedStripChart, ChartTheme, getAvailableThemes } from '../components/charts'

const PageContainer = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  background: ${props => props.theme.mode === 'dark' ? '#141414' : '#ffffff'};
  min-height: 100vh;
`

const Title = styled.h1`
  color: ${props => props.theme.mode === 'dark' ? '#ffffff' : '#333'};
  margin-bottom: 24px;
  text-align: center;
`

const Section = styled.div`
  margin-bottom: 32px;
  padding: 24px;
  background: ${props => props.theme.mode === 'dark' ? '#1f1f1f' : '#fff'};
  border-radius: 8px;
  box-shadow: 0 2px 8px ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#434343' : 'transparent'};
`

const SectionTitle = styled.h2`
  color: ${props => props.theme.mode === 'dark' ? '#ffffff' : '#333'};
  margin-bottom: 16px;
  font-size: 20px;
`

const ControlPanel = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  align-items: center;
`

const ControlGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.theme.mode === 'dark' ? '#ffffff' : '#333'};
`

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#434343' : '#d9d9d9'};
  border-radius: 4px;
  background: ${props => props.theme.mode === 'dark' ? '#262626' : 'white'};
  color: ${props => props.theme.mode === 'dark' ? '#ffffff' : '#000000'};
  font-size: 14px;
  min-width: 120px;
`

const Button = styled.button`
  padding: 8px 16px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    opacity: 0.8;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 24px;
  margin-top: 24px;
`

const ChartCard = styled.div`
  border: 1px solid ${props => props.theme.mode === 'dark' ? '#434343' : '#e8e8e8'};
  border-radius: 8px;
  overflow: hidden;
  background: ${props => props.theme.mode === 'dark' ? '#262626' : 'white'};
`

const ChartHeader = styled.div`
  padding: 16px;
  background: ${props => props.theme.mode === 'dark' ? '#1a1a1a' : '#f5f5f5'};
  border-bottom: 1px solid ${props => props.theme.mode === 'dark' ? '#434343' : '#e8e8e8'};
  font-weight: 500;
  color: ${props => props.theme.mode === 'dark' ? '#ffffff' : '#333'};
`

const Description = styled.p`
  color: ${props => props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.85)' : '#666'};
  line-height: 1.6;
  margin-bottom: 16px;
`

/**
 * Enhanced Charts Demo Page
 */
export const EnhancedChartsPage: React.FC = () => {
  const { t } = useTranslation()
  const [selectedTheme, setSelectedTheme] = useState<ChartTheme>('default')
  const [isAutoStart, setIsAutoStart] = useState(false)
  const [maxDataPoints, setMaxDataPoints] = useState(300)
  const [updateInterval, setUpdateInterval] = useState(100)

  const availableThemes = getAvailableThemes()

  const themeDisplayNames: Record<ChartTheme, string> = {
    default: t('enhancedCharts.themes.default'),
    dark: t('enhancedCharts.themes.dark'),
    oscilloscope: t('enhancedCharts.themes.oscilloscope'),
    spectrum: t('enhancedCharts.themes.spectrum'),
    professional: t('enhancedCharts.themes.professional')
  }

  const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTheme(event.target.value as ChartTheme)
  }

  const toggleAutoStart = () => {
    setIsAutoStart(!isAutoStart)
  }

  return (
    <PageContainer>
      <Title>{t('enhancedCharts.title')}</Title>
      
      <Description>
        {t('enhancedCharts.description')}
      </Description>

      <Section>
        <SectionTitle>{t('enhancedCharts.globalControlPanel')}</SectionTitle>
        <ControlPanel>
          <ControlGroup>
            <Label>{t('enhancedCharts.themeSelection')}</Label>
            <Select value={selectedTheme} onChange={handleThemeChange}>
              {availableThemes.map(theme => (
                <option key={theme} value={theme}>
                  {themeDisplayNames[theme]}
                </option>
              ))}
            </Select>
          </ControlGroup>
          
          <ControlGroup>
            <Label>{t('enhancedCharts.maxDataPoints')}</Label>
            <Select 
              value={maxDataPoints} 
              onChange={(e) => setMaxDataPoints(Number(e.target.value))}
            >
              <option value={100}>100</option>
              <option value={300}>300</option>
              <option value={500}>500</option>
              <option value={1000}>1000</option>
            </Select>
          </ControlGroup>
          
          <ControlGroup>
            <Label>{t('enhancedCharts.updateInterval')}</Label>
            <Select 
              value={updateInterval} 
              onChange={(e) => setUpdateInterval(Number(e.target.value))}
            >
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
              <option value={500}>500</option>
            </Select>
          </ControlGroup>
          
          <ControlGroup>
            <Label>{t('enhancedCharts.realTimeMode')}</Label>
            <Button onClick={toggleAutoStart}>
              {isAutoStart ? t('enhancedCharts.stop') : t('enhancedCharts.start')}
            </Button>
          </ControlGroup>
        </ControlPanel>
      </Section>

      <Section>
        <SectionTitle>{t('enhancedCharts.enhancedStripChart')}</SectionTitle>
        <Description>
          {t('enhancedCharts.stripChartDescription')}
        </Description>
        
        <ChartGrid>
          <ChartCard>
            <ChartHeader>{t('enhancedCharts.basicRealTimeChart')}</ChartHeader>
            <EnhancedStripChart
              key={`basic-${isAutoStart}-${selectedTheme}-${maxDataPoints}-${updateInterval}`}
              width="100%"
              height="300px"
              title={t('enhancedCharts.sensorDataMonitoring')}
              theme={selectedTheme}
              maxDataPoints={maxDataPoints}
              updateInterval={updateInterval}
              autoStart={isAutoStart}
              showGrid={true}
              showToolbox={true}
              enableZoom={true}
              yAxisRange={[0, 120]}
              xAxisLabel={t('charts.time')}
              yAxisLabel={t('charts.value')}
            />
          </ChartCard>

          <ChartCard>
            <ChartHeader>{t('enhancedCharts.oscilloscopeStyle')}</ChartHeader>
            <EnhancedStripChart
              width="100%"
              height="300px"
              title={t('enhancedCharts.waveformMonitoring')}
              theme="oscilloscope"
              maxDataPoints={maxDataPoints}
              updateInterval={updateInterval}
              autoStart={isAutoStart}
              showGrid={true}
              lineColor="#00ff00"
              lineWidth={1}
              yAxisRange={[-50, 150]}
            />
          </ChartCard>

          <ChartCard>
            <ChartHeader>{t('enhancedCharts.spectrumStyle')}</ChartHeader>
            <EnhancedStripChart
              width="100%"
              height="300px"
              title={t('enhancedCharts.spectrumAnalysis')}
              theme="spectrum"
              maxDataPoints={maxDataPoints}
              updateInterval={updateInterval}
              autoStart={isAutoStart}
              showGrid={true}
              lineColor="#00aaff"
              lineWidth={2}
              yAxisRange={[0, 100]}
            />
          </ChartCard>

          <ChartCard>
            <ChartHeader>{t('enhancedCharts.professionalStyle')}</ChartHeader>
            <EnhancedStripChart
              width="100%"
              height="300px"
              title={t('enhancedCharts.precisionMeasurement')}
              theme="professional"
              maxDataPoints={maxDataPoints}
              updateInterval={updateInterval}
              autoStart={isAutoStart}
              showGrid={true}
              showToolbox={true}
              enableZoom={true}
              lineColor="#007bff"
              lineWidth={2}
              yAxisRange={[20, 80]}
            />
          </ChartCard>
        </ChartGrid>
      </Section>

      <Section>
        <SectionTitle>{t('enhancedCharts.architectureFeatures')}</SectionTitle>
        <Description>
          <strong>🏗️ {t('enhancedCharts.unifiedArchitecture')}</strong><br/>
          <strong>📊 {t('enhancedCharts.dataManagement')}</strong><br/>
          <strong>🎨 {t('enhancedCharts.themeSystem')}</strong><br/>
          <strong>⚡ {t('enhancedCharts.performanceOptimization')}</strong><br/>
          <strong>🔧 {t('enhancedCharts.extensibility')}</strong><br/>
          <strong>🎯 {t('enhancedCharts.typeSafety')}</strong>
        </Description>
      </Section>
    </PageContainer>
  )
}

export default EnhancedChartsPage
