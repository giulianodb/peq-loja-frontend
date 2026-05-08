<template>
  <div>
    <div v-if="loading" class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
      <div v-for="i in 4" :key="i" class="animate-pulse">
        <div class="aspect-[4/5] bg-primary-100 rounded-xl" />
        <div class="mt-3 h-4 bg-primary-100 rounded w-1/3" />
        <div class="mt-2 h-5 bg-primary-100 rounded w-3/4" />
        <div class="mt-2 h-4 bg-primary-100 rounded w-1/2" />
      </div>
    </div>

    <div
      v-else-if="products.length > 0"
      class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6"
    >
      <ProductCard v-for="product in products" :key="product.id" :product="product" />
    </div>

    <div v-else class="text-center py-16">
      <i class="pi pi-inbox text-4xl text-primary-300 mb-4" />
      <p class="text-primary-500">Nenhum material encontrado.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/types'

defineProps<{
  products: Product[]
  loading?: boolean
}>()
</script>
