export function onlyDigits(value: string): string {
  return (value || '').replace(/\D/g, '')
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

/** Reais para centavos. O Stripe trabalha sempre na menor unidade da moeda. */
export function toMinorUnits(value: number): number {
  return Math.round(value * 100)
}

/** Valida CPF com os dois dígitos verificadores. */
export function isValidCpf(cpf: string): boolean {
  const digits = onlyDigits(cpf)
  if (digits.length !== 11) return false
  if (/^(\d)\1{10}$/.test(digits)) return false
  const calc = (factor: number) => {
    let sum = 0
    for (let i = 0; i < factor - 1; i++) sum += parseInt(digits[i]) * (factor - i)
    const rest = (sum * 10) % 11
    return rest >= 10 ? 0 : rest
  }
  return calc(10) === parseInt(digits[9]) && calc(11) === parseInt(digits[10])
}

export function maskCpf(value: string): string {
  let v = onlyDigits(value).slice(0, 11)
  if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, '$1.$2.$3-$4')
  else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3')
  else if (v.length > 3) v = v.replace(/(\d{3})(\d+)/, '$1.$2')
  return v
}

export function maskPhone(value: string): string {
  let v = onlyDigits(value).slice(0, 11)
  if (v.length > 6) v = v.replace(/(\d{2})(\d{5})(\d+)/, '($1) $2-$3')
  else if (v.length > 2) v = v.replace(/(\d{2})(\d+)/, '($1) $2')
  return v
}
