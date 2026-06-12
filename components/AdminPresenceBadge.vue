<template>
  <span
    class="flex items-center gap-1.5 text-sm text-white/90"
    :title="`${count} pessoa(s) navegando na loja agora`"
  >
    <span class="relative flex h-2 w-2">
      <span
        v-if="count > 0"
        class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75"
      />
      <span
        class="relative inline-flex rounded-full h-2 w-2"
        :class="count > 0 ? 'bg-green-400' : 'bg-white/40'"
      />
    </span>
    {{ count }} <span class="hidden sm:inline">online</span>
  </span>
</template>

<script setup lang="ts">
const { $fetch } = useApi()
const count = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

async function load() {
  try {
    const data = await $fetch<{ online: number }>('/api/admin/presence')
    count.value = data.online
  } catch {
    // ignore
  }
}

onMounted(() => {
  load()
  timer = setInterval(load, 20_000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>
