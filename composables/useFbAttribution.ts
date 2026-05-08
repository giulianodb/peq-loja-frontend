const FBCLID_KEY = 'peq_fbclid'

export function useFbAttribution() {
  function persistFbclid() {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const fbclid = params.get('fbclid')
    if (fbclid) {
      localStorage.setItem(FBCLID_KEY, fbclid)
    }
  }

  function getFbclid(): string | null {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    return params.get('fbclid') || localStorage.getItem(FBCLID_KEY) || null
  }

  function getFbp(): string | null {
    if (typeof document === 'undefined') return null
    const match = document.cookie.match(/(?:^|;\s*)_fbp=([^;]+)/)
    return match ? match[1] : null
  }

  return { persistFbclid, getFbclid, getFbp }
}
