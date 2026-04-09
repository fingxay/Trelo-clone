function Card({ card, onClick, onDragStart, onDragEnd }) {
  const hasDescription = Boolean(card.description?.trim())

  const checklists = Array.isArray(card.checklists) ? card.checklists : []

  const totalChecklistCount = checklists.reduce((total, checklist) => {
    const items = Array.isArray(checklist.items) ? checklist.items : []
    return total + items.length
  }, 0)

  const completedChecklistCount = checklists.reduce((total, checklist) => {
    const items = Array.isArray(checklist.items) ? checklist.items : []
    return total + items.filter((item) => item.done).length
  }, 0)

  const showChecklist = totalChecklistCount > 0
  const isChecklistCompleted =
    showChecklist && completedChecklistCount === totalChecklistCount

  return (
    <div
      draggable
      data-card-dragging="true"
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
      onDragStart={(e) => {
        e.stopPropagation()
        e.dataTransfer.effectAllowed = "move"
        e.dataTransfer.setData("text/plain", card.id)
        e.dataTransfer.setData("application/x-trello-card", card.id)
        onDragStart?.()
      }}
      onDragEnd={(e) => {
        e.stopPropagation()
        onDragEnd?.()
      }}
      className="
        bg-white
        rounded-xl
        px-3 py-2.5
        text-sm text-slate-800
        shadow-sm
        hover:shadow-md
        hover:bg-slate-50
        cursor-pointer
        transition
        leading-snug
      "
    >
      <div className="font-medium break-words">{card.title}</div>

      {(hasDescription || showChecklist) && (
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          {hasDescription && (
            <div className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-slate-200/70">
              <span className="text-sm leading-none">☰</span>
            </div>
          )}

          {showChecklist && (
            <div
              className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 ${
                isChecklistCompleted
                  ? "bg-lime-200 text-lime-800"
                  : "hover:bg-slate-200/70"
              }`}
            >
              <span className="text-sm leading-none">☑</span>
              <span>
                {completedChecklistCount}/{totalChecklistCount}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Card