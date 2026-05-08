export default defineNuxtPlugin(() => {
  const authStore = useAuthStore()
  const cartStore = useCartStore()

  authStore.restore()
  cartStore.restore()
})
