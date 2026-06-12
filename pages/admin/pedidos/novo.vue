<template>
  <div>
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink to="/admin/pedidos" class="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
        <i class="pi pi-arrow-left" />
      </NuxtLink>
      <h1 class="text-2xl font-serif font-bold text-gray-900">Novo pedido</h1>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left column -->
      <div class="lg:col-span-2 space-y-6">

        <!-- Cliente -->
        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <h2 class="font-semibold text-gray-800 mb-4">Cliente</h2>

          <!-- Cliente selecionado -->
          <div v-if="selectedCustomer" class="flex items-start justify-between gap-3 p-3 bg-teal/5 border border-teal/20 rounded-lg">
            <div>
              <p class="font-medium text-gray-800">{{ selectedCustomer.name }}</p>
              <p class="text-sm text-gray-500">{{ selectedCustomer.email }}</p>
              <p v-if="selectedCustomer.phone" class="text-sm text-gray-500">{{ selectedCustomer.phone }}</p>
              <span class="inline-block mt-1 text-xs bg-teal/10 text-teal px-2 py-0.5 rounded-full">Cliente cadastrado</span>
            </div>
            <button @click="clearCustomer" class="text-gray-400 hover:text-gray-600 p-1 rounded">
              <i class="pi pi-times text-sm" />
            </button>
          </div>

          <!-- Modo manual ativo -->
          <div v-else-if="manualMode">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nome <span class="text-red-500">*</span></label>
                <input v-model="guest.name" type="text" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30" placeholder="Nome completo" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email <span class="text-red-500">*</span></label>
                <input v-model="guest.email" type="email" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30" placeholder="email@exemplo.com" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input v-model="guest.phone" type="text" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30" placeholder="(00) 00000-0000" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                <input v-model="guest.cpf" type="text" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30" placeholder="000.000.000-00" />
              </div>
            </div>
            <button @click="manualMode = false" class="mt-3 text-sm text-gray-400 hover:text-gray-600">
              <i class="pi pi-arrow-left text-xs mr-1" />Voltar para busca
            </button>
          </div>

          <!-- Nenhum cliente selecionado -->
          <div v-else class="flex flex-col sm:flex-row gap-2">
            <button
              @click="openModal"
              class="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <i class="pi pi-search text-gray-400" />
              Buscar cliente cadastrado
            </button>
            <button
              @click="manualMode = true"
              class="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <i class="pi pi-user-plus text-gray-400" />
              Inserir dados manualmente
            </button>
          </div>
        </div>

        <!-- Produtos -->
        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <h2 class="font-semibold text-gray-800 mb-4">Produtos</h2>

          <!-- Itens adicionados -->
          <div v-if="items.length" class="mb-4 space-y-2">
            <div
              v-for="(item, idx) in items"
              :key="idx"
              class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100"
            >
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-800 truncate">{{ item.productName }}</p>
                <p class="text-xs text-gray-400">Preço original: {{ formatCurrency(item.originalPrice) }}</p>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <div class="flex items-center gap-1">
                  <button
                    @click="item.quantity = Math.max(1, item.quantity - 1)"
                    class="w-6 h-6 rounded border border-gray-200 text-gray-500 hover:bg-gray-100 flex items-center justify-center text-xs"
                  >-</button>
                  <span class="w-6 text-center text-sm font-medium">{{ item.quantity }}</span>
                  <button
                    @click="item.quantity++"
                    class="w-6 h-6 rounded border border-gray-200 text-gray-500 hover:bg-gray-100 flex items-center justify-center text-xs"
                  >+</button>
                </div>
                <div class="flex items-center gap-1">
                  <span class="text-xs text-gray-400">R$</span>
                  <input
                    v-model.number="item.unitPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    class="w-20 border border-gray-200 rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-2 focus:ring-teal/30"
                  />
                </div>
                <button @click="removeItem(idx)" class="text-gray-300 hover:text-red-400 p-1">
                  <i class="pi pi-trash text-xs" />
                </button>
              </div>
            </div>
          </div>

          <!-- Adicionar produto -->
          <div ref="productPickerRef" class="relative">
            <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              v-model="productSearch"
              @input="onProductInput"
              @focus="onProductFocus"
              type="text"
              class="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30"
              placeholder="Buscar produto para adicionar..."
            />
            <div
              v-if="showProductResults && productSearch.length >= 1"
              class="absolute z-10 top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden max-h-72 overflow-y-auto"
            >
              <div v-if="searchingProducts" class="py-6 text-center text-gray-400 text-sm">
                <i class="pi pi-spin pi-spinner" />
              </div>
              <template v-else-if="productResults.length">
                <button
                  v-for="p in productResults"
                  :key="p.id"
                  @click="addProduct(p)"
                  class="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 text-left border-b border-gray-100 last:border-0"
                >
                  <span class="text-sm text-gray-800">{{ p.name }}</span>
                  <span class="text-xs text-gray-400 ml-2 shrink-0">{{ formatCurrency(p.price) }}</span>
                </button>
              </template>
              <div v-else class="py-6 text-center text-gray-400 text-sm">Nenhum produto encontrado</div>
            </div>
          </div>
          <p v-if="!items.length" class="text-xs text-gray-400 mt-2">Nenhum produto adicionado</p>
        </div>
      </div>

      <!-- Right column — Resumo -->
      <div class="space-y-4">
        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <h2 class="font-semibold text-gray-800 mb-4">Resumo</h2>

          <div class="space-y-3 mb-4">
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Itens</span>
              <span class="text-gray-800">{{ items.length }}</span>
            </div>
            <div class="flex justify-between text-sm font-semibold border-t border-gray-100 pt-3">
              <span class="text-gray-800">Total</span>
              <span class="text-teal">{{ formatCurrency(orderTotal) }}</span>
            </div>
          </div>

          <div class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Forma de pagamento</label>
              <select v-model="paymentMethod" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30">
                <option value="">— Não informado —</option>
                <option value="pix">Pix</option>
                <option value="credit_card">Cartão de crédito</option>
                <option value="boleto">Boleto</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select v-model="status" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30">
                <option value="CONFIRMED">Confirmado</option>
                <option value="PENDING">Pendente</option>
                <option value="DELIVERED">Entregue</option>
              </select>
            </div>
          </div>
        </div>

        <button
          @click="submit"
          :disabled="saving || !canSubmit"
          class="w-full bg-teal text-white font-medium py-3 rounded-xl transition-opacity text-sm"
          :class="!canSubmit || saving ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'"
        >
          <i v-if="saving" class="pi pi-spin pi-spinner mr-2" />
          {{ saving ? 'Salvando...' : 'Criar pedido' }}
        </button>

        <p v-if="error" class="text-xs text-red-500 text-center">{{ error }}</p>
      </div>
    </div>

    <!-- Modal busca de cliente -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40" @click="showModal = false" />
        <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
          <div class="p-5 border-b border-gray-100">
            <h3 class="font-semibold text-gray-800">Buscar cliente</h3>
          </div>

          <div class="p-4">
            <div class="relative">
              <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                v-model="customerQuery"
                @input="searchCustomers"
                ref="customerSearchInput"
                type="text"
                class="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30"
                placeholder="Nome ou email..."
              />
            </div>
          </div>

          <!-- Resultados -->
          <div class="max-h-64 overflow-y-auto divide-y divide-gray-100">
            <div v-if="searchingCustomers" class="py-8 text-center text-gray-400 text-sm">
              <i class="pi pi-spin pi-spinner" />
            </div>
            <div v-else-if="customerResults.length === 0 && customerQuery.length >= 2" class="py-6 text-center text-gray-400 text-sm">
              Nenhum cliente encontrado
            </div>
            <button
              v-for="c in customerResults"
              :key="c.id"
              @click="selectCustomer(c)"
              class="w-full flex items-start gap-3 px-5 py-3 hover:bg-gray-50 text-left transition-colors"
            >
              <div class="w-8 h-8 rounded-full bg-teal/10 flex items-center justify-center shrink-0 mt-0.5">
                <span class="text-teal text-xs font-semibold">{{ c.name.charAt(0).toUpperCase() }}</span>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-800">{{ c.name }}</p>
                <p class="text-xs text-gray-500">{{ c.email }}</p>
                <p v-if="c.phone" class="text-xs text-gray-400">{{ c.phone }}</p>
              </div>
            </button>
          </div>

          <!-- Ação manual -->
          <div class="p-4 border-t border-gray-100">
            <button
              @click="switchToManual"
              class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <i class="pi pi-user-plus text-gray-400" />
              Inserir dados manualmente
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
const router = useRouter()

