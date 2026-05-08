<template>
  <div class="max-w-2xl mx-auto px-4 py-16 text-center">
    <div class="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
      <i class="pi pi-clock text-3xl text-yellow-600" />
    </div>
    <h1 class="font-serif text-3xl text-teal mb-3">Pagamento Pendente</h1>
    <p class="text-steel mb-2">
      Seu pedido <span class="font-semibold text-teal">#{{ externalReference }}</span> está aguardando confirmação do pagamento.
    </p>
    <p class="text-primary-300 text-sm mb-8">
      Assim que o pagamento for confirmado, você receberá os materiais por email.
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
