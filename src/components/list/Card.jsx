function formatCardDate(value) {
  if (!value) return ""

  const date = new Date(value)
  const day = date.getDate()
  const month = date.getMonth() + 1

  return `${day} thg ${month}`
}

function formatCardDateRange(dates) {
  const startDate = dates?.startDate ? new Date(dates.startDate) : null
  const dueDate = dates?.dueDate ? new Date(dates.dueDate) : null

  if (startDate && dueDate) {
    return `${formatCardDate(startDate)} - ${formatCardDate(dueDate)}`
  }

  if (dueDate) {
    return formatCardDate(dueDate)
  }

  if (startDate) {
    return formatCardDate(startDate)
  }

  return ""
}

function getCardDueDateClass(value) {
  if (!value) return "hover:bg-slate-200/70"

  const now = new Date()
  const dueDate = new Date(value)
  const diff = dueDate.getTime() - now.getTime()

  if (diff < 0) {
    return "bg-red-200 text-red-800"
  }

  if (diff < 24 * 60 * 60 * 1000) {
    return "bg-amber-200 text-amber-800"
  }

  return "hover:bg-slate-200/70"
}

function Card({ card, onClick, onDragStart, onDragEnd }) {
  const hasDescription = Boolean(card.description?.trim())

  const labels = Array.isArray(card.labels) ? card.labels : []
  const visibleLabels = labels.filter((label) => label?.color)

  const hasLabelText = visibleLabels.some((label) => label.text?.trim())

  const checklists = Array.isArray(card.checklists) ? card.checklists : []

  const totalChecklistCount = checklists.reduce((total, checklist) => {
    const items = Array.isArray(checklist.items) ? checklist.items : []
    return total + items.length
  }, 0)

  const completedChecklistCount = checklists.reduce((total, checklist) => {
    const items = Array.isArray(checklist.items) ? checklist.items : []
    return total + items.filter((item) => item.done).length
  }, 0)

  const dueDate = card.dates?.dueDate || null
  const dateText = formatCardDateRange(card.dates)
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
      {visibleLabels.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {visibleLabels.map((label) => (
            <div
              key={label.id}
              className={`rounded-sm ${
                hasLabelText
                  ? "max-w-full px-2 py-1 text-[11px] font-semibold text-slate-900 flex items-center truncate"
                  : "h-2 w-10"
              }`}
              style={{ backgroundColor: label.color }}
              title={label.text || "Nhãn"}
            >
              <span className={hasLabelText ? "block w-full truncate" : ""}>
                {hasLabelText ? label.text : ""}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="font-medium break-words">{card.title}</div>

      {(hasDescription || showChecklist || dateText) && (
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          {hasDescription && (
            <div className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-slate-200/70">
              <span className="text-sm leading-none">☰</span>
            </div>
          )}

          {dateText && (
            <div
              className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 ${getCardDueDateClass(
                dueDate
              )}`}
            >
              <span className="text-sm leading-none">🕒</span>
              <span>{dateText}</span>
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