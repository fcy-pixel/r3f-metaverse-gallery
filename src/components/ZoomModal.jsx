import { useGallery, FRAMES } from '../store'

/**
 * 放大觀看 Modal：點擊畫作後，以 HTML 覆蓋層顯示放大的畫作
 * （已上傳則顯示圖片，否則顯示該畫框顏色），跨桌機 / 手機皆適用。
 */
export default function ZoomModal() {
  const zoomFrame = useGallery((s) => s.zoomFrame)
  const artworks = useGallery((s) => s.artworks)
  const closeZoom = useGallery((s) => s.closeZoom)

  if (!zoomFrame) return null

  const frame = FRAMES.find((f) => f.id === zoomFrame)
  const img = artworks[zoomFrame]
  const index = FRAMES.findIndex((f) => f.id === zoomFrame) + 1

  return (
    <div className="zoom-overlay" onClick={closeZoom}>
      <div className="zoom-content" onClick={(e) => e.stopPropagation()}>
        {img ? (
          <img className="zoom-img" src={img} alt={`畫作 ${index}`} />
        ) : (
          <div
            className="zoom-placeholder"
            style={{ background: frame?.color || '#888' }}
          >
            尚未上傳圖片
          </div>
        )}
        <div className="zoom-caption">
          畫框 {index} · {frame?.floor === 2 ? '二樓' : '一樓'}
        </div>
        <button className="zoom-close" onClick={closeZoom}>
          ✕ 關閉
        </button>
      </div>
    </div>
  )
}
