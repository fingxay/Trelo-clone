import { useCallback, useEffect, useMemo, useState } from "react"
import Board from "./components/Board"
import BoardList from "./components/BoardList"
import defaultBoards from "./data/mockBoard"

const BOARDS_STORAGE_KEY = "trello-clone-boards"
const ARCHIVED_BOARDS_STORAGE_KEY = "trello-clone-archived-boards"

function App() {
  const [boards, setBoards] = useState(() => {
    try {
      const savedBoards = localStorage.getItem(BOARDS_STORAGE_KEY)
      if (!savedBoards) return defaultBoards

      const parsedBoards = JSON.parse(savedBoards)
      return Array.isArray(parsedBoards) && parsedBoards.length > 0
        ? parsedBoards
        : defaultBoards
    } catch {
      return defaultBoards
    }
  })

  const [archivedBoards, setArchivedBoards] = useState(() => {
    try {
      const savedArchivedBoards = localStorage.getItem(ARCHIVED_BOARDS_STORAGE_KEY)
      if (!savedArchivedBoards) return []

      const parsedArchivedBoards = JSON.parse(savedArchivedBoards)
      return Array.isArray(parsedArchivedBoards) ? parsedArchivedBoards : []
    } catch {
      return []
    }
  })

  const [selectedBoardId, setSelectedBoardId] = useState(null)

  const selectedBoard = useMemo(() => {
    return boards.find((board) => board.id === selectedBoardId) || null
  }, [boards, selectedBoardId])

  const handleChangeBoard = useCallback((updatedBoard) => {
    setBoards((prev) =>
      prev.map((board) => (board.id === updatedBoard.id ? updatedBoard : board))
    )
  }, [])

  const handleCreateBoard = () => {
    const newBoard = {
      id: `board-${Date.now()}`,
      title: `Bảng mới ${boards.length + 1}`,
      lists: [],
      archivedLists: [],
      archivedCards: [],
    }

    setBoards((prev) => [...prev, newBoard])
    setSelectedBoardId(newBoard.id)
  }

  const handleArchiveBoard = (boardId) => {
    const boardToArchive = boards.find((board) => board.id === boardId)
    if (!boardToArchive) return

    setArchivedBoards((prevArchivedBoards) => {
      const alreadyExists = prevArchivedBoards.some((board) => board.id === boardId)
      if (alreadyExists) return prevArchivedBoards

      return [
        ...prevArchivedBoards,
        {
          ...boardToArchive,
          archivedAt: new Date().toISOString(),
        },
      ]
    })

    setBoards((prevBoards) => prevBoards.filter((board) => board.id !== boardId))

    if (selectedBoardId === boardId) {
      setSelectedBoardId(null)
    }
  }

  const handleDeleteBoard = (boardId) => {
    setBoards((prevBoards) => {
      if (selectedBoardId === boardId) {
        setSelectedBoardId(null)
      }

      return prevBoards.filter((board) => board.id !== boardId)
    })
  }

  const handleRestoreBoard = (boardId) => {
    setArchivedBoards((prevArchivedBoards) => {
      const boardToRestore = prevArchivedBoards.find((board) => board.id === boardId)
      if (!boardToRestore) return prevArchivedBoards

      const { archivedAt: _archivedAt, ...restoredBoard } = boardToRestore

      setBoards((prevBoards) => {
        const alreadyExists = prevBoards.some((board) => board.id === restoredBoard.id)
        if (alreadyExists) return prevBoards
        return [...prevBoards, restoredBoard]
      })

      return prevArchivedBoards.filter((board) => board.id !== boardId)
    })
  }

  const handleDeleteArchivedBoard = (boardId) => {
    setArchivedBoards((prevArchivedBoards) =>
      prevArchivedBoards.filter((board) => board.id !== boardId)
    )
  }

  useEffect(() => {
    localStorage.setItem(BOARDS_STORAGE_KEY, JSON.stringify(boards))
  }, [boards])

  useEffect(() => {
    localStorage.setItem(
      ARCHIVED_BOARDS_STORAGE_KEY,
      JSON.stringify(archivedBoards)
    )
  }, [archivedBoards])

  if (!selectedBoard) {
    return (
      <BoardList
        boards={boards}
        selectedBoardId={null}
        onSelectBoard={setSelectedBoardId}
        onCreateBoard={handleCreateBoard}
        onArchiveBoard={handleArchiveBoard}
        onDeleteBoard={handleDeleteBoard}
        archivedBoards={archivedBoards}
        onRestoreBoard={handleRestoreBoard}
        onDeleteArchivedBoard={handleDeleteArchivedBoard}
      />
    )
  }

  return (
    <Board
      key={selectedBoard.id}
      board={selectedBoard}
      onBack={() => setSelectedBoardId(null)}
      onChangeBoard={handleChangeBoard}
    />
  )
}

export default App