import { MoreHorizontal, Settings, Archive, X, ArrowLeft } from "lucide-react"
import ArchivedItemsPanel from "./ArchivedItemsPanel"

function BoardHeader({
  onBack,
  title,
  isEditingBoardTitle,
  boardTitleDraft,
  setBoardTitleDraft,
  startEditBoardTitle,
  commitEditBoardTitle,
  cancelEditBoardTitle,
  boardMenuRef,
  isBoardMenuOpen,
  setIsBoardMenuOpen,
  archivedPanelRef,
  isArchivedPanelOpen,
  setIsArchivedPanelOpen,
  archivedLists,
  archivedCards,
  onRestoreList,
  onRestoreCard,
  onDeleteList,
  onDeleteCard,
}) {
  return (
    <div className="h-12 shrink-0 flex items-center justify-between px-4 text-white font-semibold bg-black/30 backdrop-blur relative">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="h-8 w-8 inline-flex items-center justify-center rounded-md text-white/80 hover:text-white hover:bg-white/10 transition"
          onClick={onBack}
        >
          <ArrowLeft size={18} />
        </button>

        {!isEditingBoardTitle ? (
          <button
            type="button"
            className="rounded-md px-2 py-1 text-left text-white hover:bg-white/10 transition"
            onClick={startEditBoardTitle}
          >
            {title}
          </button>
        ) : (
          <input
            autoFocus
            value={boardTitleDraft}
            onChange={(e) => setBoardTitleDraft(e.target.value)}
            onBlur={commitEditBoardTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitEditBoardTitle()
              if (e.key === "Escape") cancelEditBoardTitle()
            }}
            className="min-w-[220px] rounded-md border border-white/15 bg-white px-2 py-1 text-sm font-semibold text-slate-800 outline-none"
          />
        )}
      </div>

      <div className="relative" ref={boardMenuRef}>
        <button
          type="button"
          className="h-8 w-8 inline-flex items-center justify-center rounded-md text-white/80 hover:text-white hover:bg-white/10 transition"
          onClick={() => setIsBoardMenuOpen((prev) => !prev)}
        >
          <MoreHorizontal size={18} />
        </button>

        {isBoardMenuOpen && (
          <div className="absolute right-0 top-10 w-80 rounded-xl border border-white/10 bg-[#1f2430] text-white shadow-2xl overflow-hidden z-50">
            <div className="relative flex items-center justify-center px-4 py-3 border-b border-white/10">
              <p className="text-sm font-semibold text-white/80">Menu</p>

              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 inline-flex items-center justify-center rounded-md text-white/70 hover:text-white hover:bg-white/10 transition"
                onClick={() => setIsBoardMenuOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-2">
              <button
                type="button"
                className="w-full flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-left text-white/85 hover:bg-white/10 transition"
              >
                <Settings size={18} className="shrink-0" />
                <span>Cài đặt</span>
              </button>

              <button
                type="button"
                className="w-full flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-left text-white/85 hover:bg-white/10 transition"
                onClick={() => {
                  setIsArchivedPanelOpen(true)
                  setIsBoardMenuOpen(false)
                }}
              >
                <Archive size={18} className="shrink-0" />
                <span>Mục đã lưu trữ</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div ref={archivedPanelRef} className="absolute right-4 top-0">
        <ArchivedItemsPanel
          open={isArchivedPanelOpen}
          archivedLists={archivedLists || []}
          archivedCards={archivedCards || []}
          onClose={() => setIsArchivedPanelOpen(false)}
          onRestoreList={onRestoreList}
          onRestoreCard={onRestoreCard}
          onDeleteList={onDeleteList}
          onDeleteCard={onDeleteCard}
        />
      </div>
    </div>
  )
}

export default BoardHeader