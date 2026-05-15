<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6">

    <!-- Carrinho vazio -->
    <div v-if="cart.items.length === 0 && !paymentResult" class="text-center py-20">
      <p class="text-steel mb-4">Seu carrinho está vazio.</p>
      <NuxtLink to="/loja" class="btn-primary">Ir para a loja</NuxtLink>
    </div>

    <!-- Resultado: Aprovado -->
    <div v-else-if="paymentResult?.status === 'approved'" class="max-w-lg mx-auto text-center py-20">
      <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <i class="pi pi-check text-3xl text-green-600" />
      </div>
      <h2 class="font-serif text-3xl text-teal mb-3">Pagamento Aprovado!</h2>
      <p class="text-steel mb-2">
        Pedido <span class="font-semibold text-teal">#{{ paymentResult.orderId }}</span> confirmado.
      </p>
      <p class="text-primary-300 text-sm mb-8">Você receberá os materiais em PDF por email em breve.</p>
      <NuxtLink to="/loja" class="btn-primary">Continuar Comprando</NuxtLink>
    </div>

    <!-- Resultado: Pix pendente (QR Code) -->
    <div v-else-if="paymentResult?.pixQrCode && !pixConfirmed" class="max-w-lg mx-auto text-center py-4">
      <div class="flex items-center justify-center gap-2 text-green-600 bg-green-50 border border-green-100 rounded-full px-4 py-2 w-fit mx-auto mb-5">
        <svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
        <span class="text-xs font-medium text-green-700">Pagamento seguro por</span>
        <img src="/images/mercadopago-logo.svg" alt="Mercado Pago" class="h-6 opacity-80" />
      </div>

      <h2 class="font-serif text-2xl text-teal mb-2">Pague com Pix</h2>
      <p class="text-steel text-sm mb-6">Pedido <span class="font-semibold text-teal">#{{ paymentResult.orderId }}</span></p>

      <div v-if="paymentResult.pixQrCodeBase64" class="mb-6">
        <img :src="'data:image/png;base64,' + paymentResult.pixQrCodeBase64" alt="QR Code Pix" class="w-56 h-56 mx-auto rounded-xl border border-sand-200 p-2" />
      </div>

      <div class="bg-sand-100 rounded-xl p-4 mb-4">
        <p class="text-xs text-steel mb-2">Ou copie o código Pix:</p>
        <div class="flex gap-2">
          <input
            :value="paymentResult.pixQrCode"
            readonly
            class="flex-1 text-xs bg-white border border-sand-200 rounded-lg px-3 py-2 truncate"
          />
          <button @click="copyPixCode" class="btn-primary text-xs px-4">
            {{ copied ? 'Copiado!' : 'Copiar' }}
          </button>
        </div>
      </div>

      <div class="flex items-center justify-center gap-2 text-xs text-steel">
        <i class="pi pi-spin pi-spinner text-teal" />
        <span>Aguardando confirmação do pagamento...</span>
      </div>
    </div>

    <!-- Resultado: Pix confirmado -->
    <div v-else-if="pixConfirmed" class="max-w-lg mx-auto text-center py-20">
      <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <i class="pi pi-check text-3xl text-green-600" />
      </div>
      <h2 class="font-serif text-3xl text-teal mb-3">Pagamento Confirmado!</h2>
      <p class="text-steel mb-2">
        Pedido <span class="font-semibold text-teal">#{{ paymentResult.orderId }}</span> confirmado.
      </p>
      <p class="text-primary-300 text-sm mb-4">Você receberá os materiais por email em breve.</p>
      <p class="text-xs text-steel">Redirecionando em {{ redirectCountdown }}s...</p>
    </div>

    <!-- Resultado: Rejeitado -->
    <div v-else-if="paymentResult?.status === 'rejected'" class="max-w-lg mx-auto text-center py-20">
      <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <i class="pi pi-times text-3xl text-red-600" />
      </div>
      <h2 class="font-serif text-3xl text-teal mb-3">Pagamento não aprovado</h2>
      <p class="text-steel mb-8">{{ getStatusMessage(paymentResult.statusDetail) }}</p>
      <button @click="paymentResult = null" class="btn-primary">Tentar novamente</button>
    </div>

    <!-- Formulário de checkout -->
    <div v-else>
      <h1 class="font-serif text-2xl text-teal text-center mb-8">Finalizar Compra</h1>

      <div class="grid lg:grid-cols-5 gap-8">

        <!-- Bloco 1: Dados do cliente -->
        <div class="lg:col-span-3 space-y-6">

          <!-- Dados do cliente -->
          <div class="bg-white rounded-2xl shadow-sm border border-sand-200 p-6">
            <div class="flex items-center justify-between mb-5">
              <h2 class="font-serif text-lg text-teal">Dados Pessoais</h2>
              <div class="flex items-center gap-1.5 text-green-600 bg-green-50 border border-green-100 rounded-full px-3 py-1">
                <svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
                <img src="/images/mercadopago-logo.svg" alt="Mercado Pago" class="h-5 opacity-80" />
              </div>
            </div>
            <div class="grid sm:grid-cols-2 gap-4">
              <div class="sm:col-span-2">
                <label class="checkout-label">Nome completo *</label>
                <input v-model="form.name" type="text" class="checkout-input" placeholder="Seu nome completo" />
              </div>
              <div>
                <label class="checkout-label">Email *</label>
                <input v-model="form.email" type="email" class="checkout-input" placeholder="seu@email.com" @blur="onEmailBlur" />
                <p class="text-xs text-steel mt-1">Os materiais serão enviados para este email.</p>
              </div>
              <div>
                <label class="checkout-label">Telefone</label>
                <div class="flex">
                  <span class="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-sand-200 bg-sand-100 text-steel text-sm select-none">+55</span>
                  <input v-model="form.phone" type="tel" class="checkout-input !rounded-l-none" placeholder="(00) 00000-0000" maxlength="15" @input="maskPhone" />
                </div>
              </div>
              <div class="sm:col-span-2">
                <label class="checkout-label">CPF *</label>
                <input
                  v-model="form.cpf"
                  type="text"
                  :class="['checkout-input', cpfError ? 'border-red-400 focus:ring-red-300 focus:border-red-400' : '']"
                  placeholder="000.000.000-00"
                  maxlength="14"
                  @input="maskCpf"
                  @blur="validateCpf"
                />
                <p v-if="cpfError" class="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <i class="pi pi-exclamation-circle" /> CPF inválido. Verifique o número digitado.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Resumo do pedido: mobile=após dados, desktop=coluna direita cobrindo as 2 linhas -->
        <div class="lg:col-span-2 lg:row-span-2">
          <div class="bg-white rounded-2xl shadow-sm border border-sand-200 p-6 lg:sticky lg:top-6">
            <h2 class="font-serif text-lg text-teal mb-5">Seu Pedido</h2>
            <div class="flex justify-between text-xs font-medium text-steel uppercase tracking-wide pb-2 border-b border-sand-200">
              <span>Produto</span>
              <span>Subtotal</span>
            </div>
            <div class="divide-y divide-sand-100">
              <div v-for="item in cart.items" :key="item.product.id" class="flex justify-between gap-3 py-3">
                <div class="min-w-0">
                  <p class="text-sm text-primary-800">{{ item.product.name }}</p>
                  <p class="text-xs text-steel">Qtd: {{ item.quantity }}</p>
                </div>
                <span class="text-sm font-medium text-primary-800 flex-shrink-0">
                  {{ formatPrice(item.product.price * item.quantity) }}
                </span>
              </div>
            </div>
            <div class="border-t border-sand-200 mt-2 pt-4 space-y-2">
              <div v-if="appliedCoupon" class="flex justify-between items-center text-sm">
                <span class="text-steel">Subtotal</span>
                <span class="text-primary-800">{{ formatPrice(cart.total) }}</span>
              </div>
              <div v-if="appliedCoupon" class="flex justify-between items-start text-sm">
                <p class="text-green-600">Cupom {{ appliedCoupon.code }}</p>
                <span class="text-green-600 font-medium shrink-0 ml-2">-{{ formatPrice(appliedCoupon.discountAmount) }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="font-serif text-teal text-lg">Total</span>
                <span class="text-2xl font-bold text-coral">{{ formatPrice(finalTotal) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Bloco 2: Pagamento + Botão -->
        <div class="lg:col-span-3 space-y-6">

          <!-- Pagamento -->
          <div class="bg-white rounded-2xl shadow-sm border border-sand-200 p-6">
            <div class="flex items-center justify-between mb-5">
              <h2 class="font-serif text-lg text-teal">Pagamento</h2>
              <div class="flex items-center gap-1.5 text-green-600 bg-green-50 border border-green-100 rounded-full px-3 py-1">
                <svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
                <img src="/images/mercadopago-logo.svg" alt="Mercado Pago" class="h-5 opacity-80" />
              </div>
            </div>

            <!-- Tabs -->
            <div class="flex border border-sand-200 rounded-xl overflow-hidden mb-6">
              <button
                @click="paymentMethod = 'pix'"
                :class="['flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors', paymentMethod === 'pix' ? 'bg-teal text-white' : 'bg-white text-primary-700 hover:bg-sand-100']"
              >
                <i class="pi pi-qrcode" />
                Pix
              </button>
              <button
                @click="paymentMethod = 'credit_card'"
                :class="['flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors', paymentMethod === 'credit_card' ? 'bg-teal text-white' : 'bg-white text-primary-700 hover:bg-sand-100']"
              >
                <i class="pi pi-credit-card" />
                Cartão de crédito
              </button>
            </div>

            <!-- Pix -->
            <div v-show="paymentMethod === 'pix'" class="text-center py-6">
              <div class="w-16 h-16 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="pi pi-qrcode text-3xl text-teal" />
              </div>
              <p class="text-primary-800 font-medium mb-1">Pague de forma segura e instantânea</p>
              <p class="text-steel text-sm">Ao confirmar a compra, vamos gerar o código Pix para pagamento.</p>
            </div>

            <!-- Cartão de crédito -->
            <div v-show="paymentMethod === 'credit_card'" class="space-y-4">
              <div>
                <label class="checkout-label">Número do cartão</label>
                <div id="mp-card-number" class="mp-field" />
              </div>
              <div>
                <label class="checkout-label">Nome do titular como aparece no cartão</label>
                <input v-model="card.holderName" type="text" class="checkout-input" placeholder="Ex.: Maria Santos Pereira" />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="checkout-label">Vencimento</label>
                  <div id="mp-expiration-date" class="mp-field" />
                </div>
                <div>
                  <label class="checkout-label">Código de segurança</label>
                  <div id="mp-security-code" class="mp-field" />
                </div>
              </div>
              <div>
                <label class="checkout-label">Parcelas</label>
                <select v-model="card.installments" class="checkout-input">
                  <option v-for="opt in installmentOptions" :key="opt.installments" :value="opt.installments">
                    {{ opt.installments }}x de {{ formatPrice(opt.installment_amount) }}
                    {{ opt.installments > 1 ? `(Total: ${formatPrice(opt.total_amount)})` : '' }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Cupom colapsável -->
            <div class="border-t border-sand-100 mt-5 pt-4">
              <div v-if="appliedCoupon" class="text-sm">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-green-600 flex items-center gap-1.5 font-medium">
                    <i class="pi pi-check-circle text-xs" />
                    Cupom <strong>{{ appliedCoupon.code }}</strong>
                  </span>
                  <button @click="removeCoupon" class="text-xs text-red-400 hover:text-red-600 underline shrink-0">Remover</button>
                </div>
                <p class="text-green-600 text-xs mt-0.5 ml-4">
                  {{ appliedCoupon.discountType === 'PERCENTAGE' ? appliedCoupon.discountValue + '% de desconto' : 'R$ ' + appliedCoupon.discountAmount.toFixed(2) + ' de desconto' }}
                </p>
              </div>
              <template v-else>
                <button
                  v-if="!showCoupon"
                  @click="showCoupon = true"
                  class="text-xs text-steel hover:text-teal transition-colors underline"
                >
                  Tem um cupom de desconto?
                </button>
                <div v-else class="flex gap-2">
                  <input
                    v-model="couponCode"
                    type="text"
                    autofocus
                    class="checkout-input flex-1 !uppercase font-mono"
                    placeholder="Digite seu cupom"
                    @keyup.enter="applyCoupon"
                  />
                  <button
                    @click="applyCoupon"
                    :disabled="!couponCode.trim() || validatingCoupon"
                    class="px-4 py-2.5 text-sm font-medium text-teal border border-teal rounded-lg hover:bg-teal/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap inline-flex items-center gap-2"
                  >
                    <i v-if="validatingCoupon" class="pi pi-spin pi-spinner text-xs" />
                    Aplicar
                  </button>
                </div>
                <p v-if="couponError" class="text-red-500 text-xs mt-1.5">
                  <i class="pi pi-exclamation-circle mr-1" />{{ couponError }}
                </p>
              </template>
            </div>
          </div>

          <!-- Botão -->
          <button
            @click="submitPayment"
            :disabled="submitting || !isFormValid"
            class="w-full bg-teal text-white font-medium py-4 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-teal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i v-if="submitting" class="pi pi-spin pi-spinner" />
            <i v-else class="pi pi-lock" />
            {{ submitting ? 'Processando...' : `Finalizar Compra  ${formatPrice(finalTotal)}` }}
          </button>

          <CheckoutTrustBar />

          <p v-if="error" class="text-red-500 text-sm text-center">
            <i class="pi pi-exclamation-circle mr-1" /> {{ error }}
          </p>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'checkout' })

const config = useRuntimeConfig()
const auth = useAuthStore()
const cart = useCartStore()
const { $fetch: apiFetch } = useApi()

const form = reactive({
  name: auth.user?.name || '',
  email: auth.user?.email || '',
  phone: '',
  cpf: '',
})

const card = reactive({
  holderName: '',
  installments: 1,
})

const paymentMethod = ref('pix')
const submitting = ref(false)
const error = ref('')
const paymentResult = ref<any>(null)
const copied = ref(false)
const installmentOptions = ref<any[]>([{ installments: 1, installment_amount: cart.total, total_amount: cart.total }])

const couponCode = ref('')
const showCoupon = ref(false)
const validatingCoupon = ref(false)
const couponError = ref('')
const appliedCoupon = ref<{ code: string; discountType: string; discountValue: number; discountAmount: number } | null>(null)

const pixConfirmed = ref(false)
const redirectCountdown = ref(5)
const recoveryToken = ref<string | null>((useRoute().query.recover as string) || null)
let pollInterval: ReturnType<typeof setInterval> | null = null
let countdownInterval: ReturnType<typeof setInterval> | null = null

const finalTotal = computed(() => {
  if (!appliedCoupon.value) return cart.total
  return Math.max(0, cart.total - appliedCoupon.value.discountAmount)
})

let mpInstance: any = null
let cardNumberField: any = null

const cpfError = ref(false)

function isValidCpf(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '')
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

function validateCpf() {
  const digits = form.cpf.replace(/\D/g, '')
  cpfError.value = digits.length === 11 && !isValidCpf(form.cpf)
}

const isFormValid = computed(() => {
  const base = form.name.trim().length > 0 && form.email.includes('@') && isValidCpf(form.cpf)
  if (paymentMethod.value === 'credit_card') {
    return base && card.holderName.trim().length > 0
  }
  return base
})

function formatPrice(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function maskCpf(e: Event) {
  const input = e.target as HTMLInputElement
  let v = input.value.replace(/\D/g, '').slice(0, 11)
  if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, '$1.$2.$3-$4')
  else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3')
  else if (v.length > 3) v = v.replace(/(\d{3})(\d+)/, '$1.$2')
  form.cpf = v
}

function maskPhone(e: Event) {
  const input = e.target as HTMLInputElement
  let v = input.value.replace(/\D/g, '').slice(0, 11)
  if (v.length > 6) v = v.replace(/(\d{2})(\d{5})(\d+)/, '($1) $2-$3')
  else if (v.length > 2) v = v.replace(/(\d{2})(\d+)/, '($1) $2')
  form.phone = v
}

async function copyPixCode() {
  if (paymentResult.value?.pixQrCode) {
    const { copy } = useClipboard()
    await copy(paymentResult.value.pixQrCode)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  }
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
      const destination = auth.token ? '/minha-conta/materiais' : '/loja'
      navigateTo(destination)
    }
  }, 1000)
}

