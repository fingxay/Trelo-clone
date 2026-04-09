import { useState } from "react"

function CardChecklistSection({
  checklistTitle,
  checklistItems,
  newChecklistItem,
  onChangeNewChecklistItem,
  onAddChecklistItem,
  onToggleChecklistItem,
  onDeleteChecklist,
  onRenameChecklist,
  onCancelNewChecklistItem,
}) {
  const [isEditingChecklistTitle, setIsEditingChecklistTitle] = useState(false)
  const [draftChecklistTitle, setDraftChecklistTitle] = useState("")
  const [isAddingItem, setIsAddingItem] = useState(false)

  const completedCount = checklistItems.filter((item) => item.done).length
  const progress = checklistItems.length
    ? Math.round((completedCount / checklistItems.length) * 100)
    : 0

  const handleStartEditChecklistTitle = () => {
    setDraftChecklistTitle(checklistTitle || "Việc cần làm")
    setIsEditingChecklistTitle(true)
  }

  const handleSaveChecklistTitle = () => {
    const trimmed = draftChecklistTitle.trim()

    if (!trimmed) {
      setDraftChecklistTitle("")
      setIsEditingChecklistTitle(false)
      return
    }

    onRenameChecklist?.(trimmed)
    setDraftChecklistTitle("")
    setIsEditingChecklistTitle(false)
  }

  const handleCancelEditChecklistTitle = () => {
    setDraftChecklistTitle("")
    setIsEditingChecklistTitle(false)
  }

  const handleOpenAddItem = () => {
    setIsAddingItem(true)
  }

  const handleCloseAddItem = () => {
    onCancelNewChecklistItem?.()
    setIsAddingItem(false)
  }

  const handleSubmitAddItem = () => {
    const trimmed = newChecklistItem.trim()
    if (!trimmed) return

    onAddChecklistItem?.()
    setIsAddingItem(false)
  }

  return (
    <div className="mb-6">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <span className="text-white/70 text-xl mt-1">☑</span>

          <div className="min-w-0 flex-1">
            {!isEditingChecklistTitle ? (
              <button
                type="button"
                className="text-left w-full"
                onClick={handleStartEditChecklistTitle}
              >
                <h3 className="text-lg font-semibold break-words hover:underline">
                  {checklistTitle}
                </h3>
              </button>
            ) : (
              <div className="space-y-3">
                <input
                  autoFocus
                  value={draftChecklistTitle}
                  onChange={(e) => setDraftChecklistTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveChecklistTitle()
                    if (e.key === "Escape") handleCancelEditChecklistTitle()
                  }}
                  className="w-full rounded-md border border-sky-400 bg-[#22272b] px-3 py-2 text-lg font-semibold text-white outline-none"
                />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium hover:bg-sky-500"
                    onClick={handleSaveChecklistTitle}
                  >
                    Lưu
                  </button>

                  <button
                    type="button"
                    className="rounded-md px-3 py-2 text-sm text-white/70 hover:bg-white/10"
                    onClick={handleCancelEditChecklistTitle}
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {progress === 100 && checklistItems.length > 0 && (
            <button
              type="button"
              className="rounded-md bg-white/10 px-3 py-2 text-sm text-white/80 hover:bg-white/15"
            >
              Ẩn các mục đã chọn
            </button>
          )}

          <button
            type="button"
            className="rounded-md bg-white/10 px-3 py-2 text-sm text-white/80 hover:bg-white/15"
            onClick={onDeleteChecklist}
          >
            Xóa
          </button>
        </div>
      </div>

      <div className="mb-3">
        <div className="mb-1 text-xs text-white/60">{progress}%</div>
        <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              progress === 100 ? "bg-lime-500" : "bg-sky-500"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-2 mb-3">
        {checklistItems.map((item) => (
          <label
            key={item.id}
            className="flex items-start gap-3 rounded-md px-2 py-2 hover:bg-white/5"
          >
            <input
              type="checkbox"
              checked={item.done}
              onChange={() => onToggleChecklistItem?.(item.id)}
              className="mt-1"
            />
            <span
              className={`text-sm ${
                item.done ? "line-through text-white/40" : "text-white/85"
              }`}
            >
              {item.text}
            </span>
          </label>
        ))}
      </div>

      <div className="ml-8">
        {!isAddingItem ? (
          <button
            type="button"
            className="rounded-md bg-white/10 px-4 py-2 text-sm text-white/85 hover:bg-white/15"
            onClick={handleOpenAddItem}
          >
            Thêm một mục
          </button>
        ) : (
          <>
            <textarea
              autoFocus
              value={newChecklistItem}
              onChange={(e) => onChangeNewChecklistItem?.(e.target.value)}
              placeholder="Thêm một mục"
              className="
                w-full rounded-md border border-sky-400
                bg-[#22272b] px-3 py-2 text-sm text-white
                outline-none resize-none
              "
              rows={2}
            />

            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium hover:bg-sky-500"
                onClick={handleSubmitAddItem}
              >
                Thêm
              </button>

              <button
                type="button"
                className="rounded-md px-3 py-2 text-sm text-white/70 hover:bg-white/10"
                onClick={handleCloseAddItem}
              >
                Hủy
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default CardChecklistSection