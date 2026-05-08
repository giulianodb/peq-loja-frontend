<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink to="/admin/pedidos" class="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
        <i class="pi pi-arrow-left" />
      </NuxtLink>
      <h1 class="text-2xl font-serif font-bold text-gray-900">Pedido #{{ route.params.id }}</h1>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <i class="pi pi-spin pi-spinner text-3xl text-teal" />
    </div>

    <template v-else-if="order">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Itens -->
        <div class="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Itens do pedido</h2>
          <div class="divide-y divide-gray-100">
            <div v-for="item in order.items" :key="item.productId" class="flex items-center justify-between py-3">
              <div>
                <p class="font-medium text-gray-900">{{ item.productName }}</p>
                <p class="text-sm text-gray-500">{{ item.quantity }}x {{ formatCurrency(item.unitPrice) }}</p>
              </div>
              <p class="font-medium text-gray-900">{{ formatCurrency(item.subtotal) }}</p>
            </div>
          </div>
          <div class="flex items-center justify-between pt-4 mt-4 border-t border-gray-200">
            <span class="text-lg font-semibold text-gray-900">Total</span>
            <span class="text-lg font-bold text-teal">{{ formatCurrency(order.total) }}</span>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-4">
          <!-- Detalhes -->
          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Detalhes</h3>
            <dl class="space-y-3 text-sm">
              <div v-if="order.customerName">
                <dt class="text-gray-500">Cliente</dt>
                <dd class="font-medium text-gray-900">{{ order.customerName }}</dd>
              </div>
              <div v-if="order.guestEmail">
                <dt class="text-gray-500">Email</dt>
                <dd class="font-medium text-gray-900 break-all">{{ order.guestEmail }}</dd>
              </div>
              <div>
                <dt class="text-gray-500">Data</dt>
                <dd class="font-medium text-gray-900">{{ formatDate(order.createdAt) }}</dd>
              </div>
              <div v-if="order.paymentMethod">
                <dt class="text-gray-500">Pagamento</dt>
                <dd class="font-medium text-gray-900">{{ order.paymentMethod }}</dd>
              </div>
            </dl>
          </div>

          <!-- Status -->
          <div class="bg-white rounded-xl border border-gray-200 p-6">
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Status</h3>
            <select
              :value="order.status"
              @change="updateStatus(($event.target as HTMLSelectElement).value)"
              class="w-full text-sm font-medium rounded-lg px-3 py-2 border border-gray-200 cursor-pointer"
            >
              <option v-for="s in statuses" :key="s.value" :value="s.value">{{ s.label }}</option>
            </select>
          </div>

          <!-- Recuperação de carrinho -->
          <div v-if="order.status === 'ABANDONED' && order.recoveryToken" class="bg-orange-50 rounded-xl border border-orange-200 p-6">
            <h3 class="text-sm font-semibold text-orange-700 uppercase tracking-wide mb-3">Recuperação</h3>
            <dl class="space-y-3 text-sm mb-4">
              <div>
                <dt class="text-orange-600">Email enviado</dt>
                <dd class="font-medium text-gray-900">{{ order.recoveryEmailSent ? 'Sim' : 'Não' }}</dd>
              </div>
              <div v-if="order.funnelSlug">
                <dt class="text-orange-600">Funil</dt>
                <dd class="font-medium text-gray-900">{{ order.funnelSlug }}</dd>
              </div>
              <div>
                <dt class="text-orange-600">Link de recuperação</dt>
                <dd class="mt-1">
                  <a
                    :href="recoveryUrl"
                    target="_blank"
                    class="text-xs text-orange-600 underline break-all"
                  >{{ recoveryUrl }}</a>
                </dd>
              </div>
            </dl>
            <button
              @click="resendEmail"
              :disabled="resending"
              class="w-full py-2 px-4 text-sm font-medium text-orange-700 border border-orange-300 rounded-lg hover:bg-orange-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <i v-if="resending" class="pi pi-spin pi-spinner text-xs" />
              <i v-else class="pi pi-send text-xs" />
              {{ order.recoveryEmailSent ? 'Reenviar email' : 'Enviar email de recuperação' }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Order } from '~/types'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const { $fetch } = useApi()

const order = ref<Order | null>(null)
const loading = ref(true)
const resending = ref(false)

const statuses = [
  { value: 'ABANDONED', label: 'Abandonado' },
  { value: 'PENDING', label: 'Pendente' },
  { value: 'CONFIRMED', label: 'Confirmado' },
  { value: 'SHIPPED', label: 'Enviado' },
  { value: 'DELIVERED', label: 'Entregue' },
  { value: 'CANCELLED', label: 'Cancelado' },
]

const recoveryUrl = computed(() => {
  if (!order.value?.recoveryToken) return ''
  const base = import.meta.client ? window.location.origin : ''
  return `${base}/checkout/recuperar/${order.value.recoveryToken}`
})

onMounted(async () => {
  try {
    order.value = await $fetch<Order>(`/api/admin/orders/${route.params.id}`)
  } catch {
    navigateTo('/admin/pedidos')
  } finally {
    loading.value = false
  }
})

async function updateStatus(status: string) {
  try {
    order.value = await $fetch<Order>(`/api/admin/orders/${route.params.id}/status?status=${status}`, {
      method: 'PATCH',
    })
  } catch (e) {
    console.error(e)
    alert('Erro ao atualizar status')
  }
}

async function resendEmail() {
  if (!order.value) return
  resending.value = true
  try {
    await $fetch(`/api/admin/orders/${order.value.id}/resend-recovery-email`, { method: 'POST' })
    order.value = { ...order.value, recoveryEmailSent: true }
    alert(`Email de recuperação enviado para ${order.value.guestEmail}`)
  } catch (e: any) {
    alert(e?.data?.message || 'Erro ao reenviar email')
  } finally {
    resending.value = false
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}
</script>
