<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-serif font-bold text-gray-900">Pedidos</h1>
      <NuxtLink
        to="/admin/pedidos/novo"
        class="flex items-center gap-2 px-4 py-2 bg-teal text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
      >
        <i class="pi pi-plus text-xs" />
        Novo pedido
      </NuxtLink>
    </div>

    <!-- Pesquisa -->
    <div class="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-wrap gap-3 items-end">
      <div class="flex-1 min-w-[180px]">
        <label class="block text-xs font-medium text-gray-500 mb-1">ID, nome ou email do cliente</label>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Ex: 123, João Silva ou joao@email.com"
          class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal/30"
          @input="onSearchInput"
        />
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-500 mb-1">Data início</label>
        <input
          v-model="dateFrom"
          type="date"
          class="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal/30"
          @change="loadPage(0)"
        />
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-500 mb-1">Data fim</label>
        <input
          v-model="dateTo"
          type="date"
          class="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal/30"
          @change="loadPage(0)"
        />
      </div>
      <button
        v-if="searchQuery || dateFrom || dateTo"
        @click="clearSearch"
        class="text-sm text-gray-400 hover:text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <i class="pi pi-times text-xs mr-1" />Limpar
      </button>
    </div>

    <!-- Filtro por status -->
    <div class="flex gap-2 flex-wrap mb-4">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        @click="setTab(tab.value)"
        class="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
        :class="activeTab === tab.value
          ? 'bg-teal text-white'
          : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'"
      >
        {{ tab.label }}
      </button>
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
                <th class="text-left px-4 py-3 font-medium text-gray-500">#</th>
                <th class="text-left px-4 py-3 font-medium text-gray-500">Cliente</th>
                <th v-if="activeTab === 'ABANDONED'" class="text-left px-4 py-3 font-medium text-gray-500">Email</th>
                <th class="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Data</th>
                <th class="text-right px-4 py-3 font-medium text-gray-500">Total</th>
                <th class="text-center px-4 py-3 font-medium text-gray-500">Status</th>
                <th class="text-right px-4 py-3 font-medium text-gray-500">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="order in orders" :key="order.id" class="hover:bg-gray-50">
                <td class="px-4 py-3 text-gray-900 font-medium">#{{ order.id }}</td>
                <td class="px-4 py-3 text-gray-700">{{ order.customerName || '—' }}</td>
                <td v-if="activeTab === 'ABANDONED'" class="px-4 py-3 text-gray-500 text-xs">{{ order.guestEmail || '—' }}</td>
                <td class="px-4 py-3 text-gray-500 hidden sm:table-cell">{{ formatDate(order.createdAt) }}</td>
                <td class="px-4 py-3 text-right text-gray-900 font-medium">{{ formatCurrency(order.total) }}</td>
                <td class="px-4 py-3 text-center">
                  <select
                    :value="order.status"
                    @change="updateStatus(order.id, ($event.target as HTMLSelectElement).value)"
                    class="text-xs font-medium rounded-full px-3 py-1 border-0 cursor-pointer"
                    :class="statusClass(order.status)"
                  >
                    <option v-for="s in statuses" :key="s.value" :value="s.value">{{ s.label }}</option>
                  </select>
                </td>
                <td class="px-4 py-3 text-right">
                  <div class="flex items-center justify-end gap-1">
                    <button
                      v-if="order.status === 'ABANDONED' && order.recoveryToken"
                      @click="resendEmail(order)"
                      :disabled="resending === order.id"
                      class="p-2 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors inline-flex"
                      :title="order.recoveryEmailSent ? 'Reenviar email de recuperação' : 'Enviar email de recuperação'"
                    >
                      <i v-if="resending === order.id" class="pi pi-spin pi-spinner text-sm" />
                      <i v-else class="pi pi-send text-sm" />
                    </button>
                    <NuxtLink
                      :to="`/admin/pedidos/${order.id}`"
                      class="p-2 rounded-lg text-gray-400 hover:text-teal hover:bg-teal/10 transition-colors inline-flex"
                      title="Ver detalhes"
                    >
                      <i class="pi pi-eye text-sm" />
                    </NuxtLink>
                  </div>
                </td>
              </tr>
              <tr v-if="orders.length === 0">
                <td :colspan="activeTab === 'ABANDONED' ? 7 : 6" class="px-4 py-12 text-center text-gray-400">
                  Nenhum pedido encontrado
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="totalPages > 1" class="flex items-center justify-center gap-1.5 mt-4">
        <button
          @click="loadPage(currentPage - 1)"
          :disabled="currentPage === 0"
          class="w-9 h-9 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed flex items-center justify-center"
          aria-label="Página anterior"
        >
          <i class="pi pi-chevron-left text-xs" />
        </button>

        <template v-for="(item, idx) in pageItems" :key="idx">
          <span v-if="item === '...'" class="w-9 h-9 flex items-center justify-center text-gray-400 text-sm select-none">…</span>
          <button
            v-else
            @click="loadPage(item - 1)"
            class="w-9 h-9 rounded-lg text-sm font-medium transition-colors"
            :class="currentPage === item - 1 ? 'bg-teal text-white' : 'text-gray-600 hover:bg-gray-100'"
          >
            {{ item }}
          </button>
        </template>

        <button
          @click="loadPage(currentPage + 1)"
          :disabled="currentPage >= totalPages - 1"
          class="w-9 h-9 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed flex items-center justify-center"
          aria-label="Próxima página"
        >
          <i class="pi pi-chevron-right text-xs" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Order, Page } from '~/types'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const router = useRouter()
