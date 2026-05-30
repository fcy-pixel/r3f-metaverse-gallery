import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export const ROOM = {
  width: 56,
  depth: 48,
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

export const ZONES = [
  { id: 'spawn', name: '入口廣場', x: 0, z: 13, w: 18, d: 16, color: '#c8b58a', accent: '#f6d365' },
  { id: 'forest', name: '森林畫廊', x: -16, z: -7, w: 18, d: 22, color: '#4f8b4f', accent: '#7bd389' },
  { id: 'ocean', name: '海晶畫廊', x: 16, z: -7, w: 18, d: 22, color: '#3b86a8', accent: '#6bd5d2' },
  { id: 'nether', name: '熔岩特展', x: 0, z: -17, w: 20, d: 10, color: '#7c3f35', accent: '#ff8a3d' },
]

export function groundHeightAt() {
  return 0
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
