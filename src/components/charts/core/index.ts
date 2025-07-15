/**
 * 图表核心模块导出
 */

export { BaseChart } from './BaseChart'
export type { BaseChartProps, BaseChartConfig, ChartEvents } from './BaseChart'

export { ChartDataManager } from './ChartDataManager'
export type { 
  DataPoint, 
  DataSeries, 
  DataSet, 
  DataUpdateEvent, 
  ChartDataManagerConfig, 
  DataSubscriber 
} from './ChartDataManager'

export { 
  getTheme, 
  getAvailableThemes, 
  createCustomTheme, 
  generateEChartsTheme 
} from './ChartTheme'
export type { ThemeConfig, ChartTheme } from './ChartTheme'
