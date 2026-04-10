import { useState } from "react"

function formatArchivedTime(value) {
  if (!value) return ""

  const date = new Date(value)
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  const day = date.getDate()
  const month = date.getMonth() + 1

  return `${hours}:${minutes} ${day} thg ${month}`
}

function ArchivedItemsPanel({
  open,
  archivedLists = [],
  archivedCards = [],
  onClose,
  onRestoreList,
  onRestoreCard,
  onDeleteList,
  onDeleteCard,
}) {

  const hasArchivedLists = archivedLists.length > 0
  const hasArchivedCards = archivedCards.length > 0
  const isEmpty = !hasArchivedLists && !hasArchivedCards
  const [activeTab, setActiveTab] = useState(hasArchivedCards ? "cards" : "lists")
  const currentTab =
  activeTab === "cards" && !hasArchivedCards && hasArchivedLists
    ? "lists"
    : activeTab === "lists" && !hasArchivedLists && hasArchivedCards
      ? "cards"
      : activeTab

  if (!open) return null

  return (
    <div className="absolute right-0 top-10 z-50 w-[360px] overflow-hidden rounded-xl border border-white/10 bg-[#1f2430] text-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <p className="text-sm font-semibold text-white/85">Mục đã lưu trữ</p>

        <button
          type="button"
          className="rounded-md px-2 py-1 text-white/60 hover:bg-white/10 hover:text-white"
          onClick={onClose}
        >
          ×
        </button>
      </div>

      <div className="p-3">
        <div className="mb-3 flex items-center gap-2">
          <button
            type="button"
            className={`rounded-md px-3 py-2 text-sm font-medium transition ${
              currentTab === "cards"
                ? "bg-white/12 text-white"
                : "text-white/60 hover:bg-white/10 hover:text-white"
            }`}
            onClick={() => setActiveTab("cards")}
          >
            Thẻ
          </button>

          <button
            type="button"
            className={`rounded-md px-3 py-2 text-sm font-medium transition ${
              currentTab === "lists"
                ? "bg-white/12 text-white"
                : "text-white/60 hover:bg-white/10 hover:text-white"
            }`}
            onClick={() => setActiveTab("lists")}
          >
            Danh sách
          </button>
        </div>

        <div className="max-h-[calc(70vh-56px)] overflow-y-auto">
        {isEmpty && (
          <div className="rounded-lg border border-dashed border-white/10 px-4 py-6 text-center text-sm text-white/45">
            Chưa có mục nào được lưu trữ
          </div>
        )}

        {!isEmpty && activeTab === "cards" && !hasArchivedCards && (
          <div className="rounded-lg border border-dashed border-white/10 px-4 py-6 text-center text-sm text-white/45">
            Chưa có thẻ nào được lưu trữ
          </div>
        )}

        {!isEmpty && activeTab === "lists" && !hasArchivedLists && (
          <div className="rounded-lg border border-dashed border-white/10 px-4 py-6 text-center text-sm text-white/45">
            Chưa có danh sách nào được lưu trữ
          </div>
        )}

        {activeTab === "lists" && hasArchivedLists && (
          <div className="mb-4">
            <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-white/45">
              Danh sách
            </p>

            <div className="space-y-2">
              {archivedLists.map((list) => (
                <div
                  key={list.id}
                  className="rounded-lg border border-white/10 bg-white/[0.03] p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white/90">
                        {list.title}
                      </p>
                      <p className="mt-1 text-xs text-white/45">
                        {Array.isArray(list.cards) ? list.cards.length : 0} thẻ
                        {list.archivedAt ? ` • ${formatArchivedTime(list.archivedAt)}` : ""}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        className="rounded-md bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600"
                        onClick={() => onDeleteList?.(list.id)}
                      >
                        Xóa
                      </button>

                      <button
                        type="button"
                        className="rounded-md bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-500"
                        onClick={() => onRestoreList?.(list.id)}
                      >
                        Khôi phục
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "cards" && hasArchivedCards && (
  <div>
    <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-white/45">
      Thẻ
    </p>

    <div className="space-y-2">
      {archivedCards.map((item) => (
        <div
          key={item.id}
          className="rounded-lg border border-white/10 bg-white/[0.03] p-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white/90">
                {item.card?.title || "Thẻ không tên"}
              </p>
              <p className="mt-1 text-xs text-white/45">
                {item.listTitle ? `từ ${item.listTitle}` : ""}
                {item.archivedAt ? ` • ${formatArchivedTime(item.archivedAt)}` : ""}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                className="rounded-md bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600"
                onClick={() => onDeleteCard?.(item.id)}
              >
                Xóa
              </button>

              <button
                type="button"
                className="rounded-md bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-500"
                onClick={() => onRestoreCard?.(item.id)}
              >
                Khôi phục
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)}
        </div>
      </div>
    </div>
  )
}

export default ArchivedItemsPanel