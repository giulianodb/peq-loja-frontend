<template>
  <div class="min-h-[70vh] flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <!-- Verificando o link -->
      <div v-if="checking" class="text-center py-12">
        <i class="pi pi-spin pi-spinner text-coral text-3xl" />
        <p class="mt-4 text-steel text-sm">Verificando seu link...</p>
      </div>

      <!-- Link fora do prazo ou já usado -->
      <div v-else-if="!tokenValid" class="text-center">
        <div class="bg-white border border-border rounded-lg p-6">
          <i class="pi pi-clock text-coral text-3xl" />
          <h1 class="font-serif text-2xl text-teal mt-4">Link expirado</h1>
          <p class="mt-3 text-steel text-sm leading-relaxed">
            Este link não vale mais — ele expira 15 minutos depois de enviado, ou já foi usado
            para trocar a senha.
          </p>
          <NuxtLink to="/esqueci-senha" class="btn-primary w-full mt-6 inline-block text-center">
            Pedir um novo link
          </NuxtLink>
        </div>

        <NuxtLink to="/login" class="mt-6 inline-block text-steel text-sm hover:text-coral">
          Voltar para o login
        </NuxtLink>
      </div>

      <!-- Senha alterada -->
      <div v-else-if="done" class="text-center">
        <div class="bg-white border border-border rounded-lg p-6">
          <i class="pi pi-check-circle text-green-600 text-3xl" />
          <h1 class="font-serif text-2xl text-teal mt-4">Senha alterada!</h1>
          <p class="mt-3 text-steel text-sm">Você já pode entrar com sua nova senha.</p>
          <NuxtLink to="/login" class="btn-primary w-full mt-6 inline-block text-center">
            Entrar
          </NuxtLink>
        </div>
      </div>

      <!-- Formulário da nova senha -->
      <template v-else>
        <div class="text-center mb-8">
          <h1 class="font-serif text-3xl text-teal">Nova senha</h1>
          <p class="mt-2 text-steel text-sm">Escolha a senha que você vai usar para entrar.</p>
        </div>

        <form @submit.prevent="submit" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-primary-800 mb-1.5">Nova senha</label>
            <input
              v-model="password"
              type="password"
              required
              minlength="6"
              autocomplete="new-password"
              class="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral transition-all text-sm"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-primary-800 mb-1.5">Confirmar senha</label>
            <input
              v-model="confirmPassword"
              type="password"
              required
              minlength="6"
              autocomplete="new-password"
              class="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral transition-all text-sm"
              placeholder="Digite novamente"
            />
          </div>

          <p v-if="error" class="text-red-500 text-sm flex items-center gap-1">
            <i class="pi pi-exclamation-circle" /> {{ error }}
          </p>

          <button type="submit" :disabled="loading" class="btn-primary w-full">
            <i v-if="loading" class="pi pi-spin pi-spinner mr-2" />
            Salvar nova senha
          </button>
        </form>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const route = useRoute()

// O token viaja na URL, então o navegador o mandaria no Referer de qualquer
// requisição a outro domínio feita por esta página.
useHead({
  meta: [{ name: 'referrer', content: 'no-referrer' }],
})

// Guardado em memória e apagado da barra de endereços logo em seguida, para não
// ficar no histórico do navegador nem ser copiado junto com o link da página.
const token = ref((route.query.token as string) || '')

const checking = ref(true)
const tokenValid = ref(false)
const loading = ref(false)
const done = ref(false)
const error = ref('')
const password = ref('')
const confirmPassword = ref('')

onMounted(async () => {
  if (import.meta.client && route.query.token) {
    window.history.replaceState({}, '', '/redefinir-senha')
  }

  if (!token.value) {
    checking.value = false
    return
  }

  try {
    const data = await $fetch<{ valid: boolean }>(
      `${config.public.apiBase}/api/auth/reset-password/${encodeURIComponent(token.value)}`,
    )
    tokenValid.value = data.valid
  } catch {
    tokenValid.value = false
  } finally {
    checking.value = false
  }
})

async function submit() {
  if (password.value !== confirmPassword.value) {
    error.value = 'As senhas não conferem.'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await $fetch(`${config.public.apiBase}/api/auth/reset-password`, {
      method: 'POST',
      body: { token: token.value, password: password.value },
    })
    done.value = true
    token.value = ''
  } catch (e: any) {
    error.value = e?.data?.error || 'Não foi possível alterar a senha. Solicite um novo link.'
  } finally {
    loading.value = false
  }
}
</script>
