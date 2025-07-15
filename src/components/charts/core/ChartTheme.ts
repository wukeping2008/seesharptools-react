/**
 * 图表主题系统
 * 
 * 提供专业仪器风格的主题配置：
 * - 示波器主题
 * - 频谱仪主题
 * - 默认主题
 * - 暗色主题
 */

/**
 * 主题配置接口
 */
export interface ThemeConfig {
  /** 背景颜色 */
  backgroundColor: string
  /** 网格背景色 */
  gridBg: string
  /** 文字颜色 */
  textColor: string
  /** 边框颜色 */
  borderColor: string
  /** 主色调 */
  primaryColor: string
  /** 次要颜色 */
  secondaryColor: string
  /** 成功颜色 */
  successColor: string
  /** 警告颜色 */
  warningColor: string
  /** 错误颜色 */
  errorColor: string
  /** 工具提示背景色 */
  tooltipBg: string
  /** 轴指示器颜色 */
  axisPointerColor: string
  /** 滑块背景色 */
  sliderBg: string
  /** 网格线颜色 */
  gridLineColor: string
  /** 轴线颜色 */
  axisLineColor: string
  /** 轴标签颜色 */
  axisLabelColor: string
  /** 图例颜色 */
  legendColor: string
  /** 数据颜色调色板 */
  colorPalette: string[]
}

/**
 * 支持的主题类型
 */
export type ChartTheme = 'default' | 'dark' | 'oscilloscope' | 'spectrum' | 'professional'

/**
 * 默认主题
 */
const defaultTheme: ThemeConfig = {
  backgroundColor: '#ffffff',
  gridBg: '#fafafa',
  textColor: '#333333',
  borderColor: '#e8e8e8',
  primaryColor: '#1890ff',
  secondaryColor: '#52c41a',
  successColor: '#52c41a',
  warningColor: '#faad14',
  errorColor: '#ff4d4f',
  tooltipBg: 'rgba(0, 0, 0, 0.8)',
  axisPointerColor: '#1890ff',
  sliderBg: '#f5f5f5',
  gridLineColor: '#e8e8e8',
  axisLineColor: '#d9d9d9',
  axisLabelColor: '#666666',
  legendColor: '#333333',
  colorPalette: [
    '#1890ff', '#52c41a', '#faad14', '#ff4d4f',
    '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16'
  ]
}

/**
 * 暗色主题
 */
const darkTheme: ThemeConfig = {
  backgroundColor: '#1f1f1f',
  gridBg: '#2a2a2a',
  textColor: '#ffffff',
  borderColor: '#404040',
  primaryColor: '#177ddc',
  secondaryColor: '#49aa19',
  successColor: '#49aa19',
  warningColor: '#d89614',
  errorColor: '#d32029',
  tooltipBg: 'rgba(0, 0, 0, 0.9)',
  axisPointerColor: '#177ddc',
  sliderBg: '#404040',
  gridLineColor: '#404040',
  axisLineColor: '#595959',
  axisLabelColor: '#bfbfbf',
  legendColor: '#ffffff',
  colorPalette: [
    '#177ddc', '#49aa19', '#d89614', '#d32029',
    '#642ab5', '#13a8a8', '#cb2b83', '#d84a1b'
  ]
}

/**
 * 示波器主题（经典绿色磷光屏风格）
 */
const oscilloscopeTheme: ThemeConfig = {
  backgroundColor: '#001100',
  gridBg: '#001a00',
  textColor: '#00ff00',
  borderColor: '#003300',
  primaryColor: '#00ff00',
  secondaryColor: '#ffff00',
  successColor: '#00ff00',
  warningColor: '#ffff00',
  errorColor: '#ff0000',
  tooltipBg: 'rgba(0, 0, 0, 0.9)',
  axisPointerColor: '#00ff00',
  sliderBg: '#002200',
  gridLineColor: '#003300',
  axisLineColor: '#004400',
  axisLabelColor: '#00cc00',
  legendColor: '#00ff00',
  colorPalette: [
    '#00ff00', '#ffff00', '#00ffff', '#ff00ff',
    '#ff8800', '#8800ff', '#00ff88', '#ff0088'
  ]
}

/**
 * 频谱仪主题（蓝色科技风格）
 */
