import type { CheckoutItem, CustomerForm, PaymentMethod, PaymentResult, TrackingItem } from '~/types/payment'

interface UsePaymentOptions {
  /** Total final a cobrar, já com desconto de cupom. */
  amount: Ref<number>
  /** Itens no formato esperado por POST /api/orders/checkout. */
  buildItems: () => CheckoutItem[]
  /** Itens no formato do pixel/analytics. */
  trackingItems: () => TrackingItem[]
  /** Dados do cliente (objeto reativo da página). */
  customer: CustomerForm
  /** Código do cupom aplicado, se houver. */
  couponCode: () => string | null
  /** Slug do funil, apenas no checkout direto. */
  funnelSlug?: string | null
  /** Envia fbclid/fbp junto do checkout (usado no checkout de funil). */
  withFbAttribution?: boolean
  /** Refs de manutenção da página, para exibir o aviso se o backend recusar. */
  maintenance: Ref<boolean>
  maintenanceMessage: Ref<string>
  /** Executado após um checkout aceito (ex.: limpar o carrinho). */
  onSubmitted?: () => void
}

/**
 * Orquestra o checkout: monta o corpo, chama o backend, cuida do resultado,
 * do polling do Pix e do redirecionamento. Tudo que é específico do provedor
 * de pagamento vive em `useCardGateway()`.
 */
