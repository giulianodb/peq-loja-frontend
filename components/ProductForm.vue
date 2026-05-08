<template>
  <form @submit.prevent="handleSubmit" class="max-w-3xl">
    <div class="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
      <!-- Name -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
        <input
          v-model="form.name"
          type="text"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none"
          placeholder="Nome do produto"
        />
      </div>

      <!-- Short description -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Descricao curta</label>
        <input
          v-model="form.shortDescription"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none"
          placeholder="Resumo do produto"
        />
      </div>

      <!-- Description -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Descricao</label>
        <textarea
          v-model="form.description"
          rows="5"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none resize-y"
          placeholder="Descricao detalhada do produto"
        />
      </div>

      <!-- Price + Stock -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Preco (R$) *</label>
          <input
            v-model.number="form.price"
            type="number"
            step="0.01"
            min="0.01"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none"
            placeholder="0,00"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Estoque *</label>
          <input
            v-model.number="form.stock"
            type="number"
            min="0"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none"
            placeholder="0"
          />
        </div>
      </div>

      <!-- Category -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
        <select
          v-model="form.categoryId"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none"
        >
          <option :value="null">Sem categoria</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
      </div>

      <!-- Active -->
      <div class="flex items-center gap-2">
        <input
          id="active"
          v-model="form.active"
          type="checkbox"
          class="w-4 h-4 rounded border-gray-300 text-teal focus:ring-teal"
        />
        <label for="active" class="text-sm font-medium text-gray-700">Produto ativo</label>
      </div>

      <!-- Cover image upload -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Imagem de capa</label>
        <div class="flex items-start gap-4">
          <div
            v-if="imagePreview || existingImage"
            class="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0"
          >
            <img
              :src="imagePreview || existingImage!"
              class="w-full h-full object-cover"
              alt="Preview"
            />
            <button
              type="button"
              @click="removeImage"
              class="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70"
            >
              <i class="pi pi-times text-xs" />
            </button>
          </div>

          <label
            class="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-teal/50 hover:bg-teal/5 transition-colors"
          >
            <i class="pi pi-cloud-upload text-2xl text-gray-400 mb-2" />
            <p class="text-sm text-gray-500">Clique para selecionar uma imagem</p>
            <p class="text-xs text-gray-400 mt-1">PNG, JPG ate 5MB</p>
            <input
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleImageSelect"
            />
          </label>
        </div>
      </div>

      <!-- Gallery -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Fotos do produto</label>

        <!-- Existing + new previews -->
        <div v-if="allGalleryPreviews.length > 0" class="flex flex-wrap gap-3 mb-3">
          <div
            v-for="(img, idx) in allGalleryPreviews"
            :key="img.key"
            class="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 group"
          >
            <img :src="img.src" class="w-full h-full object-cover" alt="Foto do produto" />
            <button
              type="button"
              @click="removeGalleryItem(idx)"
              class="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <i class="pi pi-times text-xs" />
            </button>
          </div>
        </div>

        <label
          class="inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 cursor-pointer hover:border-teal/50 hover:bg-teal/5 transition-colors"
        >
          <i class="pi pi-plus text-xs" />
          Adicionar fotos
          <input
            type="file"
            accept="image/*"
            multiple
            class="hidden"
            @change="handleGallerySelect"
          />
        </label>
        <p class="text-xs text-gray-400 mt-1">Selecione uma ou mais imagens adicionais do produto</p>
      </div>

      <!-- Materials -->
      <div v-if="product">
        <label class="block text-sm font-medium text-gray-700 mb-2">Materiais do produto</label>
        <p class="text-xs text-gray-500 mb-3">Arquivos (PDF, ZIP, etc.) que o cliente receberá após a compra.</p>

        <div v-if="materials.length > 0" class="space-y-2 mb-3">
          <div
            v-for="mat in materials"
            :key="mat.id"
            class="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2.5 border border-gray-200"
          >
            <div class="flex items-center gap-3 min-w-0 flex-1">
              <i class="pi pi-file text-teal flex-shrink-0" />
              <div class="min-w-0 flex-1">
                <input
                  :value="mat.displayName"
                  @blur="(e) => updateDisplayName(mat, (e.target as HTMLInputElement).value)"
                  class="text-sm text-gray-800 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-teal focus:outline-none w-full py-0.5 transition-colors"
                />
                <p class="text-xs text-gray-400">{{ mat.fileName }} · {{ formatFileSize(mat.fileSize) }}</p>
              </div>
            </div>
            <button
              type="button"
              @click="deleteMaterial(mat.id)"
              class="ml-3 text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
              :disabled="deletingMaterial === mat.id"
            >
              <i :class="deletingMaterial === mat.id ? 'pi pi-spin pi-spinner' : 'pi pi-trash'" class="text-sm" />
            </button>
          </div>
        </div>

        <label
          class="inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 cursor-pointer hover:border-teal/50 hover:bg-teal/5 transition-colors"
          :class="{ 'opacity-50 pointer-events-none': uploadingMaterials }"
        >
          <i :class="uploadingMaterials ? 'pi pi-spin pi-spinner' : 'pi pi-upload'" class="text-xs" />
          {{ uploadingMaterials ? 'Enviando...' : 'Adicionar materiais' }}
          <input
            type="file"
            multiple
            class="hidden"
            @change="handleMaterialUpload"
            accept=".pdf,.zip,.rar,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg"
          />
        </label>
        <p v-if="materialError" class="text-xs text-red-500 mt-1">{{ materialError }}</p>
      </div>
      <div v-else class="bg-gray-50 rounded-lg p-4 border border-dashed border-gray-300">
        <p class="text-sm text-gray-500 text-center">
          <i class="pi pi-info-circle mr-1" />
          Salve o produto primeiro para poder adicionar materiais.
        </p>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-3 mt-6">
      <button
        type="submit"
        :disabled="saving"
        class="inline-flex items-center gap-2 px-6 py-2.5 bg-teal text-white text-sm font-medium rounded-lg hover:bg-teal/90 transition-colors disabled:opacity-50"
      >
        <i v-if="saving" class="pi pi-spin pi-spinner text-sm" />
        {{ product ? 'Salvar alteracoes' : 'Criar produto' }}
      </button>
      <NuxtLink
        to="/admin/produtos"
        class="px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
      >
        Cancelar
      </NuxtLink>
    </div>
  </form>
