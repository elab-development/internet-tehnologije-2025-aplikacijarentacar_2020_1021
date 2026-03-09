const API_BASE = import.meta.env.VITE_API_URL || '/api'

export async function api<T>(
  path: string,
  options?: RequestInit & { json?: unknown }
): Promise<T> {
  const { json, ...rest } = options ?? {}
  const token = localStorage.getItem('token')
  const headers: HeadersInit = {
    ...(rest.headers as Record<string, string>),
  }
  if (json !== undefined) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json'
  }
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }
  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers,
    ...(json !== undefined && { body: JSON.stringify(json) }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    const detail = err.detail
    const message = Array.isArray(detail)
      ? detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join(', ') || res.statusText
      : detail ?? err.message ?? res.statusText
    throw new Error(message)
  }
  return res.json() as Promise<T>
}

export function getApiUrl(path: string): string {
  return `${API_BASE}${path}`
}
