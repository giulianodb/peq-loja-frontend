<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink to="/admin/clientes" class="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
        <i class="pi pi-arrow-left" />
      </NuxtLink>
      <h1 class="text-2xl font-serif font-bold text-gray-900">Editar cliente</h1>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <i class="pi pi-spin pi-spinner text-3xl text-teal" />
    </div>

    <div v-else-if="customer" class="max-w-xl space-y-6">

      <!-- Dados pessoais -->
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <h2 class="font-semibold text-gray-800 mb-4">Dados pessoais</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nome <span class="text-red-500">*</span></label>
            <input
              v-model="form.name"
              type="text"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30"
              placeholder="Nome completo"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email <span class="text-red-500">*</span></label>
            <input
              v-model="form.email"
              type="email"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30"
              placeholder="email@exemplo.com"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
            <input
              v-model="form.phone"
              type="text"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30"
              placeholder="(00) 00000-0000"
            />
          </div>
        </div>

        <p v-if="infoError" class="text-xs text-red-500 mt-3">{{ infoError }}</p>
        <p v-if="infoSuccess" class="text-xs text-green-600 mt-3">Dados atualizados com sucesso.</p>

        <div class="mt-5 flex justify-end">
          <button
            @click="saveInfo"
            :disabled="savingInfo || !form.name.trim() || !form.email.includes('@')"
            class="px-5 py-2 bg-teal text-white text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            <i v-if="savingInfo" class="pi pi-spin pi-spinner mr-2" />
            Salvar dados
          </button>
        </div>
      </div>

      <!-- Alterar senha -->
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <h2 class="font-semibold text-gray-800 mb-1">Alterar senha</h2>
        <p class="text-xs text-gray-400 mb-4">A nova senha será usada no próximo login do cliente.</p>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nova senha <span class="text-red-500">*</span></label>
            <div class="relative">
              <input
                v-model="passwordForm.newPassword"
                :type="showNewPassword ? 'text' : 'password'"
                class="w-full border border-gray-200 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30"
                placeholder="Mínimo 4 caracteres"
              />
              <button
                type="button"
                @click="showNewPassword = !showNewPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <i :class="showNewPassword ? 'pi pi-eye-slash' : 'pi pi-eye'" class="text-sm" />
              </button>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Confirmar senha <span class="text-red-500">*</span></label>
            <input
              v-model="passwordForm.confirm"
              :type="showNewPassword ? 'text' : 'password'"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30"
              placeholder="Repita a nova senha"
            />
          </div>
        </div>

        <p v-if="passwordError" class="text-xs text-red-500 mt-3">{{ passwordError }}</p>
        <p v-if="passwordSuccess" class="text-xs text-green-600 mt-3">Senha alterada com sucesso.</p>

        <div class="mt-5 flex justify-end">
          <button
            @click="savePassword"
            :disabled="savingPassword || !canSavePassword"
            class="px-5 py-2 bg-teal text-white text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            <i v-if="savingPassword" class="pi pi-spin pi-spinner mr-2" />
            Alterar senha
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const { $fetch } = useApi()

interface Customer {
  id: number
  name: string
  email: string
  phone: string | null
  createdAt: string
}

const loading = ref(true)
const customer = ref<Customer | null>(null)

const form = reactive({ name: '', email: '', phone: '' })
const savingInfo = ref(false)
const infoError = ref('')
const infoSuccess = ref(false)

const passwordForm = reactive({ newPassword: '', confirm: '' })
const savingPassword = ref(false)
const passwordError = ref('')
const passwordSuccess = ref(false)
const showNewPassword = ref(false)

const canSavePassword = computed(() =>
  passwordForm.newPassword.length >= 4 && passwordForm.newPassword === passwordForm.confirm
)

onMounted(async () => {
  try {
    customer.value = await $fetch<Customer>(`/api/admin/customers/${route.params.id}`)
    form.name = customer.value.name
    form.email = customer.value.email
    form.phone = customer.value.phone || ''
  } catch {
    navigateTo('/admin/clientes')
  } finally {
    loading.value = false
  }
})

async function saveInfo() {
  infoError.value = ''
  infoSuccess.value = false
  savingInfo.value = true
  try {
    customer.value = await $fetch<Customer>(`/api/admin/customers/${route.params.id}`, {
      method: 'PUT',
      body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone || null }),
    })
    infoSuccess.value = true
    setTimeout(() => (infoSuccess.value = false), 3000)
  } catch (e: any) {
    infoError.value = e?.data?.message || 'Erro ao salvar dados.'
  } finally {
    savingInfo.value = false
  }
}

async function savePassword() {
  passwordError.value = ''
  passwordSuccess.value = false

  if (passwordForm.newPassword !== passwordForm.confirm) {
    passwordError.value = 'As senhas não coincidem.'
    return
  }
  if (passwordForm.newPassword.length < 4) {
    passwordError.value = 'A senha deve ter no mínimo 4 caracteres.'
    return
  }

  savingPassword.value = true
  try {
    await $fetch(`/api/admin/customers/${route.params.id}/password`, {
      method: 'PATCH',
      body: JSON.stringify({ newPassword: passwordForm.newPassword }),
    })
    passwordForm.newPassword = ''
    passwordForm.confirm = ''
    passwordSuccess.value = true
    setTimeout(() => (passwordSuccess.value = false), 3000)
  } catch (e: any) {
    passwordError.value = e?.data?.message || 'Erro ao alterar senha.'
  } finally {
    savingPassword.value = false
  }
}
</script>