const spectrumTheme: ThemeConfig = {
  backgroundColor: '#0a0a1a',
  gridBg: '#0f0f2a',
  textColor: '#00aaff',
  borderColor: '#1a1a3a',
  primaryColor: '#00aaff',
  secondaryColor: '#0088ff',
  successColor: '#00ff88',
  warningColor: '#ffaa00',
  errorColor: '#ff4444',
  tooltipBg: 'rgba(0, 0, 0, 0.9)',
  axisPointerColor: '#00aaff',
  sliderBg: '#1a1a3a',
  gridLineColor: '#2a2a4a',
  axisLineColor: '#3a3a5a',
  axisLabelColor: '#0088cc',
  legendColor: '#00aaff',
  colorPalette: [
    '#00aaff', '#0088ff', '#0066ff', '#0044ff',
    '#4400ff', '#8800ff', '#aa00ff', '#ff00aa'
  ]
}

/**
 * 专业仪器主题（现代仪器风格）
 */
const professionalTheme: ThemeConfig = {
  backgroundColor: '#f8f9fa',
  gridBg: '#ffffff',
  textColor: '#2c3e50',
  borderColor: '#dee2e6',
  primaryColor: '#007bff',
  secondaryColor: '#28a745',
  successColor: '#28a745',
  warningColor: '#ffc107',
  errorColor: '#dc3545',
  tooltipBg: 'rgba(44, 62, 80, 0.9)',
  axisPointerColor: '#007bff',
  sliderBg: '#e9ecef',
  gridLineColor: '#dee2e6',
  axisLineColor: '#adb5bd',
  axisLabelColor: '#6c757d',
  legendColor: '#2c3e50',
  colorPalette: [
    '#007bff', '#28a745', '#ffc107', '#dc3545',
    '#6f42c1', '#20c997', '#e83e8c', '#fd7e14'
  ]
}

/**
 * 主题映射表
 */
const themes: Record<ChartTheme, ThemeConfig> = {
  default: defaultTheme,
  dark: darkTheme,
  oscilloscope: oscilloscopeTheme,
  spectrum: spectrumTheme,
  professional: professionalTheme
}

/**
 * 获取指定主题配置
 */
export function getTheme(themeName: ChartTheme): ThemeConfig {
  return themes[themeName] || themes.default
}

/**
 * 获取所有可用主题名称
 */
export function getAvailableThemes(): ChartTheme[] {
  return Object.keys(themes) as ChartTheme[]
}

/**
 * 创建自定义主题
 */
export function createCustomTheme(
  baseTheme: ChartTheme,
  overrides: Partial<ThemeConfig>
): ThemeConfig {
  const base = getTheme(baseTheme)
  return { ...base, ...overrides }
}

/**
 * 根据主题生成ECharts主题对象
 */
