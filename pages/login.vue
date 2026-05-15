<template>
  <div class="min-h-[70vh] flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <!-- Toggle -->
      <div class="text-center mb-8">
        <h1 class="font-serif text-3xl text-teal">
          {{ isLogin ? 'Entrar' : 'Criar Conta' }}
        </h1>
        <p class="mt-2 text-steel text-sm">
          {{ isLogin ? 'Acesse sua conta Pequenas Trilhas' : 'Junte-se à comunidade Pequenas Trilhas' }}
        </p>
      </div>

      <form @submit.prevent="submit" class="space-y-5">
        <!-- Name (register only) -->
        <div v-if="!isLogin">
          <label class="block text-sm font-medium text-primary-800 mb-1.5">Nome completo</label>
          <input
            v-model="form.name"
            type="text"
            required
            class="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral transition-all text-sm"
            placeholder="Seu nome"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-primary-800 mb-1.5">Email</label>
          <input
            v-model="form.email"
            type="email"
            required
            class="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral transition-all text-sm"
            placeholder="seu@email.com"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-primary-800 mb-1.5">Senha</label>
          <input
            v-model="form.password"
            type="password"
            required
            :minlength="isLogin ? 1 : 6"
            class="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral transition-all text-sm"
            :placeholder="isLogin ? 'Sua senha' : 'Mínimo 6 caracteres'"
          />
        </div>

        <p v-if="error" class="text-red-500 text-sm flex items-center gap-1">
          <i class="pi pi-exclamation-circle" /> {{ error }}
        </p>

        <button
          type="submit"
          :disabled="loading"
          class="btn-primary w-full"
        >
          <i v-if="loading" class="pi pi-spin pi-spinner mr-2" />
          {{ isLogin ? 'Entrar' : 'Criar Conta' }}
        </button>
      </form>

      <p class="mt-6 text-center text-sm text-steel">
        <template v-if="isLogin">
          Não tem conta?
          <button @click="isLogin = false" class="text-coral font-medium hover:underline">
            Cadastre-se
          </button>
        </template>
        <template v-else>
          Já tem conta?
          <button @click="isLogin = true" class="text-coral font-medium hover:underline">
            Entrar
          </button>
        </template>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AuthResponse } from '~/types'

const config = useRuntimeConfig()
const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const isLogin = ref(true)
const loading = ref(false)
const error = ref('')

const form = reactive({
  name: '',
  email: '',
  password: '',
})

async function submit() {
  loading.value = true
  error.value = ''

  try {
    const endpoint = isLogin.value ? '/api/auth/login' : '/api/auth/register'
    const body = isLogin.value
      ? { email: form.email, password: form.password }
      : { name: form.name, email: form.email, password: form.password }

    const data = await $fetch<AuthResponse>(`${config.public.apiBase}${endpoint}`, {
      method: 'POST',
      body,
    })

    auth.setAuth(data)

    const redirect = route.query.redirect as string
    router.push(redirect || '/minha-conta/materiais')
  } catch (e: any) {
    error.value = e?.data?.error || 'Erro ao processar. Verifique seus dados.'
  } finally {
    loading.value = false
  }
}
</script>
