import { useEffect, useRef, useState } from 'react'
import { useGallery, FRAMES } from '../store'

const MAX_ARTWORK_EDGE = 1600
const ARTWORK_QUALITY = 0.86
const ADMIN_SESSION_KEY = 'gallery-admin-auth'

const getArtworkData = (artwork) => {
  if (!artwork) return { dataURL: null, title: '' }
  if (typeof artwork === 'string') return { dataURL: artwork, title: '' }
  return { dataURL: artwork.dataURL ?? null, title: artwork.title ?? '' }
}

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
  const [isOpen, setIsOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isSavingTitle, setIsSavingTitle] = useState(false)
  const [loginName, setLoginName] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [adminAuth, setAdminAuth] = useState(() => window.sessionStorage.getItem(ADMIN_SESSION_KEY) ?? '')
  const [artworkTitle, setArtworkTitleInput] = useState('')
  const selectedFrame = useGallery((s) => s.selectedFrame)
  const setSelectedFrame = useGallery((s) => s.setSelectedFrame)
  const setArtwork = useGallery((s) => s.setArtwork)
  const saveArtworkTitle = useGallery((s) => s.setArtworkTitle)
  const clearArtwork = useGallery((s) => s.clearArtwork)
  const artworks = useGallery((s) => s.artworks)
  const syncStatus = useGallery((s) => s.syncStatus)
  const syncError = useGallery((s) => s.syncError)
  const isAdmin = Boolean(adminAuth)
  const selectedArtwork = getArtworkData(artworks[selectedFrame])

  useEffect(() => {
    setArtworkTitleInput(selectedArtwork.title)
  }, [selectedFrame, selectedArtwork.title])

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
      await setArtwork(selectedFrame, dataURL, artworkTitle, adminAuth)
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
      await clearArtwork(selectedFrame, adminAuth)
    } catch (error) {
      alert(error.message || '移除失敗，請再試一次')
    }
  }

  const handleLogin = (e) => {
    e.preventDefault()

    if (loginName !== 'admin' || loginPassword !== 'admin') {
      setLoginError('帳戶或密碼不正確')
      return
    }

    const auth = `Basic ${window.btoa('admin:admin')}`
    window.sessionStorage.setItem(ADMIN_SESSION_KEY, auth)
    setAdminAuth(auth)
    setLoginName('')
    setLoginPassword('')
    setLoginError('')
  }

  const handleLogout = () => {
    window.sessionStorage.removeItem(ADMIN_SESSION_KEY)
    setAdminAuth('')
  }

  const handleSaveTitle = async () => {
    setIsSavingTitle(true)
    try {
      await saveArtworkTitle(selectedFrame, artworkTitle, adminAuth)
    } catch (error) {
      alert(error.message || '儲存作品名失敗，請再試一次')
    } finally {
      setIsSavingTitle(false)
    }
  }

  // 避免 pointer lock 啟動時 UI 被鎖住點擊：阻止事件冒泡
  const stop = (e) => e.stopPropagation()

  return (
    <div className={`ui-panel ${isOpen ? 'is-open' : 'is-collapsed'}`} onPointerDown={stop} onClick={stop}>
      <button className="panel-toggle" type="button" onClick={() => setIsOpen((value) => !value)}>
        {isOpen ? '收起上傳' : '上傳畫作'}
      </button>

      {!isOpen && syncStatus === 'error' && (
        <p className="sync-status">同步失敗：{syncError}</p>
      )}

      {isOpen && (
        <>
          <h2>🖼️ 上傳畫作</h2>

          {!isAdmin && (
            <form className="admin-login" onSubmit={handleLogin}>
              <label htmlFor="admin-name">管理員帳戶</label>
              <input
                id="admin-name"
                type="text"
                value={loginName}
                autoComplete="username"
                onChange={(e) => setLoginName(e.target.value)}
              />

              <label htmlFor="admin-password">密碼</label>
              <input
                id="admin-password"
                type="password"
                value={loginPassword}
                autoComplete="current-password"
                onChange={(e) => setLoginPassword(e.target.value)}
              />

              {loginError && <p className="login-error">{loginError}</p>}

              <button className="upload-btn" type="submit">管理員登入</button>
            </form>
          )}

          {isAdmin && (
            <>
              <div className="admin-row">
                <span>已登入：admin</span>
                <button type="button" onClick={handleLogout}>登出</button>
              </div>

              <label htmlFor="frame-select">選擇畫框</label>
              <select
                id="frame-select"
                value={selectedFrame}
                onChange={(e) => setSelectedFrame(e.target.value)}
              >
                {FRAMES.map((f, i) => (
                  <option key={f.id} value={f.id}>
                    畫框 {i + 1} {artworks[f.id] ? '（已設定）' : ''}
                  </option>
                ))}
              </select>

              <label htmlFor="artwork-title">作品名字</label>
              <input
                id="artwork-title"
                type="text"
                value={artworkTitle}
                maxLength={80}
                placeholder="輸入作品名字"
                onChange={(e) => setArtworkTitleInput(e.target.value)}
              />
              <button
                className="upload-btn secondary"
                type="button"
                disabled={isSavingTitle || syncStatus === 'saving'}
                onClick={handleSaveTitle}
              >
                {isSavingTitle ? '儲存作品名...' : '儲存作品名'}
              </button>

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

              {artworks[selectedFrame] && (
                <button
                  className="upload-btn danger"
                  onClick={handleClear}
                >
                  移除此畫框資料
                </button>
              )}
            </>
          )}

          <p className="sync-status">
            {syncStatus === 'loading' && '正在載入網上畫作...'}
            {syncStatus === 'ready' && '已同步網上畫廊'}
            {syncStatus === 'error' && `同步失敗：${syncError}`}
          </p>
        </>
      )}
    </div>
  )
}
