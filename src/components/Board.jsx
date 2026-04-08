import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import mockBoard from "../data/mockBoard"
import List from "./list/List"
import CardModal from "./card/CardModal"

const BOARD_STORAGE_KEY = "trello-clone-board"

function getSafeBoard(data) {
  if (!data || typeof data !== "object") return mockBoard
  if (!Array.isArray(data.lists)) return mockBoard

  return {
    ...mockBoard,
    ...data,
    lists: data.lists.map((list) => ({
      ...list,
      cards: Array.isArray(list.cards)
        ? list.cards.map((card) => ({
            ...card,
            description: card.description || "",
          }))
        : [],
    })),
  }
}

function Board() {
  const [board, setBoard] = useState(() => {
    try {
      const savedBoard = localStorage.getItem(BOARD_STORAGE_KEY)
      if (!savedBoard) return getSafeBoard(mockBoard)

      const parsedBoard = JSON.parse(savedBoard)
      return getSafeBoard(parsedBoard)
    } catch {
      return getSafeBoard(mockBoard)
    }
  })

  const [isAddingList, setIsAddingList] = useState(false)
  const [newListTitle, setNewListTitle] = useState("")
  const [dragCardOver, setDragCardOver] = useState(null)
  const [selectedCard, setSelectedCard] = useState(null)

  const addListRef = useRef(null)
  const inputRef = useRef(null)
  const draggedListIndexRef = useRef(null)
  const draggedCardRef = useRef(null)

  const title = board?.title || mockBoard.title
  const lists = useMemo(() => {
    return Array.isArray(board?.lists) ? board.lists : []
  }, [board])

  useEffect(() => {
    localStorage.setItem(BOARD_STORAGE_KEY, JSON.stringify(board))
  }, [board])

  const handleAddCard = useCallback((listId, cardTitle) => {
    setBoard((prev) => ({
      ...prev,
      lists: prev.lists.map((list) =>
        list.id === listId
          ? {
              ...list,
              cards: [
                ...list.cards,
                {
                  id: `card-${Date.now()}`,
                  title: cardTitle,
                  description: "",
                },
              ],
            }
          : list
      ),
    }))
  }, [])

  const handleRenameList = useCallback((listId, newTitle) => {
    setBoard((prev) => ({
      ...prev,
      lists: prev.lists.map((list) =>
        list.id === listId ? { ...list, title: newTitle } : list
      ),
    }))
  }, [])

  const handleCopyList = useCallback((sourceList, newTitle) => {
    setBoard((prev) => {
      const index = prev.lists.findIndex((l) => l.id === sourceList.id)
      if (index === -1) return prev

      const copiedList = {
        id: `list-${Date.now()}`,
        title: newTitle,
        cards: sourceList.cards.map((c, index) => ({
          id: `card-${Date.now()}-${index}`,
          title: c.title,
          description: c.description || "",
        })),
      }

      const newLists = [...prev.lists]
      newLists.splice(index + 1, 0, copiedList)

      return { ...prev, lists: newLists }
    })
  }, [])

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

  const handleDragListStart = useCallback((fromIndex) => {
    draggedListIndexRef.current = fromIndex
  }, [])

  const handleDragListEnter = useCallback((toIndex) => {
    const fromIndex = draggedListIndexRef.current

    if (fromIndex === null || fromIndex === toIndex) return

    setBoard((prev) => {
      const newLists = [...prev.lists]
      const [moved] = newLists.splice(fromIndex, 1)
      newLists.splice(toIndex, 0, moved)
      return { ...prev, lists: newLists }
    })

    draggedListIndexRef.current = toIndex
  }, [])

  const handleDragListEnd = useCallback(() => {
    draggedListIndexRef.current = null
  }, [])

  const handleDragCardStart = useCallback((listId, cardIndex) => {
    draggedCardRef.current = { listId, cardIndex }
    setDragCardOver(null)
  }, [])

  const handleDragCardEnter = useCallback((listId, cardIndex) => {
    if (!draggedCardRef.current) return

    const dragged = draggedCardRef.current

    if (dragged.listId === listId && dragged.cardIndex === cardIndex) {
      setDragCardOver(null)
      return
    }

    setDragCardOver((prev) => {
      if (prev?.listId === listId && prev?.cardIndex === cardIndex) return prev
      return { listId, cardIndex }
    })
  }, [])

  const handleDropCardToListEnd = useCallback((listId) => {
    if (!draggedCardRef.current) return

    setDragCardOver((prev) => {
      if (prev?.listId === listId && prev?.cardIndex === null) return prev
      return { listId, cardIndex: null }
    })
  }, [])

  const handleCommitCardDrop = useCallback(() => {
    const dragged = draggedCardRef.current
    const over = dragCardOver

    if (!dragged || !over) {
      draggedCardRef.current = null
      setDragCardOver(null)
      return
    }

    const { listId: fromListId, cardIndex: fromCardIndex } = dragged
    const { listId: toListId, cardIndex: rawToCardIndex } = over

    setBoard((prev) => {
      const sourceListIndex = prev.lists.findIndex((list) => list.id === fromListId)
      const targetListIndex = prev.lists.findIndex((list) => list.id === toListId)

      if (sourceListIndex === -1 || targetListIndex === -1) return prev

      const sourceList = prev.lists[sourceListIndex]
      if (!sourceList.cards[fromCardIndex]) return prev

      const nextLists = prev.lists.map((list) => ({
        ...list,
        cards: [...list.cards],
      }))

      const [movedCard] = nextLists[sourceListIndex].cards.splice(fromCardIndex, 1)

      let insertIndex =
        rawToCardIndex === null
          ? nextLists[targetListIndex].cards.length
          : rawToCardIndex

      if (fromListId === toListId && fromCardIndex < insertIndex) {
        insertIndex -= 1
      }

      if (insertIndex < 0) insertIndex = 0
      if (insertIndex > nextLists[targetListIndex].cards.length) {
        insertIndex = nextLists[targetListIndex].cards.length
      }

      const sameListSameIndex =
        fromListId === toListId && insertIndex === fromCardIndex

      if (sameListSameIndex) return prev

      nextLists[targetListIndex].cards.splice(insertIndex, 0, movedCard)

      return {
        ...prev,
        lists: nextLists,
      }
    })

    draggedCardRef.current = null
    setDragCardOver(null)
  }, [dragCardOver])

  const handleDragCardEnd = useCallback(() => {
    handleCommitCardDrop()
  }, [handleCommitCardDrop])

  const handleOpenCardModal = useCallback((list, card) => {
    setSelectedCard({
      listId: list.id,
      cardId: card.id,
    })
  }, [])

  const handleCloseCardModal = useCallback(() => {
    setSelectedCard(null)
  }, [])

  const handleUpdateCard = useCallback((listId, cardId, updates) => {
    setBoard((prev) => ({
      ...prev,
      lists: prev.lists.map((list) =>
        list.id !== listId
          ? list
          : {
              ...list,
              cards: list.cards.map((card) =>
                card.id === cardId ? { ...card, ...updates } : card
              ),
            }
      ),
    }))
  }, [])

  const activeCardData = useMemo(() => {
    if (!selectedCard) return null

    const list = lists.find((item) => item.id === selectedCard.listId)
    if (!list) return null

    const card = list.cards.find((item) => item.id === selectedCard.cardId)
    if (!card) return null

    return {
      listId: list.id,
      listTitle: list.title,
      cardId: card.id,
      cardTitle: card.title,
      description: card.description || "",
    }
  }, [lists, selectedCard])

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

  useEffect(() => {
    if (isAddingList && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isAddingList])

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

  useEffect(() => {
    if (!selectedCard) return

    function handleKeyDown(e) {
      if (e.key === "Escape") handleCloseCardModal()
    }

    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [selectedCard, handleCloseCardModal])

  return (
    <>
      <div className="h-screen flex flex-col bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364]">
        <div className="h-12 shrink-0 flex items-center px-4 text-white font-semibold bg-black/30 backdrop-blur">
          {title}
        </div>

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
                onDragListStart={handleDragListStart}
                onDragListEnter={handleDragListEnter}
                onDragListEnd={handleDragListEnd}
                onDragCardStart={handleDragCardStart}
                onDragCardEnter={handleDragCardEnter}
                onDropCardToListEnd={handleDropCardToListEnd}
                onDragCardEnd={handleDragCardEnd}
                onOpenCardModal={handleOpenCardModal}
                dragCardOver={dragCardOver}
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

      <CardModal
        key={activeCardData ? `${activeCardData.listId}-${activeCardData.cardId}` : "empty-card"}
        card={activeCardData}
        onClose={handleCloseCardModal}
        onUpdateCard={handleUpdateCard}
      />
    </>
  )
}

export default Board