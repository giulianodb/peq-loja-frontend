<template>
  <div class="bg-white rounded-2xl shadow-sm border border-sand-200 p-6">
    <div class="flex items-center justify-between mb-5">
      <h2 class="font-serif text-lg text-teal">Pagamento</h2>
      <CheckoutSecureBadge />
    </div>

    <!-- Tabs: Pix é o método padrão -->
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
        {{ cardTabLabel }}
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
      <!-- Cobrança processada no exterior: sem parcelamento e com IOF. -->
      <div class="flex items-start gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
        <i class="pi pi-info-circle mt-0.5 shrink-0" />
        <span>
          Cobrança internacional, em parcela única. Seu banco pode adicionar IOF e taxas de
          compra no exterior. <strong>Pagando com Pix você não tem esses custos.</strong>
        </span>
      </div>

      <div :id="PAYMENT_ELEMENT_ID" class="min-h-[220px]" />
    </div>

    <!-- Cupom colapsável -->
    <div class="border-t border-sand-100 mt-5 pt-4">
      <div v-if="coupon.applied.value" class="text-sm">
        <div class="flex items-center justify-between gap-2">
          <span class="text-green-600 flex items-center gap-1.5 font-medium">
            <i class="pi pi-check-circle text-xs" />
            Cupom <strong>{{ coupon.applied.value.code }}</strong>
          </span>
          <button @click="coupon.remove()" class="text-xs text-red-400 hover:text-red-600 underline shrink-0">Remover</button>
        </div>
        <p class="text-green-600 text-xs mt-0.5 ml-4">
          {{ coupon.applied.value.discountType === 'PERCENTAGE'
            ? coupon.applied.value.discountValue + '% de desconto'
            : 'R$ ' + coupon.applied.value.discountAmount.toFixed(2) + ' de desconto' }}
        </p>
      </div>
      <template v-else>
        <button
          v-if="!coupon.show.value"
          @click="coupon.show.value = true"
          class="text-xs text-steel hover:text-teal transition-colors underline"
        >
          Tem um cupom de desconto?
        </button>
        <div v-else class="flex gap-2">
          <input
            v-model="coupon.code.value"
            type="text"
            autofocus
            class="checkout-input flex-1 !uppercase font-mono"
            placeholder="Digite seu cupom"
            @keyup.enter="coupon.apply()"
          />
          <button
            @click="coupon.apply()"
            :disabled="!coupon.code.value.trim() || coupon.validating.value"
            class="px-4 py-2.5 text-sm font-medium text-teal border border-teal rounded-lg hover:bg-teal/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap inline-flex items-center gap-2"
          >
            <i v-if="coupon.validating.value" class="pi pi-spin pi-spinner text-xs" />
            Aplicar
          </button>
        </div>
        <p v-if="coupon.error.value" class="text-red-500 text-xs mt-1.5">
          <i class="pi pi-exclamation-circle mr-1" />{{ coupon.error.value }}
        </p>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    payment: ReturnType<typeof usePayment>
    coupon: ReturnType<typeof useCoupon>
    cardTabLabel?: string
  }>(),
  { cardTabLabel: 'Cartão de crédito' },
)

const { paymentMethod } = props.payment
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
