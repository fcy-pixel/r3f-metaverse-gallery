import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const START_STATS = {
  ideal: 8,
  solitude: 8,
  compassion: 8,
  writing: 8,
}

export const DAO_TRIALS = [
  {
    id: 'yongzhen',
    title: '永貞風雨',
    subtitle: '改革理想與政治代價',
    position: [-9, 0.15, 7],
    color: '#b8563d',
    insight: '柳宗元年少入仕，曾參與王叔文推動的永貞革新。他不是只會寫山水詩的人，也曾真切相信制度可以改變民生。',
    prompt: '改革失敗，好友被貶，朝中風聲急轉。你是柳宗元，仍要決定如何保存自己的信念。',
    choices: [
      {
        id: 'hold-line',
        label: '守住改革初心',
        text: '承認失敗，但不把理想說成錯誤。',
        effects: { ideal: 18, solitude: 8 },
        reflection: '你明白柳宗元的痛苦不只是被貶，而是看見理想被現實折斷。他的孤獨，首先來自不肯把信念賣掉。',
      },
      {
        id: 'protect-friends',
        label: '保護同道朋友',
        text: '少說自己功勞，多替同伴留下活路。',
        effects: { compassion: 12, ideal: 8, solitude: 6 },
        reflection: '你觸碰到柳宗元重情的一面。政治失敗後，他仍珍惜共同走過的人，這份情義後來沉入他的文章與書信。',
      },
      {
        id: 'record-lessons',
        label: '把失敗寫成警醒',
        text: '整理改革得失，等待後人重新理解。',
        effects: { writing: 14, ideal: 10 },
        reflection: '你看見柳宗元作為文章家的力量：不能改變朝局時，他把思考留給後世，讓文字成為另一種改革。',
      },
    ],
  },
  {
    id: 'yongzhou',
    title: '永州孤影',
    subtitle: '貶謫、孤獨與山水',
    position: [9, 0.15, 7],
    color: '#3f7f84',
    insight: '柳宗元被貶永州多年，遠離長安權力中心。永州山水給他的不是簡單安慰，而是一面照見內心的鏡子。',
    prompt: '你初到永州，前路被封，舊友四散。眼前只有陌生山水與漫長歲月。',
    choices: [
      {
        id: 'face-silence',
        label: '直面孤寂',
        text: '不急着逃避失落，先承認心裡的寒冷。',
        effects: { solitude: 18, writing: 6 },
        reflection: '柳宗元的山水不是旅遊風景，而是失意者的內心地形。能面對孤寂，才寫得出《江雪》的清冷。',
      },
      {
        id: 'walk-rivers',
        label: '走入山水',
        text: '觀察溪石、竹影、寒江，把痛苦化成文字。',
        effects: { writing: 16, solitude: 8 },
        reflection: '你理解到柳宗元的山水遊記其實是自我修復：外在被困，心靈仍可在觀察與書寫中保持清醒。',
      },
      {
        id: 'meet-people',
        label: '聆聽地方百姓',
        text: '不只看山水，也聽永州人的辛苦生活。',
        effects: { compassion: 16, ideal: 6 },
        reflection: '貶謫沒有令柳宗元只關心自己。他仍看見百姓疾苦，這份民生關懷成為他文章中最有重量的部分。',
      },
    ],
  },
  {
    id: 'snake-catcher',
    title: '捕蛇者說',
    subtitle: '民生苦難與制度批判',
    position: [-11, 0.15, -9],
    color: '#5d8b45',
    insight: '《捕蛇者說》表面寫捕蛇人，實際指出苛政比毒蛇更可怕。柳宗元的同情心，常常帶着尖銳的制度批判。',
    prompt: '捕蛇人告訴你：寧願冒死捕蛇，也不願承受沉重賦稅。你聽完後心中震動。',
    choices: [
      {
        id: 'ask-why',
        label: '追問苦難根源',
        text: '不只憐憫個人遭遇，更追問制度為何如此。',
        effects: { ideal: 14, compassion: 12 },
        reflection: '你抓住柳宗元文章的核心：真正的同情不是流淚就完，而是追問造成苦難的制度。',
      },
      {
        id: 'write-plainly',
        label: '用故事說真相',
        text: '把抽象的苛政，寫成學生也能看懂的故事。',
        effects: { writing: 16, compassion: 8 },
        reflection: '柳宗元懂得用故事承載思想。《捕蛇者說》的力量，正在於讀者會先記住人，再明白道理。',
      },
      {
        id: 'stand-with-people',
        label: '站到百姓一邊',
        text: '即使自己失勢，也不放棄替弱者說話。',
        effects: { compassion: 18, solitude: 6 },
        reflection: '你看見柳宗元被貶後仍未冷漠。他的孤獨不是遠離人群，而是在困境中仍把心放向百姓。',
      },
    ],
  },
  {
    id: 'jiangxue',
    title: '江雪問心',
    subtitle: '寒江、孤舟與精神潔癖',
    position: [11, 0.15, -9],
    color: '#5d6fb0',
    insight: '《江雪》只有二十字，卻把天地空寂與人的孤高寫到極致。孤舟蓑笠翁，也像柳宗元在逆境中守住自我。',
    prompt: '千山鳥飛絕，萬徑人蹤滅。天地寂靜，你獨坐寒江。你要把什麼留在心中？',
    choices: [
      {
        id: 'keep-purity',
        label: '守住清白',
        text: '即使無人理解，也不讓自己隨波逐流。',
        effects: { solitude: 16, ideal: 10 },
        reflection: '你讀到《江雪》的精神潔癖：孤獨不是姿態，而是在世界沉默時仍保存人格的溫度。',
      },
      {
        id: 'turn-to-poem',
        label: '把寒冷寫成詩',
        text: '讓冷寂成為意境，而不是單純的絕望。',
        effects: { writing: 18, solitude: 6 },
        reflection: '你明白柳宗元最深的本領：他沒有否認痛苦，卻能把痛苦鍛造成清澈有力的文學。',
      },
      {
        id: 'return-to-world',
        label: '仍願回望人間',
        text: '在孤舟之上，仍記得改革、朋友與百姓。',
        effects: { compassion: 10, ideal: 10, writing: 6 },
        reflection: '你看見柳宗元不是逃避世界的隱士。他在寒江中沉思，心裡仍有天下、文章與人的苦樂。',
      },
    ],
  },
]