</template>

<script setup lang="ts">
import type { Product, Category, ProductMedia, ProductMaterialItem } from '~/types'

interface GalleryPreview {
  key: string
  src: string
  type: 'existing' | 'new'
}

const props = defineProps<{
  product?: Product
  saving: boolean
}>()

const emit = defineEmits<{
  save: [formData: FormData]
}>()

const { $fetch } = useApi()
const config = useRuntimeConfig()

const categories = ref<Category[]>([])

const form = reactive({
  name: props.product?.name || '',
  shortDescription: props.product?.shortDescription || '',
  description: props.product?.description || '',
  price: props.product?.price || 0,
  stock: props.product?.stock ?? 0,
  categoryId: props.product?.categoryId || null as number | null,
  active: props.product?.active ?? true,
})

const imageFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)
const existingImage = ref<string | null>(
  props.product?.imageUrl
    ? (props.product.imageUrl.startsWith('http') ? props.product.imageUrl : `${config.public.apiBase}${props.product.imageUrl}`)
    : null
)

const existingGallery = ref<ProductMedia[]>(
  props.product?.media?.filter(m => m.mediaType === 'IMAGE') || []
)
const newGalleryFiles = ref<File[]>([])
const newGalleryPreviews = ref<string[]>([])

const allGalleryPreviews = computed<GalleryPreview[]>(() => {
  const items: GalleryPreview[] = []
  for (const m of existingGallery.value) {
    const src = m.mediaUrl.startsWith('http') ? m.mediaUrl : `${config.public.apiBase}${m.mediaUrl}`
    items.push({ key: `existing-${m.id}`, src, type: 'existing' })
  }
  for (let i = 0; i < newGalleryFiles.value.length; i++) {
    items.push({ key: `new-${i}`, src: newGalleryPreviews.value[i], type: 'new' })
  }
  return items
})

