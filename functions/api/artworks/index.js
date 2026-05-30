import { artworkKey, FRAME_IDS, json } from '../../_shared/artworks'

export async function onRequestGet({ env }) {
  if (!env.GALLERY_ARTWORKS) {
    return json({ error: 'Gallery storage is not configured.' }, 500)
  }

  const artworks = {}
  const pairs = await Promise.all(
    [...FRAME_IDS].map(async (frameId) => [frameId, await env.GALLERY_ARTWORKS.get(artworkKey(frameId))]),
  )

  for (const [frameId, dataURL] of pairs) {
    if (dataURL) artworks[frameId] = dataURL
  }

  return json({ artworks })
}
