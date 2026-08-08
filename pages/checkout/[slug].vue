<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6">

    <!-- Loading -->
    <div v-if="loadingFunnel" class="flex items-center justify-center py-20">
      <i class="pi pi-spin pi-spinner text-3xl text-teal" />
    </div>

    <!-- Funnel not found -->
    <div v-else-if="!funnel" class="text-center py-20">
      <p class="text-steel mb-4">Checkout não encontrado.</p>
      <NuxtLink to="/loja" class="btn-primary">Ir para a loja</NuxtLink>
    </div>

    <!-- Resultado do pagamento -->
    <PaymentResult
      v-else-if="payment.showResult.value"
      :payment-result="payment.paymentResult.value"
      :pix-confirmed="payment.pixConfirmed.value"
      :redirect-countdown="payment.redirectCountdown.value"
      :copied="payment.copied.value"
      :is-failed="payment.isFailed.value"
      :pix-seconds-left="payment.pixSecondsLeft.value"
      :pix-expired="payment.pixExpired.value"
      :status-message="payment.statusMessage"
      delivery-notice="Você receberá os materiais por email em breve."
      @copy="payment.copyPixCode()"
      @retry="payment.reset()"
    />

    <!-- Checkout em manutenção -->
    <CheckoutMaintenanceNotice v-else-if="maintenance" :message="maintenanceMessage" />

    <!-- Formulario de checkout do funil -->
    <div v-else>
      <!-- Headline -->
      <div v-if="funnel.headline" class="text-center mb-8">
        <h1 class="font-serif text-2xl sm:text-3xl text-teal">{{ funnel.headline }}</h1>
        <p v-if="funnel.description" class="text-steel mt-2 max-w-xl mx-auto text-sm">{{ funnel.description }}</p>
      </div>
      <h1 v-else class="font-serif text-2xl text-teal text-center mb-8">Finalizar Compra</h1>

      <div class="grid lg:grid-cols-5 gap-8">

        <!-- Bloco 1: Dados + Bumps -->
        <div class="lg:col-span-3 space-y-6">

          <!-- Dados do cliente -->
          <div class="bg-white rounded-2xl shadow-sm border border-sand-200 p-6">
            <div class="flex items-center justify-between mb-5">
              <h2 class="font-serif text-lg text-teal">Dados Pessoais</h2>
              <CheckoutSecureBadge />
            </div>
            <div class="grid sm:grid-cols-2 gap-4">
              <div class="sm:col-span-2">
                <label class="checkout-label">Nome completo *</label>
                <input v-model="form.name" type="text" class="checkout-input" placeholder="Seu nome completo" />
              </div>
              <div>
                <label class="checkout-label">Email *</label>
                <input v-model="form.email" type="email" class="checkout-input" placeholder="seu@email.com" />
                <p class="text-xs text-steel mt-1">Os materiais serão enviados para este email.</p>
              </div>
              <div>
                <label class="checkout-label">Telefone</label>
                <div class="flex">
                  <span class="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-sand-200 bg-sand-100 text-steel text-sm select-none">+55</span>
                  <input v-model="form.phone" type="tel" class="checkout-input !rounded-l-none" placeholder="(00) 00000-0000" maxlength="15" />
                </div>
              </div>
              <div class="sm:col-span-2">
                <label class="checkout-label">CPF *</label>
                <input
                  v-model="form.cpf"
                  type="text"
                  inputmode="numeric"
                  :class="['checkout-input', cpfError ? 'border-red-400 focus:ring-red-300 focus:border-red-400' : '']"
                  placeholder="000.000.000-00"
                  maxlength="14"
                  @blur="validateCpf"
                />
                <p v-if="cpfError" class="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <i class="pi pi-exclamation-circle" /> CPF inválido. Verifique o número digitado.
                </p>
              </div>
            </div>
          </div>

          <!-- Order bumps -->
          <div v-if="funnel.bumps.length > 0" class="rounded-2xl border-2 border-coral/40 overflow-hidden shadow-sm">

            <!-- Cabeçalho chamativo -->
            <div class="bg-gradient-to-r from-coral/15 to-salmon/20 border-b border-coral/20 px-4 py-3.5 flex items-start gap-3">
              <span class="text-xl leading-none mt-0.5">📖</span>
              <div>
                <p class="text-sm font-semibold text-teal leading-snug">Aproveite para complementar o aprendizado</p>
              </div>
            </div>

            <!-- Cards dos bumps -->
            <div class="bg-white p-3 space-y-3">
              <div
                v-for="bump in funnel.bumps"
                :key="bump.id"
                @click="toggleBump(bump.id)"
                class="rounded-xl border-2 p-4 cursor-pointer transition-all"
                :class="selectedBumps.has(bump.id) ? 'border-coral bg-coral/5' : 'border-sand-200 hover:border-salmon/50 bg-white'"
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
          </div>
        </div>

        <!-- Resumo do pedido: mobile=após bumps, desktop=coluna direita cobrindo as 2 linhas -->
        <div class="lg:col-span-2 lg:row-span-2">
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
                </div>
                <span class="text-sm font-medium text-primary-800 flex-shrink-0">
                  {{ formatPrice(bump.funnelPrice) }}
                </span>
              </div>
            </div>

            <div class="border-t border-sand-200 mt-2 pt-4 space-y-2">
              <div v-if="coupon.applied.value" class="flex justify-between items-center text-sm">
                <span class="text-steel">Subtotal</span>
                <span class="text-primary-800">{{ formatPrice(subtotal) }}</span>
              </div>
              <div v-if="coupon.applied.value" class="flex justify-between items-start text-sm">
                <p class="text-green-600">Cupom {{ coupon.applied.value.code }}</p>
                <span class="text-green-600 font-medium shrink-0 ml-2">-{{ formatPrice(coupon.applied.value.discountAmount) }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="font-serif text-teal text-lg">Total</span>
                <span class="text-2xl font-bold text-coral">{{ formatPrice(orderTotal) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Bloco 2: Pagamento + Botão -->
        <div class="lg:col-span-3 space-y-6">
          <PaymentBox :payment="payment" :coupon="coupon" card-tab-label="Cartão" :card-enabled="cardEnabled" />

          <button
            @click="payment.submitPayment()"
            :disabled="payment.submitting.value || !payment.isFormValid.value"
            class="w-full bg-teal text-white font-medium py-4 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-teal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i v-if="payment.submitting.value" class="pi pi-spin pi-spinner" />
            <i v-else class="pi pi-lock" />
            {{ payment.submitting.value ? 'Processando...' : `Finalizar Compra  ${formatPrice(orderTotal)}` }}
          </button>

          <CheckoutTrustBar />

          <p v-if="payment.error.value" class="text-red-500 text-sm text-center">
            <i class="pi pi-exclamation-circle mr-1" /> {{ payment.error.value }}
          </p>
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
const { maintenance, maintenanceMessage, cardEnabled } = useCheckoutStatus()

const funnel = ref<FunnelData | null>(null)
const loadingFunnel = ref(true)
const selectedBumps = reactive(new Set<number>())

const form = reactive({
  name: auth.user?.name || '',
  email: auth.user?.email || '',
  phone: '',
  cpf: '',
})

const selectedBumpsList = computed(() =>
  funnel.value?.bumps.filter(b => selectedBumps.has(b.id)) || [],
)

const subtotal = computed(() => {
  if (!funnel.value) return 0
  let total = funnel.value.product.funnelPrice
  for (const bump of selectedBumpsList.value) {
    total += bump.funnelPrice
  }
  return total
})

const coupon = useCoupon(subtotal, () => form.cpf)
const orderTotal = coupon.total

const trackingItems = () => {
  if (!funnel.value) return []
  return [
    { id: funnel.value.product.id, name: funnel.value.product.name, price: funnel.value.product.funnelPrice, quantity: 1 },
    ...selectedBumpsList.value.map(b => ({ id: b.productId, name: b.productName, price: b.funnelPrice, quantity: 1 })),
  ]
}

const payment = usePayment({
  amount: orderTotal,
  buildItems: () => {
    if (!funnel.value) return []
    return [
      { productId: funnel.value.product.id, quantity: 1, unitPrice: funnel.value.product.funnelPrice },
      ...selectedBumpsList.value.map(b => ({ productId: b.productId, quantity: 1, unitPrice: b.funnelPrice })),
    ]
  },
  trackingItems,
  customer: form,
  couponCode: () => coupon.applied.value?.code || null,
  funnelSlug: route.params.slug as string,
  withFbAttribution: true,
  maintenance,
  maintenanceMessage,
})

const cpfError = ref(false)

function validateCpf() {
  const digits = onlyDigits(form.cpf)
  cpfError.value = digits.length === 11 && !isValidCpf(form.cpf)
}

watch(() => form.cpf, (val) => {
  const masked = maskCpf(val)
  if (masked !== val) form.cpf = masked
})

watch(() => form.phone, (val) => {
  const masked = maskPhone(val)
  if (masked !== val) form.phone = masked
})

function imgUrl(url: string) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${config.public.apiBase}${url}`
}

function toggleBump(id: number) {
  if (selectedBumps.has(id)) {
    selectedBumps.delete(id)
  } else {
    selectedBumps.add(id)
  }
}

onMounted(async () => {
  try {
    const data = await apiFetch<FunnelData>(`/api/funnels/${route.params.slug}`)
    if (!data.active) {
      funnel.value = null
      return
    }
    funnel.value = data

    const { initiateCheckout } = useTracking()
    initiateCheckout(data.product.funnelPrice, [
      { id: data.product.id, name: data.product.name, price: data.product.funnelPrice, quantity: 1 },
    ])
  } catch {
    funnel.value = null
  } finally {
    loadingFunnel.value = false
  }

  if (payment.recoveryToken.value) {
    try {
      const recovered = await apiFetch<any>(`/api/orders/recover/${payment.recoveryToken.value}`)
      if (recovered.name) form.name = recovered.name
      if (recovered.email) form.email = recovered.email
      if (recovered.phone) form.phone = recovered.phone
      if (recovered.cpf) form.cpf = recovered.cpf
      if (recovered.couponCode) {
        coupon.code.value = recovered.couponCode
        coupon.show.value = true
        await coupon.apply()
      }
    } catch (_) {}
  }
})
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
</style>
