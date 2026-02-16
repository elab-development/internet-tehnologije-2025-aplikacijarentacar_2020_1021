const TOKEN_KEY = 'token'

export interface AuthUser {
  user_id: number
  role: string
}

function parseJwtPayload(token: string): AuthUser | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = parts[1]
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(base64)
    const data = JSON.parse(json) as { user_id?: number; role?: string }
    if (typeof data.user_id !== 'number' || typeof data.role !== 'string') return null
    return { user_id: data.user_id, role: data.role }
  } catch {
    return null
  }
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredUser(): AuthUser | null {
  const token = getStoredToken()
  if (!token) return null
  return parseJwtPayload(token)
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearStoredAuth(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export function isAdmin(role: string): boolean {
  return role === 'admin'
}
