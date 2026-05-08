export default defineNuxtRouteMiddleware(() => {
  const auth = useAuthStore()
  if (!auth.isLoggedIn) {
    return navigateTo('/login?redirect=/admin')
  }
  if (!auth.isAdmin) {
    return navigateTo('/')
  }
})