onUnmounted(() => {
  stopPixPolling()
  if (countdownInterval) clearInterval(countdownInterval)
})

onMounted(async () => {
  if (recoveryToken.value) {
    try {
      const recovered = await apiFetch<any>(`/api/orders/recover/${recoveryToken.value}`)
      // Sempre pré-preenche o formulário, independente de o carrinho já ter itens
      if (recovered.name) form.name = recovered.name
      if (recovered.email) form.email = recovered.email
      if (recovered.phone) form.phone = recovered.phone
      if (recovered.cpf) form.cpf = recovered.cpf
      // Só popula o carrinho se estiver vazio (acesso direto à URL, sem passar pela página /recuperar/)
      if (cart.items.length === 0 && recovered.items?.length) {
        for (const item of recovered.items) {
          cart.add({ id: item.productId, name: item.productName, price: item.unitPrice } as any, item.quantity)
        }
        await nextTick()
      }
      if (recovered.couponCode) {
        couponCode.value = recovered.couponCode
        showCoupon.value = true
        await applyCoupon()
      }
    } catch (_) {}
  }

  if (cart.items.length === 0) return

  const { initiateCheckout } = useTracking()
  initiateCheckout(cart.total, cart.items.map(i => ({
    id: i.product.id, name: i.product.name, price: i.product.price, quantity: i.quantity,
  })))

  try {
    const { loadMercadoPago } = await import('@mercadopago/sdk-js')
    await loadMercadoPago()
    mpInstance = new (window as any).MercadoPago(config.public.mercadoPagoPublicKey, { locale: 'pt-BR' })

    const fieldStyle = {
      height: '40px',
      'font-size': '14px',
      'font-family': 'inherit',
      padding: '0 12px',
    }

    cardNumberField = mpInstance.fields.create('cardNumber', {
      placeholder: '1234 1234 1234 1234',
      style: fieldStyle,
    }).mount('mp-card-number')

    mpInstance.fields.create('expirationDate', {
      placeholder: 'MM/AA',
      style: fieldStyle,
    }).mount('mp-expiration-date')

    mpInstance.fields.create('securityCode', {
      placeholder: 'CVV',
      style: fieldStyle,
    }).mount('mp-security-code')

    cardNumberField.on('binChange', async (data: any) => {
      if (data.bin && data.bin.length >= 6) {
        try {
          const result = await mpInstance.getInstallments({
            amount: String(finalTotal.value),
            bin: data.bin,
          })
          if (result && result[0]?.payer_costs) {
            installmentOptions.value = result[0].payer_costs
            card.installments = 1
          }
        } catch (_) {}
      }
    })
  } catch (e) {
    console.error('Erro ao inicializar MercadoPago:', e)
    error.value = 'Erro ao carregar formulário de pagamento.'
  }
})

