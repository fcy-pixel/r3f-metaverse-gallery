export const FRAME_IDS = new Set([
  'n1', 'n2', 'n3', 'n4', 'n5', 'n6',
  'w1', 'w2', 'w3', 'w4', 'w5',
  'e1', 'e2', 'e3', 'e4', 'e5',
  's1', 's2', 's3', 's4', 's5',
])

export const artworkKey = (frameId) => `artwork:${frameId}`

export function isAdminRequest(request) {
  const authorization = request.headers.get('Authorization') ?? ''
  return authorization === `Basic ${btoa('admin:admin')}`
}

export function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}

export function isValidArtworkDataURL(value) {
  return typeof value === 'string' && /^data:image\/(png|jpe?g|webp);base64,/i.test(value)
}

export function normalizeArtwork(value) {
  if (!value) return null

  if (isValidArtworkDataURL(value)) {
    return { dataURL: value, title: '' }
  }

  try {
    const data = JSON.parse(value)
    return {
      dataURL: isValidArtworkDataURL(data?.dataURL) ? data.dataURL : null,
      title: typeof data?.title === 'string' ? data.title.slice(0, 80) : '',
    }
  } catch {
    return null
  }
}
