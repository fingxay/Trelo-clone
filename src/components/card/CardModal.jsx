import { createPortal } from "react-dom"
import { useEffect, useRef, useState } from "react"
import CardChecklistSection from "./CardChecklistSection"
import { LABEL_OPTIONS } from "./labelOptions"
import CardDatePopover from "./CardDatePopover"

function formatModalDate(value) {
  if (!value) return ""

  const date = new Date(value)
  const day = date.getDate()
  const month = date.getMonth() + 1

  return `${day} thg ${month}`
}

function formatDateBadge(dates) {
  const startDate = dates?.startDate ? new Date(dates.startDate) : null
  const dueDate = dates?.dueDate ? new Date(dates.dueDate) : null

  if (startDate && dueDate) {
    return `${formatModalDate(startDate)} - ${formatModalDate(dueDate)}`
  }

  if (dueDate) {
    const hours = String(dueDate.getHours()).padStart(2, "0")
    const minutes = String(dueDate.getMinutes()).padStart(2, "0")
    return `${hours}:${minutes} ${dueDate.getDate()} thg ${dueDate.getMonth() + 1}`
  }

  if (startDate) {
    return formatModalDate(startDate)
  }

  return ""
}

function getDueDateBadgeClass(value) {
  if (!value) {
    return "bg-white/10 text-white/85 hover:bg-white/15"
  }

  const now = new Date()
  const dueDate = new Date(value)
  const diff = dueDate.getTime() - now.getTime()

  if (diff < 0) {
    return "bg-[#f87168] text-[#172b4d] hover:brightness-95"
  }

  if (diff < 24 * 60 * 60 * 1000) {
    return "bg-[#f5cd47] text-[#172b4d] hover:brightness-95"
  }

  return "bg-white/10 text-white/85 hover:bg-white/15"
}


