<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-serif font-bold text-gray-900">Cupons</h1>
      <NuxtLink to="/admin/cupons/novo" class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-teal rounded-lg hover:bg-teal/90 transition-colors">
        <i class="pi pi-plus text-xs" /> Novo Cupom
      </NuxtLink>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <i class="pi pi-spin pi-spinner text-3xl text-teal" />
    </div>

    <div v-else>
      <div v-if="coupons.length === 0" class="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
        Nenhum cupom cadastrado
      </div>

      <div v-else class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="text-left px-4 py-3 font-medium text-gray-500">Código</th>
                <th class="text-left px-4 py-3 font-medium text-gray-500">Desconto</th>
                <th class="text-center px-4 py-3 font-medium text-gray-500">Aplicação</th>
                <th class="text-center px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Usos</th>
                <th class="text-center px-4 py-3 font-medium text-gray-500">Status</th>
                <th class="text-right px-4 py-3 font-medium text-gray-500">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="c in coupons" :key="c.id" class="hover:bg-gray-50">
                <td class="px-4 py-3">
                  <span class="font-mono font-semibold text-gray-900">{{ c.code }}</span>
                </td>
                <td class="px-4 py-3 text-gray-700">
                  {{ c.discountType === 'PERCENTAGE' ? c.discountValue + '%' : 'R$ ' + Number(c.discountValue).toFixed(2) }}
                </td>
                <td class="px-4 py-3 text-center">
                  <span class="text-xs px-2 py-0.5 rounded-full" :class="c.applicationType === 'TOTAL' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'">
                    {{ c.applicationType === 'TOTAL' ? 'Total' : 'Por produto' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-center text-gray-600 hidden sm:table-cell">
                  {{ c.currentUses }}<span v-if="c.maxUses">/{{ c.maxUses }}</span><span v-else> / ∞</span>
                </td>
                <td class="px-4 py-3 text-center">
                  <span class="inline-block px-2 py-0.5 rounded-full text-xs font-medium" :class="c.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'">
                    {{ c.active ? 'Ativo' : 'Inativo' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right">
                  <div class="flex items-center justify-end gap-1">
                    <NuxtLink :to="`/admin/cupons/${c.id}`" class="p-2 rounded-lg text-gray-400 hover:text-teal hover:bg-teal/10 transition-colors">
                      <i class="pi pi-pencil text-sm" />
                    </NuxtLink>
                    <button @click="confirmDelete(c)" class="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <i class="pi pi-trash text-sm" />
                    </button>
                  </div>
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

    <!-- Delete modal -->
    <Teleport to="body">
      <div v-if="deleting" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="deleting = null">
        <div class="bg-white rounded-xl p-6 w-full max-w-sm mx-4 shadow-xl">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Excluir cupom</h3>
          <p class="text-sm text-gray-600 mb-6">
            Excluir o cupom <strong class="font-mono">{{ deleting.code }}</strong>?
          </p>
          <div class="flex gap-3 justify-end">
            <button @click="deleting = null" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              Cancelar
            </button>
            <button @click="doDelete" class="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors">
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

interface CouponItem {
  id: number
  code: string
  discountType: string
  discountValue: number
  applicationType: string
  combinable: boolean
  maxUses: number | null
  currentUses: number
  active: boolean
}

definePageMeta({ layout: 'admin', middleware: 'admin' })

const { $fetch } = useApi()
const coupons = ref<CouponItem[]>([])
const loading = ref(true)
const currentPage = ref(0)
const totalPages = ref(0)
const deleting = ref<CouponItem | null>(null)

async function loadPage(page: number) {
  loading.value = true
  try {
    const data = await $fetch<Page<CouponItem>>(`/api/admin/coupons?page=${page}&size=20`)
    coupons.value = data.content
    totalPages.value = data.totalPages
    currentPage.value = data.number
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => loadPage(0))

function confirmDelete(c: CouponItem) {
  deleting.value = c
}

async function doDelete() {
  if (!deleting.value) return
  try {
    await $fetch(`/api/admin/coupons/${deleting.value.id}`, { method: 'DELETE' })
    deleting.value = null
    await loadPage(currentPage.value)
  } catch (e) {
    console.error(e)
  }
}
</script>
