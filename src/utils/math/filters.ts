/**
 * 数字滤波器工具
 * 用于信号处理和噪声滤除
 */

export interface FilterConfig {
  type: 'lowpass' | 'highpass' | 'bandpass' | 'bandstop'
  cutoffFrequency: number
  cutoffFrequency2?: number // 用于带通和带阻滤波器
  sampleRate: number
  order?: number
}

export interface FilterResponse {
  frequencies: number[]
  magnitudes: number[]
  phases: number[]
}

/**
 * 数字滤波器类
 */
export class DigitalFilter {
  private coefficientsA: number[] = []
  private coefficientsB: number[] = []
  private delayLineX: number[] = []
  private delayLineY: number[] = []

  constructor(private config: FilterConfig) {
    this.designFilter()
    this.initializeDelayLines()
  }

  /**
   * 设计滤波器系数
   */
  private designFilter(): void {
    const { type, cutoffFrequency, cutoffFrequency2, sampleRate, order = 2 } = this.config
    
    // 归一化频率 (0-1, 其中1对应奈奎斯特频率)
    const normalizedFreq = cutoffFrequency / (sampleRate / 2)
    const normalizedFreq2 = cutoffFrequency2 ? cutoffFrequency2 / (sampleRate / 2) : 0

    switch (type) {
      case 'lowpass':
        this.designButterworthLowpass(normalizedFreq, order)
        break
      case 'highpass':
        this.designButterworthHighpass(normalizedFreq, order)
        break
      case 'bandpass':
        if (!cutoffFrequency2) {
          throw new Error('带通滤波器需要两个截止频率')
        }
        this.designButterworthBandpass(normalizedFreq, normalizedFreq2, order)
        break
      case 'bandstop':
        if (!cutoffFrequency2) {
          throw new Error('带阻滤波器需要两个截止频率')
        }
        this.designButterworthBandstop(normalizedFreq, normalizedFreq2, order)
        break
    }
  }

  /**
   * 设计巴特沃斯低通滤波器
   */
  private designButterworthLowpass(fc: number, order: number): void {
    // 简化的巴特沃斯滤波器设计 (双线性变换)
    const wc = Math.tan(Math.PI * fc / 2)
    
    if (order === 1) {
      // 一阶低通
      const k = wc
      this.coefficientsB = [k, k]
      this.coefficientsA = [1 + k, k - 1]
    } else {
      // 二阶低通
      const k = wc
      const k2 = k * k
      const sqrt2 = Math.sqrt(2)
      const norm = 1 + sqrt2 * k + k2
      
      this.coefficientsB = [k2 / norm, 2 * k2 / norm, k2 / norm]
      this.coefficientsA = [1, (2 * (k2 - 1)) / norm, (1 - sqrt2 * k + k2) / norm]
    }
  }

  /**
   * 设计巴特沃斯高通滤波器
   */
  private designButterworthHighpass(fc: number, order: number): void {
    const wc = Math.tan(Math.PI * fc / 2)
    
    if (order === 1) {
      // 一阶高通
      const k = wc
      this.coefficientsB = [1, -1]
      this.coefficientsA = [1 + k, k - 1]
    } else {
      // 二阶高通
      const k = wc
      const k2 = k * k
      const sqrt2 = Math.sqrt(2)
      const norm = 1 + sqrt2 * k + k2
      
      this.coefficientsB = [1 / norm, -2 / norm, 1 / norm]
      this.coefficientsA = [1, (2 * (k2 - 1)) / norm, (1 - sqrt2 * k + k2) / norm]
    }
  }

  /**
   * 设计巴特沃斯带通滤波器
   */
  private designButterworthBandpass(fc1: number, fc2: number, order: number): void {
    // 确保fc1 < fc2
    const [f1, f2] = fc1 < fc2 ? [fc1, fc2] : [fc2, fc1]
    const centerFreq = Math.sqrt(f1 * f2)
    const bandwidth = f2 - f1
    
    const wc = Math.tan(Math.PI * centerFreq / 2)
    const bw = Math.tan(Math.PI * bandwidth / 2)
    
    // 简化的二阶带通滤波器
    const norm = 1 + bw + wc * wc
    this.coefficientsB = [bw / norm, 0, -bw / norm]
    this.coefficientsA = [1, (2 * (wc * wc - 1)) / norm, (1 - bw + wc * wc) / norm]
  }

