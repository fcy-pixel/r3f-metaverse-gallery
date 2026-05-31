import { DAO_TRIALS, STAT_LABELS, getEnding, getRealm, getTotal, useDaoGame } from '../daoGameStore'

export default function DaoGameUI() {
  const stats = useDaoGame((state) => state.stats)
  const completed = useDaoGame((state) => state.completed)
  const currentTrialId = useDaoGame((state) => state.currentTrialId)
  const result = useDaoGame((state) => state.result)
  const isHudOpen = useDaoGame((state) => state.isHudOpen)
  const openTrial = useDaoGame((state) => state.openTrial)
  const closeTrial = useDaoGame((state) => state.closeTrial)
  const choosePath = useDaoGame((state) => state.choosePath)
  const dismissResult = useDaoGame((state) => state.dismissResult)
  const toggleHud = useDaoGame((state) => state.toggleHud)
  const resetDao = useDaoGame((state) => state.resetDao)

  const total = getTotal(stats)
  const realm = getRealm(stats)
  const currentTrial = DAO_TRIALS.find((trial) => trial.id === currentTrialId)
  const nextTrial = DAO_TRIALS.find((trial) => !completed.includes(trial.id))
  const progress = Math.round((completed.length / DAO_TRIALS.length) * 100)

  return (
    <>
      <section className={`dao-hud ${isHudOpen ? 'is-open' : 'is-collapsed'}`} onPointerDown={(event) => event.stopPropagation()}>
        <button className="dao-toggle" type="button" onClick={toggleHud}>
          {isHudOpen ? '收起尋道' : '柳宗元尋道'}
        </button>

        {isHudOpen && (
          <>
            <div className="dao-heading">
              <span className="dao-kicker">尋道大千 · 柳宗元心境</span>
              <h2>{realm.name}</h2>
              <p>{realm.note}</p>
            </div>

            <div className="dao-progress" aria-label="修行進度">
              <span style={{ width: `${progress}%` }} />
            </div>
            <div className="dao-meta">
              <span>道行 {total}</span>
              <span>{completed.length}/{DAO_TRIALS.length} 心境</span>
            </div>

            <div className="dao-stats">
              {Object.entries(STAT_LABELS).map(([key, label]) => (
                <div className="dao-stat" key={key}>
                  <span>{label}</span>
                  <strong>{stats[key]}</strong>
                </div>
              ))}
            </div>

            <div className="dao-next">
              <span>當前目標</span>
              <strong>{nextTrial ? `尋訪「${nextTrial.title}」石碑` : '已完成全部心境試煉'}</strong>
            </div>

            <div className="dao-trial-list">
              {DAO_TRIALS.map((trial) => {
                const done = completed.includes(trial.id)
                return (
                  <button
                    key={trial.id}
                    className={done ? 'is-done' : ''}
                    type="button"
                    onClick={() => openTrial(trial.id)}
                  >
                    <span>{done ? '已悟' : '未悟'}</span>
                    {trial.title}
                  </button>
                )
              })}
            </div>

            <button className="dao-reset" type="button" onClick={resetDao}>重新修行</button>
          </>
        )}
      </section>

      {currentTrial && (
        <TrialModal
          trial={currentTrial}
          completed={completed.includes(currentTrial.id)}
          onClose={closeTrial}
          onChoose={choosePath}
        />
      )}

      {result && (
        <ResultModal
          result={result}
          stats={stats}
          onClose={dismissResult}
        />
      )}
    </>
  )
}

function TrialModal({ trial, completed, onClose, onChoose }) {
  return (
    <div className="dao-modal-backdrop" onPointerDown={(event) => event.stopPropagation()}>
      <article className="dao-modal">
        <span className="dao-kicker">柳宗元心境試煉</span>
        <h2>{trial.title}</h2>
        <h3>{trial.subtitle}</h3>
        <p className="dao-insight">{trial.insight}</p>
        <p className="dao-prompt">{completed ? '你已完成這段心境。可以重溫背景，或重新修行全部路線。' : trial.prompt}</p>

        {!completed && (
          <div className="dao-choice-grid">
            {trial.choices.map((choice) => (
              <button key={choice.id} type="button" onClick={() => onChoose(trial.id, choice.id)}>
                <strong>{choice.label}</strong>
                <span>{choice.text}</span>
                <small>{formatEffects(choice.effects)}</small>
              </button>
            ))}
          </div>
        )}

        <button className="dao-close" type="button" onClick={onClose}>離開石碑</button>
      </article>
    </div>
  )
}

function ResultModal({ result, stats, onClose }) {
  return (
    <div className="dao-modal-backdrop" onPointerDown={(event) => event.stopPropagation()}>
      <article className="dao-modal dao-result">
        <span className="dao-kicker">心境札記</span>
        <h2>{result.trialTitle}</h2>
        <h3>{result.choiceLabel}</h3>
        <p className="dao-insight">{result.reflection}</p>

        {result.isComplete && (
          <div className="dao-ending">
            <strong>修行總結</strong>
            <p>{getEnding(stats)}</p>
          </div>
        )}

        <button className="dao-close" type="button" onClick={onClose}>收入心中</button>
      </article>
    </div>
  )
}

function formatEffects(effects) {
  return Object.entries(effects)
    .map(([key, value]) => `${STAT_LABELS[key]} +${value}`)
    .join(' · ')
}