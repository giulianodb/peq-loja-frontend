<template>
  <div>
    <h1 class="text-2xl font-serif font-bold text-gray-900 mb-1">Tráfego</h1>
    <p class="text-sm text-gray-500 mb-6">
      Páginas abertas na loja. Não inclui a área administrativa nem acessos feitos por um admin logado.
    </p>

    <!-- Filters -->
    <div class="bg-white rounded-xl border border-gray-200 p-4 mb-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
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
        <div class="flex items-center lg:col-span-2">
          <button
            @click="reload"
            class="ml-auto px-4 py-2 text-sm font-medium text-white bg-teal rounded-lg hover:bg-teal/90 transition-colors"
          >
            Filtrar
          </button>
        </div>
      </div>
    </div>

    <!-- Summary -->
    <div v-if="summary" class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Visitantes únicos</p>
        <p class="text-2xl font-semibold text-gray-900 mt-1">{{ summary.uniqueVisitors }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Páginas vistas</p>
        <p class="text-2xl font-semibold text-gray-900 mt-1">{{ summary.totalViews }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Logados</p>
        <p class="text-2xl font-semibold text-gray-900 mt-1">{{ summary.authenticatedViews }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Anônimos</p>
        <p class="text-2xl font-semibold text-gray-900 mt-1">{{ summary.anonymousViews }}</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 mb-4 border-b border-gray-200">
      <button
        v-for="t in tabs"
        :key="t.key"
        @click="switchTab(t.key)"
        class="px-4 py-2 text-sm font-medium -mb-px border-b-2 transition-colors"
        :class="tab === t.key
          ? 'border-teal text-teal'
          : 'border-transparent text-gray-500 hover:text-gray-800'"
      >
        {{ t.label }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-20">
      <i class="pi pi-spin pi-spinner text-3xl text-teal" />
    </div>

    <!-- Por dia -->
    <div v-else-if="tab === 'daily'" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div v-if="daily.length === 0" class="text-center py-16 text-gray-400 text-sm">
        Nenhum acesso registrado no período.
      </div>
      <table v-else class="w-full text-sm">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <th class="px-4 py-3 text-left">Dia</th>
            <th class="px-4 py-3 text-right">Visitantes únicos</th>
            <th class="px-4 py-3 text-right">Páginas vistas</th>
            <th class="px-4 py-3 text-right">Logados</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="d in daily" :key="d.day" class="hover:bg-gray-50 transition-colors">
            <td class="px-4 py-3 font-medium text-gray-800">{{ formatDay(d.day) }}</td>
            <td class="px-4 py-3 text-right font-semibold text-gray-800">{{ d.uniqueVisitors }}</td>
            <td class="px-4 py-3 text-right text-gray-600">{{ d.totalViews }}</td>
            <td class="px-4 py-3 text-right text-gray-600">{{ d.authenticatedViews }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Páginas -->
    <div v-else-if="tab === 'pages'" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div v-if="pages.length === 0" class="text-center py-16 text-gray-400 text-sm">
        Nenhum acesso registrado no período.
      </div>
      <table v-else class="w-full text-sm">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <th class="px-4 py-3 text-left">Página</th>
            <th class="px-4 py-3 text-right">Visitantes únicos</th>
            <th class="px-4 py-3 text-right">Páginas vistas</th>
            <th class="px-4 py-3 text-left">Último acesso</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="p in pages" :key="p.path" class="hover:bg-gray-50 transition-colors">
            <td class="px-4 py-3 font-mono text-xs text-gray-800 break-all">{{ p.path }}</td>
            <td class="px-4 py-3 text-right font-semibold text-gray-800">{{ p.uniqueVisitors }}</td>
            <td class="px-4 py-3 text-right text-gray-600">{{ p.totalViews }}</td>
            <td class="px-4 py-3 text-gray-600">{{ formatDateTime(p.lastViewedAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Últimos acessos -->
    <div v-else class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div v-if="views.length === 0" class="text-center py-16 text-gray-400 text-sm">
        Nenhum acesso registrado no período.
      </div>
      <template v-else>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <th class="px-4 py-3 text-left">Quando</th>
                <th class="px-4 py-3 text-left">Página</th>
                <th class="px-4 py-3 text-left">Sessão</th>
                <th class="px-4 py-3 text-left">Origem</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="v in views" :key="v.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-4 py-3 text-gray-600 whitespace-nowrap">{{ formatDateTime(v.viewedAt) }}</td>
                <td class="px-4 py-3">
                  <div class="font-mono text-xs text-gray-800 break-all">{{ v.path }}</div>
                  <div v-if="v.queryString" class="font-mono text-xs text-gray-400 break-all">?{{ v.queryString }}</div>
                </td>
                <td class="px-4 py-3">
                  <span
                    class="text-xs px-2 py-0.5 rounded-full"
                    :class="v.authenticated ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'"
                  >
                    {{ v.authenticated ? 'Logado' : 'Anônimo' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-xs text-gray-500 break-all max-w-xs">{{ v.referrer || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex items-center justify-between px-4 py-3 border-t border-gray-200">
          <span class="text-xs text-gray-500">Página {{ currentPage + 1 }} de {{ totalPages }}</span>
          <div class="flex gap-2">
            <button
              :disabled="currentPage === 0"
              @click="loadViews(currentPage - 1)"
              class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Anterior
            </button>
            <button
              :disabled="currentPage >= totalPages - 1"
              @click="loadViews(currentPage + 1)"
              class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Próxima
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const { $fetch } = useApi()

interface Summary {
  totalViews: number
  uniqueVisitors: number
  authenticatedViews: number
  anonymousViews: number
}

interface DailyTraffic {
  day: string
  totalViews: number
  uniqueVisitors: number
  authenticatedViews: number
}

interface TopPage {
  path: string
  totalViews: number
  uniqueVisitors: number
  lastViewedAt: string | null
}

interface PageView {
  id: number
  path: string
  queryString: string | null
  referrer: string | null
  authenticated: boolean
  visitorId: string | null
  userAgent: string | null
  viewedAt: string
}

interface Page<T> {
  content: T[]
  totalPages: number
  number: number
}

type Tab = 'daily' | 'pages' | 'views'

const tabs: { key: Tab; label: string }[] = [
  { key: 'daily', label: 'Por dia' },
  { key: 'pages', label: 'Páginas' },
  { key: 'views', label: 'Últimos acessos' },
]

const tab = ref<Tab>('daily')
const loading = ref(true)
const summary = ref<Summary | null>(null)
const daily = ref<DailyTraffic[]>([])
const pages = ref<TopPage[]>([])
const views = ref<PageView[]>([])
const totalPages = ref(0)
const currentPage = ref(0)

const filters = reactive({
  from: isoDaysAgo(29),
  to: isoDaysAgo(0),
})

function isoDaysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}

function dateParams() {
  const params = new URLSearchParams()
  if (filters.from) params.set('from', `${filters.from}T00:00:00`)
  if (filters.to) params.set('to', `${filters.to}T23:59:59`)
  return params
}

async function loadSummary() {
  try {
    summary.value = await $fetch<Summary>(`/api/admin/traffic/summary?${dateParams()}`)
  } catch (e) {
    console.error(e)
  }
}

async function loadDaily() {
  loading.value = true
  try {
    daily.value = await $fetch<DailyTraffic[]>(`/api/admin/traffic/daily?${dateParams()}`)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function loadPages() {
  loading.value = true
  try {
    pages.value = await $fetch<TopPage[]>(`/api/admin/traffic/pages?${dateParams()}&limit=30`)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function loadViews(page = 0) {
  loading.value = true
  try {
    const params = dateParams()
    params.set('page', String(page))
    params.set('size', '50')
    const data = await $fetch<Page<PageView>>(`/api/admin/traffic/views?${params}`)
    views.value = data.content
    totalPages.value = data.totalPages
    currentPage.value = data.number
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function loadTab() {
  if (tab.value === 'daily') return loadDaily()
  if (tab.value === 'pages') return loadPages()
  return loadViews(0)
}

async function reload() {
  await Promise.all([loadSummary(), loadTab()])
}

async function switchTab(t: Tab) {
  if (tab.value === t) return
  tab.value = t
  await loadTab()
}

function formatDateTime(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

function formatDay(day: string): string {
  if (!day) return '—'
  // day chega como YYYY-MM-DD; evita deslocamento de fuso ao formatar
  const [y, m, d] = day.split('-')
  return `${d}/${m}/${y}`
}

onMounted(reload)
</script>
