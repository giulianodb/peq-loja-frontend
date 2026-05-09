<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-12">
    <!-- Loading -->
    <div v-if="loading" class="grid md:grid-cols-2 gap-12 animate-pulse">
      <div class="aspect-square bg-sand-100 rounded-2xl" />
      <div class="space-y-4">
        <div class="h-4 bg-sand-100 rounded w-1/4" />
        <div class="h-8 bg-sand-100 rounded w-3/4" />
        <div class="h-6 bg-sand-100 rounded w-1/3" />
        <div class="h-24 bg-sand-100 rounded" />
      </div>
    </div>

    <div v-else-if="product" class="grid md:grid-cols-2 gap-12">
      <!-- Gallery -->
      <div>
        <!-- Main image/video -->
        <div class="aspect-square bg-light rounded-2xl overflow-hidden mb-3">
          <template v-if="activeMedia && activeMedia.type === 'VIDEO'">
            <YoutubeEmbed :url="activeMedia.url" title="Vídeo do produto" />
          </template>
          <template v-else>
            <img
              v-if="activeMedia"
              :src="resolveUrl(activeMedia.url)"
              :alt="product.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-sand-100 to-sand-200">
              <i class="pi pi-file-pdf text-7xl text-salmon mb-4" />
              <span class="text-steel text-sm">Material Digital — PDF</span>
            </div>
          </template>
        </div>

        <!-- Thumbnails -->
        <div v-if="galleryItems.length > 1" class="flex gap-2 overflow-x-auto pb-2">
          <button
            v-for="(item, index) in galleryItems"
            :key="index"
            @click="activeIndex = index"
            :class="[
              'w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all',
              activeIndex === index ? 'border-coral' : 'border-border hover:border-salmon'
            ]"
          >
            <template v-if="item.type === 'VIDEO'">
              <div class="relative w-full h-full">
                <img
                  :src="`https://img.youtube.com/vi/${extractYoutubeId(item.url)}/hqdefault.jpg`"
                  loading="lazy"
                  class="w-full h-full object-cover"
                />
                <div class="absolute inset-0 flex items-center justify-center bg-black/30">
                  <i class="pi pi-play-circle text-white text-xl" />
                </div>
              </div>
            </template>
            <template v-else>
              <img
                :src="resolveUrl(item.url)"
                :alt="`${product.name} - ${index + 1}`"
                loading="lazy"
                class="w-full h-full object-cover"
              />
            </template>
          </button>
        </div>
      </div>

      <!-- Details -->
      <div>
        <NuxtLink
          v-if="product.categoryName"
          :to="`/loja?categoria=${product.categoryId}`"
          class="text-xs uppercase tracking-widest text-coral font-medium hover:text-moss-500 transition-colors"
        >
          {{ product.categoryName }}
        </NuxtLink>

        <h1 class="font-serif text-3xl md:text-4xl text-teal mt-2 leading-tight">
          {{ product.name }}
        </h1>

        <p v-if="product.shortDescription" class="mt-3 text-steel text-lg leading-relaxed">
          {{ product.shortDescription }}
        </p>

        <div class="mt-4 flex items-center gap-3">
          <span class="text-3xl font-bold text-coral">
            {{ formatPrice(product.price) }}
          </span>
          <span class="text-sm text-steel bg-light px-3 py-1 rounded-full">
            <i class="pi pi-file-pdf mr-1" /> PDF Digital
          </span>
        </div>

        <div class="mt-4">
          <button
            @click="addToCart"
            :disabled="product.stock <= 0"
            class="btn-primary w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i class="pi pi-shopping-bag mr-2" />
            {{ product.stock > 0 ? 'Adicionar ao Carrinho' : 'Esgotado' }}
          </button>
        </div>

        <div class="mt-6 border-t border-border pt-6">
          <div class="product-description text-primary-700 leading-relaxed" v-html="product.description" />
        </div>

        <!-- Add to cart -->
        <div class="mt-8">
          <button
            @click="addToCart"
            :disabled="product.stock <= 0"
            class="btn-primary w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i class="pi pi-shopping-bag mr-2" />
            {{ product.stock > 0 ? 'Adicionar ao Carrinho' : 'Esgotado' }}
          </button>
        </div>

        <div v-if="added" class="mt-4 flex items-center gap-2 text-coral text-sm">
          <i class="pi pi-check-circle" />
          Adicionado ao carrinho!
          <NuxtLink to="/carrinho" class="underline font-medium">Ver carrinho</NuxtLink>
        </div>

        <!-- Features -->
        <div class="mt-8 grid grid-cols-2 gap-4">
          <div class="flex items-center gap-3 p-3 bg-sand-100 rounded-lg">
            <i class="pi pi-download text-coral" />
            <span class="text-sm text-primary-800">Download imediato</span>
          </div>
          <div class="flex items-center gap-3 p-3 bg-sand-100 rounded-lg">
            <i class="pi pi-print text-coral" />
            <span class="text-sm text-primary-800">Pode imprimir</span>
          </div>
          <div class="flex items-center gap-3 p-3 bg-sand-100 rounded-lg">
            <i class="pi pi-tablet text-coral" />
            <span class="text-sm text-primary-800">Acesso no celular</span>
          </div>
          <div class="flex items-center gap-3 p-3 bg-sand-100 rounded-lg">
            <i class="pi pi-lock text-coral" />
            <span class="text-sm text-primary-800">Compra segura</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Reviews section -->
    <section v-if="product" class="mt-20 border-t border-border pt-12">
      <div class="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h2 class="section-title text-2xl">Avaliações</h2>
          <div v-if="reviewData.totalReviews > 0" class="flex items-center gap-2 mt-2">
            <div class="flex items-center gap-0.5">
              <i
                v-for="s in 5"
                :key="s"
                class="pi text-lg"
                :class="s <= Math.round(reviewData.averageRating) ? 'pi-star-fill text-yellow-400' : 'pi-star text-gray-300'"
              />
            </div>
            <span class="text-primary-800 font-semibold">{{ reviewData.averageRating.toFixed(1) }}</span>
            <span class="text-steel text-sm">({{ reviewData.totalReviews }} {{ reviewData.totalReviews === 1 ? 'avaliação' : 'avaliações' }})</span>
          </div>
        </div>
        <button
          @click="showReviewForm = !showReviewForm"
          class="btn-primary text-sm"
        >
          <i class="pi pi-pencil mr-1.5" /> Avaliar
        </button>
      </div>

      <!-- Review form -->
      <Transition name="slide">
        <div v-if="showReviewForm" class="bg-sand-100 rounded-2xl p-6 mb-8">
          <h3 class="font-serif text-lg text-teal mb-4">Sua Avaliação</h3>

          <div class="mb-4">
            <label class="block text-sm font-medium text-primary-700 mb-2">Nota</label>
            <div class="flex items-center gap-1">
              <button
                v-for="s in 5"
                :key="s"
                @click="reviewForm.rating = s"
                class="p-1 transition-transform hover:scale-110"
              >
                <i
                  class="pi text-2xl"
                  :class="s <= reviewForm.rating ? 'pi-star-fill text-yellow-400' : 'pi-star text-gray-300 hover:text-yellow-300'"
                />
              </button>
            </div>
          </div>

          <div v-if="!auth.isLoggedIn" class="mb-4">
            <label class="block text-sm font-medium text-primary-700 mb-1">Seu nome *</label>
            <input
              v-model="reviewForm.authorName"
              type="text"
              class="w-full border border-sand-200 rounded-lg px-4 py-2.5 text-primary-800 focus:outline-none focus:ring-2 focus:ring-coral/40 focus:border-coral/40 placeholder:text-primary-300"
              placeholder="Como deseja ser identificado"
            />
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-primary-700 mb-1">Comentário</label>
            <textarea
              v-model="reviewForm.comment"
              rows="3"
              class="w-full border border-sand-200 rounded-lg px-4 py-2.5 text-primary-800 focus:outline-none focus:ring-2 focus:ring-coral/40 focus:border-coral/40 placeholder:text-primary-300"
              placeholder="Conte o que achou do material..."
            />
          </div>

          <div class="flex items-center justify-between">
            <p v-if="reviewSuccess" class="text-sm text-green-600 flex items-center gap-1">
              <i class="pi pi-check-circle" /> Avaliação enviada! Será publicada após aprovação.
            </p>
            <p v-if="reviewError" class="text-sm text-red-500">{{ reviewError }}</p>
            <div class="flex gap-3 ml-auto">
              <button @click="showReviewForm = false" class="px-4 py-2 text-sm text-steel hover:text-primary-800 transition-colors">
                Cancelar
              </button>
              <button
                @click="submitReview"
                :disabled="reviewSubmitting || reviewForm.rating === 0"
                class="px-6 py-2 text-sm font-medium text-white bg-teal rounded-lg hover:bg-teal/90 disabled:opacity-50 transition-colors"
              >
                <i v-if="reviewSubmitting" class="pi pi-spin pi-spinner mr-1" />
                Enviar
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Reviews list -->
      <div v-if="reviewData.reviews.length === 0 && !showReviewForm" class="bg-light rounded-xl p-8 text-center">
        <i class="pi pi-star text-3xl text-salmon mb-3" />
        <p class="text-steel">Ainda não há avaliações para este material.</p>
        <p class="text-sm text-primary-300 mt-1">Seja o primeiro a avaliar!</p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="review in reviewData.reviews"
          :key="review.id"
          class="bg-white rounded-xl border border-border p-5"
        >
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-teal/10 flex items-center justify-center">
                <span class="text-sm font-semibold text-teal">{{ review.authorName.charAt(0).toUpperCase() }}</span>
              </div>
              <div>
                <p class="font-medium text-primary-800 text-sm">{{ review.authorName }}</p>
                <p class="text-xs text-steel">{{ formatReviewDate(review.createdAt) }}</p>
              </div>
            </div>
            <div class="flex items-center gap-0.5">
              <i
                v-for="s in 5"
                :key="s"
                class="pi text-sm"
                :class="s <= review.rating ? 'pi-star-fill text-yellow-400' : 'pi-star text-gray-300'"
              />
            </div>
          </div>
          <p v-if="review.comment" class="text-sm text-primary-700 leading-relaxed">{{ review.comment }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/types'

const config = useRuntimeConfig()
const route = useRoute()
const cart = useCartStore()
const auth = useAuthStore()

const loading = ref(true)
const product = ref<Product | null>(null)
const added = ref(false)
const activeIndex = ref(0)

// Reviews
interface ReviewItem {
  id: number
  authorName: string
  rating: number
  comment: string | null
  createdAt: string
}

const reviewData = reactive({
  reviews: [] as ReviewItem[],
  averageRating: 0,
  totalReviews: 0,
})

const showReviewForm = ref(false)
const reviewSubmitting = ref(false)
const reviewSuccess = ref(false)
const reviewError = ref('')
const reviewForm = reactive({ rating: 0, comment: '', authorName: '' })

interface GalleryItem {
  url: string
  type: 'IMAGE' | 'VIDEO'
}

const galleryItems = computed<GalleryItem[]>(() => {
  if (!product.value) return []
  const items: GalleryItem[] = []

  if (product.value.imageUrl) {
    items.push({ url: product.value.imageUrl, type: 'IMAGE' })
  }

  if (product.value.media) {
    for (const m of product.value.media) {
      items.push({ url: m.mediaUrl, type: m.mediaType })
    }
  }

  return items
})

const activeMedia = computed<GalleryItem | null>(() => {
  return galleryItems.value[activeIndex.value] || null
})

function resolveUrl(url: string) {
  if (url.startsWith('http')) return url
  return `${config.public.apiBase}${url}`
}

function extractYoutubeId(url: string): string {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/)
  return match?.[1] ?? ''
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function addToCart() {
  if (!product.value || product.value.stock <= 0) return
  cart.add(product.value, 1)
  added.value = true
  setTimeout(() => (added.value = false), 3000)
  const { addToCart: trackAddToCart } = useTracking()
  trackAddToCart(product.value.name, product.value.id, product.value.price, 1)
}

function formatReviewDate(date: string) {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

async function loadReviews() {
  if (!product.value) return
  try {
    const data = await $fetch<{ reviews: ReviewItem[]; averageRating: number; totalReviews: number }>(
      `${config.public.apiBase}/api/reviews/product/${product.value.id}`
    )
    reviewData.reviews = data.reviews
    reviewData.averageRating = data.averageRating
    reviewData.totalReviews = data.totalReviews
  } catch {
    // ignore
  }
}

async function submitReview() {
  if (reviewForm.rating === 0) return
  if (!auth.isLoggedIn && !reviewForm.authorName.trim()) {
    reviewError.value = 'Informe seu nome para avaliar.'
    return
  }

  reviewSubmitting.value = true
  reviewError.value = ''
  reviewSuccess.value = false

  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (auth.token) headers['Authorization'] = `Bearer ${auth.token}`

    await $fetch(`${config.public.apiBase}/api/reviews`, {
      method: 'POST',
      headers,
      body: {
        productId: product.value!.id,
        rating: reviewForm.rating,
        comment: reviewForm.comment || null,
        authorName: auth.isLoggedIn ? null : reviewForm.authorName.trim(),
      },
    })

    reviewSuccess.value = true
    reviewForm.rating = 0
    reviewForm.comment = ''
    reviewForm.authorName = ''
    setTimeout(() => { reviewSuccess.value = false; showReviewForm.value = false }, 3000)
  } catch {
    reviewError.value = 'Erro ao enviar avaliação. Tente novamente.'
  } finally {
    reviewSubmitting.value = false
  }
}

onMounted(async () => {
  try {
    product.value = await $fetch<Product>(
      `${config.public.apiBase}/api/products/${route.params.id}`
    )
    if (product.value) {
      const { viewContent } = useTracking()
      viewContent(product.value.name, product.value.id, product.value.price)
      await loadReviews()
    }
  } catch {
    // not found
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.product-description :deep(strong) { font-weight: 700; }
.product-description :deep(em) { font-style: italic; }
.product-description :deep(u) { text-decoration: underline; }
.product-description :deep(ul) { list-style: disc; padding-left: 1.25rem; margin: 0.5rem 0; }
.product-description :deep(ol) { list-style: decimal; padding-left: 1.25rem; margin: 0.5rem 0; }
.product-description :deep(li) { margin: 0.25rem 0; }
.product-description :deep(p) { margin: 0.5rem 0; }
.product-description :deep(br) { display: block; content: ''; }
.product-description :deep(a) { color: #e07a5f; text-decoration: underline; }
.product-description :deep(h1),
.product-description :deep(h2),
.product-description :deep(h3) { font-weight: 700; margin: 0.75rem 0 0.25rem; }

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}
.slide-enter-to,
.slide-leave-from {
  opacity: 1;
  max-height: 600px;
}
</style>
