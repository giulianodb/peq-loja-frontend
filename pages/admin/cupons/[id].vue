<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <NuxtLink to="/admin/cupons" class="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
        <i class="pi pi-arrow-left" />
      </NuxtLink>
      <h1 class="text-2xl font-serif font-bold text-gray-900">Editar Cupom</h1>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <i class="pi pi-spin pi-spinner text-3xl text-teal" />
    </div>

    <CouponForm v-else-if="coupon" :coupon="coupon" :saving="saving" @save="handleSave" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const { $fetch } = useApi()
const coupon = ref<any>(null)
const loading = ref(true)
const saving = ref(false)

onMounted(async () => {
  try {
    coupon.value = await $fetch(`/api/admin/coupons/${route.params.id}`)
  } catch {
    navigateTo('/admin/cupons')
  } finally {
    loading.value = false
  }
})

async function handleSave(payload: any) {
  saving.value = true
  try {
    await $fetch(`/api/admin/coupons/${route.params.id}`, { method: 'PUT', body: JSON.stringify(payload) })
    navigateTo('/admin/cupons')
  } catch (e: any) {
    const msg = e?.data?.error || e?.data?.message || 'Erro ao atualizar cupom'
    alert(msg)
  } finally {
    saving.value = false
  }
}
</script>
