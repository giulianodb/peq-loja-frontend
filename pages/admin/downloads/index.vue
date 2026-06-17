<template>
  <div>
    <h1 class="text-2xl font-serif font-bold text-gray-900 mb-6">Downloads</h1>

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
        <div v-if="tab === 'daily'">
          <label class="block text-xs font-medium text-gray-600 mb-1">Material</label>
          <select
            v-model="filters.materialId"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
          >
            <option value="">Todos os materiais</option>
            <option v-for="m in materials" :key="m.materialId" :value="m.materialId">
              {{ m.displayName }} ({{ m.productName }})
            </option>
          </select>
        </div>
        <div class="flex items-center">
          <button
            @click="reload"
            class="ml-auto px-4 py-2 text-sm font-medium text-white bg-teal rounded-lg hover:bg-teal/90 transition-colors"
          >
            Filtrar
          </button>
        </div>
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

    <!-- Por material -->
    <div v-else-if="tab === 'material'" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div v-if="materials.length === 0" class="text-center py-16 text-gray-400 text-sm">
        Nenhum download registrado no período.
      </div>
      <table v-else class="w-full text-sm">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <th class="px-4 py-3 text-left">Material</th>
            <th class="px-4 py-3 text-left">Produto</th>
            <th class="px-4 py-3 text-right">Total</th>
            <th class="px-4 py-3 text-right">Clientes únicos</th>
            <th class="px-4 py-3 text-left">Último download</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="m in materials" :key="m.materialId" class="hover:bg-gray-50 transition-colors">
            <td class="px-4 py-3">
              <div class="font-medium text-gray-800">{{ m.displayName }}</div>
              <div class="text-xs text-gray-400 font-mono">{{ m.fileName }}</div>
            </td>
            <td class="px-4 py-3 text-gray-600">{{ m.productName }}</td>
            <td class="px-4 py-3 text-right font-semibold text-gray-800">{{ m.totalDownloads }}</td>
            <td class="px-4 py-3 text-right text-gray-600">{{ m.uniqueCustomers }}</td>
            <td class="px-4 py-3 text-gray-600">{{ formatDateTime(m.lastDownloadedAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Por dia -->
    <div v-else class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div v-if="daily.length === 0" class="text-center py-16 text-gray-400 text-sm">
        Nenhum download registrado no período.
      </div>
      <table v-else class="w-full text-sm">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <th class="px-4 py-3 text-left">Dia</th>
            <th class="px-4 py-3 text-right">Total</th>
            <th class="px-4 py-3 text-right">Clientes únicos</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="d in daily" :key="d.day" class="hover:bg-gray-50 transition-colors">
            <td class="px-4 py-3 font-medium text-gray-800">{{ formatDay(d.day) }}</td>
            <td class="px-4 py-3 text-right font-semibold text-gray-800">{{ d.totalDownloads }}</td>
            <td class="px-4 py-3 text-right text-gray-600">{{ d.uniqueCustomers }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const { $fetch } = useApi()

interface MaterialStat {
  materialId: number
  displayName: string
  fileName: string
  productId: number
  productName: string
  totalDownloads: number
  uniqueCustomers: number
  lastDownloadedAt: string | null
}

interface DailyStat {
  day: string
  totalDownloads: number
  uniqueCustomers: number
}

type Tab = 'material' | 'daily'

const tabs: { key: Tab; label: string }[] = [
  { key: 'material', label: 'Por material' },
  { key: 'daily', label: 'Por dia' },
]

const tab = ref<Tab>('material')
const loading = ref(true)
const materials = ref<MaterialStat[]>([])
const daily = ref<DailyStat[]>([])

const filters = reactive({
  from: '',
  to: '',
  materialId: '' as string | number,
})

function dateParams() {
  const params = new URLSearchParams()
  if (filters.from) params.set('from', `${filters.from}T00:00:00`)
  if (filters.to) params.set('to', `${filters.to}T23:59:59`)
  return params
}

async function loadMaterials() {
  loading.value = true
  try {
    materials.value = await $fetch<MaterialStat[]>(`/api/admin/downloads/materials?${dateParams()}`)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function loadDaily() {
  loading.value = true
  try {
    const params = dateParams()
    if (filters.materialId) params.set('materialId', String(filters.materialId))
    daily.value = await $fetch<DailyStat[]>(`/api/admin/downloads/daily?${params}`)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function reload() {
  return tab.value === 'material' ? loadMaterials() : loadDaily()
}

async function switchTab(t: Tab) {
  if (tab.value === t) return
  tab.value = t
  await reload()
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

onMounted(async () => {
  // garante a lista de materiais para o filtro da aba "Por dia"
  await loadMaterials()
})
</script>
