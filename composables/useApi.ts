export function useApi() {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  async function $fetch<T>(path: string, options: any = {}): Promise<T> {
    const headers: Record<string, string> = {
      ...options.headers,
    }

    if (authStore.token) {
      headers['Authorization'] = `Bearer ${authStore.token}`
    }

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json'
    }

    const response = await globalThis.$fetch<T>(`${config.public.apiBase}${path}`, {
      ...options,
      headers,
    })

    return response
  }

  return { $fetch }
}