  /**
   * 设计巴特沃斯带阻滤波器
   */
  private designButterworthBandstop(fc1: number, fc2: number, order: number): void {
    // 确保fc1 < fc2
    const [f1, f2] = fc1 < fc2 ? [fc1, fc2] : [fc2, fc1]
    const centerFreq = Math.sqrt(f1 * f2)
    const bandwidth = f2 - f1
    
    const wc = Math.tan(Math.PI * centerFreq / 2)
    const bw = Math.tan(Math.PI * bandwidth / 2)
    
    // 简化的二阶带阻滤波器
    const wc2 = wc * wc
    const norm = 1 + bw + wc2
    this.coefficientsB = [(1 + wc2) / norm, (2 * (wc2 - 1)) / norm, (1 + wc2) / norm]
    this.coefficientsA = [1, (2 * (wc2 - 1)) / norm, (1 - bw + wc2) / norm]
  }

  /**
   * 初始化延迟线
   */
  private initializeDelayLines(): void {
    this.delayLineX = new Array(this.coefficientsB.length).fill(0)
    this.delayLineY = new Array(this.coefficientsA.length - 1).fill(0)
  }

  /**
   * 处理单个样本
   * @param input 输入样本
   * @returns 滤波后的样本
   */
  processSample(input: number): number {
    // 更新输入延迟线
    this.delayLineX.unshift(input)
    this.delayLineX.pop()

    // 计算输出
    let output = 0
    
    // FIR部分 (前馈)
    for (let i = 0; i < this.coefficientsB.length; i++) {
      output += this.coefficientsB[i] * this.delayLineX[i]
    }

    // IIR部分 (反馈)
    for (let i = 0; i < this.delayLineY.length; i++) {
      output -= this.coefficientsA[i + 1] * this.delayLineY[i]
    }

    // 更新输出延迟线
    this.delayLineY.unshift(output)
    this.delayLineY.pop()

    return output
  }

  /**
   * 处理数据数组
   * @param data 输入数据数组
   * @returns 滤波后的数据数组
   */
  processData(data: number[]): number[] {
    return data.map(sample => this.processSample(sample))
  }

  /**
   * 重置滤波器状态
   */
  reset(): void {
    this.initializeDelayLines()
  }

  /**
   * 计算频率响应
   * @param frequencies 频率数组 (Hz)
   * @returns 频率响应
   */
  getFrequencyResponse(frequencies: number[]): FilterResponse {
    const magnitudes: number[] = []
    const phases: number[] = []

    frequencies.forEach(freq => {
      const omega = 2 * Math.PI * freq / this.config.sampleRate
      const z = { real: Math.cos(omega), imag: Math.sin(omega) }

      // 计算分子 (B(z))
      let numerator = { real: 0, imag: 0 }
      for (let i = 0; i < this.coefficientsB.length; i++) {
        const zPower = this.complexPower(z, i)
        numerator.real += this.coefficientsB[i] * zPower.real
        numerator.imag += this.coefficientsB[i] * zPower.imag
      }

      // 计算分母 (A(z))
      let denominator = { real: 0, imag: 0 }
      for (let i = 0; i < this.coefficientsA.length; i++) {
        const zPower = this.complexPower(z, i)
        denominator.real += this.coefficientsA[i] * zPower.real
        denominator.imag += this.coefficientsA[i] * zPower.imag
      }

      // H(z) = B(z) / A(z)
      const h = this.complexDivide(numerator, denominator)
      
      magnitudes.push(Math.sqrt(h.real * h.real + h.imag * h.imag))
      phases.push(Math.atan2(h.imag, h.real))
    })

    return {
      frequencies,
      magnitudes,
      phases
    }
  }

