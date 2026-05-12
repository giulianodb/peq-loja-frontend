<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-12">
    <!-- Header -->
    <div class="text-center mb-12">
      <h1 class="section-title">Nossos Materiais</h1>
      <p class="mt-3 text-steel max-w-xl mx-auto">
        Encontre o material ideal para acompanhar a jornada de aprendizado
      </p>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap items-center gap-3 mb-10">
      <button
        @click="selectCategory(null)"
        :class="[
          'px-4 py-2 rounded-full text-sm font-medium transition-all',
          selectedCategory === null
            ? 'bg-coral text-white shadow-sm'
            : 'bg-light text-primary-800 hover:bg-sand-100'
        ]"
      >
        Todos
      </button>
      <button
        v-for="cat in categories"
        :key="cat.id"
        @click="selectCategory(cat.id)"
        :class="[
          'px-4 py-2 rounded-full text-sm font-medium transition-all',
          selectedCategory === cat.id
            ? 'bg-coral text-white shadow-sm'
            : 'bg-light text-primary-800 hover:bg-sand-100'
        ]"
      >
        {{ cat.name }}
      </button>
    </div>

    <!-- Products -->
    <ProductGrid :products="products" :loading="loading" />

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex justify-center mt-12 gap-2">
      <button
        v-for="p in totalPages"
        :key="p"
        @click="goToPage(p - 1)"
        :class="[
          'w-10 h-10 rounded-full text-sm font-medium transition-all',
          page === p - 1
            ? 'bg-coral text-white'
            : 'bg-light text-primary-800 hover:bg-sand-100'
        ]"
      >
        {{ p }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product, Category, Page as PageType } from '~/types'

const config = useRuntimeConfig()
const route = useRoute()

const loading = ref(true)
const products = ref<Product[]>([])
const categories = ref<Category[]>([])
const selectedCategory = ref<number | null>(null)
const page = ref(0)
const totalPages = ref(0)

function selectCategory(catId: number | null) {
  selectedCategory.value = catId
  page.value = 0
  fetchProducts()
}

function goToPage(p: number) {
  page.value = p
  fetchProducts()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function fetchProducts() {
  loading.value = true
  try {
    let url = `${config.public.apiBase}/api/products?page=${page.value}&size=12&sort=category.name,asc&sort=name,asc`
    if (selectedCategory.value) {
      url += `&categoryId=${selectedCategory.value}`
    }
    const data = await $fetch<PageType<Product>>(url)
    products.value = data.content
    totalPages.value = data.totalPages
  } catch {
    products.value = []
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    categories.value = await $fetch<Category[]>(`${config.public.apiBase}/api/categories`)
  } catch {
    // ignore
  }

  const catParam = route.query.categoria
  if (catParam) {
    selectedCategory.value = Number(catParam)
  }

  fetchProducts()
})
</script>
