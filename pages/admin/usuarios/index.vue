<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-serif font-bold text-gray-900">Usuários Admin</h1>
      <NuxtLink to="/admin/usuarios/novo" class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-teal rounded-lg hover:bg-teal/90 transition-colors">
        <i class="pi pi-plus text-xs" /> Novo Usuário
      </NuxtLink>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <i class="pi pi-spin pi-spinner text-3xl text-teal" />
    </div>

    <div v-else>
      <div v-if="users.length === 0" class="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
        Nenhum usuário cadastrado
      </div>

      <div v-else class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="text-left px-4 py-3 font-medium text-gray-500">Nome</th>
              <th class="text-left px-4 py-3 font-medium text-gray-500">E-mail</th>
              <th class="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Cadastrado em</th>
              <th class="text-right px-4 py-3 font-medium text-gray-500">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="u in users" :key="u.id" class="hover:bg-gray-50">
              <td class="px-4 py-3 font-medium text-gray-900">{{ u.name }}</td>
              <td class="px-4 py-3 text-gray-600">{{ u.email }}</td>
              <td class="px-4 py-3 text-gray-500 hidden sm:table-cell">{{ formatDate(u.createdAt) }}</td>
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-1">
                  <NuxtLink :to="`/admin/usuarios/${u.id}`" class="p-2 rounded-lg text-gray-400 hover:text-teal hover:bg-teal/10 transition-colors">
                    <i class="pi pi-pencil text-sm" />
                  </NuxtLink>
                  <button @click="confirmDelete(u)" class="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                    <i class="pi pi-trash text-sm" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
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

    <Teleport to="body">
      <div v-if="deleting" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="deleting = null">
        <div class="bg-white rounded-xl p-6 w-full max-w-sm mx-4 shadow-xl">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Excluir usuário</h3>
          <p class="text-sm text-gray-600 mb-6">
            Excluir o usuário <strong>{{ deleting.name }}</strong>? Esta ação não pode ser desfeita.
          </p>
          <div v-if="deleteError" class="mb-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{{ deleteError }}</div>
          <div class="flex gap-3 justify-end">
            <button @click="deleting = null; deleteError = null" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
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

interface AdminUser {
  id: number
  name: string
  email: string
  role: string
  createdAt: string
}

definePageMeta({ layout: 'admin', middleware: 'admin' })

const { $fetch } = useApi()
const users = ref<AdminUser[]>([])
const loading = ref(true)
const currentPage = ref(0)
const totalPages = ref(0)
const deleting = ref<AdminUser | null>(null)
const deleteError = ref<string | null>(null)

async function loadPage(page: number) {
  loading.value = true
  try {
    const data = await $fetch<Page<AdminUser>>(`/api/admin/users?page=${page}&size=20`)
    users.value = data.content
    totalPages.value = data.totalPages
    currentPage.value = data.number
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => loadPage(0))

function confirmDelete(u: AdminUser) {
  deleting.value = u
  deleteError.value = null
}

async function doDelete() {
  if (!deleting.value) return
  try {
    await $fetch(`/api/admin/users/${deleting.value.id}`, { method: 'DELETE' })
    deleting.value = null
    await loadPage(currentPage.value)
  } catch (e: any) {
    deleteError.value = e?.data?.message || e?.data?.error || 'Erro ao excluir usuário'
  }
}

function formatDate(dt: string) {
  if (!dt) return '-'
  return new Date(dt).toLocaleDateString('pt-BR')
}
</script>
