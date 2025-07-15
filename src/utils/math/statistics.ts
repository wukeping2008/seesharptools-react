/**
 * 统计分析工具
 * 用于数据的统计计算和分析
 */

export interface StatisticsResult {
  mean: number
  median: number
  mode: number[]
  variance: number
  standardDeviation: number
  min: number
  max: number
  range: number
  skewness: number
  kurtosis: number
  count: number
  sum: number
  percentiles: {
    p25: number
    p50: number
    p75: number
    p90: number
    p95: number
    p99: number
  }
}

export interface HistogramData {
  bins: number[]
  counts: number[]
  binWidth: number
  totalCount: number
}

export interface RegressionResult {
  slope: number
  intercept: number
  rSquared: number
  correlation: number
  equation: string
  predictedValues: number[]
  residuals: number[]
}

/**
 * 统计分析器
 */
export class StatisticsAnalyzer {
  /**
   * 计算基本统计量
   * @param data 数据数组
   * @returns 统计结果
   */
  static basicStatistics(data: number[]): StatisticsResult {
    if (data.length === 0) {
      throw new Error('数据数组不能为空')
    }

    const sortedData = [...data].sort((a, b) => a - b)
    const n = data.length
    const sum = data.reduce((acc, val) => acc + val, 0)
    const mean = sum / n

    // 中位数
    const median = n % 2 === 0
      ? (sortedData[n / 2 - 1] + sortedData[n / 2]) / 2
      : sortedData[Math.floor(n / 2)]

    // 众数
    const mode = StatisticsAnalyzer.calculateMode(data)

    // 方差和标准差
    const variance = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n
    const standardDeviation = Math.sqrt(variance)

    // 最值和范围
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min

    // 偏度 (skewness)
    const skewness = StatisticsAnalyzer.calculateSkewness(data, mean, standardDeviation)

    // 峰度 (kurtosis)
    const kurtosis = StatisticsAnalyzer.calculateKurtosis(data, mean, standardDeviation)

    // 百分位数
    const percentiles = {
      p25: StatisticsAnalyzer.percentile(sortedData, 25),
      p50: median,
      p75: StatisticsAnalyzer.percentile(sortedData, 75),
      p90: StatisticsAnalyzer.percentile(sortedData, 90),
      p95: StatisticsAnalyzer.percentile(sortedData, 95),
      p99: StatisticsAnalyzer.percentile(sortedData, 99)
    }

    return {
      mean,
      median,
      mode,
      variance,
      standardDeviation,
      min,
      max,
      range,
      skewness,
      kurtosis,
      count: n,
      sum,
      percentiles
    }
  }

  /**
   * 计算众数
   */
  private static calculateMode(data: number[]): number[] {
    const frequency: { [key: number]: number } = {}
    
    // 计算频率
    data.forEach(value => {
      frequency[value] = (frequency[value] || 0) + 1
    })

    const maxFrequency = Math.max(...Object.values(frequency))
    
    // 找出所有最高频率的值
    return Object.keys(frequency)
      .filter(key => frequency[Number(key)] === maxFrequency)
      .map(Number)
  }

  /**
   * 计算偏度
   */
  private static calculateSkewness(data: number[], mean: number, stdDev: number): number {
    if (stdDev === 0) return 0
    
    const n = data.length
    const sum = data.reduce((acc, val) => acc + Math.pow((val - mean) / stdDev, 3), 0)
    
    return (n / ((n - 1) * (n - 2))) * sum
  }

  /**
   * 计算峰度
   */
  private static calculateKurtosis(data: number[], mean: number, stdDev: number): number {
    if (stdDev === 0) return 0
    
    const n = data.length
    const sum = data.reduce((acc, val) => acc + Math.pow((val - mean) / stdDev, 4), 0)
    
    const kurtosis = (n * (n + 1) / ((n - 1) * (n - 2) * (n - 3))) * sum
    const correction = 3 * Math.pow(n - 1, 2) / ((n - 2) * (n - 3))
    
    return kurtosis - correction // 超额峰度
  }

