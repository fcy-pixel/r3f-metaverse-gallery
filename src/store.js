import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export const ROOM = {
  width: 64,
  depth: 58,
  height: 8,
  wallT: 0.8,
}

export const PLAYER_RADIUS = 0.7

export const BOUNDS = {
  minX: -ROOM.width / 2 + ROOM.wallT + PLAYER_RADIUS,
  maxX: ROOM.width / 2 - ROOM.wallT - PLAYER_RADIUS,
  minZ: -ROOM.depth / 2 + ROOM.wallT + PLAYER_RADIUS,
  maxZ: ROOM.depth / 2 - ROOM.wallT - PLAYER_RADIUS,
}

// 科學實驗室分區。color 為地面色帶／指示燈，accent 為標示牌顏色。
export const ZONES = [
  { id: 'spawn', name: '科學探究入口', icon: '🔬', x: 0, z: 16, color: '#cdd8e6', accent: '#5bc0de' },
  { id: 'forest', name: '生命科學區', icon: '🌱', x: -16, z: -7, color: '#bfe3c4', accent: '#54c275' },
  { id: 'ocean', name: '化學實驗區', icon: '⚗️', x: 16, z: -7, color: '#bfe0ee', accent: '#39a7d4' },
  { id: 'nether', name: '物理與能量區', icon: '⚡', x: 0, z: -20, color: '#f6dcc0', accent: '#f0883e' },
]

// 室內隔斷（玻璃+金屬框）。每段為軸對齊長方體，w/d 為佔地尺寸；中間留有走道缺口。
export const PARTITION_H = 2.9
export const PARTITIONS = [
  // 橫向隔斷（z = 2），分隔「入口」與「展區」，中央留 8m 走道
  { x: -17.5, z: 2, w: 27, d: 0.5 },
  { x: 17.5, z: 2, w: 27, d: 0.5 },
  // 縱向隔斷（x = 0），分隔「生命科學」與「化學實驗」，中段留走道
  { x: 0, z: -3.5, w: 0.5, d: 11 },
  { x: 0, z: -20.5, w: 0.5, d: 15 },
]

export function groundHeightAt() {
  return 0
}

// 解析玩家與隔斷的碰撞：把玩家推離最近的牆面（沿穿透較淺的軸）。
export function resolvePartitions(x, z) {
  let nx = x
  let nz = z
  const r = PLAYER_RADIUS
  for (const p of PARTITIONS) {
    const minX = p.x - p.w / 2 - r
    const maxX = p.x + p.w / 2 + r
    const minZ = p.z - p.d / 2 - r
    const maxZ = p.z + p.d / 2 + r
    if (nx > minX && nx < maxX && nz > minZ && nz < maxZ) {
      const penLeft = nx - minX
      const penRight = maxX - nx
      const penDown = nz - minZ
      const penUp = maxZ - nz
      const minPen = Math.min(penLeft, penRight, penDown, penUp)
      if (minPen === penLeft) nx = minX
      else if (minPen === penRight) nx = maxX
      else if (minPen === penDown) nz = minZ
      else nz = maxZ
    }
  }
  return [nx, nz]
}

const W = ROOM.width / 2 - ROOM.wallT - 0.08
const D = ROOM.depth / 2 - ROOM.wallT - 0.08

const PALETTE = [
  '#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6',
  '#1abc9c', '#e67e22', '#95a5a6', '#ff6b9a', '#4f7cff',
  '#27ae60', '#c0392b', '#f39c12', '#16a085', '#8e44ad',
  '#d35400', '#00bcd4', '#ffca28', '#7cb342', '#ec407a',
]

let colorIndex = 0
const nextColor = () => PALETTE[colorIndex++ % PALETTE.length]

