export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:mounted', () => {
    const loader = document.getElementById('pt-loader')
    if (!loader) return

    loader.style.opacity = '0'
    loader.addEventListener('transitionend', () => loader.remove(), { once: true })
  })
})
