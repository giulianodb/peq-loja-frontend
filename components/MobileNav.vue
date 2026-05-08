<template>
  <nav class="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border safe-bottom">
    <div class="flex items-center justify-around h-16">
      <NuxtLink
        to="/"
        class="flex flex-col items-center gap-0.5 text-[11px] transition-colors"
        :class="isActive('/') ? 'text-coral' : 'text-steel'"
      >
        <i class="pi pi-home text-lg" />
        <span>Início</span>
      </NuxtLink>

      <NuxtLink
        to="/loja"
        class="flex flex-col items-center gap-0.5 text-[11px] transition-colors"
        :class="isActive('/loja') ? 'text-coral' : 'text-steel'"
      >
        <i class="pi pi-th-large text-lg" />
        <span>Materiais</span>
      </NuxtLink>

      <NuxtLink
        to="/carrinho"
        class="flex flex-col items-center gap-0.5 text-[11px] relative transition-colors"
        :class="isActive('/carrinho') ? 'text-coral' : 'text-steel'"
      >
        <i class="pi pi-shopping-bag text-lg" />
        <span
          v-if="cart.count > 0"
          class="absolute -top-0.5 right-1/2 translate-x-4 bg-coral text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
        >
          {{ cart.count }}
        </span>
        <span>Carrinho</span>
      </NuxtLink>

      <NuxtLink
        v-if="auth.isLoggedIn"
        to="/minha-conta"
        class="flex flex-col items-center gap-0.5 text-[11px] transition-colors"
        :class="isActive('/minha-conta') ? 'text-coral' : 'text-steel'"
      >
        <i class="pi pi-user text-lg" />
        <span>Conta</span>
      </NuxtLink>
      <NuxtLink
        v-else
        to="/login"
        class="flex flex-col items-center gap-0.5 text-[11px] transition-colors"
        :class="isActive('/login') ? 'text-coral' : 'text-steel'"
      >
        <i class="pi pi-user text-lg" />
        <span>Entrar</span>
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
const route = useRoute()
const auth = useAuthStore()
const cart = useCartStore()

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<style scoped>
.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
</style>