export function generateEChartsTheme(theme: ThemeConfig) {
  return {
    color: theme.colorPalette,
    backgroundColor: theme.backgroundColor,
    textStyle: {
      color: theme.textColor
    },
    title: {
      textStyle: {
        color: theme.textColor
      }
    },
    line: {
      itemStyle: {
        borderWidth: 2
      },
      lineStyle: {
        width: 2
      },
      symbolSize: 4,
      symbol: 'circle',
      smooth: false
    },
    radar: {
      itemStyle: {
        borderWidth: 2
      },
      lineStyle: {
        width: 2
      },
      symbolSize: 4,
      symbol: 'circle',
      smooth: false
    },
    bar: {
      itemStyle: {
        barBorderWidth: 0,
        barBorderColor: theme.borderColor
      }
    },
    pie: {
      itemStyle: {
        borderWidth: 0,
        borderColor: theme.borderColor
      }
    },
    scatter: {
      itemStyle: {
        borderWidth: 0,
        borderColor: theme.borderColor
      }
    },
    boxplot: {
      itemStyle: {
        borderWidth: 0,
        borderColor: theme.borderColor
      }
    },
    parallel: {
      itemStyle: {
        borderWidth: 0,
        borderColor: theme.borderColor
      }
    },
    sankey: {
      itemStyle: {
        borderWidth: 0,
        borderColor: theme.borderColor
      }
    },
    funnel: {
      itemStyle: {
        borderWidth: 0,
        borderColor: theme.borderColor
      }
    },
    gauge: {
      itemStyle: {
        borderWidth: 0,
        borderColor: theme.borderColor
      }
    },
    candlestick: {
      itemStyle: {
        color: theme.successColor,
        color0: theme.errorColor,
        borderColor: theme.successColor,
        borderColor0: theme.errorColor,
        borderWidth: 1
      }
    },
    graph: {
      itemStyle: {
        borderWidth: 0,
        borderColor: theme.borderColor
      },
      lineStyle: {
        width: 1,
        color: theme.borderColor
      },
      symbolSize: 4,
      symbol: 'circle',
      smooth: false,
      color: theme.colorPalette,
      label: {
        color: theme.textColor
      }
    },
    categoryAxis: {
      axisLine: {
        show: true,
        lineStyle: {
          color: theme.axisLineColor
        }
      },
      axisTick: {
        show: true,
        lineStyle: {
          color: theme.axisLineColor
        }
      },
      axisLabel: {
        show: true,
        color: theme.axisLabelColor
      },
      splitLine: {
        show: false,
        lineStyle: {
          color: [theme.gridLineColor]
        }
      },
      splitArea: {
        show: false,
        areaStyle: {
          color: [theme.gridBg]
        }
      }
    },
    valueAxis: {
      axisLine: {
        show: true,
        lineStyle: {
          color: theme.axisLineColor
        }
      },
      axisTick: {
        show: true,
        lineStyle: {
          color: theme.axisLineColor
        }
      },
      axisLabel: {
        show: true,
        color: theme.axisLabelColor
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: [theme.gridLineColor]
        }
      },
      splitArea: {
        show: false,
        areaStyle: {
          color: [theme.gridBg]
        }
      }
    },
    logAxis: {
      axisLine: {
        show: true,
        lineStyle: {
          color: theme.axisLineColor
        }
      },
      axisTick: {
        show: true,
        lineStyle: {
          color: theme.axisLineColor
        }
      },
      axisLabel: {
        show: true,
        color: theme.axisLabelColor
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: [theme.gridLineColor]
        }
      },
      splitArea: {
        show: false,
        areaStyle: {
          color: [theme.gridBg]
        }
      }
    },
    timeAxis: {
      axisLine: {
        show: true,
        lineStyle: {
          color: theme.axisLineColor
        }
      },
      axisTick: {
        show: true,
        lineStyle: {
          color: theme.axisLineColor
        }
      },
      axisLabel: {
        show: true,
        color: theme.axisLabelColor
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: [theme.gridLineColor]
        }
      },
      splitArea: {
        show: false,
        areaStyle: {
          color: [theme.gridBg]
        }
      }
    },
    toolbox: {
      iconStyle: {
        borderColor: theme.textColor
      },
      emphasis: {
        iconStyle: {
          borderColor: theme.primaryColor
        }
      }
    },
    legend: {
      textStyle: {
        color: theme.legendColor
      }
    },
    tooltip: {
      axisPointer: {
        lineStyle: {
          color: theme.axisPointerColor,
          width: 1
        },
        crossStyle: {
          color: theme.axisPointerColor,
          width: 1
        }
      }
    },
    timeline: {
      lineStyle: {
        color: theme.primaryColor,
        width: 1
      },
      itemStyle: {
        color: theme.primaryColor,
        borderWidth: 1
      },
      controlStyle: {
        color: theme.primaryColor,
        borderColor: theme.primaryColor,
        borderWidth: 0.5
      },
      checkpointStyle: {
        color: theme.primaryColor,
        borderColor: theme.backgroundColor
      },
      label: {
        color: theme.textColor
      },
      emphasis: {
        itemStyle: {
          color: theme.secondaryColor
        },
        controlStyle: {
          color: theme.primaryColor,
          borderColor: theme.primaryColor,
          borderWidth: 0.5
        },
        label: {
          color: theme.textColor
        }
      }
    },
    visualMap: {
      color: [theme.primaryColor, theme.secondaryColor]
    },
    dataZoom: {
      backgroundColor: 'rgba(0,0,0,0)',
      dataBackgroundColor: 'rgba(255,255,255,0.3)',
      fillerColor: 'rgba(167,183,204,0.4)',
      handleColor: theme.primaryColor,
      handleSize: '100%',
      textStyle: {
        color: theme.textColor
      }
    },
    markPoint: {
      label: {
        color: theme.textColor
      },
      emphasis: {
        label: {
          color: theme.textColor
        }
      }
    }
  }
}

export default {
  getTheme,
  getAvailableThemes,
  createCustomTheme,
  generateEChartsTheme
}
