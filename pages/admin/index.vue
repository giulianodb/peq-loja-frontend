<template>
  <div>
    <h1 class="text-2xl font-serif font-bold text-gray-900 mb-6">Dashboard</h1>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <i class="pi pi-spin pi-spinner text-3xl text-teal" />
    </div>

    <template v-else-if="dashboard">
      <!-- KPI Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-lg bg-teal/10 flex items-center justify-center">
              <i class="pi pi-shopping-bag text-teal" />
            </div>
          </div>
          <p class="text-2xl font-bold text-gray-900">{{ dashboard.totalOrders }}</p>
          <p class="text-sm text-gray-500">Pedidos</p>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <i class="pi pi-dollar text-green-600" />
            </div>
          </div>
          <p class="text-2xl font-bold text-gray-900">{{ formatCurrency(dashboard.totalRevenue) }}</p>
          <p class="text-sm text-gray-500">Receita total</p>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <i class="pi pi-box text-purple-600" />
            </div>
          </div>
          <p class="text-2xl font-bold text-gray-900">{{ dashboard.totalProducts }}</p>
          <p class="text-sm text-gray-500">Produtos</p>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
              <i class="pi pi-users text-orange-600" />
            </div>
          </div>
          <p class="text-2xl font-bold text-gray-900">{{ dashboard.totalCustomers }}</p>
          <p class="text-sm text-gray-500">Clientes</p>
        </div>
      </div>

      <!-- Carrinho Abandonado -->
      <div class="bg-white rounded-xl border border-orange-200 p-5 mb-8">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
              <i class="pi pi-shopping-cart text-orange-500 text-xl" />
            </div>
            <div>
              <p class="text-sm text-gray-500 mb-0.5">Carrinhos abandonados</p>
              <div class="flex items-baseline gap-4">
                <span class="text-2xl font-bold text-gray-900">{{ dashboard.abandonedCount }}</span>
                <span class="text-sm text-gray-500">
                  <span class="font-medium text-green-600">{{ dashboard.recoveredCount }} recuperados</span>
                  <template v-if="recoveryRate !== null"> · <span class="font-medium">{{ recoveryRate }}% taxa</span></template>
                </span>
              </div>
            </div>
          </div>
          <NuxtLink
            to="/admin/pedidos?status=ABANDONED"
            class="px-4 py-2 text-sm font-medium text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors whitespace-nowrap"
          >
            Ver abandonados
          </NuxtLink>
        </div>
      </div>

      <!-- Orders by Status -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Pedidos por status</h2>
          <div class="space-y-3">
            <div
              v-for="(count, status) in dashboard.ordersByStatus"
              :key="status"
              class="flex items-center justify-between"
            >
              <div class="flex items-center gap-2">
                <span
                  class="w-2.5 h-2.5 rounded-full"
                  :class="statusColor(status as string)"
                />
                <span class="text-sm text-gray-700">{{ statusLabel(status as string) }}</span>
              </div>
              <span class="text-sm font-semibold text-gray-900">{{ count }}</span>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Receita mensal</h2>
          <div v-if="Object.keys(dashboard.revenueByMonth).length === 0" class="text-sm text-gray-400 py-8 text-center">
            Nenhuma venda registrada
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="(amount, month) in dashboard.revenueByMonth"
              :key="month"
              class="flex items-center justify-between"
            >
              <span class="text-sm text-gray-700">{{ formatMonth(month as string) }}</span>
              <span class="text-sm font-semibold text-gray-900">{{ formatCurrency(amount as number) }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="text-center py-20 text-gray-400">
      Erro ao carregar dashboard
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const { $fetch } = useApi()

interface Dashboard {
  totalOrders: number
  totalRevenue: number
  totalProducts: number
  totalCustomers: number
  ordersByStatus: Record<string, number>
  revenueByMonth: Record<string, number>
  abandonedCount: number
  recoveredCount: number
}

const dashboard = ref<Dashboard | null>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    dashboard.value = await $fetch<Dashboard>('/api/admin/dashboard')
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatMonth(ym: string) {
  const [year, month] = ym.split('-')
  const date = new Date(Number(year), Number(month) - 1)
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

const statusLabels: Record<string, string> = {
  ABANDONED: 'Abandonado',
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmado',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregue',
  CANCELLED: 'Cancelado',
}

function statusLabel(s: string) {
  return statusLabels[s] || s
}

function statusColor(s: string) {
  const map: Record<string, string> = {
    ABANDONED: 'bg-orange-400',
    PENDING: 'bg-yellow-400',
    CONFIRMED: 'bg-blue-500',
    SHIPPED: 'bg-purple-500',
    DELIVERED: 'bg-green-500',
    CANCELLED: 'bg-red-400',
  }
  return map[s] || 'bg-gray-400'
}

const recoveryRate = computed(() => {
  if (!dashboard.value) return null
  const total = dashboard.value.abandonedCount + dashboard.value.recoveredCount
  if (total === 0) return null
  return Math.round((dashboard.value.recoveredCount / total) * 100)
})
</script>
