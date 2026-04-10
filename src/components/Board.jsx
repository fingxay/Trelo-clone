import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import List from "./list/List"
import CardModal from "./card/CardModal"
import ConfirmModal from "./common/ConfirmModal"
import BoardHeader from "./board/BoardHeader"
import AddListBox from "./board/AddListBox"
import {
  fallbackBoard,
  getBoardStorageKey,
  getSafeBoard,
} from "../utils/boardData"
import {
  createNewCard,
  createCopiedCard,
  getActiveCardData,
  normalizeCardUpdates,
} from "../utils/boardCardData"

function Board({ board: initialBoard, onBack, onChangeBoard }) {
  const [board, setBoard] = useState(() => {
    try {
      const savedBoard = localStorage.getItem(
        getBoardStorageKey((initialBoard || fallbackBoard).id)
      )
      if (!savedBoard) return getSafeBoard(initialBoard || fallbackBoard)

      const parsedBoard = JSON.parse(savedBoard)
      return getSafeBoard(parsedBoard)
    } catch {
      return getSafeBoard(initialBoard || fallbackBoard)
    }
  })

  const [isAddingList, setIsAddingList] = useState(false)
  const [newListTitle, setNewListTitle] = useState("")
  const [dragCardOver, setDragCardOver] = useState(null)
  const [selectedCard, setSelectedCard] = useState(null)
  const [isBoardMenuOpen, setIsBoardMenuOpen] = useState(false)
  const [isArchivedPanelOpen, setIsArchivedPanelOpen] = useState(false)
  const [isEditingBoardTitle, setIsEditingBoardTitle] = useState(false)
  const [boardTitleDraft, setBoardTitleDraft] = useState("")
  const [confirmState, setConfirmState] = useState({
    open: false,
    title: "",
    message: "",
    confirmText: "Xóa",
    confirmButtonClassName: "bg-red-500 hover:bg-red-600 text-white",
    onConfirm: null,
  })

  const addListRef = useRef(null)
  const inputRef = useRef(null)
  const boardMenuRef = useRef(null)
  const archivedPanelRef = useRef(null)
  const draggedListIndexRef = useRef(null)
  const draggedCardRef = useRef(null)

  const title = board?.title || fallbackBoard.title

  const lists = useMemo(() => {
    return Array.isArray(board?.lists) ? board.lists : []
  }, [board])

  const activeCardData = useMemo(() => {
    return getActiveCardData(lists, selectedCard)
  }, [lists, selectedCard])

  const startEditBoardTitle = useCallback(() => {
    setBoardTitleDraft(title)
    setIsEditingBoardTitle(true)
  }, [title])

  const closeConfirmModal = useCallback(() => {
    setConfirmState((prev) => ({
      ...prev,
      open: false,
      onConfirm: null,
    }))
  }, [])

  const openConfirmModal = useCallback((config) => {
    setConfirmState({
      open: true,
      title: config.title || "Xác nhận",
      message: config.message || "Bạn có chắc không?",
      confirmText: config.confirmText || "Xóa",
      confirmButtonClassName:
        config.confirmButtonClassName || "bg-red-500 hover:bg-red-600 text-white",
      onConfirm: config.onConfirm || null,
    })
  }, [])

  const cancelEditBoardTitle = useCallback(() => {
    setBoardTitleDraft(title)
    setIsEditingBoardTitle(false)
  }, [title])

  const commitEditBoardTitle = useCallback(() => {
    const trimmed = boardTitleDraft.trim()

    if (!trimmed) {
      cancelEditBoardTitle()
      return
    }

    setBoard((prev) => ({
      ...prev,
      title: trimmed,
    }))
    setIsEditingBoardTitle(false)
  }, [boardTitleDraft, cancelEditBoardTitle])

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

  const handleAddCard = useCallback((listId, cardTitle) => {
    setBoard((prev) => ({
      ...prev,
      lists: prev.lists.map((list) =>
        list.id === listId
          ? {
              ...list,
              cards: [...list.cards, createNewCard(cardTitle)],
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

  const handleChangeListColor = useCallback((listId, nextColor) => {
    setBoard((prev) => ({
      ...prev,
      lists: prev.lists.map((list) =>
        list.id === listId ? { ...list, color: nextColor } : list
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
        cards: sourceList.cards.map((card, cardIndex) =>
          createCopiedCard(card, cardIndex)
        ),
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

  const handleMoveAllCardsInList = useCallback((fromListId, toListIndex) => {
    setBoard((prev) => {
      const sourceListIndex = prev.lists.findIndex((list) => list.id === fromListId)
      if (sourceListIndex === -1) return prev
      if (sourceListIndex === toListIndex) return prev

      const sourceList = prev.lists[sourceListIndex]
      if (!Array.isArray(sourceList.cards) || sourceList.cards.length === 0) return prev
      if (!prev.lists[toListIndex]) return prev

      const cardsToMove = [...sourceList.cards]

      return {
        ...prev,
        lists: prev.lists.map((list, index) => {
          if (index === sourceListIndex) {
            return {
              ...list,
              cards: [],
            }
          }

          if (index === toListIndex) {
            return {
              ...list,
              cards: [...list.cards, ...cardsToMove],
            }
          }

          return list
        }),
      }
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
                card.id === cardId ? normalizeCardUpdates(card, updates) : card
              ),
            }
      ),
    }))
  }, [])

  const handleArchiveList = useCallback((listId) => {
    setBoard((prev) => {
      const listToArchive = prev.lists.find((list) => list.id === listId)
      if (!listToArchive) return prev

      return {
        ...prev,
        lists: prev.lists.filter((list) => list.id !== listId),
        archivedLists: [
          ...(Array.isArray(prev.archivedLists) ? prev.archivedLists : []),
          {
            ...listToArchive,
            archivedAt: new Date().toISOString(),
          },
        ],
      }
    })
  }, [])

  const handleArchiveCard = useCallback((listId, cardId) => {
    setBoard((prev) => {
      const sourceList = prev.lists.find((list) => list.id === listId)
      if (!sourceList) return prev

      const cardToArchive = sourceList.cards.find((card) => card.id === cardId)
      if (!cardToArchive) return prev

      return {
        ...prev,
        lists: prev.lists.map((list) =>
          list.id !== listId
            ? list
            : {
                ...list,
                cards: list.cards.filter((card) => card.id !== cardId),
              }
        ),
        archivedCards: [
          ...(Array.isArray(prev.archivedCards) ? prev.archivedCards : []),
          {
            id: `archived-card-${cardToArchive.id}`,
            listId,
            listTitle: sourceList.title,
            archivedAt: new Date().toISOString(),
            card: {
              ...cardToArchive,
            },
          },
        ],
      }
    })

    setSelectedCard((prev) => {
      if (!prev) return prev
      if (prev.listId === listId && prev.cardId === cardId) return null
      return prev
    })
  }, [])

  const handleArchiveAllCardsInList = useCallback((listId) => {
    setBoard((prev) => {
      const sourceList = prev.lists.find((list) => list.id === listId)
      if (!sourceList || !Array.isArray(sourceList.cards) || sourceList.cards.length === 0) {
        return prev
      }

      const nextArchivedCards = [
        ...(Array.isArray(prev.archivedCards) ? prev.archivedCards : []),
        ...sourceList.cards.map((card) => ({
          id: `archived-card-${card.id}`,
          listId,
          listTitle: sourceList.title,
          archivedAt: new Date().toISOString(),
          card: {
            ...card,
          },
        })),
      ]

      return {
        ...prev,
        lists: prev.lists.map((list) =>
          list.id !== listId
            ? list
            : {
                ...list,
                cards: [],
              }
        ),
        archivedCards: nextArchivedCards,
      }
    })

    setSelectedCard((prev) => {
      if (!prev) return prev
      if (prev.listId === listId) return null
      return prev
    })
  }, [])

  const handleRestoreList = useCallback((archivedListId) => {
    setBoard((prev) => {
      const listToRestore = (Array.isArray(prev.archivedLists) ? prev.archivedLists : []).find(
        (list) => list.id === archivedListId
      )
      if (!listToRestore) return prev

      const { archivedAt: _archivedAt, ...restoredList } = listToRestore

      return {
        ...prev,
        lists: [...prev.lists, restoredList],
        archivedLists: prev.archivedLists.filter((list) => list.id !== archivedListId),
      }
    })
  }, [])

  const handleDeleteArchivedList = useCallback((archivedListId) => {
    openConfirmModal({
      title: "Xóa danh sách đã lưu trữ",
      message: "Danh sách này sẽ bị xóa vĩnh viễn. Bạn có chắc muốn xóa không?",
      confirmText: "Xóa",
      onConfirm: () => {
        setBoard((prev) => ({
          ...prev,
          archivedLists: (Array.isArray(prev.archivedLists) ? prev.archivedLists : []).filter(
            (list) => list.id !== archivedListId
          ),
        }))
        closeConfirmModal()
      },
    })
  }, [openConfirmModal, closeConfirmModal])

  const handleRestoreCard = useCallback((archivedCardId) => {
    setBoard((prev) => {
      const archivedItem = (Array.isArray(prev.archivedCards) ? prev.archivedCards : []).find(
        (item) => item.id === archivedCardId
      )
      if (!archivedItem?.card) return prev

      const hasActiveList = prev.lists.some((list) => list.id === archivedItem.listId)
      const hasArchivedList = (Array.isArray(prev.archivedLists) ? prev.archivedLists : []).some(
        (list) => list.id === archivedItem.listId
      )

      if (hasActiveList) {
        return {
          ...prev,
          lists: prev.lists.map((list) =>
            list.id !== archivedItem.listId
              ? list
              : {
                  ...list,
                  cards: list.cards.some((card) => card.id === archivedItem.card.id)
                    ? list.cards
                    : [...list.cards, archivedItem.card],
                }
          ),
          archivedCards: prev.archivedCards.filter((item) => item.id !== archivedCardId),
        }
      }

      if (hasArchivedList) {
        return {
          ...prev,
          archivedLists: prev.archivedLists.map((list) =>
            list.id !== archivedItem.listId
              ? list
              : {
                  ...list,
                  cards:
                    Array.isArray(list.cards) &&
                    list.cards.some((card) => card.id === archivedItem.card.id)
                      ? list.cards
                      : [...(Array.isArray(list.cards) ? list.cards : []), archivedItem.card],
                }
          ),
          archivedCards: prev.archivedCards.filter((item) => item.id !== archivedCardId),
        }
      }

      return prev
    })
  }, [])

  const handleDeleteArchivedCard = useCallback((archivedCardId) => {
    openConfirmModal({
      title: "Xóa thẻ đã lưu trữ",
      message: "Thẻ này sẽ bị xóa vĩnh viễn. Bạn có chắc muốn xóa không?",
      confirmText: "Xóa",
      onConfirm: () => {
        setBoard((prev) => ({
          ...prev,
          archivedCards: (Array.isArray(prev.archivedCards) ? prev.archivedCards : []).filter(
            (item) => item.id !== archivedCardId
          ),
        }))
        closeConfirmModal()
      },
    })
  }, [openConfirmModal, closeConfirmModal])

  useEffect(() => {
    if (!board?.id) return
    localStorage.setItem(getBoardStorageKey(board.id), JSON.stringify(board))
    onChangeBoard?.(board)
  }, [board, onChangeBoard])

  useEffect(() => {
    if (!isBoardMenuOpen) return

    function handleClickOutside(e) {
      if (boardMenuRef.current && !boardMenuRef.current.contains(e.target)) {
        setIsBoardMenuOpen(false)
      }
    }

    function handleKeyDown(e) {
      if (e.key === "Escape") setIsBoardMenuOpen(false)
    }

    window.addEventListener("mousedown", handleClickOutside)
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("mousedown", handleClickOutside)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isBoardMenuOpen])

  useEffect(() => {
    if (!isArchivedPanelOpen) return

    function handleClickOutside(e) {
      if (
        archivedPanelRef.current &&
        !archivedPanelRef.current.contains(e.target) &&
        boardMenuRef.current &&
        !boardMenuRef.current.contains(e.target)
      ) {
        setIsArchivedPanelOpen(false)
      }
    }

    function handleKeyDown(e) {
      if (e.key === "Escape") setIsArchivedPanelOpen(false)
    }

    window.addEventListener("mousedown", handleClickOutside)
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("mousedown", handleClickOutside)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isArchivedPanelOpen])

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
        <BoardHeader
          onBack={onBack}
          title={title}
          isEditingBoardTitle={isEditingBoardTitle}
          boardTitleDraft={boardTitleDraft}
          setBoardTitleDraft={setBoardTitleDraft}
          startEditBoardTitle={startEditBoardTitle}
          commitEditBoardTitle={commitEditBoardTitle}
          cancelEditBoardTitle={cancelEditBoardTitle}
          boardMenuRef={boardMenuRef}
          isBoardMenuOpen={isBoardMenuOpen}
          setIsBoardMenuOpen={setIsBoardMenuOpen}
          archivedPanelRef={archivedPanelRef}
          isArchivedPanelOpen={isArchivedPanelOpen}
          setIsArchivedPanelOpen={setIsArchivedPanelOpen}
          archivedLists={board.archivedLists || []}
          archivedCards={board.archivedCards || []}
          onRestoreList={handleRestoreList}
          onRestoreCard={handleRestoreCard}
          onDeleteList={handleDeleteArchivedList}
          onDeleteCard={handleDeleteArchivedCard}
        />

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
                onMoveAllCardsInList={handleMoveAllCardsInList}
                onDragListStart={handleDragListStart}
                onDragListEnter={handleDragListEnter}
                onDragListEnd={handleDragListEnd}
                onDragCardStart={handleDragCardStart}
                onDragCardEnter={handleDragCardEnter}
                onDropCardToListEnd={handleDropCardToListEnd}
                onDragCardEnd={handleDragCardEnd}
                onOpenCardModal={handleOpenCardModal}
                dragCardOver={dragCardOver}
                onArchiveList={handleArchiveList}
                onChangeListColor={handleChangeListColor}
                onArchiveAllCardsInList={handleArchiveAllCardsInList}
              />
            ))}

            <AddListBox
              isAddingList={isAddingList}
              setIsAddingList={setIsAddingList}
              addListRef={addListRef}
              inputRef={inputRef}
              newListTitle={newListTitle}
              setNewListTitle={setNewListTitle}
              commitAddList={commitAddList}
              resetAddList={resetAddList}
            />
          </div>
        </div>
      </div>

      <CardModal
        key={activeCardData ? `${activeCardData.listId}-${activeCardData.cardId}` : "empty-card"}
        card={activeCardData}
        onClose={handleCloseCardModal}
        onUpdateCard={handleUpdateCard}
        onArchiveCard={handleArchiveCard}
      />

      <ConfirmModal
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        confirmButtonClassName={confirmState.confirmButtonClassName}
        onConfirm={() => confirmState.onConfirm?.()}
        onClose={closeConfirmModal}
      />
    </>
  )
}

export default Board