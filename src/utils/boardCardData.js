import { normalizeChecklist, normalizeChecklists } from "./boardData"

export function createNewCard(cardTitle) {
  return {
    id: `card-${Date.now()}`,
    title: cardTitle,
    description: "",
    checklists: [],
    labels: [],
    dates: null,
  }
}

export function createCopiedCard(card, index) {
  return {
    id: `card-${Date.now()}-${index}`,
    title: card.title,
    description: card.description || "",
    checklists: normalizeChecklists(card),
    labels: Array.isArray(card.labels) ? card.labels : [],
    dates: card.dates || null,
  }
}

export function normalizeCardUpdates(card, updates) {
  return {
    ...card,
    ...updates,
    checklists:
      updates.checklists !== undefined
        ? Array.isArray(updates.checklists)
          ? updates.checklists.map(normalizeChecklist)
          : []
        : normalizeChecklists(card),
    labels:
      updates.labels !== undefined
        ? Array.isArray(updates.labels)
          ? updates.labels
          : []
        : Array.isArray(card.labels)
          ? card.labels
          : [],
  }
}

export function getActiveCardData(lists, selectedCard) {
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
    checklists: normalizeChecklists(card),
    labels: Array.isArray(card.labels) ? card.labels : [],
    dates: card.dates || null,
  }
}