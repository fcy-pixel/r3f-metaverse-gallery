import { useEffect, useRef, useState } from 'react'

const MUSIC_SRC = '/background-music.mp3'
const MUSIC_PREF_KEY = 'gallery-background-music'

export default function BackgroundMusic() {
  const audioRef = useRef(null)
  const [enabled, setEnabled] = useState(() => window.localStorage.getItem(MUSIC_PREF_KEY) !== 'off')
  const [started, setStarted] = useState(false)

  useEffect(() => {
    window.localStorage.setItem(MUSIC_PREF_KEY, enabled ? 'on' : 'off')
  }, [enabled])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.volume = 0.32

    if (!enabled) {
      audio.pause()
      return
    }

    // 一進入就嘗試自動播放；若被瀏覽器阻擋，下方 effect 會在首次互動時補播。
    audio.play().then(() => setStarted(true)).catch(() => setStarted(false))
  }, [enabled])

  useEffect(() => {
    if (!enabled || started) return

    const unlockAudio = async () => {
      const audio = audioRef.current
      if (!audio) return

      try {
        await audio.play()
        setStarted(true)
      } catch {
        setStarted(false)
      }
    }

    window.addEventListener('pointerdown', unlockAudio, { once: true })
    window.addEventListener('keydown', unlockAudio, { once: true })

    return () => {
      window.removeEventListener('pointerdown', unlockAudio)
      window.removeEventListener('keydown', unlockAudio)
    }
  }, [enabled, started])

  const toggleMusic = async (event) => {
    event.stopPropagation()

    const nextEnabled = !enabled
    setEnabled(nextEnabled)

    if (nextEnabled) {
      try {
        await audioRef.current?.play()
        setStarted(true)
      } catch {
        setStarted(false)
      }
    } else {
      audioRef.current?.pause()
    }
  }

  return (
    <div className="music-control" onPointerDown={(event) => event.stopPropagation()} onClick={(event) => event.stopPropagation()}>
      <audio ref={audioRef} src={MUSIC_SRC} loop autoPlay preload="auto" />
      <button type="button" className="music-button" aria-pressed={enabled} onClick={toggleMusic}>
        {enabled ? '音樂：開' : '音樂：關'}
      </button>
    </div>
  )
}
