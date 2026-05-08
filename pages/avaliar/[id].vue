<template>
  <div class="min-h-[80vh] flex items-center justify-center px-4 py-12">
    <!-- Loading -->
    <div v-if="loading" class="animate-pulse space-y-4 w-full max-w-md">
      <div class="h-48 bg-sand-100 rounded-2xl" />
      <div class="h-6 bg-sand-100 rounded w-2/3 mx-auto" />
      <div class="h-10 bg-sand-100 rounded" />
    </div>

    <!-- Product not found -->
    <div v-else-if="!product" class="text-center">
      <i class="pi pi-exclamation-circle text-4xl text-salmon mb-4" />
      <p class="text-steel text-lg">Produto não encontrado.</p>
    </div>

    <!-- Success -->
    <Transition name="fade">
      <div v-if="success" class="text-center max-w-md">
        <div class="w-20 h-20 rounded-full bg-teal/10 flex items-center justify-center mx-auto mb-6">
          <i class="pi pi-check text-4xl text-teal" />
        </div>
        <h2 class="font-serif text-2xl text-teal mb-3">Obrigado pela sua avaliação!</h2>
        <p class="text-steel leading-relaxed">
          Sua avaliação será publicada após aprovação.
        </p>
        <p class="text-sm text-steel/60 mt-4">Redirecionando para a loja...</p>
      </div>
    </Transition>

    <!-- Review form -->
    <div v-if="product && !success" class="w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="font-serif text-2xl md:text-3xl text-teal">Avaliar Produto</h1>
        <p class="text-steel text-sm mt-1">Sua opinião é muito importante para nós</p>
      </div>

      <!-- Product card -->
      <div class="flex items-center gap-4 bg-sand-100 rounded-xl p-4 mb-8">
        <div class="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-light">
          <img
            v-if="product.imageUrl"
            :src="resolveUrl(product.imageUrl)"
            :alt="product.name"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <i class="pi pi-file-pdf text-2xl text-salmon" />
          </div>
        </div>
        <div class="min-w-0">
          <p v-if="product.categoryName" class="text-[10px] uppercase tracking-widest text-coral font-medium">
            {{ product.categoryName }}
          </p>
          <h2 class="font-serif text-lg text-teal leading-snug line-clamp-2">{{ product.name }}</h2>
        </div>
      </div>

      <!-- Stars -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-primary-700 mb-3 text-center">Qual a sua nota?</label>
        <div class="flex items-center justify-center gap-2">
          <button
            v-for="s in 5"
            :key="s"
            @click="form.rating = s"
            class="p-1 transition-transform hover:scale-125"
          >
            <i
              class="pi text-3xl"
              :class="s <= form.rating ? 'pi-star-fill text-yellow-400' : 'pi-star text-gray-300 hover:text-yellow-300'"
            />
          </button>
        </div>
      </div>

      <!-- Name -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-primary-700 mb-1">Seu nome</label>
        <input
          v-model="form.authorName"
          type="text"
          class="w-full border border-sand-200 rounded-lg px-4 py-2.5 text-primary-800 focus:outline-none focus:ring-2 focus:ring-coral/40 focus:border-coral/40 placeholder:text-primary-300"
          placeholder="Como deseja ser identificado"
        />
      </div>

      <!-- Comment -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-primary-700 mb-1">Comentário <span class="text-steel font-normal">(opcional)</span></label>
        <textarea
          v-model="form.comment"
          rows="3"
          class="w-full border border-sand-200 rounded-lg px-4 py-2.5 text-primary-800 focus:outline-none focus:ring-2 focus:ring-coral/40 focus:border-coral/40 placeholder:text-primary-300"
          placeholder="Conte o que achou do material..."
        />
      </div>

      <!-- Error -->
      <p v-if="error" class="text-sm text-red-500 mb-4 text-center">{{ error }}</p>

      <!-- Submit -->
      <button
        @click="submit"
        :disabled="submitting || form.rating === 0"
        class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <i v-if="submitting" class="pi pi-spin pi-spinner mr-2" />
        Enviar Avaliação
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/types'

const config = useRuntimeConfig()
const route = useRoute()

const loading = ref(true)
const product = ref<Product | null>(null)
const submitting = ref(false)
const success = ref(false)
const error = ref('')
const form = reactive({ rating: 0, comment: '', authorName: '' })

function resolveUrl(url: string) {
  if (url.startsWith('http')) return url
  return `${config.public.apiBase}${url}`
}

async function submit() {
  if (form.rating === 0) return
  if (!form.authorName.trim()) {
    error.value = 'Informe seu nome para avaliar.'
    return
  }

  submitting.value = true
  error.value = ''

  try {
    await $fetch(`${config.public.apiBase}/api/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        productId: product.value!.id,
        rating: form.rating,
        comment: form.comment || null,
        authorName: form.authorName.trim(),
      },
    })

    success.value = true
    setTimeout(() => navigateTo('/loja'), 4000)
  } catch {
    error.value = 'Erro ao enviar avaliação. Tente novamente.'
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  try {
    product.value = await $fetch<Product>(
      `${config.public.apiBase}/api/products/${route.params.id}`
    )
  } catch {
    // not found
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.4s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
