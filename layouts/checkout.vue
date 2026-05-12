<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-sand-100 via-white to-sand-100">
    <!-- Header mínimo -->
    <header class="py-6 text-center">
      <NuxtLink to="/">
        <picture>
          <source srcset="/images/logo-coral.webp" type="image/webp" />
          <img
            src="/images/logo-coral.png"
            alt="Pequenas Trilhas"
            class="h-12 mx-auto"
            width="276"
            height="120"
            fetchpriority="high"
          />
        </picture>
      </NuxtLink>
    </header>

    <main class="flex-1 pb-12">
      <slot />
    </main>

    <!-- Footer mínimo -->
    <footer class="py-4 text-center text-xs text-steel border-t border-sand-200">
      <p>&copy; {{ new Date().getFullYear() }} Pequenas Trilhas&reg;. Todos os direitos reservados.</p>
      <p class="mt-1">CNPJ: 55.312.007/0001-30</p>
    </footer>
  </div>
</template>
