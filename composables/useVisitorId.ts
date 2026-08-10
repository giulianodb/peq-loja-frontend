/**
 * Id pseudônimo do navegador, persistido em localStorage. Identifica o mesmo
 * visitante entre páginas e sessões sem dizer quem ele é — usado pelo heartbeat
 * de presença e pelo registro de navegação. Só funciona no client.
 */
export function useVisitorId(): string {
  const KEY = 'visitor_id'

  let visitorId = localStorage.getItem(KEY)
  if (!visitorId) {
    visitorId = crypto.randomUUID?.() ?? `${Math.random().toString(36).slice(2)}${Date.now()}`
    localStorage.setItem(KEY, visitorId)
  }
  return visitorId
}
