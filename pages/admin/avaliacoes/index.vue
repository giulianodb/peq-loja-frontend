<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-serif font-bold text-gray-900">Avaliações</h1>

      <div class="flex items-center gap-3">
        <select
          v-model="filter"
          @change="loadPage(0)"
          class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
        >
          <option value="all">Todas</option>
          <option value="pending">Pendentes</option>
          <option value="approved">Aprovadas</option>
        </select>

        <button
          @click="openModal"
          class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-teal rounded-lg hover:bg-teal/90 transition-colors"
        >
          <i class="pi pi-plus" /> Nova avaliação
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <i class="pi pi-spin pi-spinner text-3xl text-teal" />
    </div>

    <div v-else>
      <div v-if="reviews.length === 0" class="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
        Nenhuma avaliação encontrada
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="review in reviews"
          :key="review.id"
          class="bg-white rounded-xl border border-gray-200 p-5"
        >
          <div class="flex flex-wrap items-start justify-between gap-3 mb-3">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="font-medium text-gray-900">{{ review.authorName }}</span>
                <span
                  class="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                  :class="review.approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'"
                >
                  {{ review.approved ? 'Aprovada' : 'Pendente' }}
                </span>
              </div>
              <p class="text-xs text-gray-400">
                {{ review.productName }} &middot; {{ formatDate(review.createdAt) }}
              </p>
            </div>
            <div class="flex items-center gap-1">
              <i
                v-for="s in 5"
                :key="s"
                class="pi text-sm"
                :class="s <= review.rating ? 'pi-star-fill text-yellow-400' : 'pi-star text-gray-300'"
              />
            </div>
          </div>

          <p v-if="review.comment" class="text-sm text-gray-700 mb-4">{{ review.comment }}</p>

          <div class="flex items-center gap-2">
            <button
              v-if="!review.approved"
              @click="approve(review)"
              class="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <i class="pi pi-check mr-1" /> Aprovar
            </button>
            <button
              v-if="review.approved"
              @click="reject(review)"
              class="px-3 py-1.5 text-xs font-medium text-yellow-700 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
            >
              <i class="pi pi-ban mr-1" /> Rejeitar
            </button>
            <button
              @click="confirmDelete(review)"
              class="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              <i class="pi pi-trash mr-1" /> Excluir
            </button>
          </div>
        </div>
      </div>

      <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-4">
        <button
          v-for="p in totalPages"
          :key="p"
          @click="loadPage(p - 1)"
          class="w-9 h-9 rounded-lg text-sm font-medium transition-colors"
          :class="currentPage === p - 1 ? 'bg-teal text-white' : 'text-gray-600 hover:bg-gray-100'"
        >
          {{ p }}
        </button>
      </div>
    </div>

    <!-- Modal: Nova avaliação -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="closeModal">
        <div class="bg-white rounded-xl p-6 w-full max-w-lg mx-4 shadow-xl">
          <h3 class="text-lg font-semibold text-gray-900 mb-5">Nova avaliação</h3>

          <div class="space-y-4">
            <!-- Produto -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Produto</label>
              <select
                v-model="form.productId"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
              >
                <option disabled value="">Selecione um produto</option>
                <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }}</option>
              </select>
            </div>

            <!-- Nome do autor -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nome do autor</label>
              <input
                v-model="form.authorName"
                type="text"
                placeholder="Ex: Maria S."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
              />
            </div>

            <!-- Nota -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nota</label>
              <div class="flex items-center gap-1">
                <button
                  v-for="s in 5"
                  :key="s"
                  type="button"
                  @click="form.rating = s"
                  class="text-2xl transition-colors"
                  :class="s <= form.rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'"
                >
                  ★
                </button>
                <span class="ml-2 text-sm text-gray-500">{{ form.rating }}/5</span>
              </div>
            </div>

            <!-- Comentário -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Comentário</label>
              <textarea
                v-model="form.comment"
                rows="3"
                placeholder="Comentário da avaliação (opcional)"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal resize-none"
              />
            </div>

            <!-- Data -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Data da avaliação</label>
              <input
                v-model="form.createdAt"
                type="datetime-local"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
              />
            </div>
          </div>

          <p v-if="formError" class="mt-3 text-sm text-red-600">{{ formError }}</p>

          <div class="flex gap-3 justify-end mt-6">
            <button
              @click="closeModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="submitReview"
              :disabled="saving"
              class="px-4 py-2 text-sm font-medium text-white bg-teal rounded-lg hover:bg-teal/90 transition-colors disabled:opacity-50"
            >
              <i v-if="saving" class="pi pi-spin pi-spinner mr-1" />
              Cadastrar
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal: Excluir -->
    <Teleport to="body">
      <div v-if="deleting" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="deleting = null">
        <div class="bg-white rounded-xl p-6 w-full max-w-sm mx-4 shadow-xl">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Excluir avaliação</h3>
          <p class="text-sm text-gray-600 mb-6">
            Excluir avaliação de <strong>{{ deleting.authorName }}</strong>?
          </p>
          <div class="flex gap-3 justify-end">
            <button @click="deleting = null" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              Cancelar
            </button>
            <button @click="doDelete" class="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors">
              Excluir
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { Page } from '~/types'

