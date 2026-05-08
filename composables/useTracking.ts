declare global {
  interface Window {
    fbq: (...args: any[]) => void
    gtag: (...args: any[]) => void
  }
}

export function useTracking() {
  function fbq(...args: any[]) {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq(...args)
    }
  }

  function gtag(...args: any[]) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag(...args)
    }
  }

  function pageView() {
    fbq('track', 'PageView')
    gtag('event', 'page_view')
  }

  function viewContent(productName: string, productId: number, price: number) {
    fbq('track', 'ViewContent', {
      content_name: productName,
      content_ids: [String(productId)],
      content_type: 'product',
      value: price,
      currency: 'BRL',
    })
    gtag('event', 'view_item', {
      items: [{ item_id: String(productId), item_name: productName, price }],
      currency: 'BRL',
      value: price,
    })
  }

  function addToCart(productName: string, productId: number, price: number, quantity: number) {
    fbq('track', 'AddToCart', {
      content_name: productName,
      content_ids: [String(productId)],
      content_type: 'product',
      value: price * quantity,
      currency: 'BRL',
    })
    gtag('event', 'add_to_cart', {
      items: [{ item_id: String(productId), item_name: productName, price, quantity }],
      currency: 'BRL',
      value: price * quantity,
    })
  }

  function initiateCheckout(total: number, items: { id: number; name: string; price: number; quantity: number }[]) {
    fbq('track', 'InitiateCheckout', {
      content_ids: items.map(i => String(i.id)),
      content_type: 'product',
      num_items: items.length,
      value: total,
      currency: 'BRL',
    })
    gtag('event', 'begin_checkout', {
      items: items.map(i => ({ item_id: String(i.id), item_name: i.name, price: i.price, quantity: i.quantity })),
      currency: 'BRL',
      value: total,
    })
  }

  function purchase(orderId: number, total: number, items: { id: number; name: string; price: number; quantity: number }[]) {
    fbq('track', 'Purchase', {
      content_ids: items.map(i => String(i.id)),
      content_type: 'product',
      num_items: items.length,
      value: total,
      currency: 'BRL',
    })
    gtag('event', 'purchase', {
      transaction_id: String(orderId),
      items: items.map(i => ({ item_id: String(i.id), item_name: i.name, price: i.price, quantity: i.quantity })),
      currency: 'BRL',
      value: total,
    })
  }

  return { pageView, viewContent, addToCart, initiateCheckout, purchase }
}
