import defaultBoards from "../data/mockBoard"

export const getBoardStorageKey = (boardId) => `trello-clone-board-${boardId}`

export const fallbackBoard = defaultBoards[0]

export function normalizeChecklistItem(item) {
  return {
    id: item?.id || `check-item-${Date.now()}`,
    text: item?.text || "",
    done: Boolean(item?.done),
  }
}

export function normalizeChecklist(checklist) {
  if (!checklist || typeof checklist !== "object") {
    return {
      id: `checklist-${Date.now()}`,
      title: "Việc cần làm",
      items: [],
    }
  }

  return {
    id: checklist.id || `checklist-${Date.now()}`,
    title: checklist.title || "Việc cần làm",
    items: Array.isArray(checklist.items)
      ? checklist.items.map(normalizeChecklistItem)
      : [],
  }
}

export function normalizeChecklists(card) {
  if (Array.isArray(card?.checklists)) {
    return card.checklists.map(normalizeChecklist)
  }

  if (card?.checklist?.hasChecklist) {
    return [
      normalizeChecklist({
        id: card.checklist.id,
        title: card.checklist.title,
        items: card.checklist.items,
      }),
    ]
  }

  return []
}

export function getSafeBoard(data) {
  if (!data || typeof data !== "object") return fallbackBoard
  if (!Array.isArray(data.lists)) return fallbackBoard

  return {
    ...fallbackBoard,
    ...data,
    lists: data.lists.map((list) => ({
      ...list,
      cards: Array.isArray(list.cards)
        ? list.cards.map((card) => ({
            ...card,
            description: card.description || "",
            checklists: normalizeChecklists(card),
            labels: Array.isArray(card.labels) ? card.labels : [],
            dates: card.dates || null,
          }))
        : [],
    })),
    archivedLists: Array.isArray(data.archivedLists)
      ? data.archivedLists.map((list) => ({
          ...list,
          cards: Array.isArray(list.cards)
            ? list.cards.map((card) => ({
                ...card,
                description: card.description || "",
                checklists: normalizeChecklists(card),
                labels: Array.isArray(card.labels) ? card.labels : [],
                dates: card.dates || null,
              }))
            : [],
        }))
      : [],
    archivedCards: Array.isArray(data.archivedCards)
      ? data.archivedCards.map((item) => ({
          ...item,
          card: item?.card
            ? {
                ...item.card,
                description: item.card.description || "",
                checklists: normalizeChecklists(item.card),
                labels: Array.isArray(item.card.labels) ? item.card.labels : [],
                dates: item.card.dates || null,
              }
            : null,
        }))
      : [],
  }
}