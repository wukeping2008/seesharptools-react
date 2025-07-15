import { useRef, useEffect, useCallback, useState } from 'react'

export interface WebGLRendererConfig {
  width: number
  height: number
  backgroundColor?: string
  antialias?: boolean
  preserveDrawingBuffer?: boolean
  powerPreference?: 'default' | 'high-performance' | 'low-power'
}

export interface RenderData {
  vertices: Float32Array
  colors?: Float32Array
  indices?: Uint16Array
  lineWidth?: number
  pointSize?: number
}

export interface WebGLRendererAPI {
  canvas: HTMLCanvasElement | null
  gl: WebGLRenderingContext | null
  isReady: boolean
  render: (data: RenderData) => void
  clear: () => void
  resize: (width: number, height: number) => void
  setViewport: (x: number, y: number, width: number, height: number) => void
}

/**
 * WebGL高性能渲染Hook
 * 用于大数据量的实时图表渲染
 */
export const useWebGLRenderer = (config: WebGLRendererConfig): WebGLRendererAPI => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const glRef = useRef<WebGLRenderingContext | null>(null)
  const programRef = useRef<WebGLProgram | null>(null)
  const [isReady, setIsReady] = useState(false)

  // 顶点着色器源码
  const vertexShaderSource = `
    attribute vec2 a_position;
    attribute vec3 a_color;
    
    uniform vec2 u_resolution;
    uniform mat3 u_transform;
    uniform float u_pointSize;
    
    varying vec3 v_color;
    
    void main() {
      // 应用变换矩阵
      vec3 position = u_transform * vec3(a_position, 1.0);
      
      // 转换到裁剪空间坐标
      vec2 zeroToOne = position.xy / u_resolution;
      vec2 zeroToTwo = zeroToOne * 2.0;
      vec2 clipSpace = zeroToTwo - 1.0;
      
      gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
      gl_PointSize = u_pointSize;
      
      v_color = a_color;
    }
  `

  // 片段着色器源码
  const fragmentShaderSource = `
    precision mediump float;
    
    varying vec3 v_color;
    
    void main() {
      gl_FragColor = vec4(v_color, 1.0);
    }
  `

  // 创建着色器
  const createShader = useCallback((gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null => {
    const shader = gl.createShader(type)
    if (!shader) return null

    gl.shaderSource(shader, source)
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('着色器编译错误:', gl.getShaderInfoLog(shader))
      gl.deleteShader(shader)
      return null
    }

    return shader
  }, [])

  // 创建着色器程序
  const createProgram = useCallback((gl: WebGLRenderingContext): WebGLProgram | null => {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)

    if (!vertexShader || !fragmentShader) return null

    const program = gl.createProgram()
    if (!program) return null

    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('着色器程序链接错误:', gl.getProgramInfoLog(program))
      gl.deleteProgram(program)
      return null
    }

    return program
  }, [createShader, vertexShaderSource, fragmentShaderSource])

  // 初始化WebGL上下文
  const initWebGL = useCallback(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    canvas.width = config.width
    canvas.height = config.height

    const gl = canvas.getContext('webgl', {
      antialias: config.antialias ?? true,
      preserveDrawingBuffer: config.preserveDrawingBuffer ?? false,
      powerPreference: config.powerPreference ?? 'high-performance'
    })

    if (!gl) {
      console.error('WebGL不支持')
      return
    }

    glRef.current = gl

    // 创建着色器程序
    const program = createProgram(gl)
    if (!program) return

    programRef.current = program

    // 设置视口
    gl.viewport(0, 0, canvas.width, canvas.height)

    // 设置背景色
    const bgColor = config.backgroundColor || '#000000'
    const r = parseInt(bgColor.slice(1, 3), 16) / 255
    const g = parseInt(bgColor.slice(3, 5), 16) / 255
    const b = parseInt(bgColor.slice(5, 7), 16) / 255
    gl.clearColor(r, g, b, 1.0)

    // 启用混合
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    setIsReady(true)
  }, [config, createProgram])

  // 渲染数据
  const render = useCallback((data: RenderData) => {
    const gl = glRef.current
    const program = programRef.current
    if (!gl || !program || !isReady) return

    gl.useProgram(program)

    // 创建顶点缓冲区
    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, data.vertices, gl.STATIC_DRAW)

    // 获取属性位置
    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position')
    const colorAttributeLocation = gl.getAttribLocation(program, 'a_color')

    // 设置顶点属性
    gl.enableVertexAttribArray(positionAttributeLocation)
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0)

    // 设置颜色属性
    let colorBuffer: WebGLBuffer | null = null
    if (data.colors) {
      colorBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, data.colors, gl.STATIC_DRAW)
      
      gl.enableVertexAttribArray(colorAttributeLocation)
      gl.vertexAttribPointer(colorAttributeLocation, 3, gl.FLOAT, false, 0, 0)
    } else {
      // 使用默认颜色
      gl.disableVertexAttribArray(colorAttributeLocation)
      gl.vertexAttrib3f(colorAttributeLocation, 1.0, 1.0, 1.0)
    }

    // 设置uniform变量
    const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution')
    const transformUniformLocation = gl.getUniformLocation(program, 'u_transform')
    const pointSizeUniformLocation = gl.getUniformLocation(program, 'u_pointSize')

    gl.uniform2f(resolutionUniformLocation, config.width, config.height)
    
    // 单位变换矩阵
    const transform = new Float32Array([
      1, 0, 0,
      0, 1, 0,
      0, 0, 1
    ])
    gl.uniformMatrix3fv(transformUniformLocation, false, transform)

    // 设置点大小
    gl.uniform1f(pointSizeUniformLocation, data.pointSize || 2.0)

    // 绘制
    if (data.indices) {
      const indexBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data.indices, gl.STATIC_DRAW)
      gl.drawElements(gl.TRIANGLES, data.indices.length, gl.UNSIGNED_SHORT, 0)
      gl.deleteBuffer(indexBuffer)
    } else {
      const vertexCount = data.vertices.length / 2
      if (data.pointSize && data.pointSize > 0) {
        // 渲染点
        gl.drawArrays(gl.POINTS, 0, vertexCount)
      } else {
        // 渲染线条
        // 对于线宽，我们使用多次绘制来模拟粗线条
        const lineWidth = data.lineWidth || 1
        if (lineWidth > 1) {
          // 绘制多条稍微偏移的线来模拟粗线条
          const offsetRange = lineWidth - 1
          const steps = Math.max(1, Math.floor(lineWidth))
          
          for (let i = 0; i < steps; i++) {
            const offset = (i / (steps - 1) - 0.5) * offsetRange
            
            // 创建偏移的顶点数据
            const offsetVertices = new Float32Array(data.vertices.length)
            for (let j = 0; j < data.vertices.length; j += 2) {
              offsetVertices[j] = data.vertices[j] // x坐标不变
              offsetVertices[j + 1] = data.vertices[j + 1] + offset // y坐标偏移
            }
            
            // 更新顶点缓冲区
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
            gl.bufferData(gl.ARRAY_BUFFER, offsetVertices, gl.STATIC_DRAW)
            gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0)
            
            gl.drawArrays(gl.LINE_STRIP, 0, vertexCount)
          }
        } else {
          gl.drawArrays(gl.LINE_STRIP, 0, vertexCount)
        }
      }
    }

    // 清理缓冲区
    gl.deleteBuffer(positionBuffer)
    if (colorBuffer) {
      gl.deleteBuffer(colorBuffer)
    }
  }, [config, isReady])

  // 清除画布
  const clear = useCallback(() => {
    const gl = glRef.current
    if (!gl) return

    gl.clear(gl.COLOR_BUFFER_BIT)
  }, [])

  // 调整大小
  const resize = useCallback((width: number, height: number) => {
    if (!canvasRef.current || !glRef.current) return

    canvasRef.current.width = width
    canvasRef.current.height = height
    glRef.current.viewport(0, 0, width, height)

    config.width = width
    config.height = height
  }, [config])

  // 设置视口
  const setViewport = useCallback((x: number, y: number, width: number, height: number) => {
    const gl = glRef.current
    if (!gl) return

    gl.viewport(x, y, width, height)
  }, [])

  // 初始化
  useEffect(() => {
    initWebGL()
  }, [initWebGL])

  // 创建canvas元素
  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.width = config.width
    canvas.height = config.height
    canvasRef.current = canvas
  }, [config.width, config.height])

  return {
    canvas: canvasRef.current,
    gl: glRef.current,
    isReady,
    render,
    clear,
    resize,
    setViewport
  }
}

export default useWebGLRenderer
