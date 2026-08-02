export type PaymentMethod = 'pix' | 'credit_card'

/**
 * Status do PaymentIntent do Stripe.
 * `succeeded` é o único terminal de sucesso; `canceled` e
 * `requires_payment_method` (depois de uma tentativa) são falha.
 */
export type PaymentIntentStatus =
  | 'succeeded'
  | 'processing'
  | 'requires_action'
  | 'requires_confirmation'
  | 'requires_payment_method'
  | 'canceled'

/** Resposta de POST /api/orders/checkout */
export interface PaymentResult {
  orderId: number
  status: PaymentIntentStatus | string
  /** decline_code do Stripe, quando houver recusa. */
  statusDetail?: string | null
  /** Id do PaymentIntent (pi_...). */
  paymentId?: string | null
  /** Segredo para o Payment Element confirmar o cartão no browser. */
  clientSecret?: string | null
  /** Código Pix copia-e-cola (EMV). */
  pixQrCode?: string | null
  /** URL da imagem PNG do QR Code Pix. */
  pixQrCodeImageUrl?: string | null
  /** Epoch em segundos do fim da validade do QR Pix. */
  pixExpiresAt?: number | null
}

export interface AppliedCoupon {
  code: string
  discountType: string
  discountValue: number
  discountAmount: number
}

/** Item enviado ao backend. unitPrice só é usado no checkout de funil. */
export interface CheckoutItem {
  productId: number
  quantity: number
  unitPrice?: number
}

/** Item no formato esperado por useTracking() */
export interface TrackingItem {
  id: number
  name: string
  price: number
  quantity: number
}

export interface CustomerForm {
  name: string
  email: string
  phone: string
  cpf: string
}
