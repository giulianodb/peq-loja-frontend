<template>
  <div class="mt-4 pt-4 border-t border-sand-200">
    <div class="flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
      <div v-for="(item, i) in items" :key="i" class="flex items-center gap-1.5">
        <i :class="item.icon" class="text-teal text-sm" />
        <span class="text-xs text-steel">{{ item.label }}</span>
        <span v-if="i < items.length - 1" class="hidden sm:inline text-sand-200 ml-5">|</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const items = [
  { icon: 'pi pi-lock',       label: 'Ambiente criptografado' },
  { icon: 'pi pi-bolt',       label: 'Acesso imediato por e-mail' },
  { icon: 'pi pi-headphones', label: 'Suporte rápido' },
]
</script>
