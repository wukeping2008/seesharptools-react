import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import { 
  ProjectConfig, 
  ComponentConfig, 
  ComponentLibraryItem,
  PropValue 
} from '@/types/projectDeveloper'

interface ProjectDeveloperState {
  // 当前项目
  currentProject: ProjectConfig | null
  
  // 选中的组件
  selectedComponentId: string | null
  
  // 组件库
  componentLibrary: ComponentLibraryItem[]
  
  // 画布设置
  canvasSettings: {
    zoom: number
    gridSize: number
    showGrid: boolean
    snapToGrid: boolean
  }
  
  // 历史记录
  history: {
    past: ProjectConfig[]
    future: ProjectConfig[]
  }
  
  // UI状态
  ui: {
    leftPanelWidth: number
    rightPanelWidth: number
    showCodePanel: boolean
    activeTab: 'design' | 'code' | 'preview'
  }
}

interface ProjectDeveloperActions {
  // 项目管理
  createNewProject: (name: string, description?: string) => void
  loadProject: (project: ProjectConfig) => void
  saveProject: () => void
  updateProjectSettings: (settings: Partial<ProjectConfig['settings']>) => void
  
  // 组件管理
  addComponent: (componentType: string, position: { x: number; y: number }) => void
  removeComponent: (componentId: string) => void
  updateComponent: (componentId: string, updates: Partial<ComponentConfig>) => void
  selectComponent: (componentId: string | null) => void
  duplicateComponent: (componentId: string) => void
  
  // 组件属性
  updateComponentProps: (componentId: string, props: Record<string, PropValue>) => void
  updateComponentStyle: (componentId: string, style: Partial<ComponentConfig['style']>) => void
  
  // 画布操作
  updateCanvasSettings: (settings: Partial<ProjectDeveloperState['canvasSettings']>) => void
  toggleGrid: () => void
  toggleSnapToGrid: () => void
  
  // 历史记录
  undo: () => void
  redo: () => void
  pushToHistory: () => void
  
  // UI状态
  updateUI: (ui: Partial<ProjectDeveloperState['ui']>) => void
  
  // 组件库
  setComponentLibrary: (library: ComponentLibraryItem[]) => void
}

