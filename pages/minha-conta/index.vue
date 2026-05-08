<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 py-12">
    <!-- Header -->
    <div class="flex items-center justify-between mb-10">
      <div>
        <h1 class="section-title text-3xl">Minha Conta</h1>
        <p class="mt-1 text-steel">
          Olá, <span class="font-medium text-teal">{{ auth.user?.name }}</span>
        </p>
      </div>
      <button
        @click="logout"
        class="text-sm text-steel hover:text-red-500 transition-colors flex items-center gap-1.5"
      >
        <i class="pi pi-sign-out" />
        Sair
      </button>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 mb-10 border-b border-border">
      <NuxtLink
        to="/minha-conta"
        class="px-4 py-2.5 text-sm font-medium transition-colors border-b-2 border-coral text-teal"
      >
        Meus Pedidos
      </NuxtLink>
      <NuxtLink
        to="/minha-conta/materiais"
        class="px-4 py-2.5 text-sm font-medium transition-colors border-b-2 border-transparent text-steel hover:text-teal"
      >
        Meus Materiais
      </NuxtLink>
    </div>

    <!-- Profile card -->
    <div class="bg-sand-100 rounded-xl p-6 mb-10">
      <h2 class="font-serif text-xl text-teal mb-4">Dados Pessoais</h2>
      <div class="grid sm:grid-cols-2 gap-4">
        <div>
          <label class="text-xs uppercase tracking-wider text-steel">Nome</label>
          <p class="text-primary-800 font-medium">{{ auth.user?.name }}</p>
        </div>
        <div>
          <label class="text-xs uppercase tracking-wider text-steel">Email</label>
          <p class="text-primary-800 font-medium">{{ auth.user?.email }}</p>
        </div>
      </div>
    </div>

    <!-- Orders -->
    <div>
      <h2 class="font-serif text-xl text-teal mb-6">Meus Pedidos</h2>

      <div v-if="loadingOrders" class="space-y-4">
        <div v-for="i in 3" :key="i" class="animate-pulse bg-sand-100 rounded-xl h-24" />
      </div>

      <div v-else-if="orders.length === 0" class="bg-light rounded-xl p-8 text-center">
        <i class="pi pi-inbox text-3xl text-salmon mb-3" />
        <p class="text-steel">Você ainda não fez nenhum pedido.</p>
        <NuxtLink to="/loja" class="btn-primary mt-4 inline-block text-sm">
          Explorar Materiais
        </NuxtLink>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="order in orders"
          :key="order.id"
          class="border border-border rounded-xl p-5 hover:border-salmon/50 transition-colors"
        >
          <div class="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div class="flex items-center gap-3">
              <span class="font-serif text-teal font-medium">
                Pedido #{{ order.id }}
              </span>
              <span :class="statusClass(order.status)" class="px-2.5 py-0.5 rounded-full text-xs font-medium">
                {{ statusLabel(order.status) }}
              </span>
            </div>
            <div class="text-sm text-steel">
              {{ formatDate(order.createdAt) }}
            </div>
          </div>

          <div class="space-y-1.5">
            <div
              v-for="item in order.items"
              :key="item.productId"
              class="flex justify-between text-sm"
            >
              <span class="text-primary-700">
                {{ item.productName }}
                <span class="text-steel">× {{ item.quantity }}</span>
              </span>
              <span class="text-primary-800 font-medium">{{ formatPrice(item.subtotal) }}</span>
            </div>
          </div>

          <div class="border-t border-border mt-3 pt-3 flex justify-between">
            <span class="text-sm text-steel">Total</span>
            <span class="font-semibold text-coral">{{ formatPrice(order.total) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Order, Page } from '~/types'

definePageMeta({ middleware: 'auth' })

const auth = useAuthStore()
const router = useRouter()
const { $fetch: apiFetch } = useApi()

const orders = ref<Order[]>([])
const loadingOrders = ref(true)

function logout() {
  auth.logout()
  router.push('/')
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    PENDING: 'Pendente',
    CONFIRMED: 'Confirmado',
    SHIPPED: 'Enviado',
    DELIVERED: 'Entregue',
    CANCELLED: 'Cancelado',
  }
  return map[status] || status
}

function statusClass(status: string) {
  const map: Record<string, string> = {
    PENDING: 'bg-sand-100 text-sand-800',
    CONFIRMED: 'bg-blue-50 text-blue-700',
    SHIPPED: 'bg-purple-50 text-purple-700',
    DELIVERED: 'bg-moss-50 text-moss-700',
    CANCELLED: 'bg-red-50 text-red-700',
  }
  return map[status] || 'bg-light text-primary-700'
}

onMounted(async () => {
  try {
    const data = await apiFetch<Page<Order>>('/api/orders?size=20&sort=createdAt,desc')
    orders.value = data.content
  } catch {
    // ignore
  } finally {
    loadingOrders.value = false
  }
})
</script>
