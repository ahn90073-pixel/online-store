const DEFAULT_STORE_API_BASE = 'https://tagerbackend.ahn90073.workers.dev/api/storefront'
const STORE_API_BASE = (import.meta.env.VITE_STORE_API_BASE_URL || DEFAULT_STORE_API_BASE).replace(/\/+$/, '')
const DEFAULT_AUDIENCE_API_BASE = 'https://neon-store-api.zazotona301.workers.dev'
const AUDIENCE_API_BASE = (import.meta.env.VITE_AUDIENCE_API_BASE_URL || DEFAULT_AUDIENCE_API_BASE).replace(/\/+$/, '')

async function request(path, { method = 'GET', body, base = STORE_API_BASE, signal } = {}) {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 25000)
  const abort = () => controller.abort()
  signal?.addEventListener('abort', abort, { once: true })
  try {
    const response = await fetch(`${base}${path}`, {
      method,
      headers: { Accept: 'application/json', ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal: controller.signal,
    })
    const payload = await response.json().catch(() => null)
    if (!response.ok || payload?.success === false) {
      const detail = payload?.errors?.map?.((item) => item.message || item).filter(Boolean).join('، ')
      throw new Error(detail || payload?.message || 'تعذر إكمال الطلب.')
    }
    return payload?.data ?? payload
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    if (error instanceof Error && error.message && error.name !== 'TypeError') throw error
    throw new Error('تعذر الاتصال بالمتجر. تحقق من الإنترنت وإعدادات الاتصال.')
  } finally {
    signal?.removeEventListener('abort', abort)
    window.clearTimeout(timeout)
  }
}

export function mapStoreProduct(product) {
  const price = Number(product?.price || 0)
  const compareAtPrice = product?.compareAtPrice === null || product?.compareAtPrice === undefined ? null : Number(product.compareAtPrice)
  const weightGrams = Number(product?.weightGrams || 0)
  const rawStockQuantity = product?.stockQuantity ?? product?.availableQuantity ?? product?.stock_quantity
  const stockQuantity = Number(rawStockQuantity ?? 0)
  const images = Array.isArray(product?.images) ? product.images.map((image) => typeof image === 'string' ? image : image?.url).filter(Boolean) : []
  const imageUrls = images.length ? images : (product?.imageUrl ? [product.imageUrl] : [])
  return {
    id: product?.id, productId: product?.id, vendorId: product?.vendorId, vendorName: product?.vendorName || '', name: product?.name || '',
    description: product?.description || '', category: product?.metadata?.categoryLabel || (typeof product?.category === 'object' ? (product.category?.name || product.category?.slug || 'عام') : (product?.category || 'عام')),
    images: imageUrls, image: imageUrls[0] || '', price, oldPrice: compareAtPrice > price ? compareAtPrice : null, currency: product?.currency || 'EGP',
    stockQuantity: Number.isFinite(stockQuantity) && stockQuantity >= 0 ? stockQuantity : 0, seller: product?.sellerName || product?.vendorName || 'تاجر معتمد',
    trustedSeller: Boolean(product?.trustedSeller), badge: product?.badge || '', freeShipping: Boolean(product?.freeShipping), flashDeal: Boolean(product?.isFlashDeal), rating: 0, reviews: 0,
    weight: weightGrams ? `${new Intl.NumberFormat('ar-EG').format(weightGrams)} جم` : '',
  }
}

export async function fetchStorefrontProductsPage({ search = '', category = '', page = 1, limit = 40, signal } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(Math.min(50, Math.max(1, limit))) })
  if (search) params.set('q', search)
  if (category && category !== 'all') params.set('category', category)
  const result = await request(`/products?${params.toString()}`, { signal })
  const rawItems = Array.isArray(result) ? result : (result?.items || [])
  const pagination = result?.pagination || {}
  const totalPages = Math.min(100, Math.max(1, Number(pagination.totalPages ?? pagination.pages) || (rawItems.length < limit ? page : page + 1)))
  return { items: rawItems.map(mapStoreProduct), page, totalPages, hasMore: page < totalPages }
}

// Kept for callers that need a complete export; the storefront itself uses page loading.
export async function fetchStorefrontProducts(options = {}) {
  const first = await fetchStorefrontProductsPage(options)
  if (!first.hasMore) return first.items
  const pages = await Promise.all(Array.from({ length: first.totalPages - 1 }, (_, index) => fetchStorefrontProductsPage({ ...options, page: index + 2 }).then((result) => result.items)))
  return first.items.concat(...pages)
}

export function createStoreOrder({ customer, address, items, customerNote = '', fcmToken, notificationConsent = false, platform }) {
  return request('/checkout', { method: 'POST', body: { customer, address, items: items.map((item) => ({ productId: item.productId, vendorId: item.vendorId, quantity: item.quantity })), customerNote, ...(notificationConsent ? { fcmToken: fcmToken || null, notificationConsent: true, platform } : {}) } })
}

export function registerCustomerNotificationToken({ token, platform, appVersion }) {
  return request('/api/v1/notifications/token', { method: 'POST', body: { token, platform, appVersion }, base: AUDIENCE_API_BASE })
}

export { STORE_API_BASE }
