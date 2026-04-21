const API_BASE = '/api/v1'

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | undefined>
}

export async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options

  let url = `${API_BASE}${endpoint}`

  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, String(value))
      }
    })
    const queryString = searchParams.toString()
    if (queryString) url += `?${queryString}`
  }

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
    ...fetchOptions,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }

  return response.json()
}

export const api = {
  get: <T>(endpoint: string, params?: Record<string, string | number | undefined>) =>
    apiFetch<T>(endpoint, { method: 'GET', params }),

  post: <T>(endpoint: string, body?: unknown) =>
    apiFetch<T>(endpoint, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),

  put: <T>(endpoint: string, body?: unknown) =>
    apiFetch<T>(endpoint, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),

  delete: <T>(endpoint: string) =>
    apiFetch<T>(endpoint, { method: 'DELETE' }),
}
