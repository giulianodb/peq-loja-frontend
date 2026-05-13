<template>
  <section class="relative bg-warm overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="grid md:grid-cols-2 gap-6 items-center min-h-[340px] md:min-h-[480px] py-8 md:py-12">
        <!-- Text -->
        <div class="order-2 md:order-1 text-center md:text-left">
          <span class="inline-block text-coral text-sm font-medium tracking-widest uppercase mb-4">
            Materiais Educativos Digitais
          </span>
          <h1 class="font-serif text-2xl sm:text-4xl lg:text-5xl text-teal leading-[1.15] tracking-tight">
            Pratique em casa o que faz <br class="hidden sm:block" />
            <span class="text-coral">diferença na escola</span>
          </h1>
          <div class="mt-8 flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
            <NuxtLink to="/loja" class="btn-primary">
              <i class="pi pi-arrow-right mr-2" />
              Ver Materiais
            </NuxtLink>
          </div>
        </div>

        <!-- Visual -->
        <div class="order-1 md:order-2 flex justify-center">
          <div class="relative">
            <picture>
              <source srcset="/images/hero-banner.webp" type="image/webp" />
              <img
                src="/images/hero-banner.png"
                alt="Pequenas Trilhas"
                width="840"
                height="1120"
                fetchpriority="high"
                class="w-56 sm:w-72 md:w-[420px] h-auto drop-shadow-xl"
                :class="heroLoaded ? 'opacity-100' : 'opacity-0'"
                style="transition: opacity 0.5s ease"
                @load="heroLoaded = true"
              />
            </picture>
            <!-- Decorative dots -->
            <div class="absolute -bottom-4 -left-4 w-24 h-24 bg-salmon/30 rounded-full -z-10" />
            <div class="absolute -top-4 -right-4 w-16 h-16 bg-sand-200 rounded-full -z-10" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const heroLoaded = ref(false)
</script>