const { $fetch } = useApi()

const orders = ref<Order[]>([])
const loading = ref(true)
const currentPage = ref(0)
const totalPages = ref(0)
const resending = ref<number | null>(null)

const searchQuery = ref('')
const dateFrom = ref('')
const dateTo = ref('')

let searchTimeout: ReturnType<typeof setTimeout> | null = null

const tabs = [
  { value: '', label: 'Todos' },
  { value: 'ABANDONED', label: 'Abandonados' },
  { value: 'PENDING', label: 'Pendentes' },
  { value: 'CONFIRMED', label: 'Confirmados' },
  { value: 'CANCELLED', label: 'Cancelados' },
  { value: 'REFUNDED', label: 'Reembolsados' },
]

const activeTab = ref((route.query.status as string) || '')

// Janela de páginas com reticências: 1 … 4 5 [6] 7 8 … 20
const pageItems = computed<(number | '...')[]>(() => {
  const total = totalPages.value
  const current = currentPage.value + 1 // 1-based
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  const items: (number | '...')[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  if (start > 2) items.push('...')
  for (let p = start; p <= end; p++) items.push(p)
  if (end < total - 1) items.push('...')
  items.push(total)
  return items
})

const statuses = [
  { value: 'ABANDONED', label: 'Abandonado' },
  { value: 'PENDING', label: 'Pendente' },
  { value: 'CONFIRMED', label: 'Confirmado' },
  { value: 'SHIPPED', label: 'Enviado' },
  { value: 'DELIVERED', label: 'Entregue' },
  { value: 'CANCELLED', label: 'Cancelado' },
  { value: 'REFUSED', label: 'Pagamento recusado' },
  { value: 'REFUNDED', label: 'Reembolsado' },
  { value: 'PARTIALLY_REFUNDED', label: 'Reembolso parcial' },
]

function onSearchInput() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => loadPage(0), 400)
}

function clearSearch() {
  searchQuery.value = ''
  dateFrom.value = ''
  dateTo.value = ''
  loadPage(0)
}

function setTab(status: string) {
  activeTab.value = status
  router.replace({ query: status ? { status } : {} })
  loadPage(0)
}

function buildParams(page: number) {
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('size', '20')
  params.set('sort', 'createdAt,desc')

  if (activeTab.value) params.set('status', activeTab.value)

  const q = searchQuery.value.trim()
  if (q) {
    if (/^\d+$/.test(q)) {
      params.set('id', q)
    } else {
      params.set('customerName', q)
    }
  }

  if (dateFrom.value) params.set('dateFrom', `${dateFrom.value}T00:00:00`)
  if (dateTo.value) params.set('dateTo', `${dateTo.value}T23:59:59`)

  return params.toString()
}

async function loadPage(page: number) {
  loading.value = true
  try {
    const data = await $fetch<Page<Order>>(`/api/admin/orders?${buildParams(page)}`)
    orders.value = data.content
    totalPages.value = data.totalPages
    currentPage.value = data.number
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => loadPage(0))

async function updateStatus(orderId: number, status: string) {
  try {
    const updated = await $fetch<Order>(`/api/admin/orders/${orderId}/status?status=${status}`, {
      method: 'PATCH',
    })
    const idx = orders.value.findIndex(o => o.id === orderId)
    if (idx !== -1) orders.value[idx] = updated
  } catch (e) {
    console.error(e)
    alert('Erro ao atualizar status')
  }
}

async function resendEmail(order: Order) {
  resending.value = order.id
  try {
    await $fetch(`/api/admin/orders/${order.id}/resend-recovery-email`, { method: 'POST' })
    const idx = orders.value.findIndex(o => o.id === order.id)
    if (idx !== -1) orders.value[idx] = { ...orders.value[idx], recoveryEmailSent: true }
    alert(`Email de recuperação enviado para ${order.guestEmail}`)
  } catch (e: any) {
    alert(e?.data?.message || 'Erro ao reenviar email')
  } finally {
    resending.value = null
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function statusClass(status: string) {
  const map: Record<string, string> = {
    ABANDONED: 'bg-orange-100 text-orange-600',
    PENDING: 'bg-yellow-100 text-yellow-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    SHIPPED: 'bg-purple-100 text-purple-700',
    DELIVERED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-500',
    REFUSED: 'bg-rose-100 text-rose-700',
    REFUNDED: 'bg-gray-100 text-gray-600',
    PARTIALLY_REFUNDED: 'bg-amber-100 text-amber-700',
  }
  return map[status] || 'bg-gray-100 text-gray-600'
}
</script>
