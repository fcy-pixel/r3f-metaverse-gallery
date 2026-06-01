import { useState } from 'react'

/**
 * 開場畫面：點擊後進入畫廊。
 * 這一下點擊同時是「使用者互動」，會解鎖並開始播放背景音樂
 * （BackgroundMusic 監聽 window 的首次 pointerdown 自動補播）。
 * 不在這裡 stopPropagation，讓事件冒泡到 window 觸發音樂解鎖。
 */
export default function EnterOverlay() {
  const [entered, setEntered] = useState(false)

  if (entered) return null

  return (
    <div className="enter-overlay" onClick={() => setEntered(true)} role="button" tabIndex={0}>
      <div className="enter-card">
        <img src="/school-logo.png" alt="中華基督教會基慈小學校徽" className="enter-logo" />
        <h1>中華基督教會基慈小學</h1>
        <p className="enter-sub">小學科學科 · 學生佳作展</p>
        <span className="enter-btn">🔬 點擊進入虛擬實驗室</span>
        <span className="enter-tip">進入後將播放背景音樂</span>
      </div>
    </div>
  )
}
