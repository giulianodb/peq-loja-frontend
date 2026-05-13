<template>
  <section class="relative w-full min-h-[70vh] md:min-h-[620px] flex items-center overflow-hidden bg-teal">

    <!-- Imagem de fundo full-width -->
    <picture>
      <source srcset="/images/hero-banner.webp" type="image/webp" />
      <img
        src="/images/hero-banner.png"
        alt=""
        role="presentation"
        width="840"
        height="1120"
        fetchpriority="high"
        class="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700"
        :class="loaded ? 'opacity-100' : 'opacity-0'"
        @load="loaded = true"
      />
    </picture>

    <!-- Overlay para garantir leitura do texto -->
    <div class="absolute inset-0 bg-gradient-to-b from-teal/70 via-teal/55 to-teal/40" />

    <!-- Conteúdo sobreposto -->
    <div class="relative w-full max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
      <span class="inline-block text-salmon text-xs sm:text-sm font-medium tracking-widest uppercase mb-5">
        Materiais Educativos Digitais
      </span>
      <h1 class="font-serif text-3xl sm:text-5xl lg:text-6xl text-white leading-[1.15] tracking-tight mb-8">
        Pratique em casa o que <br />
        <span class="text-salmon">faz diferença na escola</span>
      </h1>
      <NuxtLink to="/loja" class="btn-primary">
        <i class="pi pi-arrow-right mr-2" />
        Ver Materiais
      </NuxtLink>
    </div>

  </section>
</template>

<script setup lang="ts">
const loaded = ref(false)
</script>
