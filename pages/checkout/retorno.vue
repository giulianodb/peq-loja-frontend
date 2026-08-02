<template>
  <div class="max-w-lg mx-auto px-4 py-20 text-center">

    <div v-if="checking">
      <i class="pi pi-spin pi-spinner text-3xl text-teal mb-4" />
      <p class="text-steel">Confirmando seu pagamento...</p>
    </div>

    <div v-else-if="confirmed">
      <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <i class="pi pi-check text-3xl text-green-600" />
      </div>
      <h1 class="font-serif text-3xl text-teal mb-3">Pagamento Confirmado!</h1>
      <p v-if="orderId" class="text-steel mb-2">
        Pedido <span class="font-semibold text-teal">#{{ orderId }}</span> confirmado.
      </p>
      <p class="text-primary-300 text-sm mb-8">Você receberá os materiais por email em breve.</p>
      <NuxtLink :to="auth.token ? '/minha-conta/materiais' : '/loja'" class="btn-primary">
        {{ auth.token ? 'Ver meus materiais' : 'Continuar comprando' }}
      </NuxtLink>
    </div>

    <div v-else-if="failed">
      <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <i class="pi pi-times text-3xl text-red-600" />
      </div>
      <h1 class="font-serif text-3xl text-teal mb-3">Pagamento não aprovado</h1>
      <p class="text-steel mb-8">A autenticação com seu banco não foi concluída. Tente novamente ou pague com Pix.</p>
      <NuxtLink to="/carrinho" class="btn-primary">Voltar ao carrinho</NuxtLink>
    </div>

    <div v-else>
      <div class="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <i class="pi pi-clock text-3xl text-amber-600" />
      </div>
      <h1 class="font-serif text-3xl text-teal mb-3">Pagamento em processamento</h1>
      <p class="text-steel mb-8">
        Assim que o banco confirmar, você recebe os materiais por email. Não é preciso pagar de novo.
      </p>
      <NuxtLink to="/loja" class="btn-primary">Ir para a loja</NuxtLink>
    </div>

  </div>
</template>

<script setup lang="ts">
/**
 * Retorno do 3DS. Só é usada quando o banco exige autenticação fora da
 * página — no caminho feliz o Payment Element resolve tudo inline.
 *
 * O redirect_status do Stripe é apenas um indício; quem confirma o pedido
 * é o webhook, então o status real vem do nosso próprio backend.
 */
definePageMeta({ layout: 'checkout' })

const route = useRoute()
const auth = useAuthStore()
const { $fetch: apiFetch } = useApi()

const orderId = computed(() => route.query.order as string | undefined)
const redirectStatus = computed(() => route.query.redirect_status as string | undefined)

const checking = ref(true)
const confirmed = ref(false)
const failed = ref(false)

// O webhook pode levar alguns segundos; tenta por até ~24s antes de
// cair na tela de "em processamento".
const MAX_ATTEMPTS = 8

onMounted(async () => {
  if (redirectStatus.value === 'failed') {
    failed.value = true
    checking.value = false
    return
  }

  if (!orderId.value) {
    checking.value = false
    return
  }

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const result = await apiFetch<{ status: string }>(`/api/orders/${orderId.value}/status`)
      if (result.status === 'CONFIRMED') {
        confirmed.value = true
        break
      }
      if (result.status === 'ABANDONED') {
        failed.value = true
        break
      }
    } catch (_) {}
    await new Promise(resolve => setTimeout(resolve, 3000))
  }

  checking.value = false
})
</script>
