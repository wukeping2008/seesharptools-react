import fs from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { ControlModel, TemplateModel, HistoryModel } from '../types'

class DataService {
  private dataDir: string
  private controlsFile: string
  private templatesFile: string
  private historyFile: string

  constructor() {
    this.dataDir = path.join(process.cwd(), 'data')
    this.controlsFile = path.join(this.dataDir, 'controls.json')
    this.templatesFile = path.join(this.dataDir, 'templates.json')
    this.historyFile = path.join(this.dataDir, 'history.json')
    this.initializeDataFiles()
  }

  private async initializeDataFiles(): Promise<void> {
    try {
      // 确保数据目录存在
      await fs.mkdir(this.dataDir, { recursive: true })

      // 初始化控件文件
      if (!await this.fileExists(this.controlsFile)) {
        await fs.writeFile(this.controlsFile, JSON.stringify([], null, 2))
      }

      // 初始化模板文件
      if (!await this.fileExists(this.templatesFile)) {
        const defaultTemplates = this.getDefaultTemplates()
        await fs.writeFile(this.templatesFile, JSON.stringify(defaultTemplates, null, 2))
      }

      // 初始化历史文件
      if (!await this.fileExists(this.historyFile)) {
        await fs.writeFile(this.historyFile, JSON.stringify([], null, 2))
      }
    } catch (error) {
      console.error('Failed to initialize data files:', error)
    }
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  }

  private getDefaultTemplates(): TemplateModel[] {
    const now = new Date().toISOString()
    return [
      {
        id: uuidv4(),
        name: '圆形温度计',
        description: '显示温度值的圆形仪表盘控件',
        category: 'measurement',
        preview: '<div style="width:100px;height:100px;border-radius:50%;border:3px solid #1890ff;display:flex;align-items:center;justify-content:center;background:linear-gradient(45deg,#f0f0f0,#fff)"><span style="font-weight:bold;color:#1890ff">25°C</span></div>',
        parameters: [
          {
            name: 'minValue',
            type: 'number',
            required: true,
            description: '最小值',
            defaultValue: 0
          },
          {
            name: 'maxValue',
            type: 'number',
            required: true,
            description: '最大值',
            defaultValue: 100
          },
          {
            name: 'unit',
            type: 'string',
            required: false,
            description: '单位',
            defaultValue: '°C'
          }
        ],
        code: `import React from 'react';

interface ThermometerProps {
  value: number;
  minValue?: number;
  maxValue?: number;
  unit?: string;
}

export const Thermometer: React.FC<ThermometerProps> = ({
  value,
  minValue = 0,
  maxValue = 100,
  unit = '°C'
}) => {
  const percentage = ((value - minValue) / (maxValue - minValue)) * 100;
  
  return (
    <div style={{
      width: '100px',
      height: '100px',
      borderRadius: '50%',
      border: '3px solid #1890ff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: \`conic-gradient(#1890ff \${percentage}%, #f0f0f0 \${percentage}%)\`
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        color: '#1890ff'
      }}>
        {value}{unit}
      </div>
    </div>
  );
};`,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: '线性进度条',
        description: '显示进度的线性条形控件',
        category: 'display',
        preview: '<div style="width:200px;height:20px;background:#f0f0f0;border-radius:10px;overflow:hidden"><div style="width:60%;height:100%;background:linear-gradient(90deg,#1890ff,#52c41a);border-radius:10px"></div></div>',
        parameters: [
          {
            name: 'percentage',
            type: 'number',
            required: true,
            description: '进度百分比',
            defaultValue: 0
          },
          {
            name: 'showText',
            type: 'boolean',
            required: false,
            description: '显示文字',
            defaultValue: true
          }
        ],
        code: `import React from 'react';

interface ProgressBarProps {
  percentage: number;
  showText?: boolean;
  color?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  showText = true,
  color = '#1890ff'
}) => {
  return (
    <div style={{ position: 'relative', width: '200px' }}>
      <div style={{
        width: '100%',
        height: '20px',
        background: '#f0f0f0',
        borderRadius: '10px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: \`\${Math.min(100, Math.max(0, percentage))}%\`,
          height: '100%',
          background: \`linear-gradient(90deg, \${color}, #52c41a)\`,
          borderRadius: '10px',
          transition: 'width 0.3s ease'
        }} />
      </div>
      {showText && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '12px',
          fontWeight: 'bold',
          color: percentage > 50 ? '#fff' : '#333'
        }}>
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
};`,
        createdAt: now,
        updatedAt: now
      }
    ]
  }

  // 控件相关方法
  async saveControl(control: Omit<ControlModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<ControlModel> {
    const controls = await this.getControls()
    const newControl: ControlModel = {
      ...control,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    controls.push(newControl)
    await fs.writeFile(this.controlsFile, JSON.stringify(controls, null, 2))
    return newControl
  }

  async getControls(): Promise<ControlModel[]> {
    try {
      const data = await fs.readFile(this.controlsFile, 'utf-8')
      return JSON.parse(data)
    } catch {
      return []
    }
  }

  async getControlById(id: string): Promise<ControlModel | null> {
    const controls = await this.getControls()
    return controls.find(control => control.id === id) || null
  }

  // 模板相关方法
  async getTemplates(): Promise<TemplateModel[]> {
    try {
      const data = await fs.readFile(this.templatesFile, 'utf-8')
      return JSON.parse(data)
    } catch {
      return []
    }
  }

  async getTemplateById(id: string): Promise<TemplateModel | null> {
    const templates = await this.getTemplates()
    return templates.find(template => template.id === id) || null
  }

  // 历史记录相关方法
  async saveHistory(history: Omit<HistoryModel, 'id' | 'createdAt'>): Promise<HistoryModel> {
    const historyList = await this.getHistory()
    const newHistory: HistoryModel = {
      ...history,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    }
    historyList.unshift(newHistory) // 最新的在前面
    
    // 只保留最近100条记录
    if (historyList.length > 100) {
      historyList.splice(100)
    }
    
    await fs.writeFile(this.historyFile, JSON.stringify(historyList, null, 2))
    return newHistory
  }

  async getHistory(): Promise<HistoryModel[]> {
    try {
      const data = await fs.readFile(this.historyFile, 'utf-8')
      return JSON.parse(data)
    } catch {
      return []
    }
  }

  async updateHistory(id: string, updates: Partial<HistoryModel>): Promise<HistoryModel | null> {
    const historyList = await this.getHistory()
    const index = historyList.findIndex(item => item.id === id)
    
    if (index === -1) return null
    
    historyList[index] = { ...historyList[index], ...updates }
    await fs.writeFile(this.historyFile, JSON.stringify(historyList, null, 2))
    return historyList[index]
  }
}

export const dataService = new DataService()