export const FRAMES = [
  { id: 'n1', floor: 1, zone: 'nether', position: [-18, 2.8, -D], rotation: [0, 0, 0], color: nextColor() },
  { id: 'n2', floor: 1, zone: 'forest', position: [-10, 2.8, -D], rotation: [0, 0, 0], color: nextColor() },
  { id: 'n3', floor: 1, zone: 'nether', position: [-2, 2.8, -D], rotation: [0, 0, 0], color: nextColor() },
  { id: 'n4', floor: 1, zone: 'ocean', position: [6, 2.8, -D], rotation: [0, 0, 0], color: nextColor() },
  { id: 'n5', floor: 1, zone: 'ocean', position: [14, 2.8, -D], rotation: [0, 0, 0], color: nextColor() },
  { id: 'n6', floor: 1, zone: 'ocean', position: [22, 2.8, -D], rotation: [0, 0, 0], color: nextColor() },

  { id: 'w1', floor: 1, zone: 'forest', position: [-W, 2.8, -17], rotation: [0, Math.PI / 2, 0], color: nextColor() },
  { id: 'w2', floor: 1, zone: 'forest', position: [-W, 2.8, -9], rotation: [0, Math.PI / 2, 0], color: nextColor() },
  { id: 'w3', floor: 1, zone: 'forest', position: [-W, 2.8, -1], rotation: [0, Math.PI / 2, 0], color: nextColor() },
  { id: 'w4', floor: 1, zone: 'spawn', position: [-W, 2.8, 9], rotation: [0, Math.PI / 2, 0], color: nextColor() },
  { id: 'w5', floor: 1, zone: 'spawn', position: [-W, 2.8, 17], rotation: [0, Math.PI / 2, 0], color: nextColor() },

  { id: 'e1', floor: 1, zone: 'ocean', position: [W, 2.8, -17], rotation: [0, -Math.PI / 2, 0], color: nextColor() },
  { id: 'e2', floor: 1, zone: 'ocean', position: [W, 2.8, -9], rotation: [0, -Math.PI / 2, 0], color: nextColor() },
  { id: 'e3', floor: 1, zone: 'ocean', position: [W, 2.8, -1], rotation: [0, -Math.PI / 2, 0], color: nextColor() },
  { id: 'e4', floor: 1, zone: 'spawn', position: [W, 2.8, 9], rotation: [0, -Math.PI / 2, 0], color: nextColor() },
  { id: 'e5', floor: 1, zone: 'spawn', position: [W, 2.8, 17], rotation: [0, -Math.PI / 2, 0], color: nextColor() },

  { id: 's1', floor: 1, zone: 'spawn', position: [-18, 2.8, D], rotation: [0, Math.PI, 0], color: nextColor() },
  { id: 's2', floor: 1, zone: 'spawn', position: [-9, 2.8, D], rotation: [0, Math.PI, 0], color: nextColor() },
  { id: 's3', floor: 1, zone: 'spawn', position: [0, 2.8, D], rotation: [0, Math.PI, 0], color: nextColor() },
  { id: 's4', floor: 1, zone: 'spawn', position: [9, 2.8, D], rotation: [0, Math.PI, 0], color: nextColor() },
  { id: 's5', floor: 1, zone: 'spawn', position: [18, 2.8, D], rotation: [0, Math.PI, 0], color: nextColor() },
]

const DB_NAME = 'r3f-metaverse-gallery-db'
const STORE_NAME = 'gallery-state'

const openStorageDB = () =>
  new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is unavailable'))
      return
    }

    const request = window.indexedDB.open(DB_NAME, 1)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })

const withGalleryStore = async (mode, action) => {
  const db = await openStorageDB()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode)
    const request = action(tx.objectStore(STORE_NAME))

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
    tx.oncomplete = () => db.close()
    tx.onerror = () => {
      db.close()
      reject(tx.error)
    }
    tx.onabort = () => {
      db.close()
      reject(tx.error)
    }
  })
}

const fallbackStorage = {
  getItem: (name) => window.localStorage.getItem(name),
  setItem: (name, value) => window.localStorage.setItem(name, value),
  removeItem: (name) => window.localStorage.removeItem(name),
}

const galleryStorage = {
  getItem: async (name) => {
    if (typeof window === 'undefined') return null

    try {
      const value = await withGalleryStore('readonly', (store) => store.get(name))
      return value ?? fallbackStorage.getItem(name)
    } catch {
      return fallbackStorage.getItem(name)
    }
  },
  setItem: async (name, value) => {
    if (typeof window === 'undefined') return

    try {
      await withGalleryStore('readwrite', (store) => store.put(value, name))
    } catch {
      fallbackStorage.setItem(name, value)
    }
  },
  removeItem: async (name) => {
    if (typeof window === 'undefined') return

    try {
      await withGalleryStore('readwrite', (store) => store.delete(name))
    } catch {
      fallbackStorage.removeItem(name)
    }
  },
}

