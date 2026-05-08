<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink to="/admin/produtos" class="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
        <i class="pi pi-arrow-left" />
      </NuxtLink>
      <h1 class="text-2xl font-serif font-bold text-gray-900">Editar produto</h1>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <i class="pi pi-spin pi-spinner text-3xl text-teal" />
    </div>

    <ProductForm v-else-if="product" :product="product" :saving="saving" @save="handleSave" />
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/types'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const { $fetch } = useApi()
const product = ref<Product | null>(null)
const loading = ref(true)
const saving = ref(false)

onMounted(async () => {
  try {
    product.value = await $fetch<Product>(`/api/admin/products/${route.params.id}`)
  } catch {
    navigateTo('/admin/produtos')
  } finally {
    loading.value = false
  }
})

async function handleSave(formData: FormData) {
  saving.value = true
  try {
    await $fetch(`/api/admin/products/${route.params.id}`, {
      method: 'PUT',
      body: formData,
    })
    navigateTo('/admin/produtos')
  } catch (e) {
    console.error(e)
    alert('Erro ao atualizar produto')
  } finally {
    saving.value = false
  }
}
</script>
