<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6">

    <!-- Carrinho vazio -->
    <div v-if="cart.items.length === 0 && !payment.paymentResult.value" class="text-center py-20">
      <p class="text-steel mb-4">Seu carrinho está vazio.</p>
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
      @copy="payment.copyPixCode()"
      @retry="payment.reset()"
    />

    <!-- Checkout em manutenção -->
    <CheckoutMaintenanceNotice v-else-if="maintenance" :message="maintenanceMessage" />

    <!-- Formulário de checkout -->
    <div v-else>
      <h1 class="font-serif text-2xl text-teal text-center mb-8">Finalizar Compra</h1>

      <div class="grid lg:grid-cols-5 gap-8">

        <!-- Bloco 1: Dados do cliente -->
        <div class="lg:col-span-3 space-y-6">
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
                <input v-model="form.email" type="email" class="checkout-input" placeholder="seu@email.com" @blur="payment.saveCart()" />
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
              <div v-if="coupon.applied.value" class="flex justify-between items-center text-sm">
                <span class="text-steel">Subtotal</span>
                <span class="text-primary-800">{{ formatPrice(cart.total) }}</span>
              </div>
              <div v-if="coupon.applied.value" class="flex justify-between items-start text-sm">
                <p class="text-green-600">Cupom {{ coupon.applied.value.code }}</p>
                <span class="text-green-600 font-medium shrink-0 ml-2">-{{ formatPrice(coupon.applied.value.discountAmount) }}</span>
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
          <PaymentBox :payment="payment" :coupon="coupon" />

          <button
            @click="payment.submitPayment()"
            :disabled="payment.submitting.value || !payment.isFormValid.value"
            class="w-full bg-teal text-white font-medium py-4 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-teal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i v-if="payment.submitting.value" class="pi pi-spin pi-spinner" />
            <i v-else class="pi pi-lock" />
            {{ payment.submitting.value ? 'Processando...' : `Finalizar Compra  ${formatPrice(finalTotal)}` }}
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

const auth = useAuthStore()
const cart = useCartStore()
const { $fetch: apiFetch } = useApi()
const { maintenance, maintenanceMessage } = useCheckoutStatus()

const form = reactive({
  name: auth.user?.name || '',
  email: auth.user?.email || '',
  phone: '',
  cpf: '',
})

const cartTotal = computed(() => cart.total)
const coupon = useCoupon(cartTotal, () => form.cpf)
const finalTotal = coupon.total

const trackingItems = () =>
  cart.items.map(i => ({ id: i.product.id, name: i.product.name, price: i.product.price, quantity: i.quantity }))

const payment = usePayment({
  amount: finalTotal,
  buildItems: () => cart.items.map(i => ({ productId: i.product.id, quantity: i.quantity })),
  trackingItems,
  customer: form,
  couponCode: () => coupon.applied.value?.code || null,
  maintenance,
  maintenanceMessage,
  onSubmitted: () => cart.clear(),
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

onMounted(async () => {
  if (payment.recoveryToken.value) {
    try {
      const recovered = await apiFetch<any>(`/api/orders/recover/${payment.recoveryToken.value}`)
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
        coupon.code.value = recovered.couponCode
        coupon.show.value = true
        await coupon.apply()
      }
    } catch (_) {}
  }

  if (cart.items.length === 0) return

  const { initiateCheckout } = useTracking()
  initiateCheckout(cart.total, trackingItems())
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
