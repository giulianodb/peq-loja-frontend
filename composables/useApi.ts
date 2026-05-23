export function useApi() {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()
  const router = useRouter()
  const route = useRoute()

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

    try {
      const response = await globalThis.$fetch<T>(`${config.public.apiBase}${path}`, {
        ...options,
        headers,
      })
      return response
    } catch (err: any) {
      const status = err?.response?.status ?? err?.status
      if (status === 401 || status === 403) {
        authStore.logout()
        await router.push(`/login?redirect=${encodeURIComponent(route.fullPath)}`)
      }
      throw err
    }
  }

  return { $fetch }
}
