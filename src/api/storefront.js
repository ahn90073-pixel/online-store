const DEFAULT_STORE_API_BASE = 'https://tagerbackend.ahn90073.workers.dev/api/storefront'
const STORE_API_BASE = (import.meta.env.VITE_STORE_API_BASE_URL || DEFAULT_STORE_API_BASE).replace(/\/+$/, '')

async function request(path, { method = 'GET', body } = {}) {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 25000)
  try {
    const response = await fetch(`${STORE_API_BASE}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
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
    if (error?.name === 'AbortError') throw new Error('انتهت مهلة الاتصال بالمتجر. حاول مرة أخرى.')
    if (error instanceof Error && error.message && error.name !== 'TypeError') throw error
    throw new Error('تعذر الاتصال بالمتجر. تحقق من الإنترنت وإعدادات الاتصال.')
  } finally {
    window.clearTimeout(timeout)
  }
}

export function mapStoreProduct(product) {
  const price = Number(product?.price || 0)
  const compareAtPrice = product?.compareAtPrice === null || product?.compareAtPrice === undefined
    ? null
    : Number(product.compareAtPrice)
  const weightGrams = Number(product?.weightGrams || 0)
  return {
    id: product?.id,
    productId: product?.id,
    vendorId: product?.vendorId,
    vendorName: product?.vendorName || '',
    name: product?.name || '',
    description: product?.description || '',
    category: product?.category || 'عام',
    image: product?.imageUrl || '',
    price,
    oldPrice: compareAtPrice > price ? compareAtPrice : null,
    currency: product?.currency || 'EGP',
    stockQuantity: Number(product?.stockQuantity || 0),
    seller: product?.sellerName || product?.vendorName || 'تاجر معتمد',
    trustedSeller: Boolean(product?.trustedSeller),
    badge: product?.badge || '',
    freeShipping: Boolean(product?.freeShipping),
    flashDeal: Boolean(product?.isFlashDeal),
    rating: 0,
    reviews: 0,
    weight: weightGrams ? `${new Intl.NumberFormat('ar-EG').format(weightGrams)} جم` : '',
  }
}

export async function fetchStorefrontProducts({ search = '', category = '', limit = 100 } = {}) {
  const params = new URLSearchParams({ page: '1', limit: String(limit) })
  if (search) params.set('q', search)
  if (category && category !== 'all') params.set('category', category)
  const first = await request(`/products?${params.toString()}`)
  const firstItems = first?.items || []
  const totalPages = Math.min(20, Math.max(1, Number(first?.pagination?.totalPages) || 1))
  if (totalPages === 1) return firstItems.map(mapStoreProduct)

  const pages = await Promise.all(Array.from({ length: totalPages - 1 }, async (_, index) => {
    const pageParams = new URLSearchParams(params)
    pageParams.set('page', String(index + 2))
    const result = await request(`/products?${pageParams.toString()}`)
    return result?.items || []
  }))
  return firstItems.concat(...pages).map(mapStoreProduct)
}

export function createStoreOrder({ customer, address, items, customerNote = '' }) {
  return request('/checkout', {
    method: 'POST',
    body: {
      customer,
      address,
      items: items.map((item) => ({
        productId: item.productId,
        vendorId: item.vendorId,
        quantity: item.quantity,
      })),
      customerNote,
    },
  })
}

export { STORE_API_BASE }
