function Card({ card }) {
  return (
    <div className="
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
    ">
      {card.title}
    </div>
  )
}

export default Card
