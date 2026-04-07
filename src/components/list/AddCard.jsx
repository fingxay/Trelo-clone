import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  forwardRef,
} from "react"

const AddCard = forwardRef(function AddCard({ onAdd }, ref) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState("")
  const rootRef = useRef(null)
  const textareaRef = useRef(null)

  /* ===== PUBLIC API (CHO LIST / MENU GỌI) ===== */
  useImperativeHandle(ref, () => ({
    open() {
      setIsOpen(true)
    },
  }))

  const reset = useCallback(() => {
    setIsOpen(false)
    setTitle("")
  }, [])

  const commitIfValid = useCallback(() => {
    const trimmed = title.trim()
    if (trimmed) {
      onAdd(trimmed)
    }
    reset()
  }, [title, onAdd, reset])

  /* Auto focus */
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isOpen])

  /* ESC / Enter */
  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(e) {
      if (e.key === "Escape") reset()
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        commitIfValid()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, reset, commitIfValid])

  /* Click outside */
  useEffect(() => {
    if (!isOpen) return

    function handleMouseDown(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        commitIfValid()
      }
    }

    window.addEventListener("mousedown", handleMouseDown)
    return () => window.removeEventListener("mousedown", handleMouseDown)
  }, [isOpen, commitIfValid])

  if (!isOpen) {
    return (
      <div
        className="
          text-slate-300 text-sm px-2 py-1.5
          cursor-pointer rounded
          hover:bg-white/10
          transition
        "
        onClick={() => setIsOpen(true)}
      >
        + Thêm thẻ
      </div>
    )
  }

  return (
    <div ref={rootRef} className="bg-slate-700 rounded-lg p-2">
      <textarea
        ref={textareaRef}
        className="
          w-full
          rounded-md
          p-2
          text-sm
          resize-none
          outline-none
          bg-white
          text-slate-800
          mb-2
        "
        rows={3}
        placeholder="Nhập tiêu đề hoặc dán liên kết"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <div className="flex items-center gap-2">
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded"
          onClick={commitIfValid}
        >
          Thêm thẻ
        </button>

        <button
          className="text-slate-300 text-xl hover:text-white"
          onClick={reset}
          title="Hủy"
        >
          ×
        </button>
      </div>
    </div>
  )
})

export default AddCard
