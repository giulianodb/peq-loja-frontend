<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-sand-100 via-white to-sand-100">
    <!-- Header mínimo -->
    <header class="py-3 text-center">
      <div>
        <picture>
          <source srcset="/images/logo-coral.webp" type="image/webp" />
          <img
            src="/images/logo-coral.png"
            alt="Pequenas Trilhas"
            class="h-10 w-auto mx-auto"
            width="276"
            height="120"
            fetchpriority="high"
          />
        </picture>
      </div>
    </header>

    <main class="flex-1 pb-12">
      <slot />
    </main>

    <!-- Footer mínimo -->
    <footer class="py-4 text-center text-xs text-steel border-t border-sand-200">
      <p>&copy; {{ new Date().getFullYear() }} Pequenas Trilhas&reg;. Todos os direitos reservados.</p>
      <p class="mt-1">Dúvidas? <a href="mailto:suporte@pequenastrilhas.com.br" class="underline">suporte@pequenastrilhas.com.br</a></p>
    </footer>
  </div>
</template>
