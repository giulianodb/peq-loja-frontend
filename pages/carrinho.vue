<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 py-12">
    <h1 class="section-title text-3xl mb-8">Carrinho</h1>

    <!-- Empty -->
    <div v-if="cart.items.length === 0" class="text-center py-16">
      <div class="w-20 h-20 bg-sand-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <i class="pi pi-shopping-bag text-3xl text-salmon" />
      </div>
      <h2 class="font-serif text-2xl text-teal mb-2">Carrinho vazio</h2>
      <p class="text-steel mb-8">Você ainda não adicionou nenhum material.</p>
      <NuxtLink to="/loja" class="btn-primary">
        <i class="pi pi-arrow-left mr-2" />
        Explorar Materiais
      </NuxtLink>
    </div>

    <div v-else>
      <!-- Items -->
      <div class="space-y-4">
        <div
          v-for="item in cart.items"
          :key="item.product.id"
          class="flex gap-4 p-4 bg-white border border-border rounded-xl"
        >
          <!-- Thumbnail -->
          <div class="w-20 h-20 flex-shrink-0 bg-light rounded-lg overflow-hidden">
            <img
              v-if="item.product.imageUrl"
              :src="getImageUrl(item.product.imageUrl)"
              :alt="item.product.name"
              loading="lazy"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <i class="pi pi-file-pdf text-2xl text-salmon" />
            </div>
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <NuxtLink
              :to="`/produto/${item.product.id}`"
              class="font-serif text-lg text-teal hover:text-coral transition-colors line-clamp-1"
            >
              {{ item.product.name }}
            </NuxtLink>
            <p class="text-sm text-steel mt-0.5">PDF Digital</p>
            <div class="mt-2">
              <button
                @click="cart.remove(item.product.id)"
                class="text-red-400 hover:text-red-600 text-sm transition-colors flex items-center gap-1"
              >
                <i class="pi pi-trash text-xs" />
                Remover
              </button>
            </div>
          </div>

          <!-- Price -->
          <div class="text-right flex-shrink-0">
            <p class="font-semibold text-coral">
              {{ formatPrice(item.product.price) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Summary -->
      <div class="mt-8 bg-sand-100 rounded-xl p-6">
        <div class="flex justify-between items-center mb-4">
          <span class="text-primary-700">Subtotal ({{ cart.count }} itens)</span>
          <span class="font-semibold text-teal">{{ formatPrice(cart.total) }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-lg font-serif text-teal">Total</span>
          <span class="text-2xl font-bold text-coral">{{ formatPrice(cart.total) }}</span>
        </div>

        <NuxtLink to="/checkout" class="btn-primary w-full mt-6 text-center">
          Finalizar Compra
          <i class="pi pi-arrow-right ml-2" />
        </NuxtLink>

        <NuxtLink
          to="/loja"
          class="block text-center mt-3 text-sm text-steel hover:text-coral transition-colors"
        >
          Continuar comprando
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const cart = useCartStore()

function formatPrice(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function getImageUrl(url: string | null) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${config.public.apiBase}${url}`
}
</script>
