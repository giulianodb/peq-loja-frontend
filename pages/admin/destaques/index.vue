<template>
  <div>
    <div class="flex items-center justify-between mb-2">
      <div>
        <h1 class="text-2xl font-serif font-bold text-gray-900">Mais Vendidos</h1>
        <p class="text-sm text-gray-500 mt-1">Defina quais produtos aparecem na seção de destaques da home e em que ordem.</p>
      </div>
      <button
        @click="save"
        :disabled="saving || !dirty"
        class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-teal rounded-lg hover:bg-teal/90 disabled:opacity-50 transition-colors"
      >
        <i v-if="saving" class="pi pi-spin pi-spinner" />
        <i v-else class="pi pi-check" />
        Salvar ordem
      </button>
    </div>

    <p v-if="saved" class="text-sm text-green-600 mb-4 flex items-center gap-1">
      <i class="pi pi-check-circle" /> Destaques salvos com sucesso!
    </p>

    <div class="grid lg:grid-cols-2 gap-6 mt-6">
      <!-- Lista de destaques -->
      <div class="bg-white rounded-xl border border-gray-200">
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 class="font-medium text-gray-800">Em destaque <span class="text-gray-400 font-normal">({{ featured.length }})</span></h2>
        </div>

        <div v-if="featured.length === 0" class="p-10 text-center text-gray-400">
          <i class="pi pi-star text-3xl mb-3 block" />
          Nenhum produto em destaque.<br/>Adicione produtos ao lado.
        </div>

        <draggable-list v-else :items="featured" @move-up="moveUp" @move-down="moveDown" @remove="remove">
          <template #item="{ item, index }">
            <div class="flex items-center gap-3 px-5 py-3 border-b border-gray-100 last:border-0">
              <span class="w-5 text-center text-xs font-bold text-gray-300">{{ index + 1 }}</span>
              <img
                v-if="item.imageUrl"
                :src="resolveUrl(item.imageUrl)"
                class="w-10 h-10 rounded-lg object-cover flex-shrink-0"
              />
              <div v-else class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <i class="pi pi-image text-gray-400 text-xs" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">{{ item.name }}</p>
                <p class="text-xs text-gray-400">{{ formatPrice(item.price) }}</p>
              </div>
              <div class="flex flex-col gap-0.5 flex-shrink-0">
                <button
                  @click="moveUp(index)"
                  :disabled="index === 0"
                  class="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-700 disabled:opacity-20 transition-colors"
                >
                  <i class="pi pi-chevron-up text-xs" />
                </button>
                <button
                  @click="moveDown(index)"
                  :disabled="index === featured.length - 1"
                  class="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-700 disabled:opacity-20 transition-colors"
                >
                  <i class="pi pi-chevron-down text-xs" />
                </button>
              </div>
              <button
                @click="remove(index)"
                class="w-6 h-6 flex items-center justify-center text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
              >
                <i class="pi pi-times text-xs" />
              </button>
            </div>
          </template>
        </draggable-list>
      </div>

      <!-- Seletor de produtos -->
      <div class="bg-white rounded-xl border border-gray-200">
        <div class="px-5 py-4 border-b border-gray-100">
          <h2 class="font-medium text-gray-800 mb-3">Adicionar produto</h2>
          <input
            v-model="search"
            type="text"
            placeholder="Buscar produto..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
          />
        </div>

        <div v-if="loadingProducts" class="p-8 text-center">
          <i class="pi pi-spin pi-spinner text-teal text-2xl" />
        </div>

        <div v-else class="overflow-y-auto max-h-96">
          <div
            v-for="product in availableProducts"
            :key="product.id"
            class="flex items-center gap-3 px-5 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
          >
            <img
              v-if="product.imageUrl"
              :src="resolveUrl(product.imageUrl)"
              class="w-10 h-10 rounded-lg object-cover flex-shrink-0"
            />
            <div v-else class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <i class="pi pi-image text-gray-400 text-xs" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ product.name }}</p>
              <p class="text-xs text-gray-400">{{ formatPrice(product.price) }}</p>
            </div>
            <button
              @click="add(product)"
              class="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-teal border border-teal rounded-lg hover:bg-teal hover:text-white transition-colors"
            >
              <i class="pi pi-plus mr-1" /> Adicionar
            </button>
          </div>

          <div v-if="availableProducts.length === 0" class="p-8 text-center text-gray-400 text-sm">
            {{ search ? 'Nenhum produto encontrado.' : 'Todos os produtos já estão em destaque.' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product, Page } from '~/types'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const { $fetch } = useApi()
const config = useRuntimeConfig()

const featured = ref<Product[]>([])
const allProducts = ref<Product[]>([])
const loadingProducts = ref(true)
const saving = ref(false)
const saved = ref(false)
const dirty = ref(false)
const search = ref('')

const featuredIds = computed(() => new Set(featured.value.map(p => p.id)))

const availableProducts = computed(() => {
  const q = search.value.toLowerCase().trim()
  return allProducts.value.filter(p =>
    !featuredIds.value.has(p.id) &&
    (!q || p.name.toLowerCase().includes(q))
  )
})

onMounted(async () => {
  const [featuredData, allData] = await Promise.all([
    $fetch<Product[]>('/api/products/featured'),
    $fetch<Page<Product>>('/api/admin/products?size=200&sort=name,asc'),
  ])
  featured.value = featuredData
  allProducts.value = allData.content
  loadingProducts.value = false
})

function resolveUrl(url: string) {
  if (!url) return ''
  return url.startsWith('http') ? url : `${config.public.apiBase}${url}`
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)
}

function add(product: Product) {
  featured.value.push(product)
  dirty.value = true
  saved.value = false
}

function remove(index: number) {
  featured.value.splice(index, 1)
  dirty.value = true
  saved.value = false
}

function moveUp(index: number) {
  if (index === 0) return
  const arr = featured.value
  ;[arr[index - 1], arr[index]] = [arr[index], arr[index - 1]]
  dirty.value = true
  saved.value = false
}

function moveDown(index: number) {
  if (index === featured.value.length - 1) return
  const arr = featured.value
  ;[arr[index], arr[index + 1]] = [arr[index + 1], arr[index]]
  dirty.value = true
  saved.value = false
}

async function save() {
  saving.value = true
  try {
    await $fetch('/api/admin/products/featured', {
      method: 'PUT',
      body: JSON.stringify(featured.value.map(p => p.id)),
    })
    dirty.value = false
    saved.value = true
    setTimeout(() => (saved.value = false), 3000)
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}
</script>
