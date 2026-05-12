<template>
  <footer class="bg-teal text-primary-200 mt-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-12">
        <!-- Brand -->
        <div>
          <img src="/images/logo-coral.png" alt="Pequenas Trilhas" class="h-12 w-auto mb-4" />
          <p class="text-sm leading-relaxed text-primary-300">
            Materiais educativos digitais pensados com carinho para famílias e educadores
            que valorizam o aprendizado significativo.
          </p>
        </div>

        <!-- Links -->
        <div>
          <h4 class="font-serif text-lg text-white mb-4">Navegação</h4>
          <ul class="space-y-2 text-sm">
            <li>
              <NuxtLink to="/" class="hover:text-salmon transition-colors">Início</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/loja" class="hover:text-salmon transition-colors">Materiais</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/minha-conta" class="hover:text-salmon transition-colors">Minha Conta</NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Legal -->
        <div>
          <h4 class="font-serif text-lg text-white mb-4">Legal</h4>
          <ul class="space-y-2 text-sm">
            <li>
              <NuxtLink to="/politica-de-privacidade" class="hover:text-salmon transition-colors">Política de Privacidade</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/perguntas-frequentes" class="hover:text-salmon transition-colors">Perguntas Frequentes</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/contato" class="hover:text-salmon transition-colors">Contato</NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Contact -->
        <div>
          <h4 class="font-serif text-lg text-white mb-4">Contato</h4>
          <ul class="space-y-2 text-sm">
            <li class="flex items-center gap-2">
              <i class="pi pi-envelope text-xs" />
              contato@pequenastrilhas.com.br
            </li>
            <li class="flex items-center gap-2">
              <i class="pi pi-instagram text-xs" />
              @pequenastrilhas
            </li>
          </ul>
        </div>
      </div>

      <div class="border-t border-primary-700 mt-12 pt-8 text-center text-xs text-primary-400">
        <p>&copy; {{ new Date().getFullYear() }} Pequenas Trilhas&reg;. Todos os direitos reservados.</p>
        <p class="mt-1">CNPJ: 55.312.007/0001-30</p>
      </div>
    </div>
  </footer>
</template>
