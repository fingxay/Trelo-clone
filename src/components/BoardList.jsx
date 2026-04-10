import { useEffect, useRef, useState } from "react"
import { MoreHorizontal, Archive, Trash2, X } from "lucide-react"
import ConfirmModal from "./common/ConfirmModal"
import ArchivedBoardsPanel from "./board/ArchivedBoardsPanel"

function BoardList({
  boards,
  selectedBoardId,
  onSelectBoard,
  onCreateBoard,
  onArchiveBoard,
  onDeleteBoard,
  archivedBoards,
  onRestoreBoard,
  onDeleteArchivedBoard,
}) {
  const [openBoardMenuId, setOpenBoardMenuId] = useState(null)
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false)
  const [isArchivedPanelOpen, setIsArchivedPanelOpen] = useState(false)
  const [confirmState, setConfirmState] = useState({
    open: false,
    type: null,
    boardId: null,
    boardTitle: "",
  })

  const headerMenuRef = useRef(null)
  const archivedPanelRef = useRef(null)
  const boardMenuRefs = useRef({})

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        isHeaderMenuOpen &&
        headerMenuRef.current &&
        !headerMenuRef.current.contains(e.target)
      ) {
        setIsHeaderMenuOpen(false)
      }

      if (
        isArchivedPanelOpen &&
        archivedPanelRef.current &&
        !archivedPanelRef.current.contains(e.target) &&
        headerMenuRef.current &&
        !headerMenuRef.current.contains(e.target)
      ) {
        setIsArchivedPanelOpen(false)
      }

      if (openBoardMenuId) {
        const activeMenuRef = boardMenuRefs.current[openBoardMenuId]
        if (activeMenuRef && !activeMenuRef.contains(e.target)) {
          setOpenBoardMenuId(null)
        }
      }
    }

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setIsHeaderMenuOpen(false)
        setIsArchivedPanelOpen(false)
        setOpenBoardMenuId(null)
        setConfirmState((prev) => ({ ...prev, open: false }))
      }
    }

    window.addEventListener("mousedown", handleClickOutside)
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("mousedown", handleClickOutside)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isHeaderMenuOpen, isArchivedPanelOpen, openBoardMenuId])

  const handleOpenConfirm = (type, board) => {
    setConfirmState({
      open: true,
      type,
      boardId: board.id,
      boardTitle: board.title,
    })
    setOpenBoardMenuId(null)
  }

  const handleCloseConfirm = () => {
    setConfirmState({
      open: false,
      type: null,
      boardId: null,
      boardTitle: "",
    })
  }

  const handleConfirmAction = () => {
    if (confirmState.type === "archive") {
      onArchiveBoard?.(confirmState.boardId)
    }

    if (confirmState.type === "delete") {
      onDeleteBoard?.(confirmState.boardId)
    }

    if (confirmState.type === "deleteArchived") {
      onDeleteArchivedBoard?.(confirmState.boardId)
    }

    handleCloseConfirm()
  }

  return (
    <>
      <div className="min-h-screen bg-[#1d2125] text-white">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold">Bảng của bạn</h1>

            <div className="relative" ref={headerMenuRef}>
              <button
                type="button"
                className="h-9 w-9 inline-flex items-center justify-center rounded-md text-white/80 hover:text-white hover:bg-white/10 transition"
                onClick={() => setIsHeaderMenuOpen((prev) => !prev)}
              >
                <MoreHorizontal size={18} />
              </button>

              {isHeaderMenuOpen && (
                <div className="absolute right-0 top-11 w-72 rounded-xl border border-white/10 bg-[#1f2430] text-white shadow-2xl overflow-hidden z-50">
                  <div className="relative flex items-center justify-center px-4 py-3 border-b border-white/10">
                    <p className="text-sm font-semibold text-white/80">Menu</p>

                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 inline-flex items-center justify-center rounded-md text-white/70 hover:text-white hover:bg-white/10 transition"
                      onClick={() => setIsHeaderMenuOpen(false)}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="p-2">
                    <button
                      type="button"
                      className="w-full flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-left text-white/85 hover:bg-white/10 transition"
                      onClick={() => {
                        setIsArchivedPanelOpen(true)
                        setIsHeaderMenuOpen(false)
                      }}
                    >
                      <Archive size={18} className="shrink-0" />
                      <span>Mục đã lưu trữ</span>
                    </button>
                  </div>
                </div>
              )}

              <div ref={archivedPanelRef} className="absolute right-0 top-0">
                <ArchivedBoardsPanel
                  open={isArchivedPanelOpen}
                  archivedBoards={archivedBoards || []}
                  onClose={() => setIsArchivedPanelOpen(false)}
                  onRestoreBoard={onRestoreBoard}
                  onDeleteArchivedBoard={(boardId) => {
                    const archivedBoard = (archivedBoards || []).find((board) => board.id === boardId)
                    if (!archivedBoard) return

                    setConfirmState({
                      open: true,
                      type: "deleteArchived",
                      boardId: archivedBoard.id,
                      boardTitle: archivedBoard.title,
                    })
                  }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {boards.map((board) => {
              const isActive = board.id === selectedBoardId

              return (
                <div
                  key={board.id}
                  className={`relative h-24 rounded-xl p-4 transition ${
                    isActive
                      ? "bg-blue-600"
                      : "bg-[#2c333a] hover:bg-[#37414b]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelectBoard(board.id)}
                    className="absolute inset-0 rounded-xl text-left"
                  />

                  <div className="relative z-10 flex items-start justify-between gap-3">
                    <div className="pr-8 text-base font-semibold truncate">
                      {board.title}
                    </div>

                    <div
                      className="relative shrink-0"
                      ref={(node) => {
                        if (node) boardMenuRefs.current[board.id] = node
                      }}
                    >
                      <button
                        type="button"
                        className="h-8 w-8 inline-flex items-center justify-center rounded-md text-white/75 hover:text-white hover:bg-black/20 transition"
                        onClick={(e) => {
                          e.stopPropagation()
                          setOpenBoardMenuId((prev) =>
                            prev === board.id ? null : board.id
                          )
                        }}
                      >
                        <MoreHorizontal size={16} />
                      </button>

                      {openBoardMenuId === board.id && (
                        <div className="absolute right-0 top-10 w-56 rounded-xl border border-white/10 bg-[#1f2430] text-white shadow-2xl overflow-hidden z-50">
                          <button
                            type="button"
                            className="w-full flex items-center gap-3 px-3 py-3 text-sm text-left text-white/85 hover:bg-white/10 transition"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenConfirm("archive", board)
                            }}
                          >
                            <Archive size={16} className="shrink-0" />
                            <span>Lưu trữ bảng</span>
                          </button>

                          <button
                            type="button"
                            className="w-full flex items-center gap-3 px-3 py-3 text-sm text-left text-red-300 hover:bg-white/10 transition"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenConfirm("delete", board)
                            }}
                          >
                            <Trash2 size={16} className="shrink-0" />
                            <span>Xóa bảng</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            <button
              type="button"
              onClick={onCreateBoard}
              className="h-24 rounded-xl border border-dashed border-white/20 bg-white/5 p-4 text-left text-white/80 transition hover:bg-white/10"
            >
              <div className="text-base font-semibold">+ Tạo bảng mới</div>
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={confirmState.open}
        title={
          confirmState.type === "archive"
            ? "Lưu trữ bảng?"
            : "Xóa bảng?"
        }
        message={
          confirmState.type === "archive"
            ? `Bảng "${confirmState.boardTitle}" sẽ được chuyển vào mục lưu trữ.`
            : `Bảng "${confirmState.boardTitle}" sẽ bị xóa luôn. Vẫn xóa chứ?`
        }
        confirmText={confirmState.type === "archive" ? "Lưu trữ" : "Xóa"}
        cancelText="Hủy"
        confirmButtonClassName={
          confirmState.type === "archive"
            ? "bg-yellow-500 hover:bg-yellow-600 text-slate-900"
            : "bg-red-500 hover:bg-red-600 text-white"
        }
        onConfirm={handleConfirmAction}
        onClose={handleCloseConfirm}
      />
    </>
  )
}

export default BoardList