async function onEmailBlur() {
  if (!form.email.includes('@') || cart.items.length === 0) return
  try {
    const result = await apiFetch<{ recoveryToken: string }>('/api/orders/save-cart', {
      method: 'POST',
      body: JSON.stringify({
        email: form.email,
        name: form.name || null,
        phone: form.phone || null,
        cpf: form.cpf || null,
        items: cart.items.map(i => ({ productId: i.product.id, quantity: i.quantity })),
        couponCode: appliedCoupon.value?.code || null,
        funnelSlug: null,
      }),
    })
    recoveryToken.value = result.recoveryToken
  } catch (_) {}
}

async function applyCoupon() {
  const code = couponCode.value.trim().toUpperCase()
  if (!code) return
  couponError.value = ''
  validatingCoupon.value = true
  try {
    const result = await apiFetch<{ code: string; discountType: string; discountValue: number }>('/api/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, cpf: form.cpf.replace(/\D/g, ''), orderTotal: String(cart.total) }),
    })
    let discountAmount: number
    if (result.discountType === 'PERCENTAGE') {
      discountAmount = Math.round(cart.total * result.discountValue) / 100
    } else {
      discountAmount = result.discountValue
    }
    discountAmount = Math.min(discountAmount, cart.total)
    appliedCoupon.value = { code: result.code, discountType: result.discountType, discountValue: result.discountValue, discountAmount }
  } catch (e: any) {
    couponError.value = e?.data?.error || e?.data?.message || 'Cupom inválido ou expirado.'
  } finally {
    validatingCoupon.value = false
  }
}