// ─── Customer ────────────────────────────────────────────────────────────────

interface CustomerResult {
  id: number
  name: string
  email: string
  phone: string | null
}

const showModal = ref(false)
const customerQuery = ref('')
const customerResults = ref<CustomerResult[]>([])
const searchingCustomers = ref(false)
const selectedCustomer = ref<CustomerResult | null>(null)
const manualMode = ref(false)
const customerSearchInput = ref<HTMLInputElement | null>(null)

const guest = reactive({ name: '', email: '', phone: '', cpf: '' })

let customerSearchTimeout: ReturnType<typeof setTimeout> | null = null

function openModal() {
  showModal.value = true
  customerQuery.value = ''
  customerResults.value = []
  nextTick(() => customerSearchInput.value?.focus())
}

function searchCustomers() {
  if (customerSearchTimeout) clearTimeout(customerSearchTimeout)
  if (customerQuery.value.length < 2) {
    customerResults.value = []
    return
  }
  customerSearchTimeout = setTimeout(async () => {
    searchingCustomers.value = true
    try {
      customerResults.value = await $fetch<CustomerResult[]>(
        `/api/admin/customers/search?q=${encodeURIComponent(customerQuery.value)}`
      )
    } catch {
      customerResults.value = []
    } finally {
      searchingCustomers.value = false
    }
  }, 300)
}

