<template>
  <div class="min-h-[80vh] flex items-center justify-center px-4 py-12">
    <!-- Loading -->
    <div v-if="loading" class="animate-pulse space-y-4 w-full max-w-md">
      <div class="h-6 bg-sand-100 rounded w-2/3 mx-auto" />
      <div class="h-24 bg-sand-100 rounded-2xl" />
      <div class="h-24 bg-sand-100 rounded-2xl" />
      <div class="h-10 bg-sand-100 rounded" />
    </div>

    <!-- Nenhum produto encontrado -->
    <div v-else-if="products.length === 0" class="text-center">
      <i class="pi pi-exclamation-circle text-4xl text-salmon mb-4" />
      <p class="text-steel text-lg">Nenhum produto encontrado para avaliar.</p>
    </div>

    <!-- Sucesso -->
    <Transition name="fade">
      <div v-if="success" class="text-center max-w-md">
        <div class="w-20 h-20 rounded-full bg-teal/10 flex items-center justify-center mx-auto mb-6">
          <i class="pi pi-check text-4xl text-teal" />
        </div>
        <h2 class="font-serif text-2xl text-teal mb-3">Obrigado pela sua avaliação!</h2>
        <p class="text-steel leading-relaxed">Sua avaliação será publicada após aprovação.</p>
        <p class="text-sm text-steel/60 mt-4">Redirecionando para a loja...</p>
      </div>
    </Transition>

    <!-- Formulário -->
    <div v-if="products.length > 0 && !success" class="w-full max-w-md">
      <div class="text-center mb-6">
        <h1 class="font-serif text-2xl md:text-3xl text-teal">Avaliar minha compra</h1>
        <p class="text-steel text-sm mt-1">Sua opinião é muito importante para nós</p>
      </div>

      <!-- Seletor de produto -->
      <div class="mb-6">
        <p class="text-sm font-medium text-primary-700 mb-3">Qual produto você quer avaliar?</p>
        <div class="space-y-2">
          <button
            v-for="p in products"
            :key="p.id"
            @click="selectProduct(p)"
            class="w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left"
            :class="selectedProduct?.id === p.id
              ? 'border-teal bg-teal/5'
              : 'border-sand-200 bg-white hover:border-sand-300'"
          >
            <div class="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-light">
              <img
                v-if="p.imageUrl"
                :src="resolveUrl(p.imageUrl)"
                :alt="p.name"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <i class="pi pi-file-pdf text-lg text-salmon" />
              </div>
            </div>
            <div class="min-w-0 flex-1">
              <p v-if="p.categoryName" class="text-[10px] uppercase tracking-widest text-coral font-medium">
                {{ p.categoryName }}
              </p>
              <p class="font-serif text-sm text-teal leading-snug line-clamp-2">{{ p.name }}</p>
            </div>
            <i
              class="pi flex-shrink-0 text-lg"
              :class="selectedProduct?.id === p.id ? 'pi-check-circle text-teal' : 'pi-circle text-sand-300'"
            />
          </button>
        </div>
      </div>

      <template v-if="selectedProduct">
        <!-- Estrelas -->
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

        <!-- Nome -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-primary-700 mb-1">Seu nome</label>
          <input
            v-model="form.authorName"
            type="text"
            class="w-full border border-sand-200 rounded-lg px-4 py-2.5 text-primary-800 focus:outline-none focus:ring-2 focus:ring-coral/40 focus:border-coral/40 placeholder:text-primary-300"
            placeholder="Como deseja ser identificado"
          />
        </div>

        <!-- Comentário -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-primary-700 mb-1">
            Comentário <span class="text-steel font-normal">(opcional)</span>
          </label>
          <textarea
            v-model="form.comment"
            rows="3"
            class="w-full border border-sand-200 rounded-lg px-4 py-2.5 text-primary-800 focus:outline-none focus:ring-2 focus:ring-coral/40 focus:border-coral/40 placeholder:text-primary-300"
            placeholder="Conte o que achou do material..."
          />
        </div>

        <!-- Erro -->
        <p v-if="error" class="text-sm text-red-500 mb-4 text-center">{{ error }}</p>

        <!-- Enviar -->
        <button
          @click="submit"
          :disabled="submitting || form.rating === 0"
          class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i v-if="submitting" class="pi pi-spin pi-spinner mr-2" />
          Enviar Avaliação
        </button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/types'

const config = useRuntimeConfig()
const route = useRoute()

const loading = ref(true)
const products = ref<Product[]>([])
const selectedProduct = ref<Product | null>(null)
const submitting = ref(false)
const success = ref(false)
const error = ref('')
const form = reactive({ rating: 0, comment: '', authorName: '' })

function resolveUrl(url: string) {
  if (url.startsWith('http')) return url
  return `${config.public.apiBase}${url}`
}

function selectProduct(p: Product) {
  selectedProduct.value = p
  form.rating = 0
  form.comment = ''
  error.value = ''
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
        productId: selectedProduct.value!.id,
        rating: form.rating,
        comment: form.comment || null,
        authorName: form.authorName.trim(),
      },
    })

    success.value = true
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setTimeout(() => navigateTo('/loja'), 4000)
  } catch {
    error.value = 'Erro ao enviar avaliação. Tente novamente.'
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  const ids = ((route.query.produtos as string) || '').split(',').filter(Boolean)

  if (ids.length === 0) {
    loading.value = false
    return
  }

  const results = await Promise.allSettled(
    ids.map(id => $fetch<Product>(`${config.public.apiBase}/api/products/${id}`))
  )

  products.value = results
    .filter((r): r is PromiseFulfilledResult<Product> => r.status === 'fulfilled')
    .map(r => r.value)

  if (products.value.length > 0) {
    selectedProduct.value = products.value[0]
  }

  loading.value = false
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.4s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
