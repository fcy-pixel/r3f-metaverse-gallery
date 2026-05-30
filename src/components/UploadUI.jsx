import { useRef } from 'react'
import { useGallery, FRAMES } from '../store'

/**
 * 上傳 UI：選擇目標畫框 → 上傳本地 PNG/JPG → 轉成 dataURL 存進 store，
 * Frame 元件會自動把它載入成 Texture 並替換材質。
 */
export default function UploadUI() {
  const fileRef = useRef()
  const selectedFrame = useGallery((s) => s.selectedFrame)
  const setSelectedFrame = useGallery((s) => s.setSelectedFrame)
  const setArtwork = useGallery((s) => s.setArtwork)
  const clearArtwork = useGallery((s) => s.clearArtwork)
  const artworks = useGallery((s) => s.artworks)

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 僅接受 PNG / JPG
    if (!/image\/(png|jpe?g)/.test(file.type)) {
      alert('請上傳 PNG 或 JPG 圖片')
      return
    }

    const reader = new FileReader()
    reader.onload = () => setArtwork(selectedFrame, reader.result)
    reader.readAsDataURL(file)

    // 清掉 input 值，讓同一張圖也能再次觸發 onChange
    e.target.value = ''
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
      <button className="upload-btn" onClick={() => fileRef.current?.click()}>
        選擇圖片上傳
      </button>

      {artworks[selectedFrame] && (
        <button
          className="upload-btn"
          style={{ background: '#555' }}
          onClick={() => clearArtwork(selectedFrame)}
        >
          移除此畫框圖片
        </button>
      )}
    </div>
  )
}
