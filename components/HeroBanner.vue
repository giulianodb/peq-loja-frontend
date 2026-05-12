<template>
  <section class="relative bg-warm overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="grid md:grid-cols-2 gap-8 items-center min-h-[500px] md:min-h-[600px] py-12">
        <!-- Text -->
        <div class="order-2 md:order-1 text-center md:text-left">
          <span class="inline-block text-coral text-sm font-medium tracking-widest uppercase mb-4">
            Materiais Educativos Digitais
          </span>
          <h1 class="font-serif text-4xl sm:text-5xl lg:text-6xl text-teal leading-[1.1] tracking-tight">
            Aprendizados que <br />
            <span class="text-coral">deixam marcas</span>
          </h1>
          <p class="mt-6 text-primary-600 text-lg leading-relaxed max-w-lg mx-auto md:mx-0">
            Descubra materiais em PDF cuidadosamente elaborados para acompanhar
            o desenvolvimento das crianças com afeto e intencionalidade.
          </p>
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
            <img
              src="/images/simbolo-coral.png"
              alt="Pequenas Trilhas"
              class="w-40 sm:w-56 md:w-80 h-auto drop-shadow-xl"
            />
            <!-- Decorative dots -->
            <div class="absolute -bottom-4 -left-4 w-24 h-24 bg-salmon/30 rounded-full -z-10" />
            <div class="absolute -top-4 -right-4 w-16 h-16 bg-sand-200 rounded-full -z-10" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
