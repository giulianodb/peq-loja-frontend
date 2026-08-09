<template>
  <!-- Aprovado (cartão) -->
  <div v-if="paymentResult?.status === 'succeeded'" class="max-w-lg mx-auto text-center py-20">
    <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
      <i class="pi pi-check text-3xl text-green-600" />
    </div>
    <h2 class="font-serif text-3xl text-teal mb-3">Pagamento Aprovado!</h2>
    <p class="text-steel mb-2">
      Pedido <span class="font-semibold text-teal">#{{ paymentResult.orderId }}</span> confirmado.
    </p>
    <p class="text-primary-300 text-sm mb-8">{{ deliveryNotice }}</p>
    <NuxtLink to="/loja" class="btn-primary">Continuar Comprando</NuxtLink>
  </div>

  <!-- Pix pendente: QR Code + copia-e-cola -->
  <div v-else-if="paymentResult?.pixQrCode && !pixConfirmed" class="max-w-lg mx-auto text-center py-4">
    <CheckoutSecureBadge full class="w-fit mx-auto mb-5" />

    <h2 class="font-serif text-2xl text-teal mb-2">Pague com Pix</h2>
    <p class="text-steel text-sm mb-6">
      Pedido <span class="font-semibold text-teal">#{{ paymentResult.orderId }}</span>
    </p>

    <!-- QR expirado: o código não é mais pagável -->
    <div v-if="pixExpired" class="bg-red-50 border border-red-200 rounded-xl p-5 mb-4">
      <i class="pi pi-clock text-2xl text-red-500 mb-2" />
      <p class="text-sm text-red-700 font-medium mb-1">Código Pix expirado</p>
      <p class="text-xs text-red-600 mb-4">Gere um novo código para concluir a compra.</p>
      <button @click="$emit('retry')" class="btn-primary text-sm">Gerar novo código</button>
    </div>

    <template v-else>
      <div v-if="paymentResult.pixQrCodeImageUrl" class="mb-4">
        <img
          :src="paymentResult.pixQrCodeImageUrl"
          alt="QR Code Pix"
          class="w-56 h-56 mx-auto rounded-xl border border-sand-200 p-2 bg-white"
        />
      </div>

      <!--
        A cobrança é internacional e quem recebe os reais no Brasil é o Ebanx,
        instituição de pagamento licenciada. Verificado no app dos bancos: só
        "EBANX" e "EBANX IP LTDA." são exibidos — o nome da loja não aparece em
        lugar nenhum da tela de confirmação.
        Não é configuração faltando. O campo 59 do QR precisa ser o do recebedor
        legal, e o `solicitacaoPagador` (que traz "Éditions Pequenas Trilhas")
        os bancos simplesmente não renderizam. Não há parâmetro na API do Stripe
        que mude isso — SDK conferido campo a campo.
        Este aviso é a única mitigação possível: o cliente precisa saber o nome
        ANTES de escanear, senão hesita na hora de confirmar.
        Os nomes abaixo são os que aparecem de fato na tela; se mudarem, o aviso
        perde a função e vira mais uma dúvida.
      -->
      <div class="flex items-start gap-2 text-left text-xs text-steel bg-sand-100 rounded-xl px-3 py-2.5 mb-4">
        <i class="pi pi-info-circle mt-0.5 shrink-0 text-teal" />
        <span>
          No app do seu banco o recebedor aparece como <strong class="text-teal">EBANX</strong>
          ou <strong class="text-teal">EBANX IP LTDA.</strong> — é a instituição que processa
          os pagamentos da Pequenas Trilhas. Pode confirmar com tranquilidade.
        </span>
      </div>

      <p v-if="countdown" class="text-xs text-steel mb-4">
        Este código expira em <span class="font-semibold text-teal">{{ countdown }}</span>
      </p>

      <div class="bg-sand-100 rounded-xl p-4 mb-4">
        <p class="text-xs text-steel mb-2">Ou copie o código Pix:</p>
        <div class="flex gap-2">
          <input
            :value="paymentResult.pixQrCode"
            readonly
            class="flex-1 text-xs bg-white border border-sand-200 rounded-lg px-3 py-2 truncate"
          />
          <button @click="$emit('copy')" class="btn-primary text-xs px-4">
            {{ copied ? 'Copiado!' : 'Copiar' }}
          </button>
        </div>
      </div>

      <div class="flex items-center justify-center gap-2 text-xs text-steel">
        <i class="pi pi-spin pi-spinner text-teal" />
        <span>Aguardando confirmação do pagamento...</span>
      </div>
    </template>
  </div>

  <!-- Pix confirmado -->
  <div v-else-if="pixConfirmed" class="max-w-lg mx-auto text-center py-20">
    <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
      <i class="pi pi-check text-3xl text-green-600" />
    </div>
    <h2 class="font-serif text-3xl text-teal mb-3">Pagamento Confirmado!</h2>
    <p class="text-steel mb-2">
      Pedido <span class="font-semibold text-teal">#{{ paymentResult?.orderId }}</span> confirmado.
    </p>
    <p class="text-primary-300 text-sm mb-4">Você receberá os materiais por email em breve.</p>
    <p class="text-xs text-steel">Redirecionando em {{ redirectCountdown }}s...</p>
  </div>

  <!-- Recusado -->
  <div v-else-if="isFailed" class="max-w-lg mx-auto text-center py-20">
    <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
      <i class="pi pi-times text-3xl text-red-600" />
    </div>
    <h2 class="font-serif text-3xl text-teal mb-3">Pagamento não aprovado</h2>
    <p class="text-steel mb-8">{{ statusMessage(paymentResult?.statusDetail) }}</p>
    <button @click="$emit('retry')" class="btn-primary">Tentar novamente</button>
  </div>
</template>

<script setup lang="ts">
import type { PaymentResult } from '~/types/payment'

const props = withDefaults(
  defineProps<{
    paymentResult: PaymentResult | null
    pixConfirmed: boolean
    redirectCountdown: number
    copied: boolean
    isFailed: boolean
    pixSecondsLeft: number | null
    pixExpired: boolean
    statusMessage: (detail?: string | null) => string
    deliveryNotice?: string
  }>(),
  { deliveryNotice: 'Você receberá os materiais em PDF por email em breve.' },
)

defineEmits<{ copy: []; retry: [] }>()

const countdown = computed(() => {
  const total = props.pixSecondsLeft
  if (total === null || total <= 0) return ''
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
})
</script>
