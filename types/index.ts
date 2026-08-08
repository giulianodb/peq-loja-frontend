export interface User {
  email: string
  name: string
  role: string
}

export interface AuthResponse {
  token: string
  email: string
  name: string
  role: string
}

export interface Category {
  id: number
  name: string
  description: string
}

export interface ProductMedia {
  id: number
  mediaUrl: string
  mediaType: 'IMAGE' | 'VIDEO'
  sortOrder: number
}

export interface ProductMaterialItem {
  id: number
  displayName: string
  fileName: string
  fileSize: number
}

export interface Product {
  id: number
  name: string
  shortDescription: string | null
  description: string
  price: number
  imageUrl: string | null
  active: boolean
  categoryId: number | null
  categoryName: string | null
  media: ProductMedia[]
  materials: ProductMaterialItem[]
  averageRating: number | null
  totalReviews: number | null
  moduleSlug: string | null
  createdAt: string
}

export interface FlashCard {
  id: number
  front: string
  back: string
  hint: string | null
  sortOrder: number
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface OrderItem {
  productId: number
  productName: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface Order {
  id: number
  status: string
  total: number
  customerName: string
  guestEmail: string | null
  recoveryToken: string | null
  funnelSlug: string | null
  recoveryEmailSent: boolean | null
  secondRecoveryEmailSent: boolean | null
  items: OrderItem[]
  createdAt: string
  checkoutUrl: string | null
  paymentMethod: string | null
  guestPhone: string | null
  guestCpf: string | null
  couponCode: string | null
  discountAmount: number | null
}

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  first: boolean
  last: boolean
}
