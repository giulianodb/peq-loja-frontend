<template>
  <div class="max-w-lg mx-auto text-center py-20">
    <div class="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
      <i class="pi pi-wrench text-3xl text-amber-600" />
    </div>
    <h2 class="font-serif text-3xl text-teal mb-3">Pagamentos em manutenção</h2>
    <p class="text-steel mb-8 whitespace-pre-line">{{ message }}</p>
    <div class="flex flex-col sm:flex-row gap-3 justify-center">
      <NuxtLink to="/loja" class="btn-primary">Continuar navegando</NuxtLink>
      <NuxtLink to="/contato" class="btn-outline">Falar conosco</NuxtLink>
    </div>
    <p class="text-xs text-primary-300 mt-8">
      Seu carrinho fica salvo — é só voltar quando os pagamentos forem reativados.
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message?: string
}>()
</script>
