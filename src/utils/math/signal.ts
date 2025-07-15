/**
 * 信号生成和处理工具
 * 用于生成各种测试信号和信号分析
 */

export interface SignalConfig {
  sampleRate: number
  duration: number
  amplitude?: number
  frequency?: number
  phase?: number
  offset?: number
}

export interface NoiseConfig {
  type: 'white' | 'pink' | 'brown'
  amplitude: number
  seed?: number
}

export interface ChirpConfig extends SignalConfig {
  startFrequency: number
  endFrequency: number
  method?: 'linear' | 'logarithmic'
}

/**
 * 信号生成器类
 */
export class SignalGenerator {
  /**
   * 生成正弦波
   * @param config 信号配置
   * @returns 信号数据数组
   */
  static sine(config: SignalConfig): number[] {
    const {
      sampleRate,
      duration,
      amplitude = 1,
      frequency = 1,
      phase = 0,
      offset = 0
    } = config

    const samples = Math.floor(sampleRate * duration)
    const signal: number[] = []

    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate
      const value = amplitude * Math.sin(2 * Math.PI * frequency * t + phase) + offset
      signal.push(value)
    }

    return signal
  }

  /**
   * 生成余弦波
   * @param config 信号配置
   * @returns 信号数据数组
   */
  static cosine(config: SignalConfig): number[] {
    const {
      sampleRate,
      duration,
      amplitude = 1,
      frequency = 1,
      phase = 0,
      offset = 0
    } = config

    const samples = Math.floor(sampleRate * duration)
    const signal: number[] = []

    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate
      const value = amplitude * Math.cos(2 * Math.PI * frequency * t + phase) + offset
      signal.push(value)
    }

    return signal
  }

  /**
   * 生成方波
   * @param config 信号配置
   * @returns 信号数据数组
   */
  static square(config: SignalConfig): number[] {
    const {
      sampleRate,
      duration,
      amplitude = 1,
      frequency = 1,
      phase = 0,
      offset = 0
    } = config

    const samples = Math.floor(sampleRate * duration)
    const signal: number[] = []

    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate
      const sineValue = Math.sin(2 * Math.PI * frequency * t + phase)
      const value = amplitude * Math.sign(sineValue) + offset
      signal.push(value)
    }

    return signal
  }

  /**
   * 生成三角波
   * @param config 信号配置
   * @returns 信号数据数组
   */
  static triangle(config: SignalConfig): number[] {
    const {
      sampleRate,
      duration,
      amplitude = 1,
      frequency = 1,
      phase = 0,
      offset = 0
    } = config

    const samples = Math.floor(sampleRate * duration)
    const signal: number[] = []

    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate
      const normalizedTime = (frequency * t + phase / (2 * Math.PI)) % 1
      
      let value: number
      if (normalizedTime < 0.5) {
        value = 4 * normalizedTime - 1 // 上升沿: -1 到 1
      } else {
        value = 3 - 4 * normalizedTime // 下降沿: 1 到 -1
      }
      
      signal.push(amplitude * value + offset)
    }

    return signal
  }

  /**
   * 生成锯齿波
   * @param config 信号配置
   * @returns 信号数据数组
   */
  static sawtooth(config: SignalConfig): number[] {
    const {
      sampleRate,
      duration,
      amplitude = 1,
      frequency = 1,
      phase = 0,
      offset = 0
    } = config

    const samples = Math.floor(sampleRate * duration)
    const signal: number[] = []

    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate
      const normalizedTime = (frequency * t + phase / (2 * Math.PI)) % 1
      const value = amplitude * (2 * normalizedTime - 1) + offset
      signal.push(value)
    }

    return signal
  }

  /**
   * 生成脉冲信号
   * @param config 信号配置
   * @param dutyCycle 占空比 (0-1)
   * @returns 信号数据数组
   */
  static pulse(config: SignalConfig, dutyCycle: number = 0.5): number[] {
    const {
      sampleRate,
      duration,
      amplitude = 1,
      frequency = 1,
      phase = 0,
      offset = 0
    } = config

    const samples = Math.floor(sampleRate * duration)
    const signal: number[] = []

    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate
      const normalizedTime = (frequency * t + phase / (2 * Math.PI)) % 1
      const value = normalizedTime < dutyCycle ? amplitude : -amplitude
      signal.push(value + offset)
    }

    return signal
  }

  /**
   * 生成线性扫频信号 (Chirp)
   * @param config 扫频配置
   * @returns 信号数据数组
   */
  static chirp(config: ChirpConfig): number[] {
    const {
      sampleRate,
      duration,
      amplitude = 1,
      startFrequency,
      endFrequency,
      method = 'linear',
      phase = 0,
      offset = 0
    } = config

    const samples = Math.floor(sampleRate * duration)
    const signal: number[] = []

    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate
      const normalizedTime = t / duration

      let instantFreq: number
      if (method === 'linear') {
        instantFreq = startFrequency + (endFrequency - startFrequency) * normalizedTime
      } else {
        // 对数扫频
        const ratio = endFrequency / startFrequency
        instantFreq = startFrequency * Math.pow(ratio, normalizedTime)
      }

      // 计算瞬时相位
      let instantPhase: number
      if (method === 'linear') {
        instantPhase = 2 * Math.PI * (startFrequency * t + 
          0.5 * (endFrequency - startFrequency) * t * t / duration)
      } else {
        instantPhase = 2 * Math.PI * startFrequency * duration * 
          (Math.pow(endFrequency / startFrequency, normalizedTime) - 1) / 
          Math.log(endFrequency / startFrequency)
      }

      const value = amplitude * Math.sin(instantPhase + phase) + offset
      signal.push(value)
    }

    return signal
  }

  /**
   * 生成白噪声
   * @param samples 样本数
   * @param amplitude 幅度
   * @param seed 随机种子
   * @returns 噪声数据数组
   */
  static whiteNoise(samples: number, amplitude: number = 1, seed?: number): number[] {
    // 简单的线性同余生成器 (如果提供种子)
    let random = seed !== undefined ? this.seededRandom(seed) : Math.random

    const noise: number[] = []
    for (let i = 0; i < samples; i++) {
      // Box-Muller变换生成高斯白噪声
      const u1 = random()
      const u2 = random()
      const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
      noise.push(amplitude * z0)
    }

    return noise
  }

  /**
   * 生成粉红噪声 (1/f噪声)
   * @param samples 样本数
   * @param amplitude 幅度
   * @returns 噪声数据数组
   */
  static pinkNoise(samples: number, amplitude: number = 1): number[] {
    // 使用Voss算法的简化版本
    const noise: number[] = []
    const generators = 16 // 生成器数量
    const values = new Array(generators).fill(0)
    let sum = 0

    for (let i = 0; i < samples; i++) {
      // 更新生成器
      let bit = 1
      for (let j = 0; j < generators; j++) {
        if ((i & bit) === 0) {
          sum -= values[j]
          values[j] = (Math.random() - 0.5) * 2
          sum += values[j]
        }
        bit <<= 1
      }

      noise.push(amplitude * sum / generators)
    }

    return noise
  }

  /**
   * 生成布朗噪声 (1/f²噪声)
   * @param samples 样本数
   * @param amplitude 幅度
   * @returns 噪声数据数组
   */
  static brownNoise(samples: number, amplitude: number = 1): number[] {
    const noise: number[] = []
    let value = 0

    for (let i = 0; i < samples; i++) {
      value += (Math.random() - 0.5) * 0.1 // 积分白噪声
      noise.push(amplitude * value)
    }

    return noise
  }

  /**
   * 生成复合信号 (多个信号的叠加)
   * @param signals 信号数组
   * @returns 复合信号
   */
  static composite(signals: number[][]): number[] {
    if (signals.length === 0) return []

    const length = Math.min(...signals.map(s => s.length))
    const composite: number[] = []

    for (let i = 0; i < length; i++) {
      let sum = 0
      for (const signal of signals) {
        sum += signal[i]
      }
      composite.push(sum)
    }

    return composite
  }

  /**
   * 添加噪声到信号
   * @param signal 原始信号
   * @param noiseConfig 噪声配置
   * @returns 带噪声的信号
   */
  static addNoise(signal: number[], noiseConfig: NoiseConfig): number[] {
    const { type, amplitude, seed } = noiseConfig
    let noise: number[]

    switch (type) {
      case 'white':
        noise = this.whiteNoise(signal.length, amplitude, seed)
        break
      case 'pink':
        noise = this.pinkNoise(signal.length, amplitude)
        break
      case 'brown':
        noise = this.brownNoise(signal.length, amplitude)
        break
      default:
        noise = this.whiteNoise(signal.length, amplitude, seed)
    }

    return signal.map((value, index) => value + noise[index])
  }

  /**
   * 生成窗函数
   * @param length 窗口长度
   * @param type 窗口类型
   * @returns 窗函数数组
   */
  static window(length: number, type: 'hanning' | 'hamming' | 'blackman' | 'kaiser' = 'hanning'): number[] {
    const window: number[] = []

    for (let i = 0; i < length; i++) {
      let value: number

      switch (type) {
        case 'hanning':
          value = 0.5 * (1 - Math.cos(2 * Math.PI * i / (length - 1)))
          break
        case 'hamming':
          value = 0.54 - 0.46 * Math.cos(2 * Math.PI * i / (length - 1))
          break
        case 'blackman':
          value = 0.42 - 0.5 * Math.cos(2 * Math.PI * i / (length - 1)) + 
                  0.08 * Math.cos(4 * Math.PI * i / (length - 1))
          break
        case 'kaiser':
          // 简化的Kaiser窗 (β=5)
          const beta = 5
          const alpha = (length - 1) / 2
          const x = (i - alpha) / alpha
          value = this.besselI0(beta * Math.sqrt(1 - x * x)) / this.besselI0(beta)
          break
        default:
          value = 1
      }

      window.push(value)
    }

    return window
  }

  /**
   * 修正贝塞尔函数 I0 (用于Kaiser窗)
   */
  private static besselI0(x: number): number {
    let sum = 1
    let term = 1
    const xSquaredOver4 = (x * x) / 4

    for (let k = 1; k <= 50; k++) {
      term *= xSquaredOver4 / (k * k)
      sum += term
      if (term < 1e-12) break
    }

    return sum
  }

  /**
   * 带种子的随机数生成器
   */
  private static seededRandom(seed: number): () => number {
    let state = seed
    return () => {
      state = (state * 1664525 + 1013904223) % 4294967296
      return state / 4294967296
    }
  }
}

