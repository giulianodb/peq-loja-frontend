<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-serif font-bold text-gray-900">Checkouts</h1>
      <NuxtLink
        to="/admin/checkouts/novo"
        class="inline-flex items-center gap-2 px-4 py-2 bg-teal text-white text-sm font-medium rounded-lg hover:bg-teal/90 transition-colors"
      >
        <i class="pi pi-plus text-xs" />
        Novo checkout
      </NuxtLink>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <i class="pi pi-spin pi-spinner text-3xl text-teal" />
    </div>

    <div v-else>
      <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200">
                <th class="text-left px-4 py-3 font-medium text-gray-500">Nome</th>
                <th class="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Produto</th>
                <th class="text-right px-4 py-3 font-medium text-gray-500">Preco</th>
                <th class="text-center px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Bumps</th>
                <th class="text-center px-4 py-3 font-medium text-gray-500">Status</th>
                <th class="text-right px-4 py-3 font-medium text-gray-500">Acoes</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="f in funnels" :key="f.id" class="hover:bg-gray-50">
                <td class="px-4 py-3">
                  <div>
                    <span class="font-medium text-gray-900">{{ f.name }}</span>
                    <span class="block text-xs text-gray-400 mt-0.5">/checkout/{{ f.slug }}</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-gray-600 hidden sm:table-cell">
                  <div class="flex items-center gap-2">
                    <img
                      v-if="f.product.imageUrl"
                      :src="imgUrl(f.product.imageUrl)"
                      class="w-8 h-8 rounded object-cover border border-gray-200"
                    />
                    <span class="truncate max-w-[160px]">{{ f.product.name }}</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-right text-gray-900">{{ formatCurrency(f.product.funnelPrice) }}</td>
                <td class="px-4 py-3 text-center hidden sm:table-cell">
                  <span class="inline-block bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium">
                    {{ f.bumps.length }}
                  </span>
                </td>
                <td class="px-4 py-3 text-center">
                  <span
                    class="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                    :class="f.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
                  >
                    {{ f.active ? 'Ativo' : 'Inativo' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right">
                  <div class="flex items-center justify-end gap-1">
                    <button
                      @click="copyLink(f.slug)"
                      class="p-2 rounded-lg text-gray-400 hover:text-teal hover:bg-teal/10 transition-colors"
                      title="Copiar link"
                    >
                      <i class="pi pi-link text-sm" />
                    </button>
                    <NuxtLink
                      :to="`/admin/checkouts/${f.id}`"
                      class="p-2 rounded-lg text-gray-400 hover:text-teal hover:bg-teal/10 transition-colors"
                      title="Editar"
                    >
                      <i class="pi pi-pencil text-sm" />
                    </NuxtLink>
                    <button
                      @click="confirmDelete(f)"
                      class="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Excluir"
                    >
                      <i class="pi pi-trash text-sm" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="funnels.length === 0">
                <td colspan="6" class="px-4 py-12 text-center text-gray-400">
                  Nenhum checkout cadastrado
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

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

    <!-- Delete modal -->
    <Teleport to="body">
      <div v-if="deleting" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="deleting = null">
        <div class="bg-white rounded-xl p-6 w-full max-w-sm mx-4 shadow-xl">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Excluir checkout</h3>
          <p class="text-sm text-gray-600 mb-6">
            Tem certeza que deseja excluir <strong>{{ deleting.name }}</strong>?
          </p>
          <div class="flex gap-3 justify-end">
            <button @click="deleting = null" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              Cancelar
            </button>
            <button @click="doDelete" class="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors">
              Excluir
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Copied toast -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="copied" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg">
          Link copiado!
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { Page } from '~/types'

interface FunnelItem {
  id: number
  name: string
  slug: string
  active: boolean
  product: { id: number; name: string; imageUrl: string | null; funnelPrice: number }
  bumps: any[]
}

definePageMeta({ layout: 'admin', middleware: 'admin' })

const { $fetch } = useApi()
const config = useRuntimeConfig()

const funnels = ref<FunnelItem[]>([])
const loading = ref(true)
const currentPage = ref(0)
const totalPages = ref(0)
const deleting = ref<FunnelItem | null>(null)
const copied = ref(false)

async function loadPage(page: number) {
  loading.value = true
  try {
    const data = await $fetch<Page<FunnelItem>>(`/api/admin/funnels?page=${page}&size=20`)
    funnels.value = data.content
    totalPages.value = data.totalPages
    currentPage.value = data.number
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => loadPage(0))

function imgUrl(url: string) {
  if (url.startsWith('http')) return url
  return `${config.public.apiBase}${url}`
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

async function copyLink(slug: string) {
  const { copy } = useClipboard()
  const url = `${window.location.origin}/checkout/${slug}`
  await copy(url)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

function confirmDelete(f: FunnelItem) {
  deleting.value = f
}

async function doDelete() {
  if (!deleting.value) return
  try {
    await $fetch(`/api/admin/funnels/${deleting.value.id}`, { method: 'DELETE' })
    deleting.value = null
    await loadPage(currentPage.value)
  } catch (e) {
    console.error(e)
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
