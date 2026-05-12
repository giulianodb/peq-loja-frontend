<template>
  <header class="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
    <!-- Top bar -->
    <div class="bg-teal text-white text-center py-1.5 text-xs tracking-wide font-light">
      🎉 Use o cupom <span class="font-semibold">BEMVINDO10</span> e ganhe 10% na primeira compra
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <!-- Main nav -->
      <div class="flex items-center justify-between h-16 md:h-20">
        <!-- Mobile: hamburger (left) -->
        <div class="md:hidden">
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="flex items-center text-primary-800 hover:text-coral transition-colors p-1"
            aria-label="Menu"
          >
            <i :class="mobileMenuOpen ? 'pi pi-times' : 'pi pi-bars'" class="text-xl" />
          </button>
        </div>

        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center">
          <img
            src="/images/logo-teal.png"
            alt="Pequenas Trilhas"
            class="h-10 md:h-14 w-auto hidden sm:block"
          />
          <img
            src="/images/simbolo-teal.png"
            alt="Pequenas Trilhas"
            class="h-9 w-auto sm:hidden"
          />
        </NuxtLink>

        <!-- Desktop nav -->
        <nav class="hidden md:flex items-center gap-8">
          <NuxtLink
            to="/"
            class="text-sm font-medium text-primary-800 hover:text-coral transition-colors"
          >
            Início
          </NuxtLink>
          <div class="relative" ref="categoryDropdown">
            <button
              @click="showCategories = !showCategories"
              class="text-sm font-medium text-primary-800 hover:text-coral transition-colors flex items-center gap-1"
            >
              Materiais
              <i class="pi pi-chevron-down text-[10px] transition-transform" :class="{ 'rotate-180': showCategories }" />
            </button>
            <Transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="opacity-0 -translate-y-1"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 -translate-y-1"
            >
              <div
                v-if="showCategories"
                class="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-border py-2"
              >
                <NuxtLink
                  to="/loja"
                  class="block px-4 py-2 text-sm text-primary-800 hover:bg-sand-100 hover:text-coral"
                  @click="showCategories = false"
                >
                  Todos os Materiais
                </NuxtLink>
                <NuxtLink
                  v-for="cat in categories"
                  :key="cat.id"
                  :to="`/loja?categoria=${cat.id}`"
                  class="block px-4 py-2 text-sm text-primary-800 hover:bg-sand-100 hover:text-coral"
                  @click="showCategories = false"
                >
                  {{ cat.name }}
                </NuxtLink>
              </div>
            </Transition>
          </div>
        </nav>

        <!-- Desktop actions -->
        <div class="hidden md:flex items-center gap-3">
          <NuxtLink
            v-if="auth.isLoggedIn"
            to="/minha-conta"
            class="flex items-center gap-1.5 text-sm text-primary-800 hover:text-coral transition-colors"
          >
            <i class="pi pi-user text-base" />
            <span class="hidden lg:inline">{{ auth.user?.name?.split(' ')[0] }}</span>
          </NuxtLink>
          <NuxtLink
            v-else
            to="/login"
            class="flex items-center gap-1.5 text-sm text-primary-800 hover:text-coral transition-colors"
          >
            <i class="pi pi-user text-base" />
            <span class="hidden lg:inline">Entrar</span>
          </NuxtLink>

          <NuxtLink
            to="/carrinho"
            class="relative flex items-center gap-1.5 text-sm text-primary-800 hover:text-coral transition-colors"
          >
            <i class="pi pi-shopping-bag text-lg" />
            <span
              v-if="cart.count > 0"
              class="absolute -top-1.5 -right-2 bg-coral text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center"
            >
              {{ cart.count }}
            </span>
          </NuxtLink>
        </div>

        <!-- Mobile: user + cart (right) -->
        <div class="md:hidden flex items-center gap-4">
          <NuxtLink
            v-if="auth.isLoggedIn"
            to="/minha-conta"
            class="relative flex items-center text-primary-800 hover:text-coral transition-colors"
          >
            <i class="pi pi-user text-lg" />
          </NuxtLink>
          <NuxtLink
            v-else
            to="/login"
            class="relative flex items-center text-primary-800 hover:text-coral transition-colors"
          >
            <i class="pi pi-user text-lg" />
          </NuxtLink>

          <NuxtLink
            to="/carrinho"
            class="relative flex items-center text-primary-800 hover:text-coral transition-colors"
          >
            <i class="pi pi-shopping-bag text-lg" />
            <span
              v-if="cart.count > 0"
              class="absolute -top-1.5 -right-2 bg-coral text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center"
            >
              {{ cart.count }}
            </span>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Mobile menu panel -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="mobileMenuOpen" class="md:hidden border-t border-border bg-white">
        <nav class="max-w-7xl mx-auto px-4 py-4 space-y-1">
          <NuxtLink
            to="/"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-primary-800 hover:bg-sand-100 hover:text-coral transition-colors"
            @click="mobileMenuOpen = false"
          >
            <i class="pi pi-home text-base" />
            Início
          </NuxtLink>

          <div>
            <button
              @click="mobileCategories = !mobileCategories"
              class="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-primary-800 hover:bg-sand-100 hover:text-coral transition-colors"
            >
              <span class="flex items-center gap-3">
                <i class="pi pi-th-large text-base" />
                Materiais
              </span>
              <i class="pi pi-chevron-down text-[10px] transition-transform" :class="{ 'rotate-180': mobileCategories }" />
            </button>
            <div v-if="mobileCategories" class="ml-9 mt-1 space-y-1">
              <NuxtLink
                to="/loja"
                class="block px-3 py-2 rounded-lg text-sm text-primary-700 hover:bg-sand-100 hover:text-coral transition-colors"
                @click="mobileMenuOpen = false"
              >
                Todos os Materiais
              </NuxtLink>
              <NuxtLink
                v-for="cat in categories"
                :key="cat.id"
                :to="`/loja?categoria=${cat.id}`"
                class="block px-3 py-2 rounded-lg text-sm text-primary-700 hover:bg-sand-100 hover:text-coral transition-colors"
                @click="mobileMenuOpen = false"
              >
                {{ cat.name }}
              </NuxtLink>
            </div>
          </div>
        </nav>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
import type { Category } from '~/types'

const auth = useAuthStore()
const cart = useCartStore()
const config = useRuntimeConfig()

const showCategories = ref(false)
const mobileMenuOpen = ref(false)
const mobileCategories = ref(false)
const categories = ref<Category[]>([])
const categoryDropdown = ref<HTMLElement>()

onMounted(async () => {
  try {
    categories.value = await $fetch<Category[]>(`${config.public.apiBase}/api/categories`)
  } catch {
    // API not available yet
  }
})

function handleClickOutside(e: MouseEvent) {
  if (categoryDropdown.value && !categoryDropdown.value.contains(e.target as Node)) {
    showCategories.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))

const route = useRoute()
watch(() => route.path, () => {
  mobileMenuOpen.value = false
  mobileCategories.value = false
})
</script>
