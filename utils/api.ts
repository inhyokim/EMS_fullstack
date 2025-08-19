import { toast } from "sonner@2.0.3"
import { projectId, publicAnonKey } from './supabase/info'

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-ead5a09b`

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: any
  headers?: Record<string, string>
  showSuccess?: boolean
  showError?: boolean
  successMessage?: string
  errorMessage?: string
}

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  total?: number
  processed?: number
  saved?: number
  errors?: string[]
}

export async function fetchJSON<T = any>(
  endpoint: string, 
  options: ApiOptions = {}
): Promise<ApiResponse<T>> {
  const {
    method = 'GET',
    body,
    headers = {},
    showSuccess = false,
    showError = true,
    successMessage,
    errorMessage
  } = options

  try {
    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
        'X-Demo-Key': 'kt-ems-demo', // 데모 모드 키
        ...headers,
      },
    }

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body)
    }

    const url = endpoint.startsWith('/') ? `${API_BASE_URL}${endpoint}` : `${API_BASE_URL}/${endpoint}`
    
    console.log(`API ${method} ${url}`, body ? { body } : '')

    const response = await fetch(url, config)
    const result: ApiResponse<T> = await response.json()

    if (!response.ok) {
      throw new Error(result.error || `HTTP ${response.status}`)
    }

    if (result.success) {
      if (showSuccess) {
        toast.success(successMessage || '작업이 완료되었습니다.')
      }
      return result
    } else {
      throw new Error(result.error || '알 수 없는 오류가 발생했습니다.')
    }

  } catch (error) {
    const message = error instanceof Error ? error.message : '네트워크 오류가 발생했습니다.'
    
    console.error(`API Error [${method} ${endpoint}]:`, message)
    
    if (showError) {
      toast.error(errorMessage || message)
    }

    return {
      success: false,
      error: message
    }
  }
}

// 편의 메서드들
export const api = {
  get: <T = any>(endpoint: string, options?: Omit<ApiOptions, 'method'>) =>
    fetchJSON<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, data?: any, options?: Omit<ApiOptions, 'method' | 'body'>) =>
    fetchJSON<T>(endpoint, { ...options, method: 'POST', body: data }),

  put: <T = any>(endpoint: string, data?: any, options?: Omit<ApiOptions, 'method' | 'body'>) =>
    fetchJSON<T>(endpoint, { ...options, method: 'PUT', body: data }),

  delete: <T = any>(endpoint: string, options?: Omit<ApiOptions, 'method'>) =>
    fetchJSON<T>(endpoint, { ...options, method: 'DELETE' }),

  patch: <T = any>(endpoint: string, data?: any, options?: Omit<ApiOptions, 'method' | 'body'>) =>
    fetchJSON<T>(endpoint, { ...options, method: 'PATCH', body: data })
}

// 리소스별 API 호출 헬퍼
export const buildingsApi = {
  list: () => api.get('/buildings'),
  create: (data: any) => api.post('/buildings', data, { 
    showSuccess: true, 
    successMessage: '건물이 성공적으로 등록되었습니다.' 
  }),
  update: (id: string, data: any) => api.put(`/buildings/${id}`, data, { 
    showSuccess: true, 
    successMessage: '건물 정보가 업데이트되었습니다.' 
  }),
  delete: (id: string) => api.delete(`/buildings/${id}`, { 
    showSuccess: true, 
    successMessage: '건물이 삭제되었습니다.' 
  })
}

export const zonesApi = {
  list: (buildingId?: string) => api.get(buildingId ? `/zones?buildingId=${buildingId}` : '/zones'),
  create: (data: any) => api.post('/zones', data, { 
    showSuccess: true, 
    successMessage: '구역이 성공적으로 등록되었습니다.' 
  }),
  update: (id: string, data: any) => api.put(`/zones/${id}`, data, { 
    showSuccess: true, 
    successMessage: '구역 정보가 업데이트되었습니다.' 
  }),
  delete: (id: string) => api.delete(`/zones/${id}`, { 
    showSuccess: true, 
    successMessage: '구역이 삭제되었습니다.' 
  })
}

export const metersApi = {
  list: (zoneId?: string) => api.get(zoneId ? `/meters?zoneId=${zoneId}` : '/meters'),
  create: (data: any) => api.post('/meters', data, { 
    showSuccess: true, 
    successMessage: '계측기가 성공적으로 등록되었습니다.' 
  }),
  update: (id: string, data: any) => api.put(`/meters/${id}`, data, { 
    showSuccess: true, 
    successMessage: '계측기 정보가 업데이트되었습니다.' 
  }),
  delete: (id: string) => api.delete(`/meters/${id}`, { 
    showSuccess: true, 
    successMessage: '계측기가 삭제되었습니다.' 
  })
}

export const readingsApi = {
  list: (options?: { 
    meterId?: string, 
    from?: string, 
    to?: string,
    limit?: number 
  }) => {
    const params = new URLSearchParams()
    if (options?.meterId) params.append('meterId', options.meterId)
    if (options?.from) params.append('from', options.from)
    if (options?.to) params.append('to', options.to)
    if (options?.limit) params.append('limit', options.limit.toString())
    const query = params.toString() ? `?${params}` : ''
    return api.get(`/readings${query}`)
  },
  upload: (readings: any[]) => api.post('/readings', { readings }, { 
    showSuccess: true, 
    successMessage: '전력 데이터가 성공적으로 업로드되었습니다.' 
  })
}

export const alertRulesApi = {
  list: () => api.get('/alert-rules'),
  create: (data: any) => api.post('/alert-rules', data, { 
    showSuccess: true, 
    successMessage: '알람 규칙이 생성되었습니다.' 
  }),
  update: (id: string, data: any) => api.put(`/alert-rules/${id}`, data, { 
    showSuccess: true, 
    successMessage: '알람 규칙이 업데이트되었습니다.' 
  }),
  delete: (id: string) => api.delete(`/alert-rules/${id}`, { 
    showSuccess: true, 
    successMessage: '알람 규칙이 삭제되었습니다.' 
  })
}

export const alertsApi = {
  list: (status?: string) => api.get(status ? `/alerts?status=${status}` : '/alerts'),
  updateStatus: (id: string, status: string, data?: any) => api.patch(`/alerts/${id}`, { status, ...data }, { 
    showSuccess: true, 
    successMessage: '알람 상태가 업데이트되었습니다.' 
  })
}

// 집계 작업 API
export const jobsApi = {
  list: () => api.get('/jobs'),
  runAggregation: (type: 'hourly' | 'daily', options?: { 
    targetDate?: string, 
    buildingId?: string, 
    zoneId?: string 
  }) => api.post(`/jobs/aggregate/${type}`, options || {}, {
    showSuccess: true,
    successMessage: `${type === 'hourly' ? '시간별' : '일별'} 집계 작업이 완료되었습니다.`
  })
}

// 집계 데이터 API  
export const aggregatesApi = {
  getHourly: (options?: {
    from?: string,
    to?: string,
    meterId?: string,
    buildingName?: string
  }) => {
    const params = new URLSearchParams()
    if (options?.from) params.append('from', options.from)
    if (options?.to) params.append('to', options.to)
    if (options?.meterId) params.append('meterId', options.meterId)
    if (options?.buildingName) params.append('buildingName', options.buildingName)
    const query = params.toString() ? `?${params}` : ''
    return api.get(`/aggregates/hourly${query}`)
  },
  getDaily: (options?: {
    from?: string,
    to?: string,
    meterId?: string,
    buildingName?: string
  }) => {
    const params = new URLSearchParams()
    if (options?.from) params.append('from', options.from)
    if (options?.to) params.append('to', options.to)
    if (options?.meterId) params.append('meterId', options.meterId)
    if (options?.buildingName) params.append('buildingName', options.buildingName)
    const query = params.toString() ? `?${params}` : ''
    return api.get(`/aggregates/daily${query}`)
  }
}

export const dashboardApi = {
  getData: () => api.get('/dashboard')
}

// 리포트 API
export const reportsApi = {
  list: (options?: { type?: string, period?: string }) => {
    const params = new URLSearchParams()
    if (options?.type) params.append('type', options.type)
    if (options?.period) params.append('period', options.period)
    const query = params.toString() ? `?${params}` : ''
    return api.get(`/reports${query}`)
  },
  getById: (id: string) => api.get(`/reports/${id}`),
  generate: (data: { 
    type: string, 
    period: string, 
    building?: string 
  }) => api.post('/reports/generate', data, {
    showSuccess: true,
    successMessage: '리포트가 생성되었습니다.'
  })
}

// 개발용 시드 데이터 생성
export const seedApi = {
  create: () => api.post('/seed', {}, { 
    showSuccess: true, 
    successMessage: '초기 데이터가 생성되었습니다.' 
  })
}

// 헬스 체크
export const healthApi = {
  check: () => api.get('/health', { showError: false })
}

// 데모 모드 디버그 체크
export const debugApi = async () => {
  console.log('Debug: Checking API configuration...')
  console.log('API_BASE_URL:', API_BASE_URL)
  console.log('Demo Key:', 'kt-ems-demo')
  console.log('Public Anon Key:', publicAnonKey.substring(0, 20) + '...')
  
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
        'X-Demo-Key': 'kt-ems-demo',
      },
    })
    
    console.log('Health check response status:', response.status)
    const result = await response.json()
    console.log('Health check result:', result)
    return result
  } catch (error) {
    console.error('Health check failed:', error)
    return { error: error.message }
  }
}

// 폼 검증 헬퍼
export const validateForm = {
  required: (value: any, fieldName: string) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      throw new Error(`${fieldName}은(는) 필수 입력 항목입니다.`)
    }
  },
  
  positiveNumber: (value: number, fieldName: string) => {
    if (!value || value <= 0) {
      throw new Error(`${fieldName}은(는) 0보다 큰 값이어야 합니다.`)
    }
  },
  
  email: (value: string, fieldName: string = '이메일') => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      throw new Error(`올바른 ${fieldName} 형식이 아닙니다.`)
    }
  },
  
  meterNo: (value: string, fieldName: string = '계측기 번호') => {
    if (!value || !/^[A-Z]{2}-\d{3}$/.test(value)) {
      throw new Error(`${fieldName}은(는) MT-001 형식이어야 합니다.`)
    }
  }
}

// 에러 처리 헬퍼
export const handleApiError = (error: any, customMessage?: string) => {
  console.error('API Error:', error)
  const message = customMessage || error?.message || '알 수 없는 오류가 발생했습니다.'
  toast.error(message)
  return { success: false, error: message }
}

// 성공 처리 헬퍼
export const handleApiSuccess = (message: string, data?: any) => {
  toast.success(message)
  return { success: true, data }
}