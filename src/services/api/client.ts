import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ApiResponse, ApiError, RequestConfig } from './types'

class ApiClient {
  private instance: AxiosInstance
  private baseURL: string

  constructor(baseURL: string = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api') {
    this.baseURL = baseURL
    this.instance = axios.create({
      baseURL,
      timeout: 120000, // 120秒超时，适应AI生成需要更长时间
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        // 添加认证token等
        const token = localStorage.getItem('auth_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        return response
      },
      (error) => {
        const apiError: ApiError = {
          code: error.response?.status || 500,
          message: error.response?.data?.message || error.message || '网络错误',
          details: error.response?.data,
        }
        return Promise.reject(apiError)
      }
    )
  }

  // 通用请求方法
  async request<T>(config: AxiosRequestConfig & RequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.request<ApiResponse<T>>(config)
      return response.data
    } catch (error) {
      throw error as ApiError
    }
  }

  // GET请求
  async get<T>(url: string, config?: AxiosRequestConfig & RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'GET', url })
  }

  // POST请求
  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig & RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'POST', url, data })
  }

  // PUT请求
  async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig & RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PUT', url, data })
  }

  // DELETE请求
  async delete<T>(url: string, config?: AxiosRequestConfig & RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'DELETE', url })
  }

  // 上传文件
  async upload<T>(
    url: string,
    file: File,
    config?: AxiosRequestConfig & RequestConfig
  ): Promise<ApiResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)

    return this.request<T>({
      ...config,
      method: 'POST',
      url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(config?.headers as Record<string, string>),
      },
    })
  }

  // 下载文件
  async download(url: string, filename?: string, config?: AxiosRequestConfig & RequestConfig): Promise<void> {
    try {
      const response = await this.instance.request({
        ...config,
        method: 'GET',
        url,
        responseType: 'blob',
      })

      const blob = new Blob([response.data])
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename || 'download'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      throw error as ApiError
    }
  }

  // 设置认证token
  setAuthToken(token: string) {
    localStorage.setItem('auth_token', token)
    this.instance.defaults.headers.Authorization = `Bearer ${token}`
  }

  // 清除认证token
  clearAuthToken() {
    localStorage.removeItem('auth_token')
    delete this.instance.defaults.headers.Authorization
  }

  // 获取基础URL
  getBaseURL(): string {
    return this.baseURL
  }
}

// 创建默认实例
export const apiClient = new ApiClient()

// 导出类以便创建其他实例
export { ApiClient }
