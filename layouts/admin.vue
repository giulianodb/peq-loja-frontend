<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Top bar -->
    <header class="bg-teal text-white h-14 flex items-center px-4 md:px-6 sticky top-0 z-50 shadow-sm">
      <button class="md:hidden mr-3 p-1" @click="sidebarOpen = !sidebarOpen">
        <i class="pi pi-bars text-lg" />
      </button>
      <NuxtLink to="/admin" class="font-serif text-lg font-semibold tracking-tight">
        Pequenas Trilhas
      </NuxtLink>
      <span class="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">Admin</span>
      <div class="ml-auto flex items-center gap-4">
        <AdminPresenceBadge />
        <NuxtLink to="/" class="text-white/80 hover:text-white text-sm flex items-center gap-1">
          <i class="pi pi-external-link text-xs" />
          Ver loja
        </NuxtLink>
        <button @click="logout" class="text-white/80 hover:text-white text-sm flex items-center gap-1">
          <i class="pi pi-sign-out text-xs" />
          Sair
        </button>
      </div>
    </header>

    <div class="flex">
      <!-- Sidebar overlay (mobile) -->
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 bg-black/40 z-40 md:hidden"
        @click="sidebarOpen = false"
      />

      <!-- Sidebar -->
      <aside
        class="fixed md:sticky top-14 left-0 z-40 w-60 h-[calc(100vh-3.5rem)] bg-white border-r border-gray-200 transition-transform md:translate-x-0 overflow-y-auto"
        :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
      >
        <nav class="p-4 space-y-1">
          <NuxtLink
            v-for="item in menuItems"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
            :class="isActive(item.to)
              ? 'bg-teal/10 text-teal'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'"
            @click="sidebarOpen = false"
          >
            <i :class="item.icon" class="text-base" />
            {{ item.label }}
          </NuxtLink>
        </nav>
      </aside>

      <!-- Main content -->
      <main class="flex-1 min-w-0 p-4 md:p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const auth = useAuthStore()
const route = useRoute()
const sidebarOpen = ref(false)

const menuItems = [
  { to: '/admin', icon: 'pi pi-chart-bar', label: 'Dashboard' },
  { to: '/admin/produtos', icon: 'pi pi-box', label: 'Produtos' },
  { to: '/admin/pedidos', icon: 'pi pi-shopping-bag', label: 'Pedidos' },
  { to: '/admin/downloads', icon: 'pi pi-download', label: 'Downloads' },
  { to: '/admin/trafego', icon: 'pi pi-chart-line', label: 'Tráfego' },
  { to: '/admin/clientes', icon: 'pi pi-users', label: 'Clientes' },
  { to: '/admin/checkouts', icon: 'pi pi-megaphone', label: 'Checkouts' },
  { to: '/admin/categorias', icon: 'pi pi-tag', label: 'Categorias' },
  { to: '/admin/cupons', icon: 'pi pi-ticket', label: 'Cupons' },
  { to: '/admin/avaliacoes', icon: 'pi pi-star', label: 'Avaliações' },
  { to: '/admin/webhook-logs', icon: 'pi pi-history', label: 'Webhooks' },
  { to: '/admin/configuracoes', icon: 'pi pi-cog', label: 'Configurações' },
  { to: '/admin/usuarios', icon: 'pi pi-user-edit', label: 'Usuários Admin' },
]

function isActive(path: string) {
  if (path === '/admin') return route.path === '/admin'
  return route.path.startsWith(path)
}

function logout() {
  auth.logout()
  navigateTo('/login')
}

watch(() => route.path, () => {
  sidebarOpen.value = false
})
</script>
