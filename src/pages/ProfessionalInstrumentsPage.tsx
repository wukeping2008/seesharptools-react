import React, { useState } from 'react'
import { Card, Row, Col, Tabs, Space, Button, Typography, Divider } from 'antd'
import { ExperimentOutlined, LineChartOutlined, BarChartOutlined, FunctionOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import DigitalOscilloscope from '../components/professional/instruments/DigitalOscilloscope'
import { generateSine, generateSquare, generateChirp } from '../utils/math/signal'
import { powerSpectralDensity, findPeaks } from '../utils/math/fft'
import { basicStatistics, linearRegression } from '../utils/math/statistics'
import { createLowpassFilter } from '../utils/math/filters'

const { Title, Paragraph, Text } = Typography
const { TabPane } = Tabs

const PageContainer = styled.div`
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;

  .demo-section {
    margin-bottom: 24px;
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .math-demo {
    background: #fafafa;
    padding: 16px;
    border-radius: 6px;
    margin: 12px 0;
    border-left: 4px solid #1890ff;
  }

  .result-display {
    background: #001529;
    color: #fff;
    padding: 12px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    margin-top: 8px;
    white-space: pre-wrap;
  }

  .feature-card {
    text-align: center;
    padding: 20px;
    border: 1px solid #d9d9d9;
    border-radius: 8px;
    transition: all 0.3s;
    cursor: pointer;

    &:hover {
      border-color: #1890ff;
      box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
    }

    .anticon {
      font-size: 32px;
      color: #1890ff;
      margin-bottom: 12px;
    }
  }
`

const ProfessionalInstrumentsPage: React.FC = () => {
  const { t } = useTranslation()
  const [activeDemo, setActiveDemo] = useState<string>('oscilloscope')
  const [demoResults, setDemoResults] = useState<string>('')

  // 数学分析演示
  const runMathDemo = (type: string) => {
    let result = ''
    
    try {
      switch (type) {
        case 'signal-generation': {
          // 信号生成演示
          const sineWave = generateSine({
            sampleRate: 1000,
            duration: 1,
            frequency: 10,
            amplitude: 2,
            offset: 0.5
          })
          
          const squareWave = generateSquare({
            sampleRate: 1000,
            duration: 1,
            frequency: 5,
            amplitude: 1.5
          })

          const chirpSignal = generateChirp({
            sampleRate: 1000,
            duration: 2,
            amplitude: 1,
            startFrequency: 1,
            endFrequency: 50,
            method: 'linear'
          })

          result = `Signal Generation Demo:
Sine Wave: ${sineWave.length} samples, Frequency: 10Hz, Amplitude: 2V
Square Wave: ${squareWave.length} samples, Frequency: 5Hz, Amplitude: 1.5V  
Chirp Signal: ${chirpSignal.length} samples, 1-50Hz Linear Sweep

First 10 sine wave samples:
${sineWave.slice(0, 10).map(v => v.toFixed(3)).join(', ')}`
          break
        }

        case 'fft-analysis': {
          // FFT分析演示
          const testSignal = generateSine({
            sampleRate: 1000,
            duration: 1,
            frequency: 50,
            amplitude: 1
          })

          const fftResult = powerSpectralDensity(testSignal, 1000)
          const peaks = findPeaks(testSignal, 1000, 0.1)

          result = `FFT Spectrum Analysis Demo:
Input Signal: 50Hz Sine Wave, 1000Hz Sample Rate
Frequency Resolution: ${fftResult.frequencyResolution.toFixed(2)} Hz
Detected Main Frequency Peaks:
${peaks.slice(0, 5).map(peak => 
  `Frequency: ${peak.frequency.toFixed(1)}Hz, Magnitude: ${peak.magnitude.toFixed(3)}`
).join('\n')}`
          break
        }

        case 'statistics': {
          // 统计分析演示
          const randomData = Array.from({ length: 1000 }, () => 
            Math.random() * 10 + Math.sin(Math.random() * Math.PI * 2) * 2
          )

          const stats = basicStatistics(randomData)
          
          result = `Statistical Analysis Demo:
Data Points: ${stats.count}
Mean: ${stats.mean.toFixed(3)}
Median: ${stats.median.toFixed(3)}
Standard Deviation: ${stats.standardDeviation.toFixed(3)}
Min: ${stats.min.toFixed(3)}
Max: ${stats.max.toFixed(3)}
Skewness: ${stats.skewness.toFixed(3)}
Kurtosis: ${stats.kurtosis.toFixed(3)}

Percentiles:
25%: ${stats.percentiles.p25.toFixed(3)}
50%: ${stats.percentiles.p50.toFixed(3)}
75%: ${stats.percentiles.p75.toFixed(3)}
95%: ${stats.percentiles.p95.toFixed(3)}`
          break
        }

        case 'regression': {
          // 回归分析演示
          const xData = Array.from({ length: 50 }, (_, i) => i)
          const yData = xData.map(x => 2 * x + 5 + (Math.random() - 0.5) * 10)

          const regression = linearRegression(xData, yData)

          result = `Linear Regression Analysis Demo:
Data Points: ${xData.length}
Regression Equation: ${regression.equation}
Correlation Coefficient: ${regression.correlation.toFixed(4)}
R-squared: ${regression.rSquared.toFixed(4)}
Slope: ${regression.slope.toFixed(4)}
Intercept: ${regression.intercept.toFixed(4)}

Fit Quality: ${regression.rSquared > 0.8 ? 'Excellent' : regression.rSquared > 0.6 ? 'Good' : 'Fair'}`
          break
        }

        case 'filtering': {
          // 滤波器演示
          const noisySignal = generateSine({
            sampleRate: 1000,
            duration: 1,
            frequency: 10,
            amplitude: 1
          }).map(v => v + (Math.random() - 0.5) * 0.5) // 添加噪声

          const lowpassFilter = createLowpassFilter(20, 1000, 2)
          const filteredLow = lowpassFilter.processData(noisySignal)

          // 计算信噪比改善
          const originalRMS = Math.sqrt(noisySignal.reduce((sum, v) => sum + v*v, 0) / noisySignal.length)
          const filteredRMS = Math.sqrt(filteredLow.reduce((sum, v) => sum + v*v, 0) / filteredLow.length)

          result = `Digital Filter Demo:
Original Signal: 10Hz Sine Wave + Random Noise
Sample Rate: 1000Hz

Lowpass Filter (20Hz Cutoff):
- Before Filtering RMS: ${originalRMS.toFixed(3)}
- After Filtering RMS: ${filteredRMS.toFixed(3)}
- Improvement Ratio: ${(originalRMS/filteredRMS).toFixed(2)}

Filter Type: 2nd Order Butterworth`
          break
        }

        default:
          result = 'Please select a demo type'
      }
    } catch (error) {
      result = `Demo execution error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }

    setDemoResults(result)
  }

  return (
    <PageContainer>
      <Title level={2}>
        <ExperimentOutlined /> {t('professionalInstruments.title')}
      </Title>
      <Paragraph>
        {t('professionalInstruments.subtitle')}
      </Paragraph>

      <Tabs activeKey={activeDemo} onChange={setActiveDemo}>
        <TabPane tab={t('professionalInstruments.digitalOscilloscope')} key="oscilloscope">
          <div className="demo-section">
            <Title level={3}>{t('professionalInstruments.oscilloscope.title')}</Title>
            <Paragraph>
              {t('professionalInstruments.oscilloscope.description')}
            </Paragraph>
            
            <DigitalOscilloscope 
              width={1000}
              height={700}
              channels={4}
            />

            <Divider />
            
            <Title level={4}>{t('professionalInstruments.mathTools.functionalFeatures')}</Title>
            <Row gutter={16}>
              <Col span={6}>
                <div className="feature-card">
                  <LineChartOutlined />
                  <Title level={5}>{t('professionalInstruments.mathTools.multiChannelDisplay')}</Title>
                  <Text>{t('professionalInstruments.mathTools.multiChannelDesc')}</Text>
                </div>
              </Col>
              <Col span={6}>
                <div className="feature-card">
                  <BarChartOutlined />
                  <Title level={5}>{t('professionalInstruments.mathTools.autoMeasurement')}</Title>
                  <Text>{t('professionalInstruments.mathTools.autoMeasurementDesc')}</Text>
                </div>
              </Col>
              <Col span={6}>
                <div className="feature-card">
                  <FunctionOutlined />
                  <Title level={5}>{t('professionalInstruments.mathTools.triggerControl')}</Title>
                  <Text>{t('professionalInstruments.mathTools.triggerControlDesc')}</Text>
                </div>
              </Col>
              <Col span={6}>
                <div className="feature-card">
                  <ExperimentOutlined />
                  <Title level={5}>{t('professionalInstruments.mathTools.professionalFeatures')}</Title>
                  <Text>{t('professionalInstruments.mathTools.professionalFeaturesDesc')}</Text>
                </div>
              </Col>
            </Row>
          </div>
        </TabPane>

        <TabPane tab={t('professionalInstruments.mathAnalysisTools')} key="math-tools">
          <div className="demo-section">
            <Title level={3}>{t('professionalInstruments.mathTools.title')}</Title>
            <Paragraph>
              {t('professionalInstruments.mathTools.description')}
            </Paragraph>

            <Row gutter={16}>
              <Col span={12}>
                <Title level={4}>{t('professionalInstruments.mathTools.demoFunctions')}</Title>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div className="math-demo">
                    <Title level={5}>{t('professionalInstruments.mathTools.signalGeneration')}</Title>
                    <Paragraph>{t('professionalInstruments.mathTools.signalGenerationDesc')}</Paragraph>
                    <Button onClick={() => runMathDemo('signal-generation')}>
                      {t('professionalInstruments.mathTools.runDemo')}
                    </Button>
                  </div>

                  <div className="math-demo">
                    <Title level={5}>{t('professionalInstruments.mathTools.fftAnalysis')}</Title>
                    <Paragraph>{t('professionalInstruments.mathTools.fftAnalysisDesc')}</Paragraph>
                    <Button onClick={() => runMathDemo('fft-analysis')}>
                      {t('professionalInstruments.mathTools.runDemo')}
                    </Button>
                  </div>

                  <div className="math-demo">
                    <Title level={5}>{t('professionalInstruments.mathTools.statisticalAnalysis')}</Title>
                    <Paragraph>{t('professionalInstruments.mathTools.statisticalAnalysisDesc')}</Paragraph>
                    <Button onClick={() => runMathDemo('statistics')}>
                      {t('professionalInstruments.mathTools.runDemo')}
                    </Button>
                  </div>

                  <div className="math-demo">
                    <Title level={5}>{t('professionalInstruments.mathTools.regressionAnalysis')}</Title>
                    <Paragraph>{t('professionalInstruments.mathTools.regressionAnalysisDesc')}</Paragraph>
                    <Button onClick={() => runMathDemo('regression')}>
                      {t('professionalInstruments.mathTools.runDemo')}
                    </Button>
                  </div>

                  <div className="math-demo">
                    <Title level={5}>{t('professionalInstruments.mathTools.digitalFiltering')}</Title>
                    <Paragraph>{t('professionalInstruments.mathTools.digitalFilteringDesc')}</Paragraph>
                    <Button onClick={() => runMathDemo('filtering')}>
                      {t('professionalInstruments.mathTools.runDemo')}
                    </Button>
                  </div>
                </Space>
              </Col>

              <Col span={12}>
                <Title level={4}>{t('professionalInstruments.mathTools.demoResults')}</Title>
                <Card>
                  <div className="result-display">
                    {demoResults || t('professionalInstruments.mathTools.clickToDemo')}
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        </TabPane>

        <TabPane tab={t('professionalInstruments.technicalSpecs')} key="specifications">
          <div className="demo-section">
            <Title level={3}>{t('professionalInstruments.technicalSpecs.title')}</Title>
            
            <Row gutter={24}>
              <Col span={12}>
                <Card title={t('professionalInstruments.technicalSpecs.oscilloscopeSpecs')} variant="outlined">
                  <ul>
                    <li><strong>{t('professionalInstruments.technicalSpecs.channels')}</strong></li>
                    <li><strong>{t('professionalInstruments.technicalSpecs.sampleRate')}</strong></li>
                    <li><strong>{t('professionalInstruments.technicalSpecs.verticalResolution')}</strong></li>
                    <li><strong>{t('professionalInstruments.technicalSpecs.bandwidth')}</strong></li>
                    <li><strong>{t('professionalInstruments.technicalSpecs.timebaseRange')}</strong></li>
                    <li><strong>{t('professionalInstruments.technicalSpecs.verticalSensitivity')}</strong></li>
                  </ul>
                </Card>
              </Col>

              <Col span={12}>
                <Card title={t('professionalInstruments.technicalSpecs.mathAnalysisFeatures')} variant="outlined">
                  <ul>
                    <li><strong>{t('professionalInstruments.technicalSpecs.signalGen')}</strong></li>
                    <li><strong>{t('professionalInstruments.technicalSpecs.fftAnalysis')}</strong></li>
                    <li><strong>{t('professionalInstruments.technicalSpecs.statistics')}</strong></li>
                    <li><strong>{t('professionalInstruments.technicalSpecs.filtering')}</strong></li>
                    <li><strong>{t('professionalInstruments.technicalSpecs.correlation')}</strong></li>
                    <li><strong>{t('professionalInstruments.technicalSpecs.spectrogram')}</strong></li>
                  </ul>
                </Card>
              </Col>
            </Row>

            <Divider />

            <Title level={4}>{t('professionalInstruments.mathTools.technicalArchitecture')}</Title>
            <Row gutter={24}>
              <Col span={8}>
                <Card title={t('professionalInstruments.mathTools.frontendTech')} size="small">
                  <ul>
                    <li>React 18 + TypeScript</li>
                    <li>{t('professionalInstruments.mathTools.canvasRendering')}</li>
                    <li>{t('professionalInstruments.mathTools.webglGraphics')}</li>
                    <li>{t('professionalInstruments.mathTools.antDesignUI')}</li>
                    <li>{t('professionalInstruments.mathTools.styledComponents')}</li>
                  </ul>
                </Card>
              </Col>
              <Col span={8}>
                <Card title={t('professionalInstruments.mathTools.mathComputation')} size="small">
                  <ul>
                    <li>{t('professionalInstruments.mathTools.customFFT')}</li>
                    <li>{t('professionalInstruments.mathTools.digitalFilterDesign')}</li>
                    <li>{t('professionalInstruments.mathTools.statisticalAlgorithms')}</li>
                    <li>{t('professionalInstruments.mathTools.signalGenerationAlgorithms')}</li>
                    <li>{t('professionalInstruments.mathTools.highPrecisionComputation')}</li>
                  </ul>
                </Card>
              </Col>
              <Col span={8}>
                <Card title={t('professionalInstruments.mathTools.performanceOptimization')} size="small">
                  <ul>
                    <li>{t('professionalInstruments.mathTools.webglAcceleration')}</li>
                    <li>{t('professionalInstruments.mathTools.virtualScrolling')}</li>
                    <li>{t('professionalInstruments.mathTools.memoryPoolManagement')}</li>
                    <li>{t('professionalInstruments.mathTools.asyncComputation')}</li>
                    <li>{t('professionalInstruments.mathTools.realtimePerformanceMonitoring')}</li>
                  </ul>
                </Card>
              </Col>
            </Row>
          </div>
        </TabPane>
      </Tabs>
    </PageContainer>
  )
}

export default ProfessionalInstrumentsPage
