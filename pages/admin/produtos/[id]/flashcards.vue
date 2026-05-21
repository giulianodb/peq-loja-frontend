<template>
  <div>
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink :to="`/admin/produtos/${route.params.id}`" class="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
        <i class="pi pi-arrow-left" />
      </NuxtLink>
      <div>
        <h1 class="text-2xl font-serif font-bold text-gray-900">Flashcards</h1>
        <p v-if="productName" class="text-sm text-gray-400 mt-0.5">{{ productName }} · <span class="font-mono">{{ moduleSlug }}</span></p>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <i class="pi pi-spin pi-spinner text-3xl text-teal" />
    </div>

    <div v-else class="max-w-3xl space-y-4">

      <!-- Lista de cards existentes -->
      <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div class="px-5 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <span class="text-sm font-medium text-gray-600">{{ cards.length }} card{{ cards.length !== 1 ? 's' : '' }}</span>
        </div>

        <div v-if="cards.length === 0" class="px-5 py-10 text-center text-gray-400 text-sm">
          Nenhum flashcard cadastrado ainda.
        </div>

        <div v-else class="divide-y divide-gray-100">
          <div v-for="card in cards" :key="card.id" class="px-5 py-4">
            <!-- Visualização -->
            <div v-if="editingId !== card.id" class="flex items-start justify-between gap-4">
              <div class="flex-1 grid grid-cols-2 gap-4">
                <div>
                  <p class="text-xs font-medium text-gray-400 mb-1">Frente</p>
                  <p class="text-sm font-medium text-gray-900">{{ card.front }}</p>
                </div>
                <div>
                  <p class="text-xs font-medium text-gray-400 mb-1">Verso</p>
                  <p class="text-sm text-teal font-medium">{{ card.back }}</p>
                </div>
                <div v-if="card.hint" class="col-span-2">
                  <p class="text-xs font-medium text-gray-400 mb-1">Dica</p>
                  <p class="text-sm text-gray-500 italic">{{ card.hint }}</p>
                </div>
              </div>
              <div class="flex items-center gap-1 flex-shrink-0">
                <button @click="startEdit(card)" class="p-2 rounded-lg text-gray-400 hover:text-teal hover:bg-teal/10 transition-colors">
                  <i class="pi pi-pencil text-sm" />
                </button>
                <button @click="deleteCard(card.id)" :disabled="deleting === card.id" class="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                  <i v-if="deleting === card.id" class="pi pi-spin pi-spinner text-sm" />
                  <i v-else class="pi pi-trash text-sm" />
                </button>
              </div>
            </div>

            <!-- Edição inline -->
            <div v-else class="space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">Frente *</label>
                  <input v-model="editForm.front" type="text" class="input-field" placeholder="Ex: 7 × 8" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">Verso *</label>
                  <input v-model="editForm.back" type="text" class="input-field" placeholder="Ex: 56" />
                </div>
                <div class="col-span-2">
                  <label class="block text-xs font-medium text-gray-500 mb-1">Dica</label>
                  <input v-model="editForm.hint" type="text" class="input-field" placeholder="Dica opcional" />
                </div>
              </div>
              <div class="flex gap-2">
                <button @click="saveEdit(card.id)" :disabled="saving" class="px-4 py-1.5 bg-teal text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
                  <i v-if="saving" class="pi pi-spin pi-spinner mr-1 text-xs" />Salvar
                </button>
                <button @click="editingId = null" class="px-4 py-1.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Formulário de novo card -->
      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <h3 class="text-sm font-medium text-gray-700 mb-4">Adicionar novo card</h3>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Frente *</label>
            <input v-model="newCard.front" type="text" class="input-field" placeholder="Ex: 7 × 8" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Verso *</label>
            <input v-model="newCard.back" type="text" class="input-field" placeholder="Ex: 56" @keydown.enter="addCard" />
          </div>
          <div class="col-span-2">
            <label class="block text-xs font-medium text-gray-500 mb-1">Dica</label>
            <input v-model="newCard.hint" type="text" class="input-field" placeholder="Dica opcional" @keydown.enter="addCard" />
          </div>
        </div>
        <div class="mt-3 flex gap-2">
          <button
            @click="addCard"
            :disabled="!newCard.front.trim() || !newCard.back.trim() || adding"
            class="flex items-center gap-2 px-4 py-2 bg-coral text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            <i v-if="adding" class="pi pi-spin pi-spinner text-xs" />
            <i v-else class="pi pi-plus text-xs" />
            Adicionar card
          </button>
          <span class="text-xs text-gray-400 self-center">ou pressione Enter</span>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import type { FlashCard, Product } from '~/types'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const { $fetch } = useApi()
const productId = route.params.id as string

const loading = ref(true)
const cards = ref<FlashCard[]>([])
const productName = ref('')
const moduleSlug = ref('')

const editingId = ref<number | null>(null)
const editForm = reactive({ front: '', back: '', hint: '' })
const saving = ref(false)
const deleting = ref<number | null>(null)

const newCard = reactive({ front: '', back: '', hint: '' })
const adding = ref(false)

onMounted(async () => {
  try {
    const [product, flashcards] = await Promise.all([
      $fetch<Product>(`/api/admin/products/${productId}`),
      $fetch<FlashCard[]>(`/api/admin/products/${productId}/flashcards`),
    ])
    productName.value = product.name
    moduleSlug.value = product.moduleSlug || ''
    cards.value = flashcards
  } catch {
    navigateTo(`/admin/produtos/${productId}`)
  } finally {
    loading.value = false
  }
})

function startEdit(card: FlashCard) {
  editingId.value = card.id
  editForm.front = card.front
  editForm.back = card.back
  editForm.hint = card.hint || ''
}

async function saveEdit(cardId: number) {
  if (!editForm.front.trim() || !editForm.back.trim()) return
  saving.value = true
  try {
    const updated = await $fetch<FlashCard>(`/api/admin/products/${productId}/flashcards/${cardId}`, {
      method: 'PUT',
      body: { front: editForm.front, back: editForm.back, hint: editForm.hint || null },
    })
    const idx = cards.value.findIndex(c => c.id === cardId)
    if (idx !== -1) cards.value[idx] = updated
    editingId.value = null
  } catch {
    alert('Erro ao salvar card')
  } finally {
    saving.value = false
  }
}

async function deleteCard(cardId: number) {
  if (!confirm('Excluir este flashcard?')) return
  deleting.value = cardId
  try {
    await $fetch(`/api/admin/products/${productId}/flashcards/${cardId}`, { method: 'DELETE' })
    cards.value = cards.value.filter(c => c.id !== cardId)
  } catch {
    alert('Erro ao excluir card')
  } finally {
    deleting.value = null
  }
}

async function addCard() {
  if (!newCard.front.trim() || !newCard.back.trim()) return
  adding.value = true
  try {
    const created = await $fetch<FlashCard>(`/api/admin/products/${productId}/flashcards`, {
      method: 'POST',
      body: {
        front: newCard.front.trim(),
        back: newCard.back.trim(),
        hint: newCard.hint.trim() || null,
        sortOrder: cards.value.length,
      },
    })
    cards.value.push(created)
    newCard.front = ''
    newCard.back = ''
    newCard.hint = ''
  } catch {
    alert('Erro ao adicionar card')
  } finally {
    adding.value = false
  }
}
</script>

<style scoped>
.input-field {
  @apply w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none;
}
</style>
