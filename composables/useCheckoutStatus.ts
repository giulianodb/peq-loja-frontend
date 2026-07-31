interface CheckoutStatus {
  maintenance: boolean
  message: string
}

/**
 * Consulta se o checkout está em manutenção.
 * Em caso de falha na consulta, assume que está liberado — o backend
 * bloqueia o pagamento de qualquer forma (HTTP 503).
 */
export function useCheckoutStatus() {
  const config = useRuntimeConfig()

  const maintenance = ref(false)
  const maintenanceMessage = ref('')
  const checking = ref(true)

  async function fetchStatus() {
    checking.value = true
    try {
      const status = await $fetch<CheckoutStatus>(`${config.public.apiBase}/api/config/checkout-status`)
      maintenance.value = !!status?.maintenance
      maintenanceMessage.value = status?.message || ''
    } catch (e) {
      maintenance.value = false
      maintenanceMessage.value = ''
    } finally {
      checking.value = false
    }
  }

  onMounted(fetchStatus)

  return { maintenance, maintenanceMessage, checking, fetchStatus }
}