  /**
   * 计算百分位数
   */
  private static percentile(sortedData: number[], p: number): number {
    const index = (p / 100) * (sortedData.length - 1)
    const lower = Math.floor(index)
    const upper = Math.ceil(index)
    
    if (lower === upper) {
      return sortedData[lower]
    }
    
    const weight = index - lower
    return sortedData[lower] * (1 - weight) + sortedData[upper] * weight
  }

  /**
   * 创建直方图
   * @param data 数据数组
   * @param bins 分箱数量或分箱边界
   * @returns 直方图数据
   */
  static histogram(data: number[], bins: number | number[] = 10): HistogramData {
    if (data.length === 0) {
      throw new Error('数据数组不能为空')
    }

    const min = Math.min(...data)
    const max = Math.max(...data)

    let binEdges: number[]
    
    if (typeof bins === 'number') {
      // 等宽分箱
      const binWidth = (max - min) / bins
      binEdges = Array.from({ length: bins + 1 }, (_, i) => min + i * binWidth)
    } else {
      // 自定义分箱边界
      binEdges = [...bins].sort((a, b) => a - b)
    }

    const binCounts = new Array(binEdges.length - 1).fill(0)
    const binCenters = binEdges.slice(0, -1).map((edge, i) => (edge + binEdges[i + 1]) / 2)

    // 分配数据到分箱
    data.forEach(value => {
      for (let i = 0; i < binEdges.length - 1; i++) {
        if (value >= binEdges[i] && (value < binEdges[i + 1] || (i === binEdges.length - 2 && value <= binEdges[i + 1]))) {
          binCounts[i]++
          break
        }
      }
    })

    return {
      bins: binCenters,
      counts: binCounts,
      binWidth: typeof bins === 'number' ? (max - min) / bins : 0,
      totalCount: data.length
    }
  }

