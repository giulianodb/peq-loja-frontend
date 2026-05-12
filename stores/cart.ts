import { defineStore } from 'pinia'
import type { CartItem, Product } from '~/types'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[],
  }),

  getters: {
    count: (state) => state.items.reduce((sum, i) => sum + i.quantity, 0),
    total: (state) =>
      state.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
  },

  actions: {
    add(product: Product) {
      const alreadyInCart = this.items.some((i) => i.product.id === product.id)
      if (!alreadyInCart) {
        this.items.push({ product, quantity: 1 })
        this.persist()
      }
    },

    remove(productId: number) {
      this.items = this.items.filter((i) => i.product.id !== productId)
      this.persist()
    },

    updateQuantity(productId: number, quantity: number) {
      const item = this.items.find((i) => i.product.id === productId)
      if (item) {
        item.quantity = Math.max(1, quantity)
        this.persist()
      }
    },

    clear() {
      this.items = []
      this.persist()
    },

    persist() {
      if (import.meta.client) {
        localStorage.setItem('cart', JSON.stringify(this.items))
      }
    },

    restore() {
      if (import.meta.client) {
        const data = localStorage.getItem('cart')
        if (data) {
          this.items = JSON.parse(data)
        }
      }
    },
  },
})
