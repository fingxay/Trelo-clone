import { useCallback, useEffect, useRef, useState } from "react"
import Card from "./Card"
import AddCard from "./AddCard"
import ListMenu from "./ListMenu"

function List({
  list,
  listIndex,
  totalLists,
  onAddCard,
  onRenameList,
  onCopyList,
  onMoveList,
  onDragListStart,
  onDragListEnter,
  onDragListEnd,
  onDragCardStart,
  onDragCardEnter,
  onDropCardToListEnd,
  onDragCardEnd,
  dragCardOver,
}) {
  const { id, title, cards } = list

  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [tempTitle, setTempTitle] = useState(title)
  const [menuPosition, setMenuPosition] = useState(null)
  const [isDragging, setIsDragging] = useState(false)

  const inputRef = useRef(null)
  const headerRef = useRef(null)
  const menuButtonRef = useRef(null)
  const addCardRef = useRef(null)

  const handleAddCard = useCallback(
    (cardTitle) => {
      onAddCard(id, cardTitle)
    },
    [id, onAddCard]
  )

  const commitRename = useCallback(() => {
    const trimmed = tempTitle.trim()
    if (trimmed && trimmed !== title) {
      onRenameList?.(id, trimmed)
    }
    setIsEditingTitle(false)
    setTempTitle(trimmed || title)
  }, [tempTitle, title, id, onRenameList])

  const cancelRename = useCallback(() => {
    setIsEditingTitle(false)
    setTempTitle(title)
  }, [title])

  useEffect(() => {
    setTempTitle(title)
  }, [title])

  useEffect(() => {
    if (isEditingTitle && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditingTitle])

  useEffect(() => {
    if (!isEditingTitle) return

    function handleMouseDown(e) {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        commitRename()
      }
    }

    window.addEventListener("mousedown", handleMouseDown)
    return () => window.removeEventListener("mousedown", handleMouseDown)
  }, [isEditingTitle, commitRename])

  const isDropAtEnd = dragCardOver?.listId === id && dragCardOver?.cardIndex === null

  return (
    <div
      draggable={!isEditingTitle}
      onDragStart={(e) => {
        if (isEditingTitle) return
        if (e.target.closest("[data-card-dragging='true']")) return

        e.dataTransfer.effectAllowed = "move"
        e.dataTransfer.setData("text/plain", id)
        setIsDragging(true)
        onDragListStart?.(listIndex)
      }}
      onDragEnter={(e) => {
        if (e.target.closest("[data-card-dragging='true']")) return
        e.preventDefault()
        onDragListEnter?.(listIndex)
      }}
      onDragOver={(e) => {
        e.preventDefault()
      }}
      onDragEnd={() => {
        setIsDragging(false)
        onDragListEnd?.()
      }}
      className={`
        w-72
        shrink-0
        bg-[#101204] bg-opacity-90
        rounded-xl
        px-2 py-2
        flex flex-col
        self-start
        transition
        ${isDragging ? "opacity-50 rotate-1" : "opacity-100"}
      `}
    >
      <div
        ref={headerRef}
        className="
          flex items-center justify-between
          px-2 py-1 mb-1
          cursor-pointer
        "
        onClick={() => {
          if (!isEditingTitle) setIsEditingTitle(true)
        }}
      >
        {!isEditingTitle && (
          <span className="text-white text-sm font-semibold truncate">
            {title}
          </span>
        )}

        {isEditingTitle && (
          <input
            ref={inputRef}
            className="
              w-full
              text-sm font-semibold
              rounded
              px-2 py-1
              outline-none
              bg-[#222]
              text-white
            "
            value={tempTitle}
            onChange={(e) => setTempTitle(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename()
              if (e.key === "Escape") cancelRename()
            }}
          />
        )}

        <button
          ref={menuButtonRef}
          className="
            w-7 h-7
            flex items-center justify-center
            rounded
            text-white/40
            hover:text-white/70
            hover:bg-white/10
          "
          onClick={(e) => {
            e.stopPropagation()
            const rect = menuButtonRef.current.getBoundingClientRect()
            setMenuPosition({
              top: rect.bottom + 4,
              left: rect.left,
            })
          }}
        >
          <svg width="14" height="4" viewBox="0 0 16 4">
            <circle cx="2" cy="2" r="1.5" fill="currentColor" />
            <circle cx="8" cy="2" r="1.5" fill="currentColor" />
            <circle cx="14" cy="2" r="1.5" fill="currentColor" />
          </svg>
        </button>
      </div>

      <div
        className="flex flex-col gap-2 px-1 max-h-[60vh] overflow-y-auto min-h-[24px]"
        onDragOver={(e) => {
          e.preventDefault()
        }}
        onDragEnter={(e) => {
          e.preventDefault()
          if (cards.length === 0) {
            onDropCardToListEnd?.(id)
          }
        }}
        onDrop={(e) => {
          e.preventDefault()
          onDragCardEnd?.()
        }}
      >
        {cards.map((card, cardIndex) => {
          const showPlaceholder =
            dragCardOver?.listId === id && dragCardOver?.cardIndex === cardIndex

          return (
            <div key={card.id}>
              {showPlaceholder && (
                <div className="h-2 rounded-md bg-sky-400/80 mb-2" />
              )}

              <div
                onDragEnter={(e) => {
                  e.preventDefault()
                  onDragCardEnter?.(id, cardIndex)
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                <Card
                  card={card}
                  onDragStart={() => onDragCardStart?.(id, cardIndex)}
                  onDragEnd={() => onDragCardEnd?.()}
                />
              </div>
            </div>
          )
        })}

        {isDropAtEnd && <div className="h-2 rounded-md bg-sky-400/80" />}

        {cards.length === 0 && isDropAtEnd && (
          <div className="h-16 rounded-lg border-2 border-dashed border-sky-400/70 bg-sky-400/10" />
        )}
      </div>

      <div className="mt-2 px-1">
        <AddCard ref={addCardRef} onAdd={handleAddCard} />
      </div>

      {menuPosition && (
        <ListMenu
          position={menuPosition}
          listTitle={title}
          listIndex={listIndex}
          totalLists={totalLists}
          onClose={() => setMenuPosition(null)}
          onAddCard={() => {
            setMenuPosition(null)
            addCardRef.current?.open()
          }}
          onCopyList={(newTitle) => {
            setMenuPosition(null)
            onCopyList?.(list, newTitle)
          }}
          onMoveList={(toIndex) => {
            setMenuPosition(null)
            onMoveList?.(list.id, toIndex)
          }}
        />
      )}
    </div>
  )
}

export default List