/**
 * 信号分析工具
 */
export class SignalAnalyzer {
  /**
   * 计算信号的RMS值
   * @param signal 信号数组
   * @returns RMS值
   */
  static rms(signal: number[]): number {
    const sumSquares = signal.reduce((sum, value) => sum + value * value, 0)
    return Math.sqrt(sumSquares / signal.length)
  }

  /**
   * 计算信号的峰值
   * @param signal 信号数组
   * @returns 峰值
   */
  static peak(signal: number[]): number {
    return Math.max(...signal.map(Math.abs))
  }

  /**
   * 计算信号的峰峰值
   * @param signal 信号数组
   * @returns 峰峰值
   */
  static peakToPeak(signal: number[]): number {
    const max = Math.max(...signal)
    const min = Math.min(...signal)
    return max - min
  }

  /**
   * 计算信号的总谐波失真 (THD)
   * @param signal 信号数组
   * @param sampleRate 采样率
   * @param fundamentalFreq 基频
   * @param harmonics 谐波数量
   * @returns THD百分比
   */
  static thd(signal: number[], sampleRate: number, fundamentalFreq: number, harmonics: number = 5): number {
    // 这里需要FFT分析，简化实现
    // 实际应用中应该使用完整的FFT分析
    return 0 // 占位符
  }

