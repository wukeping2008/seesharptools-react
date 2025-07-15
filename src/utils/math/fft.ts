/**
 * FFT (快速傅里叶变换) 数学分析工具
 * 用于频谱分析和信号处理
 */

export interface ComplexNumber {
  real: number
  imag: number
}

export interface FFTResult {
  frequencies: number[]
  magnitudes: number[]
  phases: number[]
  powerSpectrum: number[]
  sampleRate: number
  frequencyResolution: number
}

/**
 * 复数运算工具
 */
export class Complex {
  constructor(public real: number = 0, public imag: number = 0) {}

  static fromPolar(magnitude: number, phase: number): Complex {
    return new Complex(
      magnitude * Math.cos(phase),
      magnitude * Math.sin(phase)
    )
  }

  add(other: Complex): Complex {
    return new Complex(this.real + other.real, this.imag + other.imag)
  }

  subtract(other: Complex): Complex {
    return new Complex(this.real - other.real, this.imag - other.imag)
  }

  multiply(other: Complex): Complex {
    return new Complex(
      this.real * other.real - this.imag * other.imag,
      this.real * other.imag + this.imag * other.real
    )
  }

  magnitude(): number {
    return Math.sqrt(this.real * this.real + this.imag * this.imag)
  }

  phase(): number {
    return Math.atan2(this.imag, this.real)
  }

  conjugate(): Complex {
    return new Complex(this.real, -this.imag)
  }
}

/**
 * FFT实现类
 */
export class FFTAnalyzer {
  /**
   * 快速傅里叶变换 (Cooley-Tukey算法)
   * @param data 输入数据 (必须是2的幂次长度)
   * @returns 复数频域结果
   */
  static fft(data: number[]): Complex[] {
    const N = data.length
    
    // 检查长度是否为2的幂
    if ((N & (N - 1)) !== 0) {
      throw new Error('FFT输入数据长度必须是2的幂次')
    }

    // 转换为复数数组
    const complexData = data.map(x => new Complex(x, 0))
    
    return this.fftRecursive(complexData)
  }

  /**
   * 递归FFT实现
   */
  private static fftRecursive(data: Complex[]): Complex[] {
    const N = data.length
    
    if (N <= 1) {
      return data
    }

    // 分治：分离偶数和奇数索引
    const even = data.filter((_, i) => i % 2 === 0)
    const odd = data.filter((_, i) => i % 2 === 1)

    // 递归计算
    const evenFFT = this.fftRecursive(even)
    const oddFFT = this.fftRecursive(odd)

    // 合并结果
    const result = new Array<Complex>(N)
    
    for (let k = 0; k < N / 2; k++) {
      const t = Complex.fromPolar(1, -2 * Math.PI * k / N).multiply(oddFFT[k])
      result[k] = evenFFT[k].add(t)
      result[k + N / 2] = evenFFT[k].subtract(t)
    }

    return result
  }

  /**
   * 逆FFT (IFFT)
   * @param complexData 复数频域数据
   * @returns 时域实数数据
   */
  static ifft(complexData: Complex[]): number[] {
    const N = complexData.length
    
    // 共轭
    const conjugated = complexData.map(c => c.conjugate())
    
    // 执行FFT
    const result = this.fftRecursive(conjugated)
    
    // 共轭并归一化
    return result.map(c => c.conjugate().real / N)
  }

  /**
   * 计算功率谱密度
   * @param data 时域数据
   * @param sampleRate 采样率 (Hz)
   * @param windowFunction 窗函数类型
   * @returns FFT分析结果
   */
  static powerSpectralDensity(
    data: number[], 
    sampleRate: number = 1000,
    windowFunction: 'hanning' | 'hamming' | 'blackman' | 'none' = 'hanning'
  ): FFTResult {
    // 确保数据长度为2的幂
    const paddedData = FFTAnalyzer.padToPowerOfTwo(data)
    
    // 应用窗函数
    const windowedData = FFTAnalyzer.applyWindow(paddedData, windowFunction)
    
    // 执行FFT
    const fftResult = FFTAnalyzer.fft(windowedData)
    
    const N = fftResult.length
    const frequencies = Array.from({ length: N / 2 }, (_, i) => i * sampleRate / N)
    
    // 计算幅度谱 (只取前一半，因为FFT结果是对称的)
    const magnitudes = fftResult.slice(0, N / 2).map(c => c.magnitude())
    
    // 计算相位谱
    const phases = fftResult.slice(0, N / 2).map(c => c.phase())
    
    // 计算功率谱 (幅度的平方)
    const powerSpectrum = magnitudes.map(mag => mag * mag)
    
    return {
      frequencies,
      magnitudes,
      phases,
      powerSpectrum,
      sampleRate,
      frequencyResolution: sampleRate / N
    }
  }

