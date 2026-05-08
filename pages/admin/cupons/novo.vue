<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink to="/admin/cupons" class="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
        <i class="pi pi-arrow-left" />
      </NuxtLink>
      <h1 class="text-2xl font-serif font-bold text-gray-900">Novo Cupom</h1>
    </div>
    <CouponForm :saving="saving" @save="handleSave" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const { $fetch } = useApi()
const saving = ref(false)

async function handleSave(payload: any) {
  saving.value = true
  try {
    await $fetch('/api/admin/coupons', { method: 'POST', body: JSON.stringify(payload) })
    navigateTo('/admin/cupons')
  } catch (e: any) {
    const msg = e?.data?.error || e?.data?.message || 'Erro ao criar cupom'
    alert(msg)
  } finally {
    saving.value = false
  }
}
</script>