  /**
   * 计算信号的信噪比 (SNR)
   * @param signal 含噪声信号
   * @param cleanSignal 纯净信号
   * @returns SNR (dB)
   */
  static snr(signal: number[], cleanSignal: number[]): number {
    if (signal.length !== cleanSignal.length) {
      throw new Error('信号长度必须相等')
    }

    const signalPower = this.rms(cleanSignal) ** 2
    const noise = signal.map((val, i) => val - cleanSignal[i])
    const noisePower = this.rms(noise) ** 2

    if (noisePower === 0) return Infinity
    return 10 * Math.log10(signalPower / noisePower)
  }

  /**
   * 检测信号中的峰值
   * @param signal 信号数组
   * @param threshold 阈值 (相对于最大值的比例)
   * @param minDistance 最小距离
   * @returns 峰值索引数组
   */
  static findPeaks(signal: number[], threshold: number = 0.1, minDistance: number = 1): number[] {
    const peaks: number[] = []
    const maxValue = Math.max(...signal.map(Math.abs))
    const minThreshold = maxValue * threshold

    for (let i = minDistance; i < signal.length - minDistance; i++) {
      const current = Math.abs(signal[i])
      
      if (current < minThreshold) continue

      let isPeak = true
      for (let j = i - minDistance; j <= i + minDistance; j++) {
        if (j !== i && Math.abs(signal[j]) >= current) {
          isPeak = false
          break
        }
      }

      if (isPeak) {
        peaks.push(i)
      }
    }

    return peaks
  }
}

/**
 * 便捷的信号生成函数
 */
export const generateSine = SignalGenerator.sine
export const generateCosine = SignalGenerator.cosine
export const generateSquare = SignalGenerator.square
export const generateTriangle = SignalGenerator.triangle
export const generateSawtooth = SignalGenerator.sawtooth
export const generatePulse = SignalGenerator.pulse
export const generateChirp = SignalGenerator.chirp
export const generateWhiteNoise = SignalGenerator.whiteNoise
export const generatePinkNoise = SignalGenerator.pinkNoise
export const generateBrownNoise = SignalGenerator.brownNoise
export const generateWindow = SignalGenerator.window

export const calculateRMS = SignalAnalyzer.rms
export const calculatePeak = SignalAnalyzer.peak
export const calculatePeakToPeak = SignalAnalyzer.peakToPeak
export const calculateSNR = SignalAnalyzer.snr
export const findSignalPeaks = SignalAnalyzer.findPeaks
