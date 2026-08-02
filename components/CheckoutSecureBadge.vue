<template>
  <div
    class="flex items-center gap-1.5 text-green-600 bg-green-50 border border-green-100 rounded-full"
    :class="full ? 'gap-2 px-4 py-2' : 'px-3 py-1'"
  >
    <svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
    </svg>
    <span class="font-medium text-green-700" :class="full ? 'text-xs' : 'text-[11px]'">
      {{ full ? 'Pagamento seguro por Stripe' : 'Pagamento seguro' }}
    </span>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ full?: boolean }>(), { full: false })
</script>
