<template>
  <div>
    <h1 class="text-2xl font-serif font-bold text-gray-900 mb-6">Pedidos</h1>

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

const tabs = [
  { value: '', label: 'Todos' },
  { value: 'ABANDONED', label: 'Abandonados' },
  { value: 'PENDING', label: 'Pendentes' },
  { value: 'CONFIRMED', label: 'Confirmados' },
  { value: 'CANCELLED', label: 'Cancelados' },
  { value: 'REFUNDED', label: 'Reembolsados' },
]

const activeTab = ref((route.query.status as string) || '')

const statuses = [
  { value: 'ABANDONED', label: 'Abandonado' },
  { value: 'PENDING', label: 'Pendente' },
  { value: 'CONFIRMED', label: 'Confirmado' },
  { value: 'SHIPPED', label: 'Enviado' },
  { value: 'DELIVERED', label: 'Entregue' },
  { value: 'CANCELLED', label: 'Cancelado' },
  { value: 'REFUNDED', label: 'Reembolsado' },
]

function setTab(status: string) {
  activeTab.value = status
  router.replace({ query: status ? { status } : {} })
  loadPage(0)
}

async function loadPage(page: number) {
  loading.value = true
  try {
    const statusParam = activeTab.value ? `&status=${activeTab.value}` : ''
    const data = await $fetch<Page<Order>>(
      `/api/admin/orders?page=${page}&size=20&sort=createdAt,desc${statusParam}`
    )
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
    REFUNDED: 'bg-gray-100 text-gray-600',
  }
  return map[status] || 'bg-gray-100 text-gray-600'
}
</script>