const ARTWORKS_API = '/api/artworks'

const normalizeArtwork = (value) => {
  if (!value) return null
  if (typeof value === 'string') return { dataURL: value, title: '' }
  return {
    dataURL: value.dataURL ?? null,
    title: typeof value.title === 'string' ? value.title : '',
  }
}

async function requestJSON(url, options) {
  const response = await fetch(url, options)

  if (!response.ok) {
    let message = '雲端畫廊暫時未能更新'
    try {
      const data = await response.json()
      if (data?.error) message = data.error
    } catch {
      message = response.statusText || message
    }
    throw new Error(message)
  }

  return response.json()
}

export const useGallery = create(
  persist(
    (set, get) => ({
      artworks: {},
      selectedFrame: FRAMES[0].id,
      zoomFrame: null,
      syncStatus: 'idle',
      syncError: null,

      setSelectedFrame: (id) => set({ selectedFrame: id }),
      syncArtworks: async () => {
        set({ syncStatus: 'loading', syncError: null })
        try {
          const data = await requestJSON(`${ARTWORKS_API}?v=${Date.now()}`, { cache: 'no-store' })
          const artworks = Object.fromEntries(
            Object.entries(data.artworks ?? {})
              .map(([frameId, artwork]) => [frameId, normalizeArtwork(artwork)])
              .filter(([, artwork]) => artwork),
          )
          set({ artworks, syncStatus: 'ready', syncError: null })
        } catch (error) {
          set({ syncStatus: 'error', syncError: error.message })
        }
      },
      setArtwork: async (frameId, dataURL, title = '', adminAuth) => {
        const previousArtworks = get().artworks
        const nextArtwork = { dataURL, title: title.trim().slice(0, 80) }
        set((state) => ({
          artworks: { ...state.artworks, [frameId]: nextArtwork },
          syncStatus: 'saving',
          syncError: null,
        }))

        try {
          await requestJSON(`${ARTWORKS_API}/${encodeURIComponent(frameId)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: adminAuth },
            body: JSON.stringify(nextArtwork),
          })
          set({ syncStatus: 'ready', syncError: null })
        } catch (error) {
          set({ artworks: previousArtworks, syncStatus: 'error', syncError: error.message })
          throw error
        }
      },
      setArtworkTitle: async (frameId, title, adminAuth) => {
        const previousArtworks = get().artworks
        const currentArtwork = normalizeArtwork(previousArtworks[frameId]) ?? { dataURL: null, title: '' }
        const nextArtwork = { ...currentArtwork, title: title.trim().slice(0, 80) }
        set((state) => ({
          artworks: { ...state.artworks, [frameId]: nextArtwork },
          syncStatus: 'saving',
          syncError: null,
        }))

        try {
          await requestJSON(`${ARTWORKS_API}/${encodeURIComponent(frameId)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: adminAuth },
            body: JSON.stringify(nextArtwork),
          })
          set({ syncStatus: 'ready', syncError: null })
        } catch (error) {
          set({ artworks: previousArtworks, syncStatus: 'error', syncError: error.message })
          throw error
        }
      },
      clearArtwork: async (frameId, adminAuth) => {
        const previousArtworks = get().artworks
        set((state) => {
          const next = { ...state.artworks }
          delete next[frameId]
          return { artworks: next, syncStatus: 'saving', syncError: null }
        })

        try {
          await requestJSON(`${ARTWORKS_API}/${encodeURIComponent(frameId)}`, {
            method: 'DELETE',
            headers: { Authorization: adminAuth },
          })
          set({ syncStatus: 'ready', syncError: null })
        } catch (error) {
          set({ artworks: previousArtworks, syncStatus: 'error', syncError: error.message })
          throw error
        }
      },

      openZoom: (frameId) => set({ zoomFrame: frameId }),
      closeZoom: () => set({ zoomFrame: null }),
    }),
    {
      name: 'r3f-metaverse-gallery',
      storage: createJSONStorage(() => galleryStorage),
      partialize: (state) => ({
        artworks: state.artworks,
        selectedFrame: state.selectedFrame,
      }),
    },
  ),
)
