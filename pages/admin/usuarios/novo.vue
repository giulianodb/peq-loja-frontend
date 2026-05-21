<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink to="/admin/usuarios" class="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
        <i class="pi pi-arrow-left" />
      </NuxtLink>
      <h1 class="text-2xl font-serif font-bold text-gray-900">Novo Usuário Admin</h1>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 p-6 max-w-lg">
      <form @submit.prevent="handleSave" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nome</label>
          <input v-model="form.name" type="text" required class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal" placeholder="Nome completo" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
          <input v-model="form.email" type="email" required class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal" placeholder="email@exemplo.com" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Senha</label>
          <input v-model="form.password" type="password" required minlength="6" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal" placeholder="Mínimo 6 caracteres" />
        </div>

        <div v-if="error" class="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{{ error }}</div>

        <div class="flex gap-3 pt-2">
          <NuxtLink to="/admin/usuarios" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            Cancelar
          </NuxtLink>
          <button type="submit" :disabled="saving" class="px-4 py-2 text-sm font-medium text-white bg-teal rounded-lg hover:bg-teal/90 transition-colors disabled:opacity-60">
            <span v-if="saving"><i class="pi pi-spin pi-spinner mr-1" />Salvando...</span>
            <span v-else>Criar usuário</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const { $fetch } = useApi()
const saving = ref(false)
const error = ref<string | null>(null)

const form = reactive({ name: '', email: '', password: '' })

async function handleSave() {
  saving.value = true
  error.value = null
  try {
    await $fetch('/api/admin/users', { method: 'POST', body: JSON.stringify(form) })
    navigateTo('/admin/usuarios')
  } catch (e: any) {
    error.value = e?.data?.message || e?.data?.error || 'Erro ao criar usuário'
  } finally {
    saving.value = false
  }
}
</script>
