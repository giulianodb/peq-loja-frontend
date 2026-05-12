<template>
  <div class="space-y-8">
    <!-- Info basica -->
    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Informacoes do Checkout</h2>
      <div class="grid sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nome (interno)</label>
          <input
            v-model="form.name"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
            placeholder="Ex: Oferta Dia das Maes"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
          <div class="flex items-center gap-1">
            <span class="text-xs text-gray-400 whitespace-nowrap">/checkout/</span>
            <input
              v-model="form.slug"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
              placeholder="oferta-dia-das-maes"
              @input="sanitizeSlug"
            />
          </div>
        </div>
        <div class="sm:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Titulo (headline)</label>
          <input
            v-model="form.headline"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
            placeholder="Ex: Oferta Exclusiva por Tempo Limitado!"
          />
        </div>
        <div class="sm:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Descricao</label>
          <textarea
            v-model="form.description"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
            placeholder="Texto de apoio para a pagina de checkout"
          />
        </div>
        <div class="flex items-center gap-3">
          <label class="relative inline-flex items-center cursor-pointer">
            <input v-model="form.active" type="checkbox" class="sr-only peer" />
            <div class="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-teal transition-colors after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
          </label>
          <span class="text-sm text-gray-700">Ativo</span>
        </div>
      </div>
    </div>

    <!-- Produto principal -->
    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Produto Principal</h2>
      <div class="grid sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Produto</label>
          <select
            v-model="form.productId"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
          >
            <option :value="null" disabled>Selecione um produto</option>
            <option v-for="p in products" :key="p.id" :value="p.id">
              {{ p.name }} ({{ formatCurrency(p.price) }})
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Preco no checkout</label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">R$</span>
            <input
              v-model="form.productPrice"
              type="number"
              step="0.01"
              min="0"
              required
              class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
            />
          </div>
          <p v-if="selectedProduct" class="text-xs text-gray-400 mt-1">
            Preco original: {{ formatCurrency(selectedProduct.price) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Order bumps -->
    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-900">Order Bumps</h2>
        <button
          type="button"
          @click="addBump"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-teal bg-teal/10 rounded-lg hover:bg-teal/20 transition-colors"
        >
          <i class="pi pi-plus text-xs" />
          Adicionar
        </button>
      </div>

      <div v-if="form.bumps.length === 0" class="text-center py-8 text-gray-400 text-sm">
        Nenhum order bump adicionado
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="(bump, index) in form.bumps"
          :key="index"
          class="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100"
        >
          <div class="flex-1 space-y-3">
            <div class="grid sm:grid-cols-3 gap-3">
              <div>
                <label class="block text-xs font-medium text-gray-500 mb-1">Produto</label>
                <select
                  v-model="bump.productId"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                >
                  <option :value="null" disabled>Selecione</option>
                  <option v-for="p in products" :key="p.id" :value="p.id">
                    {{ p.name }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-500 mb-1">Preco no checkout</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">R$</span>
                  <input
                    v-model="bump.price"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                  />
                </div>
                <p v-if="getBumpProduct(bump.productId)" class="text-xs text-gray-400 mt-1">
                  Original: {{ formatCurrency(getBumpProduct(bump.productId)!.price) }}
                </p>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-500 mb-1">Ordem</label>
                <input
                  v-model.number="bump.sortOrder"
                  type="number"
                  min="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                />
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Título personalizado</label>
              <input
                v-model="bump.customTitle"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                placeholder="Ex: Sim! Quero o Material de Divisão"
              />
              <p class="text-xs text-gray-400 mt-1">Exibido no lugar do nome do produto no checkout.</p>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Descrição (HTML)</label>
              <textarea
                v-model="bump.description"
                rows="4"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                placeholder="Ex: Adicione este material com <strong>50% de desconto</strong>!"
              />
              <p class="text-xs text-gray-400 mt-1">Aceita HTML: &lt;strong&gt;, &lt;em&gt;, &lt;br&gt;, &lt;ul&gt;, etc.</p>
            </div>
          </div>
          <button
            type="button"
            @click="removeBump(index)"
            class="mt-5 p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
          >
            <i class="pi pi-trash text-sm" />
          </button>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center justify-end gap-3">
      <NuxtLink
        to="/admin/checkouts"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
      >
        Cancelar
      </NuxtLink>
      <button
        @click="save"
        :disabled="saving || !isValid"
        class="px-6 py-2 text-sm font-medium text-white bg-teal rounded-lg hover:bg-teal/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
      >
        <i v-if="saving" class="pi pi-spin pi-spinner" />
        {{ saving ? 'Salvando...' : 'Salvar' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product, Page } from '~/types'

interface BumpForm {
  productId: number | null
  price: number | null
  customTitle: string
  description: string
  sortOrder: number
}

interface FunnelForm {
  name: string
  slug: string
  productId: number | null
  productPrice: number | null
  headline: string
  description: string
  active: boolean
  bumps: BumpForm[]
}

interface FunnelData {
  id: number
  name: string
  slug: string
  active: boolean
  headline: string | null
  description: string | null
  product: { id: number; funnelPrice: number }
  bumps: { productId: number; funnelPrice: number; customTitle: string | null; description: string | null; sortOrder: number }[]
}

const props = defineProps<{
  funnel?: FunnelData | null
  saving?: boolean
}>()

const emit = defineEmits<{
  save: [payload: any]
}>()

const { $fetch } = useApi()

const products = ref<Product[]>([])

const form = reactive<FunnelForm>({
  name: props.funnel?.name || '',
  slug: props.funnel?.slug || '',
  productId: props.funnel?.product?.id || null,
  productPrice: props.funnel?.product?.funnelPrice || null,
  headline: props.funnel?.headline || '',
  description: props.funnel?.description || '',
  active: props.funnel?.active ?? true,
  bumps: props.funnel?.bumps?.map(b => ({
    productId: b.productId,
    price: b.funnelPrice,
    customTitle: b.customTitle || '',
    description: b.description || '',
    sortOrder: b.sortOrder,
  })) || [],
})

const selectedProduct = computed(() =>
  products.value.find(p => p.id === form.productId) || null
)

const isValid = computed(() =>
  form.name && form.slug && form.productId && form.productPrice && form.productPrice > 0
)

function getBumpProduct(productId: number | null) {
  if (!productId) return null
  return products.value.find(p => p.id === productId) || null
}

function sanitizeSlug() {
  form.slug = form.slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function addBump() {
  form.bumps.push({ productId: null, price: null, customTitle: '', description: '', sortOrder: form.bumps.length })
}

function removeBump(index: number) {
  form.bumps.splice(index, 1)
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function save() {
  emit('save', {
    name: form.name,
    slug: form.slug,
    productId: form.productId,
    productPrice: form.productPrice,
    headline: form.headline || null,
    description: form.description || null,
    active: form.active,
    bumps: form.bumps
      .filter(b => b.productId && b.price)
      .map(b => ({
        productId: b.productId,
        price: b.price,
        customTitle: b.customTitle || null,
        description: b.description || null,
        sortOrder: b.sortOrder,
      })),
  })
}

onMounted(async () => {
  try {
    const data = await $fetch<Page<Product>>('/api/admin/products?size=100')
    products.value = data.content
  } catch (e) {
    console.error(e)
  }
})
</script>
