<template>
  <div class="max-w-2xl mx-auto px-4 py-16 text-center">
    <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
      <i class="pi pi-check text-3xl text-green-600" />
    </div>
    <h1 class="font-serif text-3xl text-teal mb-3">Pagamento Aprovado!</h1>
    <p class="text-steel mb-2">
      Seu pedido <span class="font-semibold text-teal">#{{ externalReference }}</span> foi confirmado.
    </p>
    <p class="text-primary-300 text-sm mb-8">
      Você receberá os materiais em PDF por email em breve.
    </p>
    <div class="flex gap-3 justify-center">
      <NuxtLink to="/minha-conta" class="btn-outline">Meus Pedidos</NuxtLink>
      <NuxtLink to="/loja" class="btn-primary">Continuar Comprando</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const externalReference = computed(() => route.query.external_reference || '')
</script>