  /**
   * 频谱分析 - 寻找主要频率成分
   * @param data 时域数据
   * @param sampleRate 采样率
   * @param threshold 阈值 (相对于最大值的比例)
   * @returns 主要频率成分
   */
  static findPeaks(
    data: number[], 
    sampleRate: number = 1000, 
    threshold: number = 0.1
  ): Array<{ frequency: number; magnitude: number; phase: number }> {
    const fftResult = FFTAnalyzer.powerSpectralDensity(data, sampleRate)
    const maxMagnitude = Math.max(...fftResult.magnitudes)
    const minThreshold = maxMagnitude * threshold
    
    const peaks: Array<{ frequency: number; magnitude: number; phase: number }> = []
    
    // 寻找局部最大值
    for (let i = 1; i < fftResult.magnitudes.length - 1; i++) {
      const current = fftResult.magnitudes[i]
      const prev = fftResult.magnitudes[i - 1]
      const next = fftResult.magnitudes[i + 1]
      
      if (current > prev && current > next && current > minThreshold) {
        peaks.push({
          frequency: fftResult.frequencies[i],
          magnitude: current,
          phase: fftResult.phases[i]
        })
      }
    }
    
    // 按幅度排序
    return peaks.sort((a, b) => b.magnitude - a.magnitude)
  }

  /**
   * 将数据填充到2的幂次长度
   */
  private static padToPowerOfTwo(data: number[]): number[] {
    const length = data.length
    const powerOfTwo = Math.pow(2, Math.ceil(Math.log2(length)))
    
    if (length === powerOfTwo) {
      return [...data]
    }
    
    // 用零填充
    const padded = new Array(powerOfTwo).fill(0)
    for (let i = 0; i < length; i++) {
      padded[i] = data[i]
    }
    
    return padded
  }

  /**
   * 应用窗函数
   */
  private static applyWindow(data: number[], windowType: string): number[] {
    const N = data.length
    const windowed = new Array(N)
    
    for (let i = 0; i < N; i++) {
      let window = 1
      
      switch (windowType) {
        case 'hanning':
          window = 0.5 * (1 - Math.cos(2 * Math.PI * i / (N - 1)))
          break
        case 'hamming':
          window = 0.54 - 0.46 * Math.cos(2 * Math.PI * i / (N - 1))
          break
        case 'blackman':
          window = 0.42 - 0.5 * Math.cos(2 * Math.PI * i / (N - 1)) + 
                   0.08 * Math.cos(4 * Math.PI * i / (N - 1))
          break
        case 'none':
        default:
          window = 1
          break
      }
      
      windowed[i] = data[i] * window
    }
    
    return windowed
  }

  /**
   * 计算频谱图 (时频分析)
   * @param data 时域数据
   * @param sampleRate 采样率
   * @param windowSize 窗口大小
   * @param overlap 重叠比例 (0-1)
   * @returns 频谱图数据
   */
  static spectrogram(
    data: number[],
    sampleRate: number = 1000,
    windowSize: number = 256,
    overlap: number = 0.5
  ): {
    timeAxis: number[]
    frequencyAxis: number[]
    powerMatrix: number[][]
  } {
    const hopSize = Math.floor(windowSize * (1 - overlap))
    const numWindows = Math.floor((data.length - windowSize) / hopSize) + 1
    
    const timeAxis: number[] = []
    const powerMatrix: number[][] = []
    
    for (let i = 0; i < numWindows; i++) {
      const start = i * hopSize
      const end = start + windowSize
      const segment = data.slice(start, end)
      
      if (segment.length < windowSize) {
        // 填充到窗口大小
        while (segment.length < windowSize) {
          segment.push(0)
        }
      }
      
      const fftResult = FFTAnalyzer.powerSpectralDensity(segment, sampleRate, 'hanning')
      powerMatrix.push(fftResult.powerSpectrum)
      timeAxis.push(start / sampleRate)
    }
    
    const frequencyAxis = powerMatrix[0] ? 
      Array.from({ length: powerMatrix[0].length }, (_, i) => i * sampleRate / (windowSize * 2)) : []
    
    return {
      timeAxis,
      frequencyAxis,
      powerMatrix
    }
  }
}

/**
 * 便捷的FFT分析函数
 */
export const fft = FFTAnalyzer.fft
export const ifft = FFTAnalyzer.ifft
export const powerSpectralDensity = FFTAnalyzer.powerSpectralDensity
export const findPeaks = FFTAnalyzer.findPeaks
export const spectrogram = FFTAnalyzer.spectrogram
