import type { AppliedCoupon } from '~/types/payment'

/**
 * Cupom de desconto do checkout.
 * `baseTotal` é o valor sobre o qual o desconto incide — o total do carrinho
 * no checkout padrão, o subtotal do funil (produto + bumps) no checkout direto.
 */
export function useCoupon(baseTotal: Ref<number>, cpf: () => string) {
  const { $fetch: apiFetch } = useApi()

  const code = ref('')
  const show = ref(false)
  const validating = ref(false)
  const error = ref('')
  const applied = ref<AppliedCoupon | null>(null)

  async function apply() {
    const normalized = code.value.trim().toUpperCase()
    if (!normalized) return
    error.value = ''
    validating.value = true
    try {
      const result = await apiFetch<{ code: string; discountType: string; discountValue: number }>(
        '/api/coupons/validate',
        {
          method: 'POST',
          body: JSON.stringify({
            code: normalized,
            cpf: onlyDigits(cpf()),
            orderTotal: String(baseTotal.value),
          }),
        },
      )

      let discountAmount: number
      if (result.discountType === 'PERCENTAGE') {
        discountAmount = Math.round(baseTotal.value * result.discountValue) / 100
      } else {
        discountAmount = result.discountValue
      }
      discountAmount = Math.min(discountAmount, baseTotal.value)

      applied.value = {
        code: result.code,
        discountType: result.discountType,
        discountValue: result.discountValue,
        discountAmount,
      }
    } catch (e: any) {
      error.value = e?.data?.error || e?.data?.message || 'Cupom inválido ou expirado.'
    } finally {
      validating.value = false
    }
  }

  function remove() {
    applied.value = null
    code.value = ''
    error.value = ''
  }

  /** Total já com o desconto aplicado, nunca negativo. */
  const total = computed(() => {
    if (!applied.value) return baseTotal.value
    return Math.max(0, baseTotal.value - applied.value.discountAmount)
  })

  return { code, show, validating, error, applied, total, apply, remove }
}
