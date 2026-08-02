import type { Stripe, StripeElements, StripePaymentElement } from '@stripe/stripe-js'
import type { PaymentResult } from '~/types/payment'

/** Id do elemento onde o Payment Element é montado. */
export const PAYMENT_ELEMENT_ID = 'stripe-payment-element'

/**
 * Adaptador do gateway para pagamento com cartão — Stripe Payment Element
 * em deferred-intent mode.
 *
 * Os campos aparecem antes de existir um PaymentIntent, então o fluxo é:
 * `elements.submit()` valida → o backend cria o intent e devolve o
 * `client_secret` → `confirmPayment` cobra. Com `redirect: 'if_required'`
 * o cliente nunca sai da página; um eventual desafio 3DS abre num modal do
 * próprio Stripe.
 *
 * Não há parcelamento: o Stripe só oferece installments no México e no Japão.
 */
export function useCardGateway(amount: Ref<number>) {
  const { $getStripe } = useNuxtApp()

  const ready = ref(false)
  const mounting = ref(false)

  let stripe: Stripe | null = null
  let elements: StripeElements | null = null
  let paymentElement: StripePaymentElement | null = null
  let cardValidFired = false
  let onCardValidCb: (() => void) | null = null

  // O Payment Element coleta o nome do titular internamente.
  const isCardFormValid = computed(() => ready.value)

  function onCardValid(cb: () => void) {
    onCardValidCb = cb
  }

  /** Bumps e cupom mudam o total: o Elements precisa saber para revalidar. */
  watch(amount, (value) => {
    if (elements && value > 0) {
      elements.update({ amount: toMinorUnits(value) })
    }
  })

  async function mount() {
    if (ready.value || mounting.value) return
    mounting.value = true
    try {
      stripe = await ($getStripe as () => Promise<Stripe | null>)()
      if (!stripe) throw new Error('Stripe.js indisponível.')

      elements = stripe.elements({
        mode: 'payment',
        amount: toMinorUnits(amount.value),
        currency: 'brl',
        paymentMethodTypes: ['card'],
        appearance: { theme: 'stripe', variables: { borderRadius: '8px' } },
      })

      paymentElement = elements.create('payment', { layout: 'tabs' })
      paymentElement.mount(`#${PAYMENT_ELEMENT_ID}`)

      paymentElement.on('change', (event) => {
        if (!cardValidFired && event.complete) {
          cardValidFired = true
          onCardValidCb?.()
        }
      })

      ready.value = true
    } catch (e) {
      console.error('Erro ao inicializar o gateway de cartão:', e)
      throw new Error('Erro ao carregar formulário de pagamento.')
    } finally {
      mounting.value = false
    }
  }

  /**
   * Roda antes do POST de checkout: valida os campos no cliente para não
   * criar um PaymentIntent que já nasceria inutilizável.
   */
  async function beforeSubmit(_cpf: string): Promise<Record<string, any>> {
    if (!ready.value) await mount()
    if (!elements) throw new Error('Erro ao carregar formulário de pagamento. Tente novamente.')

    const { error } = await elements.submit()
    if (error) {
      throw new Error(error.message || 'Verifique os dados do cartão.')
    }
    // Nenhum dado de cartão trafega pelo nosso backend.
    return {}
  }

  /**
   * Roda depois do POST de checkout: confirma o PaymentIntent com o
   * `client_secret` devolvido pelo backend.
   */
  async function afterSubmit(response: PaymentResult): Promise<PaymentResult> {
    if (!stripe || !elements) throw new Error('Erro ao carregar formulário de pagamento.')
    if (!response.clientSecret) throw new Error('Não foi possível iniciar o pagamento. Tente novamente.')

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      clientSecret: response.clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/retorno?order=${response.orderId}`,
      },
      redirect: 'if_required',
    })

    if (error) {
      return {
        ...response,
        status: 'requires_payment_method',
        statusDetail: error.decline_code || error.code || null,
      }
    }

    return { ...response, status: paymentIntent?.status || response.status }
  }

  /** Traduz decline_code / code do Stripe. */
  function declineMessage(detail?: string | null): string {
    const messages: Record<string, string> = {
      insufficient_funds: 'Saldo insuficiente.',
      expired_card: 'Cartão expirado.',
      incorrect_cvc: 'Código de segurança incorreto.',
      invalid_cvc: 'Código de segurança incorreto.',
      incorrect_number: 'Número do cartão incorreto.',
      invalid_number: 'Número do cartão incorreto.',
      invalid_expiry_month: 'Data de validade incorreta.',
      invalid_expiry_year: 'Data de validade incorreta.',
      card_not_supported: 'Cartão não suportado para esta compra.',
      currency_not_supported: 'Seu cartão não aceita cobrança nesta moeda.',
      do_not_honor: 'Transação não autorizada pelo banco emissor.',
      transaction_not_allowed: 'Transação não autorizada pelo banco emissor.',
      lost_card: 'Cartão bloqueado. Contate seu banco.',
      stolen_card: 'Cartão bloqueado. Contate seu banco.',
      pickup_card: 'Cartão bloqueado. Contate seu banco.',
      fraudulent: 'Pagamento recusado por segurança.',
      merchant_blacklist: 'Pagamento recusado por segurança.',
      processing_error: 'Erro ao processar o cartão. Tente novamente.',
      authentication_required: 'Autenticação exigida pelo banco. Tente novamente.',
      card_declined: 'Cartão recusado pelo banco emissor.',
      generic_decline: 'Cartão recusado pelo banco emissor.',
    }
    return messages[detail || ''] || 'Pagamento não aprovado. Tente novamente com outro método.'
  }

  onUnmounted(() => {
    paymentElement?.unmount()
    paymentElement = null
    elements = null
    ready.value = false
  })

  return {
    ready,
    isCardFormValid,
    mount,
    onCardValid,
    beforeSubmit,
    afterSubmit,
    declineMessage,
  }
}
