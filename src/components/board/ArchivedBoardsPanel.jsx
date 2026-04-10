import { ArchiveRestore, Trash2, X } from "lucide-react"

function ArchivedBoardsPanel({
  open,
  archivedBoards,
  onClose,
  onRestoreBoard,
  onDeleteArchivedBoard,
}) {
  if (!open) return null

  return (
    <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-xl border border-white/10 bg-[#1f2430] text-white shadow-2xl">
      <div className="relative flex items-center justify-center border-b border-white/10 px-4 py-3">
        <p className="text-sm font-semibold text-white/80">Bảng đã lưu trữ</p>

        <button
          type="button"
          className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-white/70 transition hover:bg-white/10 hover:text-white"
          onClick={onClose}
        >
          <X size={18} />
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto p-2">
        {archivedBoards.length === 0 ? (
          <div className="rounded-lg px-3 py-6 text-center text-sm text-white/60">
            Chưa có bảng nào được lưu trữ
          </div>
        ) : (
          <div className="space-y-2">
            {archivedBoards.map((board) => (
              <div
                key={board.id}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
              >
                <p className="mb-3 text-sm font-semibold text-white">
                  {board.title}
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/20"
                    onClick={() => onRestoreBoard?.(board.id)}
                  >
                    <ArchiveRestore size={14} />
                    <span>Khôi phục</span>
                  </button>

                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg bg-red-500/20 px-3 py-2 text-xs font-medium text-red-200 transition hover:bg-red-500/30"
                    onClick={() => onDeleteArchivedBoard?.(board.id)}
                  >
                    <Trash2 size={14} />
                    <span>Xóa</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ArchivedBoardsPanel