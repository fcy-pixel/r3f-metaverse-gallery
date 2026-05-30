import { useRef, useState } from 'react'
import { useGallery, FRAMES } from '../store'

const MAX_ARTWORK_EDGE = 1600
const ARTWORK_QUALITY = 0.86

function fileToArtworkDataURL(file) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    const objectURL = URL.createObjectURL(file)

    image.onload = () => {
      const scale = Math.min(1, MAX_ARTWORK_EDGE / Math.max(image.width, image.height))
      const width = Math.max(1, Math.round(image.width * scale))
      const height = Math.max(1, Math.round(image.height * scale))
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')

      canvas.width = width
      canvas.height = height
      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, width, height)
      context.drawImage(image, 0, 0, width, height)
      URL.revokeObjectURL(objectURL)
      resolve(canvas.toDataURL('image/jpeg', ARTWORK_QUALITY))
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectURL)
      reject(new Error('圖片讀取失敗'))
    }

    image.src = objectURL
  })
}

/**
 * 上傳 UI：選擇目標畫框 → 上傳本地 PNG/JPG → 轉成 dataURL 存進 store，
 * Frame 元件會自動把它載入成 Texture 並替換材質。
 */
export default function UploadUI() {
  const fileRef = useRef()
  const [isUploading, setIsUploading] = useState(false)
  const selectedFrame = useGallery((s) => s.selectedFrame)
  const setSelectedFrame = useGallery((s) => s.setSelectedFrame)
  const setArtwork = useGallery((s) => s.setArtwork)
  const clearArtwork = useGallery((s) => s.clearArtwork)
  const artworks = useGallery((s) => s.artworks)
  const syncStatus = useGallery((s) => s.syncStatus)
  const syncError = useGallery((s) => s.syncError)

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 僅接受 PNG / JPG
    if (!/image\/(png|jpe?g)/.test(file.type)) {
      alert('請上傳 PNG 或 JPG 圖片')
      return
    }

    setIsUploading(true)
    try {
      const dataURL = await fileToArtworkDataURL(file)
      await setArtwork(selectedFrame, dataURL)
    } catch (error) {
      alert(error.message || '上傳失敗，請再試一次')
    } finally {
      setIsUploading(false)
      // 清掉 input 值，讓同一張圖也能再次觸發 onChange
      e.target.value = ''
    }
  }

  const handleClear = async () => {
    try {
      await clearArtwork(selectedFrame)
    } catch (error) {
      alert(error.message || '移除失敗，請再試一次')
    }
  }

  // 避免 pointer lock 啟動時 UI 被鎖住點擊：阻止事件冒泡
  const stop = (e) => e.stopPropagation()

  return (
    <div className="ui-panel" onPointerDown={stop} onClick={stop}>
      <h2>🖼️ 上傳畫作</h2>

      <label htmlFor="frame-select">選擇畫框</label>
      <select
        id="frame-select"
        value={selectedFrame}
        onChange={(e) => setSelectedFrame(e.target.value)}
      >
        {FRAMES.map((f, i) => (
          <option key={f.id} value={f.id}>
            畫框 {i + 1} {artworks[f.id] ? '（已上傳）' : ''}
          </option>
        ))}
      </select>

      <input
        ref={fileRef}
        type="file"
        accept="image/png, image/jpeg"
        onChange={handleFile}
      />
      <button
        className="upload-btn"
        disabled={isUploading || syncStatus === 'saving'}
        onClick={() => fileRef.current?.click()}
      >
        {isUploading || syncStatus === 'saving' ? '儲存到雲端...' : '選擇圖片上傳'}
      </button>

      <p className="sync-status">
        {syncStatus === 'loading' && '正在載入網上畫作...'}
        {syncStatus === 'ready' && '已同步網上畫廊'}
        {syncStatus === 'error' && `同步失敗：${syncError}`}
      </p>

      {artworks[selectedFrame] && (
        <button
          className="upload-btn"
          style={{ background: '#555' }}
          onClick={handleClear}
        >
          移除此畫框圖片
        </button>
      )}
    </div>
  )
}
