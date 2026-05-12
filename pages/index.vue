<template>
  <div>
    <HeroBanner />

    <!-- Mais Vendidos -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div class="text-center mb-12">
        <h2 class="section-title">Mais Vendidos</h2>
        <p class="mt-3 text-steel max-w-xl mx-auto">
          Os materiais que famílias e educadores mais amam
        </p>
      </div>
      <ProductGrid :products="featured" :loading="loading" />
    </section>

    <!-- Divider -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="border-t border-border" />
    </div>

    <!-- Todos os Materiais -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12">
        <div>
          <h2 class="section-title">Todos os Materiais</h2>
          <p class="mt-2 text-steel">Explore toda a nossa coleção</p>
        </div>
        <NuxtLink to="/loja" class="mt-4 sm:mt-0 btn-outline text-sm">
          Ver todos <i class="pi pi-arrow-right ml-2 text-xs" />
        </NuxtLink>
      </div>
      <ProductGrid :products="allProducts" :loading="loading" />
    </section>

    <!-- Trust section -->
    <section class="bg-light py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div>
            <div class="w-14 h-14 bg-sand-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="pi pi-download text-2xl text-coral" />
            </div>
            <h3 class="font-serif text-lg text-teal">Download Imediato</h3>
            <p class="text-sm text-steel mt-1">Acesse seus materiais em PDF na hora</p>
          </div>
          <div>
            <div class="w-14 h-14 bg-sand-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="pi pi-heart text-2xl text-coral" />
            </div>
            <h3 class="font-serif text-lg text-teal">Feito com Carinho</h3>
            <p class="text-sm text-steel mt-1">Cada material pensado com intencionalidade</p>
          </div>
          <div>
            <div class="w-14 h-14 bg-sand-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="pi pi-shield text-2xl text-coral" />
            </div>
            <h3 class="font-serif text-lg text-teal">Compra Segura</h3>
            <p class="text-sm text-steel mt-1">Pagamento seguro e suporte rápido</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Product, Page } from '~/types'


const config = useRuntimeConfig()

const loading = ref(true)
const featured = ref<Product[]>([])
const allProducts = ref<Product[]>([])

onMounted(async () => {
  try {
    const [featuredData, allData] = await Promise.all([
      $fetch<Product[]>(`${config.public.apiBase}/api/products/featured`),
      $fetch<Page<Product>>(`${config.public.apiBase}/api/products?size=8&sort=createdAt,desc`),
    ])
    featured.value = featuredData
    allProducts.value = allData.content
  } catch {
    // API not available
  } finally {
    loading.value = false
  }
})
</script>
