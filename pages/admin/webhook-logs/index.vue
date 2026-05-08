<template>
  <div>
    <h1 class="text-2xl font-serif font-bold text-gray-900 mb-6">Logs de Webhook</h1>

    <!-- Filters -->
    <div class="bg-white rounded-xl border border-gray-200 p-4 mb-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Pedido ID</label>
          <input
            v-model="filters.orderId"
            type="number"
            placeholder="Ex: 42"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">De</label>
          <input
            v-model="filters.from"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">Até</label>
          <input
            v-model="filters.to"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
          />
        </div>
        <div class="flex items-center gap-3">
          <label class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
            <input v-model="filters.errorsOnly" type="checkbox" class="w-4 h-4 accent-teal" />
            Apenas erros
          </label>
          <button
            @click="load(0)"
            class="ml-auto px-4 py-2 text-sm font-medium text-white bg-teal rounded-lg hover:bg-teal/90 transition-colors"
          >
            Filtrar
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-20">
      <i class="pi pi-spin pi-spinner text-3xl text-teal" />
    </div>

    <!-- Table -->
    <div v-else class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div v-if="logs.length === 0" class="text-center py-16 text-gray-400 text-sm">
        Nenhum log encontrado.
      </div>

      <table v-else class="w-full text-sm">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <th class="px-4 py-3 text-left">ID</th>
            <th class="px-4 py-3 text-left">Pedido</th>
            <th class="px-4 py-3 text-left">HTTP</th>
            <th class="px-4 py-3 text-left">Data / Hora</th>
            <th class="px-4 py-3 text-left">Status</th>
            <th class="px-4 py-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="log in logs" :key="log.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-4 py-3 text-gray-500 font-mono">#{{ log.id }}</td>
            <td class="px-4 py-3 font-medium text-gray-800">#{{ log.order_id }}</td>
            <td class="px-4 py-3 font-mono">
              <span v-if="log.status_code" :class="log.success ? 'text-green-600' : 'text-red-600'">
                {{ log.status_code }}
              </span>
              <span v-else class="text-gray-400">—</span>
            </td>
            <td class="px-4 py-3 text-gray-600">{{ formatDate(log.called_at) }}</td>
            <td class="px-4 py-3">
              <span
                :class="log.success
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
              >
                <i :class="log.success ? 'pi pi-check' : 'pi pi-times'" class="text-[10px]" />
                {{ log.success ? 'OK' : 'Erro' }}
              </span>
            </td>
            <td class="px-4 py-3 text-right">
              <div class="flex items-center justify-end gap-2">
                <button
                  @click="openPayload(log)"
                  class="text-xs text-teal hover:underline"
                >
                  Ver payload
                </button>
                <button
                  @click="confirmRetryId = log.id"
                  class="text-xs text-orange-600 hover:underline"
                >
                  Reenviar
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between px-4 py-3 border-t border-gray-200">
        <span class="text-xs text-gray-500">
          Página {{ currentPage + 1 }} de {{ totalPages }} — {{ totalElements }} registros
        </span>
        <div class="flex gap-2">
          <button
            :disabled="currentPage === 0"
            @click="load(currentPage - 1)"
            class="px-3 py-1.5 text-xs border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            Anterior
          </button>
          <button
            :disabled="currentPage >= totalPages - 1"
            @click="load(currentPage + 1)"
            class="px-3 py-1.5 text-xs border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            Próxima
          </button>
        </div>
      </div>
    </div>

    <!-- Payload modal -->
    <Teleport to="body">
      <div
        v-if="payloadModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="payloadModal = null"
      >
        <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <div>
              <h3 class="font-semibold text-gray-900">Payload — Log #{{ payloadModal.id }}</h3>
              <p class="text-xs text-gray-500 mt-0.5">Pedido #{{ payloadModal.order_id }} · {{ formatDate(payloadModal.called_at) }}</p>
            </div>
            <button @click="payloadModal = null" class="text-gray-400 hover:text-gray-600">
              <i class="pi pi-times text-lg" />
            </button>
          </div>
          <div class="overflow-auto p-5 flex-1 space-y-4">
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Payload enviado</p>
              <pre class="bg-gray-50 rounded-lg p-3 text-xs font-mono overflow-auto max-h-64 whitespace-pre-wrap break-all">{{ prettyJson(payloadModal.payload) }}</pre>
            </div>
            <div v-if="payloadModal.response_body">
              <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Resposta recebida</p>
              <pre class="bg-gray-50 rounded-lg p-3 text-xs font-mono overflow-auto max-h-40 whitespace-pre-wrap break-all">{{ payloadModal.response_body }}</pre>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Retry confirmation modal -->
    <Teleport to="body">
      <div
        v-if="confirmRetryId !== null"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      >
        <div class="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
              <i class="pi pi-refresh text-orange-600 text-lg" />
            </div>
            <h3 class="font-semibold text-gray-900">Reenviar webhook</h3>
          </div>
          <p class="text-sm text-gray-600 mb-5">
            Tem certeza que deseja reenviar o webhook do log <strong>#{{ confirmRetryId }}</strong>?
            Um novo disparo será feito com o estado atual do pedido e registrado no histórico.
          </p>
          <div class="flex gap-3 justify-end">
            <button
              @click="confirmRetryId = null"
              class="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="retry(confirmRetryId!)"
              :disabled="retrying"
              class="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors inline-flex items-center gap-2"
            >
              <i v-if="retrying" class="pi pi-spin pi-spinner" />
              {{ retrying ? 'Reenviando...' : 'Confirmar reenvio' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Toast -->
    <Transition name="fade">
      <div
        v-if="toast"
        :class="toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 text-white text-sm px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
      >
        <i :class="toast.type === 'success' ? 'pi pi-check' : 'pi pi-times'" />
        {{ toast.message }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const { $fetch } = useApi()

interface WebhookLog {
  id: number
  order_id: number
  status_code: number | null
  called_at: string
  payload: string
  response_body: string | null
  success: boolean
}

interface PageResponse {
  content: WebhookLog[]
  totalPages: number
  totalElements: number
  number: number
}

const loading = ref(true)
const retrying = ref(false)
const logs = ref<WebhookLog[]>([])
const totalPages = ref(0)
const totalElements = ref(0)
const currentPage = ref(0)
const payloadModal = ref<WebhookLog | null>(null)
const confirmRetryId = ref<number | null>(null)
const toast = ref<{ type: 'success' | 'error'; message: string } | null>(null)

const filters = reactive({
  orderId: '',
  from: '',
  to: '',
  errorsOnly: false,
})

async function load(page = 0) {
  loading.value = true
  try {
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('size', '20')
    params.set('errorsOnly', String(filters.errorsOnly))
    if (filters.orderId) params.set('orderId', filters.orderId)
    if (filters.from) params.set('from', `${filters.from}T00:00:00`)
    if (filters.to) params.set('to', `${filters.to}T23:59:59`)

    const data = await $fetch<PageResponse>(`/api/admin/webhook-logs?${params}`)
    logs.value = data.content
    totalPages.value = data.totalPages
    totalElements.value = data.totalElements
    currentPage.value = data.number
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function retry(id: number) {
  retrying.value = true
  try {
    await $fetch(`/api/admin/webhook-logs/${id}/retry`, { method: 'POST' })
    confirmRetryId.value = null
    showToast('success', 'Webhook reenviado com sucesso')
    await load(currentPage.value)
  } catch (e) {
    confirmRetryId.value = null
    showToast('error', 'Erro ao reenviar o webhook')
  } finally {
    retrying.value = false
  }
}

function openPayload(log: WebhookLog) {
  payloadModal.value = log
}

function prettyJson(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2)
  } catch {
    return raw
  }
}

function formatDate(iso: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

function showToast(type: 'success' | 'error', message: string) {
  toast.value = { type, message }
  setTimeout(() => { toast.value = null }, 3000)
}

onMounted(() => load(0))
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