function removeCoupon() {
  appliedCoupon.value = null
  couponCode.value = ''
  couponError.value = ''
}

async function submitPayment() {
  error.value = ''
  submitting.value = true

  try {
    if (paymentMethod.value === 'credit_card') {
      await submitCardPayment()
    } else {
      await submitPixPayment()
    }
  } catch (e: any) {
    error.value = e?.data?.message || e?.data?.error || e?.message || 'Erro ao processar pagamento.'
  } finally {
    submitting.value = false
  }
}

async function submitCardPayment() {
  const token = await mpInstance.fields.createCardToken({
    cardholderName: card.holderName,
    identificationType: 'CPF',
    identificationNumber: form.cpf.replace(/\D/g, ''),
  })

  if (!token?.id) {
    error.value = 'Erro ao processar dados do cartão. Verifique e tente novamente.'
    return
  }

  const paymentMethods = await mpInstance.getPaymentMethods({ bin: token.first_six_digits })
  const pm = paymentMethods?.results?.[0]

  const body = {
    items: cart.items.map(i => ({ productId: i.product.id, quantity: i.quantity })),
    customerName: form.name,
    customerEmail: form.email,
    customerPhone: form.phone || null,
    customerCpf: form.cpf.replace(/\D/g, ''),
    paymentType: 'credit_card',
    token: token.id,
    payment_method_id: pm?.id || 'visa',
    issuer_id: String(token.issuer?.id || pm?.issuer?.default_card_id || '24'),
    installments: card.installments,
    transaction_amount: finalTotal.value,
    couponCode: appliedCoupon.value?.code || null,
    recoveryToken: recoveryToken.value || null,
  }

  const response = await apiFetch<any>('/api/orders/checkout', {
    method: 'POST',
    body: JSON.stringify(body),
  })

  paymentResult.value = response
  cart.clear()
}

