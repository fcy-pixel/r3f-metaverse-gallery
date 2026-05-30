import { create } from 'zustand'

/**
 * 輸入狀態：移動向量（鍵盤 / 虛擬搖桿共用）與視角角度。
 * Character 每幀讀取，控制元件負責寫入。
 */
export const useInput = create((set, get) => ({
  // 移動：x = 左右(-1~1)，z = 前後(-1~1, +1 為前進)
  move: { x: 0, z: 0 },
  // 視角：yaw 水平、pitch 垂直
  yaw: 0,
  pitch: 0,

  setMove: (x, z) => set({ move: { x, z } }),

  // 鍵盤同時可能多鍵，這裡直接覆蓋
  setMoveAxis: (axis, value) =>
    set((s) => ({ move: { ...s.move, [axis]: value } })),

  addLook: (dx, dy) => {
    const yaw = get().yaw - dx
    let pitch = get().pitch + dy
    pitch = Math.max(-1.05, Math.min(1.05, pitch)) // 限制俯仰角
    set({ yaw, pitch })
  },
}))