function CardModal({ card, onClose, onUpdateCard }) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const labelsButtonRef = useRef(null)
  const labelsPopoverRef = useRef(null)
  const dateButtonRef = useRef(null)
  const datePopoverRef = useRef(null)
  const [draftTitle, setDraftTitle] = useState(card?.cardTitle || "")
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [draftDescription, setDraftDescription] = useState(card?.description || "")
  const [showChecklistPopover, setShowChecklistPopover] = useState(false)
  const [showLabelsPopover, setShowLabelsPopover] = useState(false)
  const [draftChecklistTitle, setDraftChecklistTitle] = useState("Việc cần làm")
  const [newChecklistItemById, setNewChecklistItemById] = useState({})
  const [labelsPopoverPosition, setLabelsPopoverPosition] = useState(null)
  const [datePopoverPosition, setDatePopoverPosition] = useState(null)
  const [datePopoverMaxHeight, setDatePopoverMaxHeight] = useState(null)
  const [showDatePopover, setShowDatePopover] = useState(false)

  const checklists = Array.isArray(card?.checklists) ? card.checklists : []

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

  const handleOpenChecklistPopover = () => {
    setDraftChecklistTitle("Việc cần làm")
    setShowChecklistPopover((prev) => !prev)
    setShowLabelsPopover(false)
  }

  const handleOpenLabelsPopover = () => {
    if (labelsButtonRef.current) {
      const rect = labelsButtonRef.current.getBoundingClientRect()

      setLabelsPopoverPosition({
        top: rect.bottom + 8,
        left: rect.left,
      })
    }

    setShowLabelsPopover((prev) => !prev)
    setShowChecklistPopover(false)
  }
  const handleOpenDatePopover = () => {
    if (dateButtonRef.current) {
      const rect = dateButtonRef.current.getBoundingClientRect()
      const popoverWidth = 360
      const popoverHeight = 620
      const gap = 8
      const viewportPadding = 16

      let top = rect.bottom + gap
      let left = rect.left

      if (top + popoverHeight > window.innerHeight - viewportPadding) {
        top = rect.top - popoverHeight - gap
      }

      if (left + popoverWidth > window.innerWidth - viewportPadding) {
        left = window.innerWidth - popoverWidth - viewportPadding
      }

      if (left < viewportPadding) left = viewportPadding
      if (top < viewportPadding) top = viewportPadding

      const maxHeight = window.innerHeight - top - viewportPadding

      setDatePopoverPosition({ top, left })
      setDatePopoverMaxHeight(maxHeight)
    }

    setShowDatePopover((prev) => !prev)
    setShowChecklistPopover(false)
    setShowLabelsPopover(false)
  }

  const handleToggleLabel = (option) => {
    const currentLabels = Array.isArray(card.labels) ? card.labels : []
    const exists = currentLabels.some((label) => label.id === option.id)

    const nextLabels = exists
      ? currentLabels.filter((label) => label.id !== option.id)
      : [
          ...currentLabels,
          {
            id: option.id,
            color: option.color,
            text: option.text || "",
          },
        ]

    onUpdateCard?.(card.listId, card.cardId, {
      labels: nextLabels,
    })
  }

  const handleUpdateLabelText = (labelId, nextText) => {
    const currentLabels = Array.isArray(card.labels) ? card.labels : []

    onUpdateCard?.(card.listId, card.cardId, {
      labels: currentLabels.map((label) =>
        label.id === labelId ? { ...label, text: nextText } : label
      ),
    })
  }

  const handleCreateChecklist = () => {
    const trimmed = draftChecklistTitle.trim()
    if (!trimmed) return

    onUpdateCard?.(card.listId, card.cardId, {
      checklists: [
        ...checklists,
        {
          id: `checklist-${Date.now()}`,
          title: trimmed,
          items: [],
        },
      ],
    })

    setDraftChecklistTitle("Việc cần làm")
    setShowChecklistPopover(false)
  }

  const handleRenameChecklist = (checklistId, nextTitle) => {
    onUpdateCard?.(card.listId, card.cardId, {
      checklists: checklists.map((checklist) =>
        checklist.id === checklistId
          ? { ...checklist, title: nextTitle }
          : checklist
      ),
    })
  }

  const handleDeleteChecklist = (checklistId) => {
    onUpdateCard?.(card.listId, card.cardId, {
      checklists: checklists.filter((checklist) => checklist.id !== checklistId),
    })

    setNewChecklistItemById((prev) => {
      const next = { ...prev }
      delete next[checklistId]
      return next
    })
  }

  const handleChangeNewChecklistItem = (checklistId, value) => {
    setNewChecklistItemById((prev) => ({
      ...prev,
      [checklistId]: value,
    }))
  }

  const handleCancelNewChecklistItem = (checklistId) => {
    setNewChecklistItemById((prev) => ({
      ...prev,
      [checklistId]: "",
    }))
  }

  const handleAddChecklistItem = (checklistId) => {
    const draftValue = newChecklistItemById[checklistId] || ""
    const trimmed = draftValue.trim()
    if (!trimmed) return

    onUpdateCard?.(card.listId, card.cardId, {
      checklists: checklists.map((checklist) =>
        checklist.id === checklistId
          ? {
              ...checklist,
              items: [
                ...(Array.isArray(checklist.items) ? checklist.items : []),
                {
                  id: `check-item-${Date.now()}`,
                  text: trimmed,
                  done: false,
                },
              ],
            }
          : checklist
      ),
    })

    setNewChecklistItemById((prev) => ({
      ...prev,
      [checklistId]: "",
    }))
  }

  const handleToggleChecklistItem = (checklistId, itemId) => {
    onUpdateCard?.(card.listId, card.cardId, {
      checklists: checklists.map((checklist) =>
        checklist.id === checklistId
          ? {
              ...checklist,
              items: (Array.isArray(checklist.items) ? checklist.items : []).map((item) =>
                item.id === itemId ? { ...item, done: !item.done } : item
              ),
            }
          : checklist
      ),
    })
  }

  useEffect(() => {
    if (!card || !showLabelsPopover) return

    function handleMouseDown(e) {
      if (labelsPopoverRef.current && !labelsPopoverRef.current.contains(e.target)) {
        setShowLabelsPopover(false)
      }
    }

    window.addEventListener("mousedown", handleMouseDown)
    return () => window.removeEventListener("mousedown", handleMouseDown)
  }, [card, showLabelsPopover])

  if (!card) return null

  const labelsPopover =
    showLabelsPopover && labelsPopoverPosition
      ? createPortal(
          <div
            ref={labelsPopoverRef}
            className="
              fixed z-[100]
              w-[360px]
              rounded-xl
              border border-white/10
              bg-[#2c333a]
              p-4
              shadow-2xl
            "
            style={{
              top: labelsPopoverPosition.top,
              left: labelsPopoverPosition.left,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-5" />
              <h4 className="text-sm font-semibold text-white/90">Nhãn</h4>
              <button
                className="text-white/60 hover:text-white"
                onClick={() => setShowLabelsPopover(false)}
              >
                ×
              </button>
            </div>

            <div className="space-y-2">
              {LABEL_OPTIONS.map((option) => {
                const activeLabel = (Array.isArray(card?.labels) ? card.labels : []).find(
                  (label) => label.id === option.id
                )

                return (
                  <div key={option.id} className="flex items-center gap-2">
                    <button
                      className={`
                        flex-1 min-w-0 rounded-md px-3 py-3 text-left text-sm font-semibold
                        transition hover:brightness-110
                        ${activeLabel ? "ring-2 ring-sky-400" : ""}
                      `}
                      style={{ backgroundColor: option.color, color: "#172b4d" }}
                      onClick={() => handleToggleLabel(option)}
                      title={activeLabel?.text || ""}
                    >
                      <span className="block w-full truncate">
                        {activeLabel?.text?.trim() || " "}
                      </span>
                    </button>

                    {activeLabel && (
                      <input
                        value={activeLabel.text || ""}
                        onChange={(e) =>
                          handleUpdateLabelText(option.id, e.target.value)
                        }
                        placeholder="Tên nhãn"
                        className="w-32 rounded-md border border-white/10 bg-[#1f2428] px-2 py-2 text-xs text-white outline-none placeholder:text-white/35"
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>,
          document.body
        )
      : null

  const datePopover =
    showDatePopover && datePopoverPosition
      ? createPortal(
          <div
            ref={datePopoverRef}
            className="fixed z-[100]"
            style={{
              top: datePopoverPosition.top,
              left: datePopoverPosition.left,
            }}
          >
            <CardDatePopover
              maxHeight={datePopoverMaxHeight}
              value={card.dates || null}
              onSave={(nextDates) => {
                onUpdateCard?.(card.listId, card.cardId, {
                  dates: nextDates,
                })
                setShowDatePopover(false)
              }}
              onRemove={() => {
                onUpdateCard?.(card.listId, card.cardId, {
                  dates: null,
                })
                setShowDatePopover(false)
              }}
              onClose={() => setShowDatePopover(false)}
            />
          </div>,
          document.body
        )
      : null

  return (
    <>
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

              {Array.isArray(card.labels) &&
                card.labels.filter((label) => label?.color).length > 0 && (
                  <div className="ml-8 mb-6">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/60">
                      Nhãn
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {card.labels
                        .filter((label) => label?.color)
                        .map((label) => (
                          <div
                            key={label.id}
                            className="max-w-[220px] rounded-sm px-3 py-1.5 text-xs font-semibold text-slate-900 flex items-center"
                            style={{ backgroundColor: label.color }}
                            title={label.text || "Nhãn"}
                          >
                            <span className="block w-full truncate">
                              {label.text?.trim() || " "}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

              {(card.dates?.startDate || card.dates?.dueDate) && (
                <div className="ml-8 mb-6">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/60">
                    Ngày
                  </p>

                  <button
                    className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition ${getDueDateBadgeClass(
                      card.dates?.dueDate
                    )}`}
                    onClick={handleOpenDatePopover}
                  >
                    <span>🕒</span>
                    <span>{formatDateBadge(card.dates)}</span>
                  </button>
                </div>
              )}

              <div className="flex flex-wrap gap-2 ml-8 mb-8">
                <button className="rounded-md border border-white/15 px-3 py-2 text-sm text-white/80 hover:bg-white/10">
                  ＋ Thêm
                </button>

                <div className="relative">
                  <button
                    ref={labelsButtonRef}
                    className="rounded-md border border-white/15 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
                    onClick={handleOpenLabelsPopover}
                  >
                    ⌂ Nhãn
                  </button>
                </div>

                <div className="relative">
                  <button
                    ref={dateButtonRef}
                    className="rounded-md border border-white/15 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
                    onClick={handleOpenDatePopover}
                  >
                    ◔ Ngày
                  </button>
                </div>

                <div className="relative">
                  <button
                    className="rounded-md border border-white/15 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
                    onClick={handleOpenChecklistPopover}
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
                          value={draftChecklistTitle}
                          onChange={(e) => setDraftChecklistTitle(e.target.value)}
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

              {checklists.map((checklist) => (
                <CardChecklistSection
                  key={checklist.id}
                  checklistTitle={checklist.title}
                  checklistItems={Array.isArray(checklist.items) ? checklist.items : []}
                  newChecklistItem={newChecklistItemById[checklist.id] || ""}
                  onChangeNewChecklistItem={(value) =>
                    handleChangeNewChecklistItem(checklist.id, value)
                  }
                  onAddChecklistItem={() => handleAddChecklistItem(checklist.id)}
                  onToggleChecklistItem={(itemId) =>
                    handleToggleChecklistItem(checklist.id, itemId)
                  }
                  onDeleteChecklist={() => handleDeleteChecklist(checklist.id)}
                  onRenameChecklist={(nextTitle) =>
                    handleRenameChecklist(checklist.id, nextTitle)
                  }
                  onCancelNewChecklistItem={() =>
                    handleCancelNewChecklistItem(checklist.id)
                  }
                />
              ))}
            </div>

            <div className="w-[380px] shrink-0 bg-[#1F2428] p-5">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-white/80 text-base">▣</span>
                  <h3 className="text-lg font-semibold">Nhận xét và hoạt động</h3>
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
                  <p className="text-sky-400 text-xs mt-1">17:35 2 thg 1, 2026</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <>
        {labelsPopover}
        {datePopover}
      </>
    </>
  )

  
}

export default CardModal