  /**
   * 复数幂运算
   */
  private complexPower(z: { real: number; imag: number }, n: number): { real: number; imag: number } {
    if (n === 0) return { real: 1, imag: 0 }
    if (n === 1) return z

    let result = { real: 1, imag: 0 }
    for (let i = 0; i < n; i++) {
      const temp = {
        real: result.real * z.real - result.imag * z.imag,
        imag: result.real * z.imag + result.imag * z.real
      }
      result = temp
    }
    return result
  }

  /**
   * 复数除法
   */
  private complexDivide(
    a: { real: number; imag: number }, 
    b: { real: number; imag: number }
  ): { real: number; imag: number } {
    const denominator = b.real * b.real + b.imag * b.imag
    return {
      real: (a.real * b.real + a.imag * b.imag) / denominator,
      imag: (a.imag * b.real - a.real * b.imag) / denominator
    }
  }
}

/**
 * 滤波器工厂类
 */
export class FilterFactory {
  /**
   * 创建低通滤波器
   */
  static createLowpass(cutoffFreq: number, sampleRate: number, order: number = 2): DigitalFilter {
    return new DigitalFilter({
      type: 'lowpass',
      cutoffFrequency: cutoffFreq,
      sampleRate,
      order
    })
  }

  /**
   * 创建高通滤波器
   */
  static createHighpass(cutoffFreq: number, sampleRate: number, order: number = 2): DigitalFilter {
    return new DigitalFilter({
      type: 'highpass',
      cutoffFrequency: cutoffFreq,
      sampleRate,
      order
    })
  }

  /**
   * 创建带通滤波器
   */
  static createBandpass(
    lowCutoff: number, 
    highCutoff: number, 
    sampleRate: number, 
    order: number = 2
  ): DigitalFilter {
    return new DigitalFilter({
      type: 'bandpass',
      cutoffFrequency: lowCutoff,
      cutoffFrequency2: highCutoff,
      sampleRate,
      order
    })
  }

  /**
   * 创建带阻滤波器
   */
  static createBandstop(
    lowCutoff: number, 
    highCutoff: number, 
    sampleRate: number, 
    order: number = 2
  ): DigitalFilter {
    return new DigitalFilter({
      type: 'bandstop',
      cutoffFrequency: lowCutoff,
      cutoffFrequency2: highCutoff,
      sampleRate,
      order
    })
  }

  /**
   * 创建陷波滤波器 (特定频率)
   */
  static createNotch(notchFreq: number, sampleRate: number, bandwidth: number = 10): DigitalFilter {
    const lowCutoff = notchFreq - bandwidth / 2
    const highCutoff = notchFreq + bandwidth / 2
    
    return new DigitalFilter({
      type: 'bandstop',
      cutoffFrequency: lowCutoff,
      cutoffFrequency2: highCutoff,
      sampleRate,
      order: 2
    })
  }
}

/**
 * 简单滤波器函数
 */
