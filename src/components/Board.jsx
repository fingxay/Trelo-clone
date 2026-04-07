import { useCallback, useEffect, useRef, useState } from "react"
import mockBoard from "../data/mockBoard"
import List from "./list/List"

function Board() {
  const [board, setBoard] = useState(mockBoard)

  const [isAddingList, setIsAddingList] = useState(false)
  const [newListTitle, setNewListTitle] = useState("")

  const addListRef = useRef(null)
  const inputRef = useRef(null)

  const { title, lists } = board

  /* ===== ADD CARD ===== */
  const handleAddCard = useCallback((listId, cardTitle) => {
    setBoard((prev) => ({
      ...prev,
      lists: prev.lists.map((list) =>
        list.id === listId
          ? {
              ...list,
              cards: [
                ...list.cards,
                { id: `card-${Date.now()}`, title: cardTitle },
              ],
            }
          : list
      ),
    }))
  }, [])

  /* ===== RENAME LIST ===== */
  const handleRenameList = useCallback((listId, newTitle) => {
    setBoard((prev) => ({
      ...prev,
      lists: prev.lists.map((list) =>
        list.id === listId ? { ...list, title: newTitle } : list
      ),
    }))
  }, [])

  /* ===== COPY LIST ===== */
  const handleCopyList = useCallback((sourceList, newTitle) => {
    setBoard((prev) => {
      const index = prev.lists.findIndex((l) => l.id === sourceList.id)
      if (index === -1) return prev

      const copiedList = {
        id: `list-${Date.now()}`,
        title: newTitle,
        cards: sourceList.cards.map((c) => ({
          id: `card-${Date.now()}-${Math.random()}`,
          title: c.title,
        })),
      }

      const newLists = [...prev.lists]
      newLists.splice(index + 1, 0, copiedList)

      return { ...prev, lists: newLists }
    })
  }, [])

  /* ===== MOVE LIST (CORE – DÙNG CHO DRAG & DROP SAU NÀY) ===== */
  const handleMoveList = useCallback((listId, toIndex) => {
    setBoard((prev) => {
      const fromIndex = prev.lists.findIndex((l) => l.id === listId)
      if (fromIndex === -1) return prev
      if (fromIndex === toIndex) return prev

      const newLists = [...prev.lists]
      const [moved] = newLists.splice(fromIndex, 1)
      newLists.splice(toIndex, 0, moved)

      return { ...prev, lists: newLists }
    })
  }, [])

  /* ===== ADD LIST ===== */
  const resetAddList = useCallback(() => {
    setIsAddingList(false)
    setNewListTitle("")
  }, [])

  const commitAddList = useCallback(() => {
    const trimmed = newListTitle.trim()
    if (!trimmed) {
      resetAddList()
      return
    }

    setBoard((prev) => ({
      ...prev,
      lists: [
        ...prev.lists,
        {
          id: `list-${Date.now()}`,
          title: trimmed,
          cards: [],
        },
      ],
    }))

    resetAddList()
  }, [newListTitle, resetAddList])

  /* auto focus */
  useEffect(() => {
    if (isAddingList && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isAddingList])

  /* ESC + click outside (ADD LIST) */
  useEffect(() => {
    if (!isAddingList) return

    function handleKeyDown(e) {
      if (e.key === "Escape") resetAddList()
      if (e.key === "Enter") commitAddList()
    }

    function handleClickOutside(e) {
      if (addListRef.current && !addListRef.current.contains(e.target)) {
        commitAddList()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("mousedown", handleClickOutside)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isAddingList, commitAddList, resetAddList])

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364]">
      {/* Top bar */}
      <div className="h-12 shrink-0 flex items-center px-4 text-white font-semibold bg-black/30 backdrop-blur">
        {title}
      </div>

      {/* ===== BOARD SCROLL ===== */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex gap-4 p-4 overflow-x-auto items-start">
          {lists.map((list, index) => (
            <List
              key={list.id}
              list={list}
              listIndex={index}
              totalLists={lists.length}
              onAddCard={handleAddCard}
              onRenameList={handleRenameList}
              onCopyList={handleCopyList}
              onMoveList={handleMoveList}
            />
          ))}

          {!isAddingList && (
            <div
              className="w-72 px-3 py-2 rounded-xl text-sm text-white/70 bg-black/20 hover:bg-black/30 cursor-pointer shrink-0"
              onClick={() => setIsAddingList(true)}
            >
              + Thêm danh sách khác
            </div>
          )}

          {isAddingList && (
            <div
              ref={addListRef}
              className="w-72 bg-[#101204] bg-opacity-90 rounded-xl p-2 shrink-0"
            >
              <input
                ref={inputRef}
                className="w-full rounded-md p-2 text-sm outline-none bg-white text-slate-800 mb-2"
                placeholder="Nhập tiêu đề danh sách..."
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
              />

              <div className="flex gap-2">
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded"
                  onClick={commitAddList}
                >
                  Thêm danh sách
                </button>

                <button
                  className="text-slate-300 text-xl hover:text-white"
                  onClick={resetAddList}
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Board
