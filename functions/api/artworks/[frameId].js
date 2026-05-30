import { artworkKey, FRAME_IDS, isValidArtworkDataURL, json } from '../../_shared/artworks'

const MAX_DATA_URL_LENGTH = 8_000_000

export async function onRequestPut({ env, params, request }) {
  const frameId = params.frameId

  if (!env.GALLERY_ARTWORKS) {
    return json({ error: 'Gallery storage is not configured.' }, 500)
  }

  if (!FRAME_IDS.has(frameId)) {
    return json({ error: 'Unknown frame.' }, 404)
  }

  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400)
  }

  const dataURL = body?.dataURL
  if (!isValidArtworkDataURL(dataURL)) {
    return json({ error: 'Artwork must be a PNG, JPG, or WebP data URL.' }, 400)
  }

  if (dataURL.length > MAX_DATA_URL_LENGTH) {
    return json({ error: 'Artwork is too large.' }, 413)
  }

  await env.GALLERY_ARTWORKS.put(artworkKey(frameId), dataURL)
  return json({ ok: true })
}

export async function onRequestDelete({ env, params }) {
  const frameId = params.frameId

  if (!env.GALLERY_ARTWORKS) {
    return json({ error: 'Gallery storage is not configured.' }, 500)
  }

  if (!FRAME_IDS.has(frameId)) {
    return json({ error: 'Unknown frame.' }, 404)
  }

  await env.GALLERY_ARTWORKS.delete(artworkKey(frameId))
  return json({ ok: true })
}
