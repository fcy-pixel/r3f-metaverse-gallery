import { artworkKey, FRAME_IDS, isAdminRequest, isValidArtworkDataURL, json, normalizeArtwork } from '../../_shared/artworks'

const MAX_DATA_URL_LENGTH = 8_000_000

export async function onRequestPut({ env, params, request }) {
  const frameId = params.frameId

  if (!isAdminRequest(request)) {
    return json({ error: 'Admin login required.' }, 401)
  }

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

  const dataURL = body?.dataURL ?? null
  const title = typeof body?.title === 'string' ? body.title.trim().slice(0, 80) : ''

  if (dataURL !== null && !isValidArtworkDataURL(dataURL)) {
    return json({ error: 'Artwork must be a PNG, JPG, or WebP data URL.' }, 400)
  }

  if (dataURL && dataURL.length > MAX_DATA_URL_LENGTH) {
    return json({ error: 'Artwork is too large.' }, 413)
  }

  const current = normalizeArtwork(await env.GALLERY_ARTWORKS.get(artworkKey(frameId)))
  const next = {
    dataURL: dataURL ?? current?.dataURL ?? null,
    title,
  }

  if (!next.dataURL && !next.title) {
    await env.GALLERY_ARTWORKS.delete(artworkKey(frameId))
    return json({ ok: true })
  }

  await env.GALLERY_ARTWORKS.put(artworkKey(frameId), JSON.stringify(next))
  return json({ ok: true })
}

export async function onRequestDelete({ env, params, request }) {
  const frameId = params.frameId

  if (!isAdminRequest(request)) {
    return json({ error: 'Admin login required.' }, 401)
  }

  if (!env.GALLERY_ARTWORKS) {
    return json({ error: 'Gallery storage is not configured.' }, 500)
  }

  if (!FRAME_IDS.has(frameId)) {
    return json({ error: 'Unknown frame.' }, 404)
  }

  await env.GALLERY_ARTWORKS.delete(artworkKey(frameId))
  return json({ ok: true })
}
