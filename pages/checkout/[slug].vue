<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6">

    <!-- Loading -->
    <div v-if="loadingFunnel" class="flex items-center justify-center py-20">
      <i class="pi pi-spin pi-spinner text-3xl text-teal" />
    </div>

    <!-- Funnel not found -->
    <div v-else-if="!funnel" class="text-center py-20">
      <p class="text-steel mb-4">Checkout nao encontrado.</p>
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
      <p class="text-primary-300 text-sm mb-8">Voce recebera os materiais por email em breve.</p>
      <NuxtLink to="/loja" class="btn-primary">Continuar Comprando</NuxtLink>
    </div>

    <!-- Resultado: Pix pendente -->
    <div v-else-if="paymentResult?.pixQrCode && !pixConfirmed" class="max-w-lg mx-auto text-center py-12">
      <div class="w-16 h-16 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <i class="pi pi-qrcode text-3xl text-teal" />
      </div>
      <h2 class="font-serif text-2xl text-teal mb-2">Pague com Pix</h2>
      <p class="text-steel text-sm mb-6">Pedido <span class="font-semibold text-teal">#{{ paymentResult.orderId }}</span></p>

      <div v-if="paymentResult.pixQrCodeBase64" class="mb-6">
        <img :src="'data:image/png;base64,' + paymentResult.pixQrCodeBase64" alt="QR Code Pix" class="w-56 h-56 mx-auto rounded-xl border border-sand-200 p-2" />
      </div>

      <div class="bg-sand-100 rounded-xl p-4 mb-4">
        <p class="text-xs text-steel mb-2">Ou copie o codigo Pix:</p>
        <div class="flex gap-2">
          <input :value="paymentResult.pixQrCode" readonly class="flex-1 text-xs bg-white border border-sand-200 rounded-lg px-3 py-2 truncate" />
          <button @click="copyPixCode" class="btn-primary text-xs px-4">
            {{ copied ? 'Copiado!' : 'Copiar' }}
          </button>
        </div>
      </div>
      <div class="flex items-center justify-center gap-2 text-xs text-steel">
        <i class="pi pi-spin pi-spinner text-teal" />
        <span>Aguardando confirmacao do pagamento...</span>
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
      <p class="text-primary-300 text-sm mb-4">Voce recebera os materiais por email em breve.</p>
      <p class="text-xs text-steel">Redirecionando em {{ redirectCountdown }}s...</p>
    </div>

    <!-- Resultado: Rejeitado -->
    <div v-else-if="paymentResult?.status === 'rejected'" class="max-w-lg mx-auto text-center py-20">
      <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <i class="pi pi-times text-3xl text-red-600" />
      </div>
      <h2 class="font-serif text-3xl text-teal mb-3">Pagamento nao aprovado</h2>
      <p class="text-steel mb-8">{{ getStatusMessage(paymentResult.statusDetail) }}</p>
      <button @click="paymentResult = null" class="btn-primary">Tentar novamente</button>
    </div>

    <!-- Formulario de checkout do funil -->
    <div v-else>
      <!-- Headline -->
      <div v-if="funnel.headline" class="text-center mb-8">
        <h1 class="font-serif text-2xl sm:text-3xl text-teal">{{ funnel.headline }}</h1>
        <p v-if="funnel.description" class="text-steel mt-2 max-w-xl mx-auto text-sm">{{ funnel.description }}</p>
      </div>
      <h1 v-else class="font-serif text-2xl text-teal text-center mb-8">Finalizar Compra</h1>

      <div class="grid lg:grid-cols-5 gap-8">
        <!-- Coluna esquerda -->
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
                <div class="checkout-field">
                  <input v-model="form.name" type="text" id="f-name" class="checkout-input" placeholder=" " />
                  <label for="f-name">Nome completo *</label>
                </div>
              </div>
              <div>
                <div class="checkout-field">
                  <input v-model="form.email" type="email" id="f-email" class="checkout-input" placeholder=" " />
                  <label for="f-email">Email *</label>
                </div>
                <p class="text-xs text-steel mt-1">Os materiais serao enviados para este email.</p>
              </div>
              <div>
                <div class="flex">
                  <span class="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-sand-200 bg-sand-100 text-steel text-sm select-none">+55</span>
                  <div class="checkout-field flex-1">
                    <input v-model="form.phone" type="tel" id="f-phone" class="checkout-input !rounded-l-none" placeholder=" " maxlength="15" @input="maskPhone" />
                    <label for="f-phone">Telefone</label>
                  </div>
                </div>
              </div>
              <div class="sm:col-span-2">
                <div class="checkout-field">
                  <input v-model="form.cpf" type="text" id="f-cpf" class="checkout-input" placeholder=" " maxlength="14" @input="maskCpf" />
                  <label for="f-cpf">CPF *</label>
                </div>
              </div>
            </div>
          </div>

          <!-- Order bumps -->
          <div v-if="funnel.bumps.length > 0" class="space-y-3">
            <div
              v-for="bump in funnel.bumps"
              :key="bump.id"
              @click="toggleBump(bump.id)"
              class="bg-white rounded-2xl shadow-sm border-2 p-4 cursor-pointer transition-all"
              :class="selectedBumps.has(bump.id) ? 'border-coral bg-coral/5' : 'border-sand-200 hover:border-salmon/50'"
            >
              <div class="flex items-center gap-4">
                <div class="flex-shrink-0">
                  <div
                    class="w-6 h-6 rounded border-2 flex items-center justify-center transition-colors"
                    :class="selectedBumps.has(bump.id) ? 'bg-coral border-coral' : 'border-gray-300'"
                  >
                    <i v-if="selectedBumps.has(bump.id)" class="pi pi-check text-white text-xs" />
                  </div>
                </div>
                <img
                  v-if="bump.productImageUrl"
                  :src="imgUrl(bump.productImageUrl)"
                  loading="lazy"
                  class="w-14 h-14 rounded-lg object-cover flex-shrink-0 hidden sm:block"
                />
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-primary-800 text-sm">{{ bump.customTitle || bump.productName }}</p>
                  <div v-if="bump.description" class="text-xs text-steel mt-0.5 leading-relaxed" v-html="bump.description" />
                  <div class="flex items-center gap-2 mt-1">
                    <span class="text-xs text-steel line-through">{{ formatPrice(bump.originalPrice) }}</span>
                    <span class="text-sm font-bold text-coral">{{ formatPrice(bump.funnelPrice) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagamento -->
          <div class="bg-white rounded-2xl shadow-sm border border-sand-200 p-6">
            <div class="flex items-center justify-between mb-5">
              <h2 class="font-serif text-lg text-teal">Pagamento</h2>
              <div class="flex items-center gap-1.5 text-green-600 bg-green-50 border border-green-100 rounded-full px-3 py-1">
                <svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
                <img src="/images/mercadopago-logo.svg" alt="Mercado Pago" class="h-5 opacity-80" />
              </div>
            </div>

            <div class="flex border border-sand-200 rounded-xl overflow-hidden mb-6">
              <button
                @click="paymentMethod = 'pix'"
                :class="['flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors', paymentMethod === 'pix' ? 'bg-teal text-white' : 'bg-white text-primary-700 hover:bg-sand-100']"
              >
                <i class="pi pi-qrcode" /> Pix
              </button>
              <button
                @click="paymentMethod = 'credit_card'"
                :class="['flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors', paymentMethod === 'credit_card' ? 'bg-teal text-white' : 'bg-white text-primary-700 hover:bg-sand-100']"
              >
                <i class="pi pi-credit-card" /> Cartao
              </button>
            </div>

            <div v-show="paymentMethod === 'pix'" class="text-center py-6">
              <div class="w-16 h-16 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="pi pi-qrcode text-3xl text-teal" />
              </div>
              <p class="text-primary-800 font-medium mb-1">Pague de forma segura e instantanea</p>
              <p class="text-steel text-sm">Ao confirmar, vamos gerar o codigo Pix para pagamento.</p>
            </div>

            <div v-show="paymentMethod === 'credit_card'" class="space-y-4">
              <div id="mp-card-number" class="mp-field" />
              <div class="checkout-field">
                <input v-model="card.holderName" type="text" id="f-holder" class="checkout-input" placeholder=" " />
                <label for="f-holder">Nome do titular como aparece no cartão</label>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div id="mp-expiration-date" class="mp-field" />
                <div id="mp-security-code" class="mp-field" />
              </div>
              <div class="checkout-field">
                <select v-model="card.installments" id="f-inst" class="checkout-input">
                  <option v-for="opt in installmentOptions" :key="opt.installments" :value="opt.installments">
                    {{ opt.installments }}x de {{ formatPrice(opt.installment_amount) }}
                    {{ opt.installments > 1 ? `(Total: ${formatPrice(opt.total_amount)})` : '' }}
                  </option>
                </select>
                <label for="f-inst">Parcelas</label>
              </div>
            </div>

            <!-- Cupom colapsável -->
            <div class="border-t border-sand-100 mt-5 pt-4">
              <div v-if="appliedCoupon" class="flex items-center justify-between text-sm">
                <span class="text-green-600 flex items-center gap-1.5">
                  <i class="pi pi-check-circle text-xs" />
                  Cupom <strong>{{ appliedCoupon.code }}</strong> — {{ appliedCoupon.discountType === 'PERCENTAGE' ? appliedCoupon.discountValue + '% de desconto' : 'R$ ' + appliedCoupon.discountAmount.toFixed(2) + ' de desconto' }}
                </span>
                <button @click="removeCoupon" class="text-xs text-red-400 hover:text-red-600 underline ml-3 shrink-0">Remover</button>
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

          <!-- Botao -->
          <button
            @click="submitPayment"
            :disabled="submitting || !isFormValid"
            class="w-full bg-teal text-white font-medium py-4 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-teal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i v-if="submitting" class="pi pi-spin pi-spinner" />
            <i v-else class="pi pi-lock" />
            {{ submitting ? 'Processando...' : `Finalizar Compra  ${formatPrice(orderTotal)}` }}
          </button>

          <CheckoutTrustBar />

          <p v-if="error" class="text-red-500 text-sm text-center">
            <i class="pi pi-exclamation-circle mr-1" /> {{ error }}
          </p>
        </div>

        <!-- Coluna direita: resumo -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-2xl shadow-sm border border-sand-200 p-6 lg:sticky lg:top-6">
            <h2 class="font-serif text-lg text-teal mb-5">Seu Pedido</h2>
            <div class="flex justify-between text-xs font-medium text-steel uppercase tracking-wide pb-2 border-b border-sand-200">
              <span>Produto</span>
              <span>Valor</span>
            </div>
            <div class="divide-y divide-sand-100">
              <!-- Produto principal -->
              <div class="flex justify-between gap-3 py-3">
                <div class="flex items-center gap-3 min-w-0">
                  <img
                    v-if="funnel.product.imageUrl"
                    :src="imgUrl(funnel.product.imageUrl)"
                    loading="lazy"
                    class="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                  />
                  <div class="min-w-0">
                    <p class="text-sm text-primary-800 truncate">{{ funnel.product.name }}</p>
                    <p v-if="funnel.product.originalPrice !== funnel.product.funnelPrice" class="text-xs text-steel line-through">
                      {{ formatPrice(funnel.product.originalPrice) }}
                    </p>
                  </div>
                </div>
                <span class="text-sm font-medium text-primary-800 flex-shrink-0">
                  {{ formatPrice(funnel.product.funnelPrice) }}
                </span>
              </div>

              <!-- Bumps selecionados -->
              <div
                v-for="bump in selectedBumpsList"
                :key="bump.id"
                class="flex justify-between gap-3 py-3"
              >
                <div class="min-w-0">
                  <p class="text-sm text-primary-800 truncate">{{ bump.productName }}</p>
                  <span class="text-xs text-coral font-medium">Order bump</span>
                </div>
                <span class="text-sm font-medium text-primary-800 flex-shrink-0">
                  {{ formatPrice(bump.funnelPrice) }}
                </span>
              </div>
            </div>

            <div class="border-t border-sand-200 mt-2 pt-4 space-y-2">
              <div v-if="appliedCoupon" class="flex justify-between items-center text-sm">
                <span class="text-steel">Subtotal</span>
                <span class="text-primary-800">{{ formatPrice(subtotal) }}</span>
              </div>
              <div v-if="appliedCoupon" class="flex justify-between items-center text-sm">
                <span class="text-green-600">Desconto ({{ appliedCoupon.code }})</span>
                <span class="text-green-600 font-medium">-{{ formatPrice(appliedCoupon.discountAmount) }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="font-serif text-teal text-lg">Total</span>
                <span class="text-2xl font-bold text-coral">{{ formatPrice(orderTotal) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'checkout' })

interface BumpInfo {
  id: number
  productId: number
  productName: string
  productImageUrl: string | null
  originalPrice: number
  funnelPrice: number
  customTitle: string | null
  description: string | null
  sortOrder: number
}

interface FunnelData {
  id: number
  name: string
  slug: string
  active: boolean
  headline: string | null
  description: string | null
  product: {
    id: number
    name: string
    imageUrl: string | null
    originalPrice: number
    funnelPrice: number
  }
  bumps: BumpInfo[]
}

const route = useRoute()
const config = useRuntimeConfig()
const auth = useAuthStore()
const { $fetch: apiFetch } = useApi()

const funnel = ref<FunnelData | null>(null)
const loadingFunnel = ref(true)

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
const selectedBumps = reactive(new Set<number>())
const installmentOptions = ref<any[]>([])

const couponCode = ref('')
const showCoupon = ref(false)
const validatingCoupon = ref(false)
const couponError = ref('')
const appliedCoupon = ref<{ code: string; discountType: string; discountValue: number; discountAmount: number } | null>(null)

const pixConfirmed = ref(false)
const redirectCountdown = ref(5)
const recoveryToken = ref<string | null>((route.query.recover as string) || null)
let pollInterval: ReturnType<typeof setInterval> | null = null
let countdownInterval: ReturnType<typeof setInterval> | null = null

let mpInstance: any = null
let cardNumberField: any = null

const selectedBumpsList = computed(() =>
  funnel.value?.bumps.filter(b => selectedBumps.has(b.id)) || []
)

const subtotal = computed(() => {
  if (!funnel.value) return 0
  let total = funnel.value.product.funnelPrice
  for (const bump of selectedBumpsList.value) {
    total += bump.funnelPrice
  }
  return total
})

const orderTotal = computed(() => {
  const s = subtotal.value
  if (!appliedCoupon.value) return s
  return Math.max(0, s - appliedCoupon.value.discountAmount)
})

const isFormValid = computed(() => {
  const base = form.name.trim().length > 0 && form.email.includes('@') && form.cpf.replace(/\D/g, '').length === 11
  if (paymentMethod.value === 'credit_card') {
    return base && card.holderName.trim().length > 0
  }
  return base
})

function imgUrl(url: string) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${config.public.apiBase}${url}`
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function toggleBump(id: number) {
  if (selectedBumps.has(id)) {
    selectedBumps.delete(id)
  } else {
    selectedBumps.add(id)
  }
  updateInstallments()
}

function updateInstallments() {
  installmentOptions.value = [{ installments: 1, installment_amount: orderTotal.value, total_amount: orderTotal.value }]
  card.installments = 1
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
  try {
    const data = await apiFetch<FunnelData>(`/api/funnels/${route.params.slug}`)
    if (!data.active) {
      funnel.value = null
      return
    }
    funnel.value = data
    installmentOptions.value = [{ installments: 1, installment_amount: data.product.funnelPrice, total_amount: data.product.funnelPrice }]

    const { initiateCheckout } = useTracking()
    initiateCheckout(data.product.funnelPrice, [
      { id: data.product.id, name: data.product.name, price: data.product.funnelPrice, quantity: 1 },
    ])
  } catch {
    funnel.value = null
  } finally {
    loadingFunnel.value = false
  }

  if (recoveryToken.value) {
    try {
      const recovered = await apiFetch<any>(`/api/orders/recover/${recoveryToken.value}`)
      if (recovered.name) form.name = recovered.name
      if (recovered.email) form.email = recovered.email
      if (recovered.phone) form.phone = recovered.phone
      if (recovered.cpf) form.cpf = recovered.cpf
    } catch (_) {}
  }

  await nextTick()
  if (!funnel.value) return

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
            amount: String(orderTotal.value),
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
    error.value = 'Erro ao carregar formulario de pagamento.'
  }
})

async function applyCoupon() {
  const code = couponCode.value.trim().toUpperCase()
  if (!code) return
  couponError.value = ''
  validatingCoupon.value = true
  try {
    const result = await apiFetch<{ code: string; discountType: string; discountValue: number }>('/api/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, cpf: form.cpf.replace(/\D/g, ''), orderTotal: String(subtotal.value) }),
    })
    let discountAmount: number
    if (result.discountType === 'PERCENTAGE') {
      discountAmount = Math.round(subtotal.value * result.discountValue) / 100
    } else {
      discountAmount = result.discountValue
    }
    discountAmount = Math.min(discountAmount, subtotal.value)
    appliedCoupon.value = { code: result.code, discountType: result.discountType, discountValue: result.discountValue, discountAmount }
    updateInstallments()
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
  updateInstallments()
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

function buildItems() {
  const items = [{ productId: funnel.value!.product.id, quantity: 1, unitPrice: funnel.value!.product.funnelPrice }]
  for (const bump of selectedBumpsList.value) {
    items.push({ productId: bump.productId, quantity: 1, unitPrice: bump.funnelPrice })
  }
  return items
}

async function submitCardPayment() {
  const token = await mpInstance.fields.createCardToken({
    cardholderName: card.holderName,
    identificationType: 'CPF',
    identificationNumber: form.cpf.replace(/\D/g, ''),
  })

  if (!token?.id) {
    error.value = 'Erro ao processar dados do cartao. Verifique e tente novamente.'
    return
  }

  const paymentMethods = await mpInstance.getPaymentMethods({ bin: token.first_six_digits })
  const pm = paymentMethods?.results?.[0]

  const { getFbclid, getFbp } = useFbAttribution()

  const body = {
    items: buildItems(),
    customerName: form.name,
    customerEmail: form.email,
    customerPhone: form.phone || null,
    customerCpf: form.cpf.replace(/\D/g, ''),
    paymentType: 'credit_card',
    token: token.id,
    payment_method_id: pm?.id || 'visa',
    issuer_id: String(token.issuer?.id || pm?.issuer?.default_card_id || '24'),
    installments: card.installments,
    transaction_amount: orderTotal.value,
    couponCode: appliedCoupon.value?.code || null,
    recoveryToken: recoveryToken.value || null,
    fbclid: getFbclid(),
    fbp: getFbp(),
  }

  const response = await apiFetch<any>('/api/orders/checkout', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  paymentResult.value = response
}

async function submitPixPayment() {
  const { getFbclid, getFbp } = useFbAttribution()

  const body = {
    items: buildItems(),
    customerName: form.name,
    customerEmail: form.email,
    customerPhone: form.phone || null,
    customerCpf: form.cpf.replace(/\D/g, ''),
    paymentType: 'pix',
    transaction_amount: orderTotal.value,
    couponCode: appliedCoupon.value?.code || null,
    recoveryToken: recoveryToken.value || null,
    fbclid: getFbclid(),
    fbp: getFbp(),
  }

  const response = await apiFetch<any>('/api/orders/checkout', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  paymentResult.value = response
  if (response.pixQrCode && response.orderId) {
    startPixPolling(response.orderId)
  }
}

function getStatusMessage(detail: string): string {
  const messages: Record<string, string> = {
    cc_rejected_bad_filled_card_number: 'Numero do cartao incorreto.',
    cc_rejected_bad_filled_date: 'Data de validade incorreta.',
    cc_rejected_bad_filled_other: 'Dados do cartao incorretos.',
    cc_rejected_bad_filled_security_code: 'Codigo de seguranca incorreto.',
    cc_rejected_call_for_authorize: 'Autorize o pagamento junto ao seu banco.',
    cc_rejected_card_disabled: 'Cartao desabilitado. Contate seu banco.',
    cc_rejected_duplicated_payment: 'Pagamento duplicado.',
    cc_rejected_high_risk: 'Pagamento recusado por seguranca.',
    cc_rejected_insufficient_amount: 'Saldo insuficiente.',
    cc_rejected_max_attempts: 'Limite de tentativas atingido.',
    cc_rejected_other_reason: 'Pagamento nao processado.',
  }
  return messages[detail] || 'Pagamento nao aprovado. Tente novamente com outro metodo.'
}
</script>

<style scoped>
.checkout-field {
  @apply relative;
}
.checkout-field > label {
  @apply absolute left-4 text-sm text-primary-400 pointer-events-none transition-all duration-150;
  top: 50%;
  transform: translateY(-50%);
}
.checkout-field > input:focus ~ label,
.checkout-field > input:not(:placeholder-shown) ~ label,
.checkout-field > select ~ label {
  top: 10px;
  transform: none;
  @apply text-xs text-teal;
}
.checkout-input {
  @apply w-full border border-sand-200 rounded-lg px-4 pt-5 pb-2 text-primary-800
         focus:outline-none focus:ring-2 focus:ring-coral/40 focus:border-coral/40
         placeholder:text-transparent transition-all;
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
