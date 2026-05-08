<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink to="/admin/produtos" class="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
        <i class="pi pi-arrow-left" />
      </NuxtLink>
      <h1 class="text-2xl font-serif font-bold text-gray-900">Novo produto</h1>
    </div>

    <ProductForm @save="handleSave" :saving="saving" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const { $fetch } = useApi()
const saving = ref(false)

async function handleSave(formData: FormData) {
  saving.value = true
  try {
    await $fetch('/api/admin/products', {
      method: 'POST',
      body: formData,
    })
    navigateTo('/admin/produtos')
  } catch (e) {
    console.error(e)
    alert('Erro ao criar produto')
  } finally {
    saving.value = false
  }
}
</script>
