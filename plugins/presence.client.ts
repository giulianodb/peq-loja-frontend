// Heartbeat de presença: avisa o backend que este visitante está navegando.
// Independe de login — identifica o navegador por um id persistente.
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const visitorId = useVisitorId()

  const PING_INTERVAL = 30_000
  let timer: ReturnType<typeof setInterval> | null = null

  function ping() {
    if (document.hidden) return
    fetch(`${config.public.apiBase}/api/presence/ping`, {
      method: 'POST',
      headers: { 'X-Visitor-Id': visitorId },
      keepalive: true,
    }).catch(() => { /* presença é best-effort */ })
  }

  function start() {
    if (timer) return
    ping()
    timer = setInterval(ping, PING_INTERVAL)
  }

  function stop() {
    if (timer) { clearInterval(timer); timer = null }
  }

  start()
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop()
    else start()
  })
})