async function submitPixPayment() {
  const body = {
    items: cart.items.map(i => ({ productId: i.product.id, quantity: i.quantity })),
    customerName: form.name,
    customerEmail: form.email,
    customerPhone: form.phone || null,
    customerCpf: form.cpf.replace(/\D/g, ''),
    paymentType: 'pix',
    transaction_amount: finalTotal.value,
    couponCode: appliedCoupon.value?.code || null,
    recoveryToken: recoveryToken.value || null,
  }

  const response = await apiFetch<any>('/api/orders/checkout', {
    method: 'POST',
    body: JSON.stringify(body),
  })

  paymentResult.value = response
  cart.clear()
  if (response.pixQrCode && response.orderId) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    startPixPolling(response.orderId)
  }
}

function getStatusMessage(detail: string): string {
  const messages: Record<string, string> = {
    cc_rejected_bad_filled_card_number: 'Número do cartão incorreto.',
    cc_rejected_bad_filled_date: 'Data de validade incorreta.',
    cc_rejected_bad_filled_other: 'Dados do cartão incorretos.',
    cc_rejected_bad_filled_security_code: 'Código de segurança incorreto.',
    cc_rejected_call_for_authorize: 'Autorize o pagamento junto ao seu banco.',
    cc_rejected_card_disabled: 'Cartão desabilitado. Contate seu banco.',
    cc_rejected_duplicated_payment: 'Pagamento duplicado.',
    cc_rejected_high_risk: 'Pagamento recusado por segurança.',
    cc_rejected_insufficient_amount: 'Saldo insuficiente.',
    cc_rejected_max_attempts: 'Limite de tentativas atingido.',
    cc_rejected_other_reason: 'Pagamento não processado.',
  }
  return messages[detail] || 'Pagamento não aprovado. Tente novamente com outro método.'
}
</script>

<style scoped>
.checkout-label {
  @apply block text-sm font-medium text-primary-700 mb-1;
}
.checkout-input {
  @apply w-full border border-sand-200 rounded-lg px-4 py-2.5 text-primary-800
         focus:outline-none focus:ring-2 focus:ring-coral/40 focus:border-coral/40
         placeholder:text-primary-300 transition-all;
}
.mp-field {
  @apply border border-sand-200 rounded-lg overflow-hidden;
  height: 42px;
}
.mp-field :deep(iframe) {
  height: 40px !important;
  min-height: 40px !important;
}
.mp-field :deep(div) {
  height: 40px !important;
}
</style>