export const useProjectDeveloperStore = create<ProjectDeveloperState & ProjectDeveloperActions>((set, get) => ({
  // 初始状态
  currentProject: null,
  selectedComponentId: null,
  componentLibrary: [],
  canvasSettings: {
    zoom: 1,
    gridSize: 20,
    showGrid: true,
    snapToGrid: true
  },
  history: {
    past: [],
    future: []
  },
  ui: {
    leftPanelWidth: 300,
    rightPanelWidth: 300,
    showCodePanel: false,
    activeTab: 'design'
  },

  // 项目管理
  createNewProject: (name: string, description = '') => {
    const newProject: ProjectConfig = {
      id: uuidv4(),
      name,
      description,
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      components: [],
      globalStyles: {},
      settings: {
        theme: 'light',
        language: 'zh-CN',
        gridSize: 20,
        snapToGrid: true
      }
    }
    
    set({
      currentProject: newProject,
      selectedComponentId: null,
      history: { past: [], future: [] }
    })
  },

  loadProject: (project: ProjectConfig) => {
    set({
      currentProject: project,
      selectedComponentId: null,
      history: { past: [], future: [] }
    })
  },

  saveProject: () => {
    const { currentProject } = get()
    if (currentProject) {
      const updatedProject = {
        ...currentProject,
        updatedAt: new Date().toISOString()
      }
      
      // 保存到localStorage
      const savedProjects = JSON.parse(localStorage.getItem('seesharp-projects') || '[]')
      const existingIndex = savedProjects.findIndex((p: ProjectConfig) => p.id === updatedProject.id)
      
      if (existingIndex >= 0) {
        savedProjects[existingIndex] = updatedProject
      } else {
        savedProjects.push(updatedProject)
      }
      
      localStorage.setItem('seesharp-projects', JSON.stringify(savedProjects))
      
      set({ currentProject: updatedProject })
    }
  },

  updateProjectSettings: (settings) => {
    const { currentProject } = get()
    if (currentProject) {
      set({
        currentProject: {
          ...currentProject,
          settings: { ...currentProject.settings, ...settings },
          updatedAt: new Date().toISOString()
        }
      })
    }
  },

  // 组件管理
  addComponent: (componentType: string, position: { x: number; y: number }) => {
    const { currentProject, componentLibrary, canvasSettings } = get()
    if (!currentProject) return

    const libraryItem = componentLibrary.find(item => item.id === componentType)
    if (!libraryItem) return

    // 网格对齐
    const snapPosition = canvasSettings.snapToGrid ? {
      x: Math.round(position.x / canvasSettings.gridSize) * canvasSettings.gridSize,
      y: Math.round(position.y / canvasSettings.gridSize) * canvasSettings.gridSize
    } : position

    const newComponent: ComponentConfig = {
      id: uuidv4(),
      type: componentType,
      name: `${libraryItem.name}_${Date.now()}`,
      props: { ...libraryItem.defaultProps },
      style: {
        position: snapPosition,
        size: libraryItem.defaultStyle.size,
        zIndex: currentProject.components.length + 1
      }
    }

    get().pushToHistory()
    
    set({
      currentProject: {
        ...currentProject,
        components: [...currentProject.components, newComponent],
        updatedAt: new Date().toISOString()
      },
      selectedComponentId: newComponent.id
    })
  },

  removeComponent: (componentId: string) => {
    const { currentProject } = get()
    if (!currentProject) return

    get().pushToHistory()
    
    set({
      currentProject: {
        ...currentProject,
        components: currentProject.components.filter(c => c.id !== componentId),
        updatedAt: new Date().toISOString()
      },
      selectedComponentId: null
    })
  },

  updateComponent: (componentId: string, updates: Partial<ComponentConfig>) => {
    const { currentProject } = get()
    if (!currentProject) return

    set({
      currentProject: {
        ...currentProject,
        components: currentProject.components.map(c => 
          c.id === componentId ? { ...c, ...updates } : c
        ),
        updatedAt: new Date().toISOString()
      }
    })
  },

  selectComponent: (componentId: string | null) => {
    set({ selectedComponentId: componentId })
  },

  duplicateComponent: (componentId: string) => {
    const { currentProject } = get()
    if (!currentProject) return

    const component = currentProject.components.find(c => c.id === componentId)
    if (!component) return

    const duplicatedComponent: ComponentConfig = {
      ...component,
      id: uuidv4(),
      name: `${component.name}_copy`,
      style: {
        ...component.style,
        position: {
          x: component.style.position.x + 20,
          y: component.style.position.y + 20
        }
      }
    }

    get().pushToHistory()
    
    set({
      currentProject: {
        ...currentProject,
        components: [...currentProject.components, duplicatedComponent],
        updatedAt: new Date().toISOString()
      },
      selectedComponentId: duplicatedComponent.id
    })
  },

  // 组件属性
  updateComponentProps: (componentId: string, props: Record<string, PropValue>) => {
    const { currentProject } = get()
    if (!currentProject) return

    set({
      currentProject: {
        ...currentProject,
        components: currentProject.components.map(c => 
          c.id === componentId ? { ...c, props: { ...c.props, ...props } } : c
        ),
        updatedAt: new Date().toISOString()
      }
    })
  },

  updateComponentStyle: (componentId: string, style: Partial<ComponentConfig['style']>) => {
    const { currentProject } = get()
    if (!currentProject) return

    set({
      currentProject: {
        ...currentProject,
        components: currentProject.components.map(c => 
          c.id === componentId ? { 
            ...c, 
            style: { ...c.style, ...style }
          } : c
        ),
        updatedAt: new Date().toISOString()
      }
    })
  },

  // 画布操作
  updateCanvasSettings: (settings) => {
    set({
      canvasSettings: { ...get().canvasSettings, ...settings }
    })
  },

  toggleGrid: () => {
    const { canvasSettings } = get()
    set({
      canvasSettings: { ...canvasSettings, showGrid: !canvasSettings.showGrid }
    })
  },

  toggleSnapToGrid: () => {
    const { canvasSettings } = get()
    set({
      canvasSettings: { ...canvasSettings, snapToGrid: !canvasSettings.snapToGrid }
    })
  },

  // 历史记录
  pushToHistory: () => {
    const { currentProject, history } = get()
    if (!currentProject) return

    set({
      history: {
        past: [...history.past, currentProject],
        future: []
      }
    })
  },

  undo: () => {
    const { history, currentProject } = get()
    if (history.past.length === 0 || !currentProject) return

    const previous = history.past[history.past.length - 1]
    const newPast = history.past.slice(0, -1)

    set({
      currentProject: previous,
      history: {
        past: newPast,
        future: [currentProject, ...history.future]
      }
    })
  },

  redo: () => {
    const { history, currentProject } = get()
    if (history.future.length === 0 || !currentProject) return

    const next = history.future[0]
    const newFuture = history.future.slice(1)

    set({
      currentProject: next,
      history: {
        past: [...history.past, currentProject],
        future: newFuture
      }
    })
  },

  // UI状态
  updateUI: (ui) => {
    set({
      ui: { ...get().ui, ...ui }
    })
  },

  // 组件库
  setComponentLibrary: (library: ComponentLibraryItem[]) => {
    set({ componentLibrary: library })
  }
}))
