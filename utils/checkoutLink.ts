/**
 * Link de compra: `/checkout?produto=5&qtd=2&cupom=PROMO10` (checkout da loja) e
 * `/checkout/meu-funil?cupom=PROMO10` (funil). Estas funções leem e limpam o que
 * vem na URL. O link só preenche campos: o preço e o desconto são sempre
 * recalculados e validados no servidor, na hora do pagamento.
 */

/** Primeiro valor de um parâmetro de query (a URL pode repetir o nome). */
function firstValue(raw: unknown): string {
  const value = Array.isArray(raw) ? raw[0] : raw
  return typeof value === 'string' ? value.trim() : ''
}

/** Id do produto: inteiro positivo, ou `null` se faltar ou não for número. */
export function parseProductParam(raw: unknown): number | null {
  const value = firstValue(raw)
  if (!/^\d{1,9}$/.test(value)) return null
  const id = Number(value)
  return id > 0 ? id : null
}

/** Quantidade: de 1 a 10; qualquer outra coisa vira 1. */
export function parseQuantityParam(raw: unknown): number {
  const value = firstValue(raw)
  if (!/^\d{1,3}$/.test(value)) return 1
  const qty = Number(value)
  return qty >= 1 && qty <= 10 ? qty : 1
}

/** Código do cupom em maiúsculas; vazio se não parecer um código (só letras, números, hífen e sublinhado). */
export function parseCouponParam(raw: unknown): string {
  const value = firstValue(raw)
  return /^[A-Za-z0-9_-]{2,40}$/.test(value) ? value.toUpperCase() : ''
}
