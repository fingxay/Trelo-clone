import { useState } from "react"

function CardModal({ card, onClose, onUpdateCard }) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [draftTitle, setDraftTitle] = useState(card?.cardTitle || "")
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [draftDescription, setDraftDescription] = useState(card?.description || "")

  const [showChecklistPopover, setShowChecklistPopover] = useState(false)
  const [checklistTitle, setChecklistTitle] = useState("Việc cần làm")
  const [checklistItems, setChecklistItems] = useState([])
  const [newChecklistItem, setNewChecklistItem] = useState("")
  const [hasChecklist, setHasChecklist] = useState(false)

  if (!card) return null

  const handleSaveTitle = () => {
    const trimmed = draftTitle.trim()
    if (!trimmed) {
      setDraftTitle(card.cardTitle)
      setIsEditingTitle(false)
      return
    }

    onUpdateCard?.(card.listId, card.cardId, { title: trimmed })
    setIsEditingTitle(false)
  }

  const handleSaveDescription = () => {
    onUpdateCard?.(card.listId, card.cardId, {
      description: draftDescription,
    })
    setIsEditingDescription(false)
  }

  const handleCancelDescription = () => {
    setDraftDescription(card.description || "")
    setIsEditingDescription(false)
  }

  const handleCreateChecklist = () => {
    const trimmed = checklistTitle.trim()
    if (!trimmed) return

    setChecklistTitle(trimmed)
    setHasChecklist(true)
    setShowChecklistPopover(false)
  }

  const handleAddChecklistItem = () => {
    const trimmed = newChecklistItem.trim()
    if (!trimmed) return

    setChecklistItems((prev) => [
      ...prev,
      {
        id: `check-item-${Date.now()}`,
        text: trimmed,
        done: false,
      },
    ])
    setNewChecklistItem("")
  }

  const handleToggleChecklistItem = (itemId) => {
    setChecklistItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, done: !item.done } : item
      )
    )
  }

  const handleDeleteChecklist = () => {
    setChecklistItems([])
    setChecklistTitle("Việc cần làm")
    setHasChecklist(false)
  }

  const completedCount = checklistItems.filter((item) => item.done).length
  const progress = checklistItems.length
    ? Math.round((completedCount / checklistItems.length) * 100)
    : 0

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center px-4 py-8"
      onClick={onClose}
    >
      <div
        className="
          w-full max-w-[1080px]
          rounded-2xl
          overflow-hidden
          bg-[#282E33]
          text-white
          shadow-2xl
          border border-white/10
        "
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex max-h-[calc(100vh-80px)]">
          <div className="flex-1 min-w-0 p-8 border-r border-white/10 overflow-y-auto">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-3 mb-1">
                  <span className="text-white/70 text-xl leading-none mt-1">
                    ◯
                  </span>

                  <div className="flex-1 min-w-0">
                    {!isEditingTitle ? (
                      <button
                        className="text-left w-full"
                        onClick={() => setIsEditingTitle(true)}
                      >
                        <h2 className="text-2xl leading-snug font-semibold break-words hover:underline">
                          {card.cardTitle}
                        </h2>
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <input
                          autoFocus
                          value={draftTitle}
                          onChange={(e) => setDraftTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveTitle()
                            if (e.key === "Escape") {
                              setDraftTitle(card.cardTitle)
                              setIsEditingTitle(false)
                            }
                          }}
                          className="w-full rounded-md border border-sky-400 bg-[#22272b] px-3 py-2 text-2xl font-semibold outline-none"
                        />

                        <div className="flex gap-2">
                          <button
                            className="rounded-md bg-sky-600 px-3 py-2 text-sm font-medium hover:bg-sky-500"
                            onClick={handleSaveTitle}
                          >
                            Lưu
                          </button>
                          <button
                            className="rounded-md px-3 py-2 text-sm text-white/70 hover:bg-white/10"
                            onClick={() => {
                              setDraftTitle(card.cardTitle)
                              setIsEditingTitle(false)
                            }}
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    )}

                    <p className="text-sm text-white/65 mt-1">
                      trong danh sách{" "}
                      <span className="underline text-white/80">
                        {card.listTitle}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <button
                className="
                  w-9 h-9 shrink-0
                  rounded-md
                  text-white/60
                  hover:text-white
                  hover:bg-white/10
                  text-2xl leading-none
                "
                onClick={onClose}
              >
                ×
              </button>
            </div>

            <div className="flex flex-wrap gap-2 ml-8 mb-8">
              <button className="rounded-md border border-white/15 px-3 py-2 text-sm text-white/80 hover:bg-white/10">
                ＋ Thêm
              </button>
              <button className="rounded-md border border-white/15 px-3 py-2 text-sm text-white/80 hover:bg-white/10">
                ⌂ Nhãn
              </button>
              <button className="rounded-md border border-white/15 px-3 py-2 text-sm text-white/80 hover:bg-white/10">
                ◔ Ngày
              </button>

              <div className="relative">
                <button
                  className="rounded-md border border-white/15 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
                  onClick={() => setShowChecklistPopover((prev) => !prev)}
                >
                  ☑ Việc cần làm
                </button>

                {showChecklistPopover && (
                  <div
                    className="
                      absolute left-0 top-[calc(100%+8px)] z-20
                      w-[320px]
                      rounded-xl
                      border border-white/10
                      bg-[#2c333a]
                      p-4
                      shadow-2xl
                    "
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-5" />
                      <h4 className="text-sm font-semibold text-white/90">
                        Thêm danh sách công việc
                      </h4>
                      <button
                        className="text-white/60 hover:text-white"
                        onClick={() => setShowChecklistPopover(false)}
                      >
                        ×
                      </button>
                    </div>

                    <div className="mb-4">
                      <label className="mb-2 block text-sm font-medium text-white/80">
                        Tiêu đề
                      </label>
                      <input
                        autoFocus
                        value={checklistTitle}
                        onChange={(e) => setChecklistTitle(e.target.value)}
                        className="w-full rounded-md border border-sky-400 bg-[#1f2428] px-3 py-2 text-sm text-white outline-none"
                      />
                    </div>

                    <button
                      className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium hover:bg-sky-500"
                      onClick={handleCreateChecklist}
                    >
                      Thêm
                    </button>
                  </div>
                )}
              </div>

              <button className="rounded-md border border-white/15 px-3 py-2 text-sm text-white/80 hover:bg-white/10">
                ⚯ Thành viên
              </button>
            </div>

            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-white/70 text-xl">☰</span>
                <h3 className="text-lg font-semibold">Mô tả</h3>
              </div>

              {!isEditingDescription ? (
                <button
                  className="
                    ml-8
                    w-[calc(100%-2rem)]
                    min-h-[120px]
                    rounded-md
                    border border-white/15
                    bg-white/[0.03]
                    px-4 py-3
                    text-left text-sm text-white/70
                    hover:bg-white/[0.05]
                    whitespace-pre-wrap
                  "
                  onClick={() => setIsEditingDescription(true)}
                >
                  {card.description?.trim()
                    ? card.description
                    : "Thêm mô tả chi tiết hơn..."}
                </button>
              ) : (
                <div className="ml-8 w-[calc(100%-2rem)]">
                  <textarea
                    autoFocus
                    value={draftDescription}
                    onChange={(e) => setDraftDescription(e.target.value)}
                    className="
                      w-full min-h-[220px]
                      rounded-md
                      border border-sky-400
                      bg-[#22272b]
                      px-4 py-3
                      text-sm text-white
                      outline-none
                      resize-none
                    "
                  />

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium hover:bg-sky-500"
                      onClick={handleSaveDescription}
                    >
                      Lưu
                    </button>
                    <button
                      className="rounded-md px-3 py-2 text-sm text-white/70 hover:bg-white/10"
                      onClick={handleCancelDescription}
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              )}
            </div>

            {hasChecklist && (
              <div className="mb-2">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-white/70 text-xl">☑</span>
                    <h3 className="text-lg font-semibold">{checklistTitle}</h3>
                  </div>

                  <button
                    className="rounded-md bg-white/10 px-3 py-2 text-sm text-white/80 hover:bg-white/15"
                    onClick={handleDeleteChecklist}
                  >
                    Xóa
                  </button>
                </div>

                <div className="mb-3">
                  <div className="mb-1 text-xs text-white/60">{progress}%</div>
                  <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-sky-500 transition-all"
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
                        onChange={() => handleToggleChecklistItem(item.id)}
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
                  <textarea
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
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
                      className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium hover:bg-sky-500"
                      onClick={handleAddChecklistItem}
                    >
                      Thêm
                    </button>
                    <button
                      className="rounded-md px-3 py-2 text-sm text-white/70 hover:bg-white/10"
                      onClick={() => setNewChecklistItem("")}
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="w-[380px] shrink-0 bg-[#1F2428] p-5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-white/80 text-base">▣</span>
                <h3 className="text-lg font-semibold">
                  Nhận xét và hoạt động
                </h3>
              </div>

              <button
                className="
                  rounded-md
                  bg-white/10
                  hover:bg-white/15
                  px-3 py-2
                  text-sm text-white/90
                  shrink-0
                "
              >
                Hiện chi tiết
              </button>
            </div>

            <input
              className="
                w-full rounded-md
                bg-white/8
                border border-white/10
                px-4 py-3
                text-sm text-white
                outline-none
                placeholder:text-white/40
                mb-6
              "
              placeholder="Viết bình luận..."
              readOnly
            />

            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-stone-300 shrink-0" />

              <div className="min-w-0 text-sm leading-6">
                <p className="text-white/90">
                  <span className="font-semibold">hong tai</span>{" "}
                  đã sao chép thẻ này từ{" "}
                  <span className="text-sky-400">{card.listTitle}</span> trong
                  danh sách
                </p>
                <p className="text-white/90 break-words">{card.cardTitle}</p>
                <p className="text-sky-400 text-xs mt-1">
                  17:35 2 thg 1, 2026
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CardModal