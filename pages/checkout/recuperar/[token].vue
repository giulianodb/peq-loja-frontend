<template>
  <div class="flex items-center justify-center min-h-[60vh]">
    <div v-if="error" class="text-center py-20">
      <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <i class="pi pi-times text-2xl text-red-500" />
      </div>
      <h2 class="font-serif text-2xl text-teal mb-2">Link inválido</h2>
      <p class="text-steel mb-6">{{ error }}</p>
      <NuxtLink to="/loja" class="btn-primary">Ir para a loja</NuxtLink>
    </div>
    <div v-else class="text-center py-20">
      <i class="pi pi-spin pi-spinner text-3xl text-teal" />
      <p class="text-steel mt-4">Carregando seu carrinho...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'checkout' })

const route = useRoute()
const { $fetch: apiFetch } = useApi()
const cartStore = useCartStore()

const error = ref<string | null>(null)

onMounted(async () => {
  const token = route.params.token as string
  try {
    const data = await apiFetch<{
      email: string
      name: string | null
      phone: string | null
      cpf: string | null
      couponCode: string | null
      funnelSlug: string | null
      total: number
      items: { productId: number; productName: string; unitPrice: number; quantity: number }[]
    }>(`/api/orders/recover/${token}`)

    if (data.funnelSlug) {
      await navigateTo(`/checkout/${data.funnelSlug}?recover=${token}`)
      return
    }

    // Carrinho normal: restaura os itens no store antes de redirecionar
    cartStore.clear()
    for (const item of data.items) {
      cartStore.add(
        { id: item.productId, name: item.productName, price: item.unitPrice } as any,
        item.quantity,
      )
    }

    await navigateTo(`/checkout?recover=${token}`)
  } catch (e: any) {
    error.value = e?.data?.message || e?.data?.error || 'Este link expirou ou já foi utilizado.'
  }
})
</script>
