<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-serif font-bold text-gray-900">Produtos</h1>
      <NuxtLink
        to="/admin/produtos/novo"
        class="inline-flex items-center gap-2 px-4 py-2 bg-teal text-white text-sm font-medium rounded-lg hover:bg-teal/90 transition-colors"
      >
        <i class="pi pi-plus text-xs" />
        Novo produto
      </NuxtLink>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <i class="pi pi-spin pi-spinner text-3xl text-teal" />
    </div>

    <div v-else>
      <!-- Table -->
      <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th class="text-left px-4 py-3 font-medium text-gray-500">Produto</th>
                <th class="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Categoria</th>
                <th class="text-right px-4 py-3 font-medium text-gray-500">Preco</th>
                <th class="text-right px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Estoque</th>
                <th class="text-center px-4 py-3 font-medium text-gray-500">Status</th>
                <th class="text-right px-4 py-3 font-medium text-gray-500">Acoes</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="p in products" :key="p.id" class="hover:bg-gray-50">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-3">
                    <img
                      v-if="p.imageUrl"
                      :src="imageUrl(p.imageUrl)"
                      :alt="p.name"
                      class="w-10 h-10 rounded-lg object-cover border border-gray-200"
                    />
                    <div v-else class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <i class="pi pi-image text-gray-400" />
                    </div>
                    <span class="font-medium text-gray-900 truncate max-w-[200px]">{{ p.name }}</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-gray-600 hidden sm:table-cell">{{ p.categoryName || '—' }}</td>
                <td class="px-4 py-3 text-right text-gray-900">{{ formatCurrency(p.price) }}</td>
                <td class="px-4 py-3 text-right hidden sm:table-cell" :class="p.stock <= 0 ? 'text-red-500 font-medium' : 'text-gray-600'">
                  {{ p.stock }}
                </td>
                <td class="px-4 py-3 text-center">
                  <span
                    class="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                    :class="p.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
                  >
                    {{ p.active ? 'Ativo' : 'Inativo' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right">
                  <div class="flex items-center justify-end gap-1">
                    <NuxtLink
                      :to="`/admin/produtos/${p.id}`"
                      class="p-2 rounded-lg text-gray-400 hover:text-teal hover:bg-teal/10 transition-colors"
                      title="Editar"
                    >
                      <i class="pi pi-pencil text-sm" />
                    </NuxtLink>
                    <button
                      @click="confirmDelete(p)"
                      class="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Excluir"
                    >
                      <i class="pi pi-trash text-sm" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="products.length === 0">
                <td colspan="6" class="px-4 py-12 text-center text-gray-400">
                  Nenhum produto cadastrado
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-4">
        <button
          v-for="p in totalPages"
          :key="p"
          @click="loadPage(p - 1)"
          class="w-9 h-9 rounded-lg text-sm font-medium transition-colors"
          :class="currentPage === p - 1 ? 'bg-teal text-white' : 'text-gray-600 hover:bg-gray-100'"
        >
          {{ p }}
        </button>
      </div>
    </div>

    <!-- Delete confirm modal -->
    <Teleport to="body">
      <div v-if="deleting" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="deleting = null">
        <div class="bg-white rounded-xl p-6 w-full max-w-sm mx-4 shadow-xl">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Excluir produto</h3>
          <p class="text-sm text-gray-600 mb-6">
            Tem certeza que deseja excluir <strong>{{ deleting.name }}</strong>? Esta acao nao pode ser desfeita.
          </p>
          <div class="flex gap-3 justify-end">
            <button
              @click="deleting = null"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="doDelete"
              class="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
            >
              Excluir
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { Product, Page } from '~/types'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const { $fetch } = useApi()
const config = useRuntimeConfig()

const products = ref<Product[]>([])
const loading = ref(true)
const currentPage = ref(0)
const totalPages = ref(0)
const deleting = ref<Product | null>(null)

async function loadPage(page: number) {
  loading.value = true
  try {
    const data = await $fetch<Page<Product>>(`/api/admin/products?page=${page}&size=20`)
    products.value = data.content
    totalPages.value = data.totalPages
    currentPage.value = data.number
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => loadPage(0))

function imageUrl(url: string) {
  if (url.startsWith('http')) return url
  return `${config.public.apiBase}${url}`
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function confirmDelete(p: Product) {
  deleting.value = p
}

async function doDelete() {
  if (!deleting.value) return
  try {
    await $fetch(`/api/admin/products/${deleting.value.id}`, { method: 'DELETE' })
    deleting.value = null
    await loadPage(currentPage.value)
  } catch (e) {
    console.error(e)
  }
}
</script>
