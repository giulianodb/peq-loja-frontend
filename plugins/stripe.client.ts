import { loadStripe, type Stripe } from '@stripe/stripe-js'

/**
 * Carrega o Stripe.js uma única vez por sessão.
 *
 * O app é SPA (ssr: false), então isso roda sempre no browser. A promise é
 * compartilhada para que abrir a aba de cartão nas duas páginas de checkout
 * não baixe o script duas vezes.
 */
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  let stripePromise: Promise<Stripe | null> | null = null

  function getStripe(): Promise<Stripe | null> {
    if (!config.public.stripePublishableKey) {
      return Promise.reject(new Error('Chave publicável do Stripe não configurada.'))
    }
    if (!stripePromise) {
      stripePromise = loadStripe(config.public.stripePublishableKey, { locale: 'pt-BR' })
    }
    return stripePromise
  }

  return { provide: { getStripe } }
})
