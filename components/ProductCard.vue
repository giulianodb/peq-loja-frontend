<template>
  <NuxtLink :to="`/produto/${product.id}`" class="card-product group">
    <div class="aspect-[4/5] bg-light relative overflow-hidden">
      <img
        v-if="product.imageUrl"
        :src="imageUrl"
        :alt="product.name"
        loading="lazy"
        decoding="async"
        class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
        :class="loaded ? 'opacity-100' : 'opacity-0'"
        style="transition: opacity 0.4s ease, transform 0.5s ease"
        @load="loaded = true"
      />
      <div
        v-else
        class="w-full h-full flex items-center justify-center bg-gradient-to-br from-sand-100 to-sand-200"
      >
        <i class="pi pi-file-pdf text-5xl text-salmon" />
      </div>
    </div>
    <div class="p-3 sm:p-4">
      <span
        v-if="product.categoryName"
        class="text-[9px] sm:text-[10px] uppercase tracking-widest text-coral font-medium"
      >
        {{ product.categoryName }}
      </span>
      <h3 class="font-serif text-xs sm:text-sm text-teal mt-0.5 leading-snug line-clamp-2">
        {{ product.name }}
      </h3>
      <p class="text-steel text-[11px] sm:text-xs mt-0.5 line-clamp-2 hidden sm:block">
        {{ product.shortDescription || product.description }}
      </p>
      <div v-if="product.totalReviews && product.totalReviews > 0" class="mt-1 flex items-center gap-1">
        <div class="flex items-center gap-0.5">
          <i
            v-for="s in 5"
            :key="s"
            class="pi text-[10px] sm:text-xs"
            :class="s <= Math.round(product.averageRating || 0) ? 'pi-star-fill text-yellow-400' : 'pi-star text-gray-300'"
          />
        </div>
        <span class="text-[10px] sm:text-xs text-steel">
          {{ (product.averageRating || 0).toFixed(1) }}
          ({{ product.totalReviews }})
        </span>
      </div>
      <div class="mt-1.5 sm:mt-2 flex items-center justify-between">
        <span class="text-base sm:text-lg font-semibold text-coral">
          {{ formatPrice(product.price) }}
        </span>
        <span class="text-[10px] sm:text-xs text-steel flex items-center gap-1">
          <i class="pi pi-file-pdf" />
          PDF
        </span>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { Product } from '~/types'

const props = defineProps<{ product: Product }>()
const config = useRuntimeConfig()

const loaded = ref(false)

const imageUrl = computed(() => {
  if (!props.product.imageUrl) return ''
  if (props.product.imageUrl.startsWith('http')) return props.product.imageUrl
  return `${config.public.apiBase}${props.product.imageUrl}`
})

function formatPrice(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}
</script>
