<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-serif font-bold text-gray-900">Clientes</h1>
    </div>

    <!-- Busca -->
    <div class="relative mb-4 max-w-sm">
      <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
      <input
        v-model="search"
        type="text"
        placeholder="Buscar por nome ou email..."
        class="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30"
      />
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <i class="pi pi-spin pi-spinner text-3xl text-teal" />
    </div>

    <div v-else>
      <div v-if="customers.length === 0" class="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
        Nenhum cliente encontrado
      </div>

      <div v-else class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="text-left px-4 py-3 font-medium text-gray-500">Nome</th>
                <th class="text-left px-4 py-3 font-medium text-gray-500">Email</th>
                <th class="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Telefone</th>
                <th class="text-left px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">Cadastro</th>
                <th class="text-right px-4 py-3 font-medium text-gray-500">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="c in customers" :key="c.id" class="hover:bg-gray-50">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-full bg-teal/10 flex items-center justify-center shrink-0">
                      <span class="text-teal text-xs font-semibold">{{ c.name.charAt(0).toUpperCase() }}</span>
                    </div>
                    <span class="font-medium text-gray-800">{{ c.name }}</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-gray-600">{{ c.email }}</td>
                <td class="px-4 py-3 text-gray-500 hidden md:table-cell">{{ c.phone || '—' }}</td>
                <td class="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">{{ formatDate(c.createdAt) }}</td>
                <td class="px-4 py-3 text-right">
                  <div class="flex items-center justify-end gap-1">
                    <NuxtLink
                      :to="`/admin/clientes/${c.id}`"
                      class="p-2 rounded-lg text-gray-400 hover:text-teal hover:bg-teal/10 transition-colors"
                    >
                      <i class="pi pi-pencil text-sm" />
                    </NuxtLink>
                    <button
                      @click="confirmDelete(c)"
                      class="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <i class="pi pi-trash text-sm" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Paginação -->
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

    <!-- Modal de confirmação de exclusão -->
    <Teleport to="body">
      <div v-if="deleting" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="deleting = null">
        <div class="bg-white rounded-xl p-6 w-full max-w-sm mx-4 shadow-xl">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Excluir cliente</h3>
          <p class="text-sm text-gray-600 mb-1">
            Deseja excluir o cliente <strong>{{ deleting.name }}</strong>?
          </p>
          <p class="text-xs text-gray-400 mb-6">
            O acesso à conta será removido. Os pedidos existentes serão mantidos.
          </p>
          <div class="flex gap-3 justify-end">
            <button @click="deleting = null" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              Cancelar
            </button>
            <button @click="doDelete" :disabled="deleteLoading" class="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors">
              <i v-if="deleteLoading" class="pi pi-spin pi-spinner mr-1" />
              Excluir
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { Page } from '~/types'

interface CustomerItem {
  id: number
  name: string
  email: string
  phone: string | null
  createdAt: string
}

definePageMeta({ layout: 'admin', middleware: 'admin' })

const { $fetch } = useApi()
const customers = ref<CustomerItem[]>([])
const loading = ref(true)
const currentPage = ref(0)
const totalPages = ref(0)
const search = ref('')
const deleting = ref<CustomerItem | null>(null)
const deleteLoading = ref(false)

let searchTimeout: ReturnType<typeof setTimeout> | null = null

watch(search, () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => loadPage(0), 350)
})

async function loadPage(page: number) {
  loading.value = true
  try {
    const params = new URLSearchParams({ page: String(page), size: '20' })
    if (search.value.trim()) params.set('search', search.value.trim())
    const data = await $fetch<Page<CustomerItem>>(`/api/admin/customers?${params}`)
    customers.value = data.content
    totalPages.value = data.totalPages
    currentPage.value = data.number
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => loadPage(0))

function confirmDelete(c: CustomerItem) {
  deleting.value = c
}

async function doDelete() {
  if (!deleting.value) return
  deleteLoading.value = true
  try {
    await $fetch(`/api/admin/customers/${deleting.value.id}`, { method: 'DELETE' })
    deleting.value = null
    await loadPage(currentPage.value)
  } catch (e) {
    console.error(e)
  } finally {
    deleteLoading.value = false
  }
}

function formatDate(iso: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR')
}
</script>
