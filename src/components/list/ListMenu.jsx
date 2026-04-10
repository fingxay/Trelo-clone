import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import CopyListView from "./CopyListView"

const COLORS = [
  "#2a6f37",
  "#a98400",
  "#bc6c25",
  "#9b2226",
  "#7b2cbf",
  "#1d4ed8",
  "#0e7490",
  "#4d7c0f",
  "#9333ea",
  null,
]

function ListMenu({
  position,
  onClose,
  onAddCard,
  onCopyList,
  onMoveList,
  onArchiveList,
  onArchiveAllCardsInList,
  listTitle,
  listIndex = 0,
  totalLists = 1,
}) {
  const menuRef = useRef(null)

  const [view, setView] = useState("menu")
  const [isWatching, setIsWatching] = useState(false)
  const [showColors, setShowColors] = useState(false)
  const [showAutomation, setShowAutomation] = useState(false)
  const [selectedColor, setSelectedColor] = useState(null)
  const [movePosition, setMovePosition] = useState(listIndex + 1)

  useEffect(() => {
    function handleMouseDown(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose()
      }
    }

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        if (view !== "menu") setView("menu")
        else onClose()
      }
    }

    window.addEventListener("mousedown", handleMouseDown)
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("mousedown", handleMouseDown)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [onClose, view])

  if (!position) return null

  return createPortal(
    <div
      ref={menuRef}
      style={{ top: position.top, left: position.left }}
      className="fixed w-72 bg-[#1D2125] rounded-xl shadow-2xl border border-white/10 z-[9999]"
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
        <span className="text-sm font-semibold text-white">
          {view === "menu" && "Thao tác"}
          {view === "copy" && "Sao chép danh sách"}
          {view === "move" && "Di chuyển danh sách"}
        </span>

        <button
          onClick={() => {
            if (view !== "menu") setView("menu")
            else onClose()
          }}
          className="text-white/60 hover:text-white"
        >
          ✕
        </button>
      </div>

      {view === "menu" && (
        <div className="py-2 text-sm text-white/80">
          <MenuItem
            onClick={() => {
              onAddCard?.()
              onClose()
            }}
          >
            Thêm thẻ
          </MenuItem>

          <MenuItem onClick={() => setView("copy")}>
            Sao chép danh sách
          </MenuItem>

          <MenuItem
            onClick={() => {
              setMovePosition(listIndex + 1)
              setView("move")
            }}
          >
            Di chuyển danh sách
          </MenuItem>

          <MenuItem>Di chuyển tất cả thẻ trong danh sách này</MenuItem>
          <MenuItem>Sắp xếp theo...</MenuItem>

          <MenuItem onClick={() => setIsWatching((v) => !v)}>
            <span>Theo dõi</span>
            {isWatching && <span>✓</span>}
          </MenuItem>

          <Divider />

          <MenuItem onClick={() => setShowColors((v) => !v)}>
            <span>Thay đổi màu danh sách</span>
            <span>{showColors ? "▴" : "▾"}</span>
          </MenuItem>

          {showColors && (
            <div className="px-3 py-2 grid grid-cols-5 gap-2">
              {COLORS.map((c, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedColor(c)}
                  className={`h-8 rounded ${
                    c ? "" : "border border-white/20"
                  } ${selectedColor === c ? "ring-2 ring-white" : ""}`}
                  style={{ backgroundColor: c || "transparent" }}
                />
              ))}
            </div>
          )}

          <Divider />

          <MenuItem onClick={() => setShowAutomation((v) => !v)}>
            <span>Tự động hóa</span>
            <span>{showAutomation ? "▴" : "▾"}</span>
          </MenuItem>

          {showAutomation && (
            <div className="pl-3">
              <MenuItem small>Khi thêm thẻ vào danh sách...</MenuItem>
              <MenuItem small>Hàng ngày, sắp xếp danh sách theo...</MenuItem>
              <MenuItem small>Thứ 2 hàng tuần, sắp xếp danh sách theo...</MenuItem>
              <MenuItem small>Tạo quy tắc</MenuItem>
            </div>
          )}

          <Divider />

          <MenuItem
            onClick={() => {
              onArchiveList?.()
              onClose()
            }}
          >
            Lưu trữ danh sách này
          </MenuItem>
          <MenuItem
            onClick={() => {
              onArchiveAllCardsInList?.()
              onClose()
            }}
          >
            Lưu trữ tất cả các thẻ trong danh sách này
          </MenuItem>
        </div>
      )}

      {view === "copy" && (
        <CopyListView
          initialTitle={listTitle}
          onConfirm={(newTitle) => {
            onCopyList?.(newTitle)
            onClose()
          }}
          onCancel={() => setView("menu")}
        />
      )}

      {view === "move" && (
        <div className="p-3 text-sm text-white/80">
          <label className="block text-xs text-white/60 mb-1">
            Bảng thông tin
          </label>

          <select
            disabled
            className="w-full rounded-md p-2 mb-3 bg-[#222] text-white border border-white/10"
          >
            <option>Bảng hiện tại</option>
          </select>

          <label className="block text-xs text-white/60 mb-1">
            Vị trí
          </label>

          <select
            className="w-full rounded-md p-2 mb-3 bg-[#222] text-white border border-white/10"
            value={movePosition}
            onChange={(e) => setMovePosition(Number(e.target.value))}
          >
            {Array.from({ length: totalLists }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>

          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded"
            onClick={() => {
              onMoveList?.(movePosition - 1)
              onClose()
            }}
          >
            Di chuyển
          </button>
        </div>
      )}
    </div>,
    document.body
  )
}

function MenuItem({ children, onClick, small }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-white/10 ${
        small ? "text-xs text-white/70" : ""
      }`}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="my-2 border-t border-white/10" />
}

export default ListMenu