  /**
   * 线性回归分析
   * @param xData X轴数据
   * @param yData Y轴数据
   * @returns 回归分析结果
   */
  static linearRegression(xData: number[], yData: number[]): RegressionResult {
    if (xData.length !== yData.length || xData.length === 0) {
      throw new Error('X和Y数据长度必须相等且不为空')
    }

    const n = xData.length
    const sumX = xData.reduce((acc, val) => acc + val, 0)
    const sumY = yData.reduce((acc, val) => acc + val, 0)
    const sumXY = xData.reduce((acc, val, i) => acc + val * yData[i], 0)
    const sumXX = xData.reduce((acc, val) => acc + val * val, 0)
    const sumYY = yData.reduce((acc, val) => acc + val * val, 0)

    const meanX = sumX / n
    const meanY = sumY / n

    // 计算斜率和截距
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = meanY - slope * meanX

    // 计算相关系数
    const numerator = n * sumXY - sumX * sumY
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY))
    const correlation = denominator === 0 ? 0 : numerator / denominator

    // 计算R²
    const rSquared = correlation * correlation

    // 计算预测值和残差
    const predictedValues = xData.map(x => slope * x + intercept)
    const residuals = yData.map((y, i) => y - predictedValues[i])

    // 生成方程字符串
    const equation = `y = ${slope.toFixed(4)}x + ${intercept.toFixed(4)}`

    return {
      slope,
      intercept,
      rSquared,
      correlation,
      equation,
      predictedValues,
      residuals
    }
  }

  /**
   * 相关性分析
   * @param xData X轴数据
   * @param yData Y轴数据
   * @returns 相关系数
   */
  static correlation(xData: number[], yData: number[]): number {
    if (xData.length !== yData.length || xData.length === 0) {
      throw new Error('X和Y数据长度必须相等且不为空')
    }

    const n = xData.length
    const meanX = xData.reduce((acc, val) => acc + val, 0) / n
    const meanY = yData.reduce((acc, val) => acc + val, 0) / n

    let numerator = 0
    let sumXSquared = 0
    let sumYSquared = 0

    for (let i = 0; i < n; i++) {
      const deltaX = xData[i] - meanX
      const deltaY = yData[i] - meanY
      
      numerator += deltaX * deltaY
      sumXSquared += deltaX * deltaX
      sumYSquared += deltaY * deltaY
    }

    const denominator = Math.sqrt(sumXSquared * sumYSquared)
    return denominator === 0 ? 0 : numerator / denominator
  }

  /**
   * 移动平均
   * @param data 数据数组
   * @param windowSize 窗口大小
   * @returns 移动平均结果
   */
  static movingAverage(data: number[], windowSize: number): number[] {
    if (windowSize <= 0 || windowSize > data.length) {
      throw new Error('窗口大小必须大于0且不超过数据长度')
    }

    const result: number[] = []
    
    for (let i = 0; i <= data.length - windowSize; i++) {
      const window = data.slice(i, i + windowSize)
      const average = window.reduce((acc, val) => acc + val, 0) / windowSize
      result.push(average)
    }

    return result
  }

  /**
   * 指数移动平均
   * @param data 数据数组
   * @param alpha 平滑因子 (0-1)
   * @returns 指数移动平均结果
   */
  static exponentialMovingAverage(data: number[], alpha: number = 0.1): number[] {
    if (alpha <= 0 || alpha > 1) {
      throw new Error('平滑因子必须在0和1之间')
    }

    const result: number[] = []
    let ema = data[0] // 初始值

    result.push(ema)

    for (let i = 1; i < data.length; i++) {
      ema = alpha * data[i] + (1 - alpha) * ema
      result.push(ema)
    }

    return result
  }

  /**
   * 异常值检测 (使用IQR方法)
   * @param data 数据数组
   * @param factor IQR倍数因子 (默认1.5)
   * @returns 异常值索引和值
   */
  static detectOutliers(data: number[], factor: number = 1.5): {
    outlierIndices: number[]
    outlierValues: number[]
    lowerBound: number
    upperBound: number
  } {
    const sortedData = [...data].sort((a, b) => a - b)
    const q1 = StatisticsAnalyzer.percentile(sortedData, 25)
    const q3 = StatisticsAnalyzer.percentile(sortedData, 75)
    const iqr = q3 - q1

    const lowerBound = q1 - factor * iqr
    const upperBound = q3 + factor * iqr

    const outlierIndices: number[] = []
    const outlierValues: number[] = []

    data.forEach((value, index) => {
      if (value < lowerBound || value > upperBound) {
        outlierIndices.push(index)
        outlierValues.push(value)
      }
    })

    return {
      outlierIndices,
      outlierValues,
      lowerBound,
      upperBound
    }
  }

  /**
   * 数据标准化 (Z-score)
   * @param data 数据数组
   * @returns 标准化后的数据
   */
  static normalize(data: number[]): number[] {
    const stats = StatisticsAnalyzer.basicStatistics(data)
    
    if (stats.standardDeviation === 0) {
      return new Array(data.length).fill(0)
    }

    return data.map(value => (value - stats.mean) / stats.standardDeviation)
  }

  /**
   * 数据归一化 (Min-Max缩放)
   * @param data 数据数组
   * @param min 目标最小值
   * @param max 目标最大值
   * @returns 归一化后的数据
   */
  static minMaxScale(data: number[], min: number = 0, max: number = 1): number[] {
    const dataMin = Math.min(...data)
    const dataMax = Math.max(...data)
    const range = dataMax - dataMin

    if (range === 0) {
      return new Array(data.length).fill((min + max) / 2)
    }

    return data.map(value => min + (value - dataMin) * (max - min) / range)
  }
}

/**
 * 便捷的统计分析函数
 */
export const basicStatistics = StatisticsAnalyzer.basicStatistics
export const histogram = StatisticsAnalyzer.histogram
export const linearRegression = StatisticsAnalyzer.linearRegression
export const correlation = StatisticsAnalyzer.correlation
export const movingAverage = StatisticsAnalyzer.movingAverage
export const exponentialMovingAverage = StatisticsAnalyzer.exponentialMovingAverage
export const detectOutliers = StatisticsAnalyzer.detectOutliers
export const normalize = StatisticsAnalyzer.normalize
export const minMaxScale = StatisticsAnalyzer.minMaxScale