export function usePayment(options: UsePaymentOptions) {
  const auth = useAuthStore()
  const route = useRoute()
  const { $fetch: apiFetch } = useApi()

  const gateway = useCardGateway(options.amount)

  const paymentMethod = ref<PaymentMethod>('pix')
  const submitting = ref(false)
  const error = ref('')
  const paymentResult = ref<PaymentResult | null>(null)
  const copied = ref(false)
  const pixConfirmed = ref(false)
  const redirectCountdown = ref(5)
  const recoveryToken = ref<string | null>((route.query.recover as string) || null)
  const pixSecondsLeft = ref<number | null>(null)

  let pollInterval: ReturnType<typeof setInterval> | null = null
  let countdownInterval: ReturnType<typeof setInterval> | null = null
  let expirationInterval: ReturnType<typeof setInterval> | null = null

  const isFormValid = computed(() => {
    const base =
      options.customer.name.trim().length > 0 &&
      options.customer.email.includes('@') &&
      isValidCpf(options.customer.cpf)
    if (paymentMethod.value === 'credit_card') {
      return base && gateway.isCardFormValid.value
    }
    return base
  })

  gateway.onCardValid(() => {
    const { addPaymentInfo } = useTracking()
    addPaymentInfo(options.amount.value, options.trackingItems())
  })

  // O formulário de cartão só é montado quando a aba é aberta — o Pix,
  // que é o método padrão, não paga o custo de carregar o SDK.
  watch(paymentMethod, async (method) => {
    if (method !== 'credit_card') return
    await nextTick()
    try {
      await gateway.mount()
    } catch (e: any) {
      error.value = e?.message || 'Erro ao carregar formulário de pagamento.'
    }
  })

  /** Pagamento que falhou de forma terminal e permite nova tentativa. */
  const isFailed = computed(() => {
    const status = paymentResult.value?.status
    return status === 'canceled' || status === 'requires_payment_method'
  })

  /** Se algum dos estados de resultado deve substituir o formulário. */
  const showResult = computed(() => {
    const r = paymentResult.value
    if (pixConfirmed.value) return true
    if (!r) return false
    return r.status === 'succeeded' || isFailed.value || !!r.pixQrCode
  })

  function statusMessage(detail?: string | null): string {
    return gateway.declineMessage(detail)
  }

  async function copyPixCode() {
    if (!paymentResult.value?.pixQrCode) return
    const { copy } = useClipboard()
    await copy(paymentResult.value.pixQrCode)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  }

  function startPixPolling(orderId: number) {
    pollInterval = setInterval(async () => {
      try {
        const result = await apiFetch<{ status: string }>(`/api/orders/${orderId}/status`)
        if (result.status === 'CONFIRMED') {
          stopPixPolling()
          pixConfirmed.value = true
          startRedirectCountdown()
        }
      } catch (_) {}
    }, 4000)
  }

  /**
   * Conta o tempo restante do QR. Sem isso o polling ficava rodando
   * indefinidamente sobre um código que o Stripe já invalidou.
   */
  function startPixExpiration(expiresAt?: number | null) {
    if (!expiresAt) return
    const tick = () => {
      const remaining = expiresAt - Math.floor(Date.now() / 1000)
      pixSecondsLeft.value = Math.max(0, remaining)
      if (remaining <= 0) {
        stopPixPolling()
        if (expirationInterval) clearInterval(expirationInterval)
        expirationInterval = null
      }
    }
    tick()
    expirationInterval = setInterval(tick, 1000)
  }

  const pixExpired = computed(() => pixSecondsLeft.value !== null && pixSecondsLeft.value <= 0)

  function stopPixPolling() {
    if (pollInterval) {
      clearInterval(pollInterval)
      pollInterval = null
    }
  }

  function startRedirectCountdown() {
    redirectCountdown.value = 5
    countdownInterval = setInterval(() => {
      redirectCountdown.value--
      if (redirectCountdown.value <= 0) {
        clearInterval(countdownInterval!)
        navigateTo(auth.token ? '/minha-conta/materiais' : '/loja')
      }
    }, 1000)
  }

  onUnmounted(() => {
    stopPixPolling()
    if (countdownInterval) clearInterval(countdownInterval)
    if (expirationInterval) clearInterval(expirationInterval)
  })

  function baseBody(): Record<string, any> {
    const body: Record<string, any> = {
      items: options.buildItems(),
      customerName: options.customer.name,
      customerEmail: options.customer.email,
      customerPhone: options.customer.phone || null,
      customerCpf: onlyDigits(options.customer.cpf),
      transaction_amount: options.amount.value,
      couponCode: options.couponCode(),
      recoveryToken: recoveryToken.value || null,
    }

    if (options.funnelSlug) body.funnelSlug = options.funnelSlug

    if (options.withFbAttribution) {
      const { getFbclid, getFbp } = useFbAttribution()
      body.fbclid = getFbclid()
      body.fbp = getFbp()
    }

    return body
  }

  /** Guarda o carrinho para recuperação de abandono. Falha em silêncio. */
  async function saveCart() {
    if (!options.customer.email.includes('@')) return
    const items = options.buildItems()
    if (items.length === 0) return
    try {
      const result = await apiFetch<{ recoveryToken: string }>('/api/orders/save-cart', {
        method: 'POST',
        body: JSON.stringify({
          email: options.customer.email,
          name: options.customer.name || null,
          phone: options.customer.phone || null,
          cpf: options.customer.cpf || null,
          items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
          couponCode: options.couponCode(),
          funnelSlug: options.funnelSlug || null,
        }),
      })
      recoveryToken.value = result.recoveryToken
    } catch (_) {}
  }

  async function submitPayment() {
    error.value = ''
    submitting.value = true

    try {
      const isCard = paymentMethod.value === 'credit_card'
      const gatewayFields = isCard ? await gateway.beforeSubmit(options.customer.cpf) : {}

      const response = await apiFetch<PaymentResult>('/api/orders/checkout', {
        method: 'POST',
        body: JSON.stringify({
          ...baseBody(),
          paymentType: paymentMethod.value,
          ...gatewayFields,
        }),
      })

      // No cartão, a cobrança só acontece aqui — o backend criou o
      // PaymentIntent, o Payment Element é quem confirma.
      const result = isCard ? await gateway.afterSubmit(response) : response

      if (!isCard && result.pixQrCode) {
        const { addPaymentInfo } = useTracking()
        addPaymentInfo(options.amount.value, options.trackingItems())
      }

      paymentResult.value = result
      options.onSubmitted?.()

      if (result.pixQrCode && result.orderId) {
        startPixExpiration(result.pixExpiresAt)
        window.scrollTo({ top: 0, behavior: 'smooth' })
        startPixPolling(result.orderId)
      }

      // O webhook é a fonte de verdade; o polling cobre a janela entre a
      // confirmação no browser e a chegada do evento.
      if (isCard && result.status === 'processing' && result.orderId) {
        startPixPolling(result.orderId)
      }
    } catch (e: any) {
      // Manutenção ativada enquanto o cliente preenchia o formulário
      if (e?.data?.maintenance) {
        options.maintenance.value = true
        options.maintenanceMessage.value = e.data.error || ''
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
      error.value = e?.data?.message || e?.data?.error || e?.message || 'Erro ao processar pagamento.'
    } finally {
      submitting.value = false
    }
  }

  /** Volta ao formulário para uma nova tentativa (recusa ou Pix expirado). */
  function reset() {
    stopPixPolling()
    if (expirationInterval) clearInterval(expirationInterval)
    expirationInterval = null
    pixSecondsLeft.value = null
    paymentResult.value = null
    error.value = ''
  }

  return {
    gateway,
    paymentMethod,
    submitting,
    error,
    paymentResult,
    pixConfirmed,
    redirectCountdown,
    copied,
    recoveryToken,
    isFormValid,
    showResult,
    isFailed,
    pixSecondsLeft,
    pixExpired,
    copyPixCode,
    submitPayment,
    saveCart,
    reset,
    statusMessage,
  }
}
