<template>
  <div class="min-h-[70vh] flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="font-serif text-3xl text-teal">Esqueci minha senha</h1>
        <p class="mt-2 text-steel text-sm">
          Informe seu email e enviaremos um link para você criar uma nova senha.
        </p>
      </div>

      <!-- Resposta idêntica exista ou não o email cadastrado -->
      <div v-if="sent" class="text-center">
        <div class="bg-white border border-border rounded-lg p-6">
          <i class="pi pi-envelope text-coral text-3xl" />
          <p class="mt-4 text-primary-800 text-sm leading-relaxed">
            Se este email estiver cadastrado, enviamos um link para redefinir a senha.
            Verifique também a caixa de spam.
          </p>
          <p class="mt-3 text-steel text-xs">
            O link expira em 15 minutos. Se expirar, é só pedir outro.
          </p>
          <button
            type="button"
            :disabled="loading"
            class="mt-5 text-coral font-medium text-sm hover:underline disabled:opacity-50"
            @click="submit"
          >
            <i v-if="loading" class="pi pi-spin pi-spinner mr-1" />
            Enviar novamente
          </button>
        </div>

        <NuxtLink to="/login" class="mt-6 inline-block text-steel text-sm hover:text-coral">
          Voltar para o login
        </NuxtLink>
      </div>

      <form v-else @submit.prevent="submit" class="space-y-5">
        <div>
          <label class="block text-sm font-medium text-primary-800 mb-1.5">Email</label>
          <input
            v-model="email"
            type="email"
            required
            autocomplete="email"
            class="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral transition-all text-sm"
            placeholder="seu@email.com"
          />
        </div>

        <p v-if="error" class="text-red-500 text-sm flex items-center gap-1">
          <i class="pi pi-exclamation-circle" /> {{ error }}
        </p>

        <button type="submit" :disabled="loading" class="btn-primary w-full">
          <i v-if="loading" class="pi pi-spin pi-spinner mr-2" />
          Enviar link
        </button>

        <p class="text-center text-sm text-steel">
          Lembrou a senha?
          <NuxtLink to="/login" class="text-coral font-medium hover:underline">Entrar</NuxtLink>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()

const email = ref('')
const loading = ref(false)
const error = ref('')
const sent = ref(false)

async function submit() {
  loading.value = true
  error.value = ''

  try {
    await $fetch(`${config.public.apiBase}/api/auth/forgot-password`, {
      method: 'POST',
      body: { email: email.value },
    })
    sent.value = true
  } catch (e: any) {
    error.value = e?.data?.error || 'Não foi possível enviar agora. Tente novamente em instantes.'
  } finally {
    loading.value = false
  }
}
</script>