function selectCustomer(c: CustomerResult) {
  selectedCustomer.value = c
  showModal.value = false
  manualMode.value = false
}

function clearCustomer() {
  selectedCustomer.value = null
}

function switchToManual() {
  showModal.value = false
  manualMode.value = true
}

// ─── Products ────────────────────────────────────────────────────────────────

interface OrderItemDraft {
  productId: number
  productName: string
  originalPrice: number
  quantity: number
  unitPrice: number
}

const items = ref<OrderItemDraft[]>([])
const productSearch = ref('')
const productResults = ref<Product[]>([])
const showProductResults = ref(false)
const searchingProducts = ref(false)
const productPickerRef = ref<HTMLElement | null>(null)
let productSearchTimeout: ReturnType<typeof setTimeout> | null = null

function onProductFocus() {
  if (productSearch.value.length >= 1) showProductResults.value = true
}

function onProductInput() {
  showProductResults.value = true
  searchProducts()
}

function searchProducts() {
  if (productSearchTimeout) clearTimeout(productSearchTimeout)
  if (productSearch.value.length < 1) {
    productResults.value = []
    searchingProducts.value = false
    return
  }
  searchingProducts.value = true
  productSearchTimeout = setTimeout(async () => {
    try {
      const data = await $fetch<Page<Product>>(
        `/api/admin/products?size=10&search=${encodeURIComponent(productSearch.value)}`
      )
      productResults.value = data.content
    } catch {
      productResults.value = []
    } finally {
      searchingProducts.value = false
    }
  }, 300)
}

function addProduct(p: Product) {
  const existing = items.value.find(i => i.productId === p.id)
  if (existing) {
    existing.quantity++
  } else {
    items.value.push({
      productId: p.id,
      productName: p.name,
      originalPrice: p.price,
      quantity: 1,
      unitPrice: p.price,
    })
  }
  productSearch.value = ''
  productResults.value = []
  showProductResults.value = false
}

function removeItem(idx: number) {
  items.value.splice(idx, 1)
}

// Fecha o dropdown apenas quando o clique acontece fora do seletor de produtos
function handleClickOutside(e: MouseEvent) {
  if (productPickerRef.value && !productPickerRef.value.contains(e.target as Node)) {
    showProductResults.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))

// ─── Order ───────────────────────────────────────────────────────────────────

const paymentMethod = ref('')
const status = ref('CONFIRMED')
const saving = ref(false)
const error = ref('')

const orderTotal = computed(() =>
  items.value.reduce((sum, i) => sum + (i.unitPrice || 0) * i.quantity, 0)
)

const canSubmit = computed(() => {
  const hasCustomer = selectedCustomer.value !== null ||
    (manualMode.value && guest.name.trim() && guest.email.trim())
  return hasCustomer && items.value.length > 0
})

async function submit() {
  error.value = ''
  saving.value = true
  try {
    const body: Record<string, unknown> = {
      status: status.value,
      paymentMethod: paymentMethod.value || null,
      items: items.value.map(i => ({
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
    }

    if (selectedCustomer.value) {
      body.customerId = selectedCustomer.value.id
    } else {
      body.guestName = guest.name
      body.guestEmail = guest.email
      body.guestPhone = guest.phone || null
      body.guestCpf = guest.cpf || null
    }

    const order = await $fetch<{ id: number }>('/api/admin/orders', {
      method: 'POST',
      body,
    })

    router.push(`/admin/pedidos/${order.id}`)
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    error.value = err?.data?.message || 'Erro ao criar pedido'
  } finally {
    saving.value = false
  }
}

// ─── Utils ───────────────────────────────────────────────────────────────────

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}
</script>
