<template>
  <div class="max-w-2xl mx-auto px-4 py-16 text-center">
    <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
      <i class="pi pi-times text-3xl text-red-600" />
    </div>
    <h1 class="font-serif text-3xl text-teal mb-3">Pagamento não aprovado</h1>
    <p class="text-steel mb-8">
      Houve um problema com o pagamento. Você pode tentar novamente.
    </p>
    <div class="flex gap-3 justify-center">
      <NuxtLink to="/carrinho" class="btn-outline">Voltar ao Carrinho</NuxtLink>
      <NuxtLink to="/loja" class="btn-primary">Ir para a Loja</NuxtLink>
    </div>
  </div>
</template>