export const REALMS = [
  { name: '初入永州', min: 0, note: '仍在失意中摸索方向' },
  { name: '山水照心', min: 55, note: '開始以山水整理內心' },
  { name: '民生入文', min: 85, note: '能把個人苦痛連到百姓疾苦' },
  { name: '孤舟問道', min: 115, note: '在孤獨中守住人格與理想' },
  { name: '子厚成章', min: 145, note: '把挫折鍛造成思想與文學' },
]

export const STAT_LABELS = {
  ideal: '理想',
  solitude: '孤寂',
  compassion: '民心',
  writing: '文心',
}

const clampStat = (value) => Math.max(0, Math.min(99, value))

export function getTotal(stats) {
  return Object.values(stats).reduce((sum, value) => sum + value, 0)
}

export function getRealm(stats) {
  const total = getTotal(stats)
  return REALMS.reduce((best, realm) => (total >= realm.min ? realm : best), REALMS[0])
}

export function getEnding(stats) {
  const entries = Object.entries(stats).sort((a, b) => b[1] - a[1])
  const top = entries[0]?.[0]

  if (top === 'compassion') return '你的柳宗元最接近「民生入文」：他不是只寫自己的失意，而是把眼光投向受苦的人。'
  if (top === 'writing') return '你的柳宗元最接近「文心成道」：他把貶謫的寒冷，轉化成山水遊記、寓言與詩。'
  if (top === 'ideal') return '你的柳宗元最接近「直道守心」：政治失敗沒有令他否定改革理想，反而令信念更沉着。'
  return '你的柳宗元最接近「孤舟問心」：他在孤獨中保持清醒，像寒江上的蓑笠翁，安靜而堅定。'
}

export const useDaoGame = create(
  persist(
    (set, get) => ({
      stats: START_STATS,
      completed: [],
      currentTrialId: null,
      result: null,
      isHudOpen: true,

      openTrial: (id) => set({ currentTrialId: id, result: null }),
      closeTrial: () => set({ currentTrialId: null }),
      dismissResult: () => set({ result: null }),
      toggleHud: () => set((state) => ({ isHudOpen: !state.isHudOpen })),

      choosePath: (trialId, choiceId) => {
        const trial = DAO_TRIALS.find((item) => item.id === trialId)
        const choice = trial?.choices.find((item) => item.id === choiceId)
        if (!trial || !choice || get().completed.includes(trialId)) return

        const stats = { ...get().stats }
        Object.entries(choice.effects).forEach(([key, value]) => {
          stats[key] = clampStat((stats[key] ?? 0) + value)
        })

        const completed = [...get().completed, trialId]
        set({
          stats,
          completed,
          currentTrialId: null,
          result: {
            trialTitle: trial.title,
            choiceLabel: choice.label,
            reflection: choice.reflection,
            isComplete: completed.length === DAO_TRIALS.length,
          },
        })
      },

      resetDao: () => set({
        stats: START_STATS,
        completed: [],
        currentTrialId: null,
        result: null,
        isHudOpen: true,
      }),
    }),
    {
      name: 'liuzongyuan-dao-game',
      partialize: (state) => ({
        stats: state.stats,
        completed: state.completed,
        isHudOpen: state.isHudOpen,
      }),
    },
  ),
)