const galleryChanged = ref(false)

const materials = ref<ProductMaterialItem[]>(props.product?.materials || [])
const uploadingMaterials = ref(false)
const deletingMaterial = ref<number | null>(null)
const materialError = ref('')

onMounted(async () => {
  try {
    categories.value = await $fetch<Category[]>('/api/categories')
  } catch {
    // ignore
  }
})

function handleImageSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  imageFile.value = file
  imagePreview.value = URL.createObjectURL(file)
  existingImage.value = null
}

function removeImage() {
  imageFile.value = null
  imagePreview.value = null
  existingImage.value = null
}

function handleGallerySelect(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files) return
  for (const file of Array.from(files)) {
    newGalleryFiles.value.push(file)
    newGalleryPreviews.value.push(URL.createObjectURL(file))
  }
  galleryChanged.value = true
  ;(e.target as HTMLInputElement).value = ''
}

function removeGalleryItem(idx: number) {
  const existingCount = existingGallery.value.length
  if (idx < existingCount) {
    existingGallery.value.splice(idx, 1)
  } else {
    const newIdx = idx - existingCount
    URL.revokeObjectURL(newGalleryPreviews.value[newIdx])
    newGalleryFiles.value.splice(newIdx, 1)
    newGalleryPreviews.value.splice(newIdx, 1)
  }
  galleryChanged.value = true
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

async function handleMaterialUpload(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files || !props.product) return
  materialError.value = ''
  uploadingMaterials.value = true

  try {
    const fd = new FormData()
    for (const file of Array.from(files)) {
      fd.append('files', file)
    }
    const result = await $fetch<ProductMaterialItem[]>(
      `/api/admin/products/${props.product.id}/materials`,
      { method: 'POST', body: fd }
    )
    materials.value = result
  } catch (err: any) {
    materialError.value = err?.data?.error || 'Erro ao enviar materiais.'
  } finally {
    uploadingMaterials.value = false
    ;(e.target as HTMLInputElement).value = ''
  }
}

async function updateDisplayName(mat: ProductMaterialItem, newName: string) {
  if (!props.product || newName.trim() === mat.displayName) return
  if (!newName.trim()) return
  try {
    const updated = await $fetch<ProductMaterialItem>(
      `/api/admin/products/${props.product.id}/materials/${mat.id}`,
      { method: 'PATCH', body: JSON.stringify({ displayName: newName.trim() }) }
    )
    mat.displayName = updated.displayName
  } catch {}
}

async function deleteMaterial(materialId: number) {
  if (!props.product) return
  deletingMaterial.value = materialId
  try {
    await $fetch(`/api/admin/products/${props.product.id}/materials/${materialId}`, { method: 'DELETE' })
    materials.value = materials.value.filter(m => m.id !== materialId)
  } catch (err: any) {
    materialError.value = err?.data?.error || 'Erro ao excluir material.'
  } finally {
    deletingMaterial.value = null
  }
}

function handleSubmit() {
  const fd = new FormData()

  const productData = {
    name: form.name,
    shortDescription: form.shortDescription || null,
    description: form.description || null,
    price: form.price,
    stock: form.stock,
    categoryId: form.categoryId,
    active: form.active,
    videoUrls: [],
  }

  fd.append('product', new Blob([JSON.stringify(productData)], { type: 'application/json' }))

  if (imageFile.value) {
    fd.append('image', imageFile.value)
  }

  if (galleryChanged.value) {
    for (const file of newGalleryFiles.value) {
      fd.append('gallery', file)
    }
    if (newGalleryFiles.value.length === 0 && existingGallery.value.length === 0) {
      fd.append('gallery', new Blob(), '')
    }
  }

  emit('save', fd)
}
</script>