export class SimpleFilters {
  /**
   * 移动平均滤波器
   * @param data 输入数据
   * @param windowSize 窗口大小
   * @returns 滤波后的数据
   */
  static movingAverage(data: number[], windowSize: number): number[] {
    const result: number[] = []
    
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - Math.floor(windowSize / 2))
      const end = Math.min(data.length, i + Math.ceil(windowSize / 2))
      const window = data.slice(start, end)
      const average = window.reduce((sum, val) => sum + val, 0) / window.length
      result.push(average)
    }
    
    return result
  }

  /**
   * 中值滤波器
   * @param data 输入数据
   * @param windowSize 窗口大小 (奇数)
   * @returns 滤波后的数据
   */
  static medianFilter(data: number[], windowSize: number): number[] {
    if (windowSize % 2 === 0) {
      windowSize += 1 // 确保窗口大小为奇数
    }
    
    const result: number[] = []
    const halfWindow = Math.floor(windowSize / 2)
    
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - halfWindow)
      const end = Math.min(data.length, i + halfWindow + 1)
      const window = data.slice(start, end).sort((a, b) => a - b)
      const median = window[Math.floor(window.length / 2)]
      result.push(median)
    }
    
    return result
  }

  /**
   * 高斯滤波器
   * @param data 输入数据
   * @param sigma 标准差
   * @param kernelSize 核大小
   * @returns 滤波后的数据
   */
  static gaussianFilter(data: number[], sigma: number = 1, kernelSize?: number): number[] {
    // 自动计算核大小
    if (!kernelSize) {
      kernelSize = Math.ceil(6 * sigma)
      if (kernelSize % 2 === 0) kernelSize += 1
    }
    
    // 生成高斯核
    const kernel: number[] = []
    const center = Math.floor(kernelSize / 2)
    let sum = 0
    
    for (let i = 0; i < kernelSize; i++) {
      const x = i - center
      const value = Math.exp(-(x * x) / (2 * sigma * sigma))
      kernel.push(value)
      sum += value
    }
    
    // 归一化核
    for (let i = 0; i < kernel.length; i++) {
      kernel[i] /= sum
    }
    
    // 应用卷积
    const result: number[] = []
    
    for (let i = 0; i < data.length; i++) {
      let value = 0
      
      for (let j = 0; j < kernelSize; j++) {
        const dataIndex = i - center + j
        if (dataIndex >= 0 && dataIndex < data.length) {
          value += data[dataIndex] * kernel[j]
        }
      }
      
      result.push(value)
    }
    
    return result
  }

  /**
   * 萨维茨基-戈雷滤波器 (Savitzky-Golay)
   * @param data 输入数据
   * @param windowSize 窗口大小 (奇数)
   * @param polyOrder 多项式阶数
   * @returns 滤波后的数据
   */
  static savitzkyGolay(data: number[], windowSize: number = 5, polyOrder: number = 2): number[] {
    if (windowSize % 2 === 0) {
      windowSize += 1 // 确保窗口大小为奇数
    }
    
    if (polyOrder >= windowSize) {
      throw new Error('多项式阶数必须小于窗口大小')
    }
    
    const halfWindow = Math.floor(windowSize / 2)
    const result: number[] = []
    
    // 简化的S-G滤波器实现 (使用预计算的系数)
    const coefficients = this.getSavitzkyGolayCoefficients(windowSize, polyOrder)
    
    for (let i = 0; i < data.length; i++) {
      let value = 0
      
      for (let j = 0; j < windowSize; j++) {
        const dataIndex = i - halfWindow + j
        let dataValue: number
        
        if (dataIndex < 0) {
          dataValue = data[0] // 边界处理：使用第一个值
        } else if (dataIndex >= data.length) {
          dataValue = data[data.length - 1] // 边界处理：使用最后一个值
        } else {
          dataValue = data[dataIndex]
        }
        
        value += dataValue * coefficients[j]
      }
      
      result.push(value)
    }
    
    return result
  }

  /**
   * 获取Savitzky-Golay滤波器系数 (简化版本)
   */
  private static getSavitzkyGolayCoefficients(windowSize: number, polyOrder: number): number[] {
    // 这里使用预计算的常用系数，实际应用中可以使用更完整的算法
    const coefficientsMap: { [key: string]: number[] } = {
      '5_2': [-0.086, 0.343, 0.486, 0.343, -0.086], // 5点2阶
      '7_2': [-0.095, 0.143, 0.286, 0.333, 0.286, 0.143, -0.095], // 7点2阶
      '9_2': [-0.084, 0.021, 0.103, 0.161, 0.196, 0.161, 0.103, 0.021, -0.084] // 9点2阶
    }
    
    const key = `${windowSize}_${polyOrder}`
    
    if (coefficientsMap[key]) {
      return coefficientsMap[key]
    }
    
    // 默认返回移动平均系数
    const coeff = 1 / windowSize
    return new Array(windowSize).fill(coeff)
  }
}

/**
 * 便捷的滤波器函数
 */
export const createLowpassFilter = FilterFactory.createLowpass
export const createHighpassFilter = FilterFactory.createHighpass
export const createBandpassFilter = FilterFactory.createBandpass
export const createBandstopFilter = FilterFactory.createBandstop
export const createNotchFilter = FilterFactory.createNotch

export const movingAverageFilter = SimpleFilters.movingAverage
export const medianFilter = SimpleFilters.medianFilter
export const gaussianFilter = SimpleFilters.gaussianFilter
export const savitzkyGolayFilter = SimpleFilters.savitzkyGolay
