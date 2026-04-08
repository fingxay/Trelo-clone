function Card({ card, onDragStart, onDragEnd }) {
  return (
    <div
      draggable
      data-card-dragging="true"
      onDragStart={(e) => {
        e.stopPropagation()
        e.dataTransfer.effectAllowed = "move"
        e.dataTransfer.setData("text/plain", card.id)
        onDragStart?.()
      }}
      onDragEnd={(e) => {
        e.stopPropagation()
        onDragEnd?.()
      }}
      className="
        bg-white
        rounded-lg
        px-2 py-1.5
        text-sm text-slate-800
        shadow-sm
        hover:shadow-md
        hover:bg-slate-50
        cursor-pointer
        transition
        leading-snug
      "
    >
      {card.title}
    </div>
  )
}

export default Card