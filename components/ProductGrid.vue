<template>
  <div>
    <Transition name="fade" mode="out-in">
      <div v-if="loading" key="skeleton" class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div v-for="i in skeletonCount" :key="i" class="animate-pulse">
          <div class="aspect-[4/5] bg-sand-200 rounded-xl" />
          <div class="mt-3 h-3 bg-sand-200 rounded w-1/3" />
          <div class="mt-2 h-4 bg-sand-200 rounded w-3/4" />
          <div class="mt-2 h-3 bg-sand-200 rounded w-1/2" />
        </div>
      </div>

      <div
        v-else-if="products.length > 0"
        key="grid"
        class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6"
      >
        <ProductCard
          v-for="(product, i) in products"
          :key="product.id"
          :product="product"
          :style="{ animationDelay: `${i * 40}ms` }"
          class="card-enter"
        />
      </div>

      <div v-else key="empty" class="text-center py-16">
        <i class="pi pi-inbox text-4xl text-primary-300 mb-4" />
        <p class="text-primary-500">Nenhum material encontrado.</p>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/types'

withDefaults(defineProps<{
  products: Product[]
  loading?: boolean
  skeletonCount?: number
}>(), {
  skeletonCount: 4,
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes card-pop {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-enter {
  animation: card-pop 0.35s ease both;
}
</style>
