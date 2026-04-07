import { useEffect, useRef, useState } from "react"

function CopyListView({
  initialTitle,
  onConfirm,
  onCancel,
}) {
  const inputRef = useRef(null)
  const [title, setTitle] = useState(initialTitle || "")

  /* focus + select khi mount */
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [])

  const commit = () => {
    const trimmed = title.trim()
    if (!trimmed) return
    onConfirm?.(trimmed)
  }

  return (
    <div className="p-3 text-sm text-white/80">
      <label className="block text-xs text-white/60 mb-1">
        Tên
      </label>

      <input
        ref={inputRef}
        className="w-full rounded-md p-2 text-sm outline-none bg-[#222] text-white border border-white/10 mb-3"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit()
          if (e.key === "Escape") onCancel?.()
        }}
      />

      <button
        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded disabled:opacity-50"
        disabled={!title.trim()}
        onClick={commit}
      >
        Tạo danh sách
      </button>
    </div>
  )
}

export default CopyListView