interface ReviewItem {
  id: number
  productId: number
  productName: string
  authorName: string
  rating: number
  comment: string | null
  approved: boolean
  createdAt: string
}

interface ProductOption {
  id: number
  name: string
}

definePageMeta({ layout: 'admin', middleware: 'admin' })

const { $fetch } = useApi()

const reviews = ref<ReviewItem[]>([])
const loading = ref(true)
const currentPage = ref(0)
const totalPages = ref(0)
const filter = ref('pending')
const deleting = ref<ReviewItem | null>(null)

// Modal
const showModal = ref(false)
const saving = ref(false)
const formError = ref('')
const products = ref<ProductOption[]>([])

const emptyForm = () => ({
  productId: '' as number | '',
  authorName: '',
  rating: 5,
  comment: '',
  createdAt: new Date().toISOString().slice(0, 16),
})

const form = ref(emptyForm())

async function loadPage(page: number) {
  loading.value = true
  try {
    let url = `/api/admin/reviews?page=${page}&size=20`
    if (filter.value === 'pending') url += '&approved=false'
    else if (filter.value === 'approved') url += '&approved=true'

    const data = await $fetch<Page<ReviewItem>>(url)
    reviews.value = data.content
    totalPages.value = data.totalPages
    currentPage.value = data.number
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function loadProducts() {
  try {
    const data = await $fetch<Page<ProductOption>>('/api/admin/products?size=200')
    products.value = data.content
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  loadPage(0)
  loadProducts()
})

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function openModal() {
  form.value = emptyForm()
  formError.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

async function submitReview() {
  formError.value = ''

  if (!form.value.productId) {
    formError.value = 'Selecione um produto.'
    return
  }
  if (!form.value.authorName.trim()) {
    formError.value = 'Informe o nome do autor.'
    return
  }

  saving.value = true
  try {
    await $fetch('/api/admin/reviews', {
      method: 'POST',
      body: JSON.stringify({
        productId: form.value.productId,
        authorName: form.value.authorName.trim(),
        rating: form.value.rating,
        comment: form.value.comment || null,
        createdAt: form.value.createdAt ? form.value.createdAt + ':00' : null,
      }),
    })
    closeModal()
    await loadPage(0)
  } catch (e: any) {
    formError.value = e?.data?.message || 'Erro ao cadastrar avaliação.'
  } finally {
    saving.value = false
  }
}

async function approve(review: ReviewItem) {
  try {
    await $fetch(`/api/admin/reviews/${review.id}/approve`, { method: 'PATCH' })
    review.approved = true
  } catch (e) {
    console.error(e)
  }
}

async function reject(review: ReviewItem) {
  try {
    await $fetch(`/api/admin/reviews/${review.id}/reject`, { method: 'PATCH' })
    review.approved = false
  } catch (e) {
    console.error(e)
  }
}

function confirmDelete(review: ReviewItem) {
  deleting.value = review
}

async function doDelete() {
  if (!deleting.value) return
  try {
    await $fetch(`/api/admin/reviews/${deleting.value.id}`, { method: 'DELETE' })
    deleting.value = null
    await loadPage(currentPage.value)
  } catch (e) {
    console.error(e)
  }
}
</script>
