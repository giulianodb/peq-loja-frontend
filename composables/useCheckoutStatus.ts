interface CheckoutStatus {
  maintenance: boolean
  message: string
  pixEnabled: boolean
  cardEnabled: boolean
}

/**
 * Consulta o estado do checkout: manutenção e métodos de pagamento ativos.
 * Em caso de falha na consulta, assume o cenário liberado — o backend recusa
 * de qualquer forma, tanto a manutenção (HTTP 503) quanto o método desligado.
 */
export function useCheckoutStatus() {
  const config = useRuntimeConfig()

  const maintenance = ref(false)
  const maintenanceMessage = ref('')
  const cardEnabled = ref(true)
  const checking = ref(true)

  async function fetchStatus() {
    checking.value = true
    try {
      const status = await $fetch<CheckoutStatus>(`${config.public.apiBase}/api/config/checkout-status`)
      maintenance.value = !!status?.maintenance
      maintenanceMessage.value = status?.message || ''
      cardEnabled.value = status?.cardEnabled !== false
    } catch (e) {
      maintenance.value = false
      maintenanceMessage.value = ''
      cardEnabled.value = true
    } finally {
      checking.value = false
    }
  }

  onMounted(fetchStatus)

  return { maintenance, maintenanceMessage, cardEnabled, checking, fetchStatus }
}
