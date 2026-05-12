<template>
  <div class="max-w-lg mx-auto px-4 sm:px-6 py-12">
    <h1 class="font-serif text-3xl text-teal mb-2 text-center">Fale Conosco</h1>
    <p class="text-steel text-sm text-center mb-10">Envie sua dúvida ou mensagem e retornaremos em breve.</p>

    <div v-if="sent" class="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
      <div class="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <i class="pi pi-check text-2xl text-green-600" />
      </div>
      <h2 class="font-serif text-xl text-teal mb-2">Mensagem enviada!</h2>
      <p class="text-steel text-sm">Recebemos seu contato e responderemos o mais breve possível.</p>
    </div>

    <form v-else @submit.prevent="submit" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-primary-700 mb-1">Nome *</label>
        <input
          v-model="form.name"
          type="text"
          required
          class="w-full border border-sand-200 rounded-lg px-4 py-2.5 text-primary-800 focus:outline-none focus:ring-2 focus:ring-coral/40 focus:border-coral/40 transition-all"
          placeholder="Seu nome"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-primary-700 mb-1">Email *</label>
        <input
          v-model="form.email"
          type="email"
          required
          class="w-full border border-sand-200 rounded-lg px-4 py-2.5 text-primary-800 focus:outline-none focus:ring-2 focus:ring-coral/40 focus:border-coral/40 transition-all"
          placeholder="seu@email.com"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-primary-700 mb-1">Mensagem *</label>
        <textarea
          v-model="form.message"
          required
          rows="5"
          maxlength="2000"
          class="w-full border border-sand-200 rounded-lg px-4 py-2.5 text-primary-800 focus:outline-none focus:ring-2 focus:ring-coral/40 focus:border-coral/40 transition-all resize-none"
          placeholder="Como podemos ajudar?"
        />
        <p class="text-xs text-steel mt-1 text-right">{{ form.message.length }}/2000</p>
      </div>

      <p v-if="error" class="text-red-500 text-sm flex items-center gap-1.5">
        <i class="pi pi-exclamation-circle" /> {{ error }}
      </p>

      <button
        type="submit"
        :disabled="submitting"
        class="w-full bg-teal text-white font-medium py-3 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-teal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <i v-if="submitting" class="pi pi-spin pi-spinner" />
        <i v-else class="pi pi-send" />
        {{ submitting ? 'Enviando...' : 'Enviar mensagem' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
const { $fetch } = useApi()

const form = reactive({ name: '', email: '', message: '' })
const submitting = ref(false)
const sent = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  submitting.value = true
  try {
    await $fetch('/api/contact', {
      method: 'POST',
      body: JSON.stringify(form),
    })
    sent.value = true
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (e: any) {
    error.value = e?.data?.message || 'Erro ao enviar mensagem. Tente novamente.'
  } finally {
    submitting.value = false
  }
}
</script>
