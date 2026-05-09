<template>
  <div class="relative w-full h-full cursor-pointer group" @click="activate">
    <template v-if="!active">
      <img
        :src="thumbnail"
        :alt="title"
        class="w-full h-full object-cover"
        loading="lazy"
      />
      <div class="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
        <div class="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
          <svg viewBox="0 0 24 24" class="w-6 h-6 fill-white ml-1" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
      </div>
    </template>
    <iframe
      v-else
      :src="`https://www.youtube.com/embed/${videoId}?autoplay=1`"
      class="w-full h-full"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  url: string
  title?: string
}>()

const active = ref(false)

const videoId = computed(() => {
  const match = props.url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/
  )
  return match?.[1] ?? ''
})

const thumbnail = computed(() =>
  videoId.value
    ? `https://img.youtube.com/vi/${videoId.value}/hqdefault.jpg`
    : ''
)

function activate() {
  if (videoId.value) active.value = true
}
</script>
