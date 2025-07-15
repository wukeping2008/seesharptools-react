// 项目开发器类型定义

// 基础属性值类型
export type PropValue = string | number | boolean | string[] | number[] | Record<string, unknown>

// 样式值类型
export type StyleValue = string | number

export interface ComponentConfig {
  id: string
  type: string
  name: string
  props: Record<string, PropValue>
  style: {
    position: { x: number; y: number }
    size: { width: number; height: number }
    zIndex: number
  }
  children?: ComponentConfig[]
}

export interface ProjectConfig {
  id: string
  name: string
  description: string
  version: string
  createdAt: string
  updatedAt: string
  components: ComponentConfig[]
  globalStyles: Record<string, StyleValue>
  settings: {
    theme: 'light' | 'dark'
    language: 'zh-CN' | 'en-US'
    gridSize: number
    snapToGrid: boolean
  }
}

export interface ComponentLibraryItem {
  id: string
  name: string
  category: string
  icon: string
  description: string
  defaultProps: Record<string, PropValue>
  defaultStyle: {
    size: { width: number; height: number }
  }
  component: React.ComponentType<any>
}

export interface DragItem {
  type: string
  componentType: string
  id?: string
  isNew?: boolean
}

export interface DropResult {
  type: string
  position: { x: number; y: number }
}

export interface PropertyEditorField {
  key: string
  label: string
  type: 'string' | 'number' | 'boolean' | 'color' | 'select' | 'range'
  options?: Array<{ label: string; value: PropValue }>
  min?: number
  max?: number
  step?: number
  defaultValue?: PropValue
}

export interface ComponentTemplate {
  id: string
  name: string
  description: string
  thumbnail: string
  components: ComponentConfig[]
  category: string
}

export interface ProjectTemplate {
  id: string
  name: string
  description: string
  thumbnail: string
  project: Omit<ProjectConfig, 'id' | 'createdAt' | 'updatedAt'>
  category: string
}

// 拖拽类型常量
export const DragTypes = {
  COMPONENT: 'component',
  EXISTING_COMPONENT: 'existing_component'
} as const

// 组件类别
export const ComponentCategories = {
  BASIC: 'basic',
  CHARTS: 'charts',
  INSTRUMENTS: 'instruments',
  CONTROLS: 'controls',
  DISPLAYS: 'displays'
} as const
