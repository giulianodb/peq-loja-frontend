<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-serif font-bold text-gray-900">Categorias</h1>
      <button
        @click="openModal()"
        class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-teal rounded-lg hover:bg-teal/90 transition-colors"
      >
        <i class="pi pi-plus text-xs" />
        Nova categoria
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <i class="pi pi-spin pi-spinner text-3xl text-teal" />
    </div>

    <!-- Lista vazia -->
    <div v-else-if="categories.length === 0" class="bg-white rounded-xl border border-gray-200 p-12 text-center">
      <i class="pi pi-tag text-4xl text-gray-300 mb-3 block" />
      <p class="text-gray-500">Nenhuma categoria cadastrada ainda.</p>
      <button @click="openModal()" class="mt-4 text-sm text-teal underline">Criar primeira categoria</button>
    </div>

    <!-- Tabela -->
    <div v-else class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nome</th>
            <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Descrição</th>
            <th class="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ações</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="cat in categories" :key="cat.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 font-medium text-gray-900">{{ cat.name }}</td>
            <td class="px-6 py-4 text-gray-500 hidden sm:table-cell">{{ cat.description || '—' }}</td>
            <td class="px-6 py-4 text-right">
              <div class="flex items-center justify-end gap-2">
                <button
                  @click="openModal(cat)"
                  class="p-1.5 text-gray-400 hover:text-teal hover:bg-teal/5 rounded-lg transition-colors"
                  title="Editar"
                >
                  <i class="pi pi-pencil text-sm" />
                </button>
                <button
                  @click="confirmDelete(cat)"
                  class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Excluir"
                >
                  <i class="pi pi-trash text-sm" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal criar / editar -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
          <div class="flex items-center justify-between mb-5">
            <h2 class="text-lg font-semibold text-gray-900">
              {{ editing ? 'Editar categoria' : 'Nova categoria' }}
            </h2>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
              <i class="pi pi-times" />
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
              <input
                v-model="form.name"
                type="text"
                placeholder="Ex.: Matemática, Português..."
                class="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                @keyup.enter="save"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <input
                v-model="form.description"
                type="text"
                placeholder="Opcional"
                class="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                @keyup.enter="save"
              />
            </div>
            <p v-if="formError" class="text-red-500 text-xs flex items-center gap-1.5">
              <i class="pi pi-exclamation-circle" />{{ formError }}
            </p>
          </div>

          <div class="flex gap-3 mt-6">
            <button
              @click="closeModal"
              class="flex-1 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="save"
              :disabled="saving || !form.name.trim()"
              class="flex-1 py-2.5 text-sm font-medium text-white bg-teal rounded-lg hover:bg-teal/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <i v-if="saving" class="pi pi-spin pi-spinner text-xs" />
              {{ editing ? 'Salvar' : 'Criar' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { Category } from '~/types'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const { $fetch } = useApi()

const categories = ref<Category[]>([])
const loading = ref(true)
const showModal = ref(false)
const editing = ref<Category | null>(null)
const saving = ref(false)
const formError = ref('')
const form = ref({ name: '', description: '' })

onMounted(loadCategories)

async function loadCategories() {
  loading.value = true
  try {
    categories.value = await $fetch<Category[]>('/api/admin/categories')
  } finally {
    loading.value = false
  }
}

function openModal(cat?: Category) {
  editing.value = cat ?? null
  form.value = { name: cat?.name ?? '', description: cat?.description ?? '' }
  formError.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editing.value = null
  formError.value = ''
}

async function save() {
  if (!form.value.name.trim()) return
  saving.value = true
  formError.value = ''
  try {
    if (editing.value) {
      const updated = await $fetch<Category>(`/api/admin/categories/${editing.value.id}`, {
        method: 'PUT',
        body: form.value,
      })
      const idx = categories.value.findIndex(c => c.id === editing.value!.id)
      if (idx !== -1) categories.value[idx] = updated
    } else {
      const created = await $fetch<Category>('/api/admin/categories', {
        method: 'POST',
        body: form.value,
      })
      categories.value.push(created)
    }
    closeModal()
  } catch (e: any) {
    formError.value = e?.data?.message || 'Erro ao salvar categoria.'
  } finally {
    saving.value = false
  }
}

async function confirmDelete(cat: Category) {
  if (!confirm(`Excluir a categoria "${cat.name}"? Os produtos vinculados ficarão sem categoria.`)) return
  try {
    await $fetch(`/api/admin/categories/${cat.id}`, { method: 'DELETE' })
    categories.value = categories.value.filter(c => c.id !== cat.id)
  } catch (e: any) {
    alert(e?.data?.message || 'Erro ao excluir categoria.')
  }
}
</script>
