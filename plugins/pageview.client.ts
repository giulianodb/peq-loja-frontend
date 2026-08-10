// Registro de navegação: a cada rota aberta na loja, grava a URL no backend.
// Diferente do heartbeat de presença (memória, "online agora"), isto é
// persistido para contabilizar acessos ao longo do tempo.
export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const router = useRouter()
  const visitorId = useVisitorId()

  let lastSent = ''

  function send(path: string, query: string) {
    // Área administrativa não é acesso à loja — o backend também descarta,
    // mas nem vale gastar a requisição.
    if (path.startsWith('/admin')) return
    // Nuxt dispara afterEach também em troca só de query/hash; evita duplicar.
    const key = `${path}?${query}`
    if (key === lastSent) return
    lastSent = key

    // O token vai junto quando existe: é dele que o backend tira "estava
    // logado?" e o descarte de tráfego admin. Sem token, conta como anônimo.
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Visitor-Id': visitorId,
    }
    const token = localStorage.getItem('auth_token')
    if (token) headers['Authorization'] = `Bearer ${token}`

    fetch(`${config.public.apiBase}/api/page-views`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        path,
        query: query || null,
        referrer: document.referrer || null,
      }),
      keepalive: true,
    }).catch(() => { /* métrica é best-effort */ })
  }

  function track(to: { path: string; fullPath: string }) {
    const query = to.fullPath.includes('?') ? to.fullPath.split('?')[1].split('#')[0] : ''
    send(to.path, query)
  }

  // A primeira rota já foi resolvida na hidratação, então afterEach não a cobre.
  nuxtApp.hook('app:mounted', () => track(router.currentRoute.value))

  router.afterEach(to => track(to))
})
