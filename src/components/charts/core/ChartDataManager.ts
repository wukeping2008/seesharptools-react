/**
 * 图表数据管理器
 * 
 * 提供统一的数据管理功能：
 * - 数据缓冲和更新
 * - 数据变换和处理
 * - 订阅/发布机制
 * - 性能优化
 */

export type DataPoint = number | [number, number] | [number, number, number]
export type DataSeries = DataPoint[]
export type DataSet = DataSeries[]

/**
 * 数据更新事件类型
 */
export interface DataUpdateEvent {
  type: 'add' | 'update' | 'clear' | 'replace'
  seriesIndex?: number
  data?: DataSeries
  timestamp: number
}

/**
 * 数据管理器配置
 */
export interface ChartDataManagerConfig {
  /** 最大数据点数 */
  maxDataPoints?: number
  /** 是否启用实时模式 */
  realTimeMode?: boolean
  /** 数据更新间隔（毫秒） */
  updateInterval?: number
  /** 是否自动清理过期数据 */
  autoCleanup?: boolean
}

/**
 * 数据订阅回调函数类型
 */
export type DataSubscriber = (event: DataUpdateEvent) => void

/**
 * ChartDataManager - 图表数据管理器
 */
export class ChartDataManager {
  private data: DataSet = []
  private subscribers: Set<DataSubscriber> = new Set()
  private config: Required<ChartDataManagerConfig>
  private updateTimer: NodeJS.Timeout | null = null

  constructor(config: ChartDataManagerConfig = {}) {
    this.config = {
      maxDataPoints: config.maxDataPoints || 1000,
      realTimeMode: config.realTimeMode || false,
      updateInterval: config.updateInterval || 100,
      autoCleanup: config.autoCleanup || true
    }
  }

  /**
   * 获取所有数据
   */
  getData(): DataSet {
    return [...this.data]
  }

  /**
   * 获取指定系列的数据
   */
  getSeriesData(seriesIndex: number): DataSeries {
    return this.data[seriesIndex] ? [...this.data[seriesIndex]] : []
  }

  /**
   * 设置数据
   */
  setData(data: DataSet): void {
    this.data = data.map(series => [...series])
    this.notifySubscribers({
      type: 'replace',
      timestamp: Date.now()
    })
  }

  /**
   * 添加数据系列
   */
  addSeries(data: DataSeries): number {
    const seriesIndex = this.data.length
    this.data.push([...data])
    this.notifySubscribers({
      type: 'add',
      seriesIndex,
      data: [...data],
      timestamp: Date.now()
    })
    return seriesIndex
  }

  /**
   * 更新指定系列的数据
   */
  updateSeries(seriesIndex: number, data: DataSeries): void {
    if (seriesIndex >= 0 && seriesIndex < this.data.length) {
      this.data[seriesIndex] = [...data]
      
      // 自动清理过期数据
      if (this.config.autoCleanup && this.data[seriesIndex].length > this.config.maxDataPoints) {
        this.data[seriesIndex] = this.data[seriesIndex].slice(-this.config.maxDataPoints)
      }

      this.notifySubscribers({
        type: 'update',
        seriesIndex,
        data: [...this.data[seriesIndex]],
        timestamp: Date.now()
      })
    }
  }

  /**
   * 向指定系列添加数据点
   */
  appendToSeries(seriesIndex: number, dataPoint: DataPoint): void {
    if (seriesIndex >= 0 && seriesIndex < this.data.length) {
      this.data[seriesIndex].push(dataPoint)
      
      // 自动清理过期数据
      if (this.config.autoCleanup && this.data[seriesIndex].length > this.config.maxDataPoints) {
        this.data[seriesIndex].shift()
      }

      this.notifySubscribers({
        type: 'update',
        seriesIndex,
        data: [...this.data[seriesIndex]],
        timestamp: Date.now()
      })
    }
  }

  /**
   * 批量添加数据点到指定系列
   */
  appendBatchToSeries(seriesIndex: number, dataPoints: DataPoint[]): void {
    if (seriesIndex >= 0 && seriesIndex < this.data.length) {
      this.data[seriesIndex].push(...dataPoints)
      
      // 自动清理过期数据
      if (this.config.autoCleanup && this.data[seriesIndex].length > this.config.maxDataPoints) {
        const excess = this.data[seriesIndex].length - this.config.maxDataPoints
        this.data[seriesIndex] = this.data[seriesIndex].slice(excess)
      }

      this.notifySubscribers({
        type: 'update',
        seriesIndex,
        data: [...this.data[seriesIndex]],
        timestamp: Date.now()
      })
    }
  }

  /**
   * 清空所有数据
   */
  clear(): void {
    this.data = []
    this.notifySubscribers({
      type: 'clear',
      timestamp: Date.now()
    })
  }

  /**
   * 清空指定系列的数据
   */
  clearSeries(seriesIndex: number): void {
    if (seriesIndex >= 0 && seriesIndex < this.data.length) {
      this.data[seriesIndex] = []
      this.notifySubscribers({
        type: 'update',
        seriesIndex,
        data: [],
        timestamp: Date.now()
      })
    }
  }

  /**
   * 获取数据统计信息
   */
  getStatistics(seriesIndex?: number): {
    totalSeries: number
    totalPoints: number
    seriesPoints?: number
    memoryUsage: number
  } {
    const totalSeries = this.data.length
    const totalPoints = this.data.reduce((sum, series) => sum + series.length, 0)
    const seriesPoints = seriesIndex !== undefined ? this.data[seriesIndex]?.length || 0 : undefined
    
    // 估算内存使用（字节）
    const memoryUsage = totalPoints * 24 // 假设每个数据点占用24字节

    return {
      totalSeries,
      totalPoints,
      seriesPoints,
      memoryUsage
    }
  }

  /**
   * 订阅数据更新事件
   */
  subscribe(callback: DataSubscriber): () => void {
    this.subscribers.add(callback)
    
    // 返回取消订阅函数
    return () => {
      this.subscribers.delete(callback)
    }
  }

  /**
   * 通知所有订阅者
   */
  private notifySubscribers(event: DataUpdateEvent): void {
    this.subscribers.forEach(callback => {
      try {
        callback(event)
      } catch (error) {
        console.error('Error in data subscriber:', error)
      }
    })
  }

  /**
   * 启动实时模式
   */
  startRealTimeMode(): void {
    if (this.config.realTimeMode && !this.updateTimer) {
      this.updateTimer = setInterval(() => {
        // 触发定时更新事件
        this.notifySubscribers({
          type: 'update',
          timestamp: Date.now()
        })
      }, this.config.updateInterval)
    }
  }

  /**
   * 停止实时模式
   */
  stopRealTimeMode(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer)
      this.updateTimer = null
    }
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<ChartDataManagerConfig>): void {
    this.config = { ...this.config, ...newConfig }
    
    // 如果实时模式配置改变，重新启动
    if (newConfig.realTimeMode !== undefined || newConfig.updateInterval !== undefined) {
      this.stopRealTimeMode()
      if (this.config.realTimeMode) {
        this.startRealTimeMode()
      }
    }
  }

  /**
   * 销毁数据管理器
   */
  destroy(): void {
    this.stopRealTimeMode()
    this.subscribers.clear()
    this.data = []
  }
}

export default ChartDataManager
