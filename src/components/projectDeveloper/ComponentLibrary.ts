import { ComponentLibraryItem, ComponentCategories } from '@/types/projectDeveloper'
import { SimpleButton } from '@/components/simple/SimpleButton'
import { SimpleLEDIndicator } from '@/components/simple/SimpleLEDIndicator'
import { SimpleCircularGauge } from '@/components/simple/SimpleCircularGauge'

// 组件库配置
export const componentLibrary: ComponentLibraryItem[] = [
  // 基础控件
  {
    id: 'simple-button',
    name: '简单按钮',
    category: ComponentCategories.BASIC,
    icon: '🔘',
    description: '可自定义样式的按钮组件',
    defaultProps: {
      text: '按钮',
      type: 'primary',
      size: 'medium',
      disabled: false,
      loading: false
    },
    defaultStyle: {
      size: { width: 100, height: 40 }
    },
    component: SimpleButton
  },
  {
    id: 'simple-led',
    name: 'LED指示器',
    category: ComponentCategories.BASIC,
    icon: '💡',
    description: 'LED状态指示器，支持多种颜色和形状',
    defaultProps: {
      color: 'green',
      shape: 'circle',
      size: 'medium',
      isOn: true,
      blinking: false,
      glowEffect: true
    },
    defaultStyle: {
      size: { width: 60, height: 60 }
    },
    component: SimpleLEDIndicator
  },
  {
    id: 'simple-gauge',
    name: '圆形仪表',
    category: ComponentCategories.BASIC,
    icon: '⏲️',
    description: 'SVG圆形仪表盘，支持刻度和警告阈值',
    defaultProps: {
      value: 50,
      min: 0,
      max: 100,
      unit: '%',
      title: '仪表盘',
      warningThreshold: 80,
      dangerThreshold: 90,
      showValue: true,
      showTicks: true
    },
    defaultStyle: {
      size: { width: 200, height: 200 }
    },
    component: SimpleCircularGauge
  }
]

// 按类别分组的组件库
export const componentsByCategory = componentLibrary.reduce((acc, component) => {
  if (!acc[component.category]) {
    acc[component.category] = []
  }
  acc[component.category].push(component)
  return acc
}, {} as Record<string, ComponentLibraryItem[]>)

// 获取组件库项目
export const getComponentLibraryItem = (id: string): ComponentLibraryItem | undefined => {
  return componentLibrary.find(item => item.id === id)
}

// 获取组件类别名称
export const getCategoryName = (category: string): string => {
  const categoryNames: Record<string, string> = {
    [ComponentCategories.BASIC]: '基础组件',
    [ComponentCategories.CHARTS]: '图表组件',
    [ComponentCategories.INSTRUMENTS]: '仪器组件',
    [ComponentCategories.CONTROLS]: '控制组件',
    [ComponentCategories.DISPLAYS]: '显示组件'
  }
  return categoryNames[category] || category
}
