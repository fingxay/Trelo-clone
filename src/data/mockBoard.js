const mockBoard = {
  id: "board-1",
  title: "Trello Clone",
  lists: [
    {
      id: "list-1",
      title: "Todo",
      cards: [
        { id: "card-1", title: "Learn React basics" },
        { id: "card-2", title: "Understand state & props" },
      ],
    },
    {
      id: "list-2",
      title: "Doing",
      cards: [{ id: "card-3", title: "Build Trello UI" }],
    },
    {
      id: "list-3",
      title: "Done",
      cards: [{ id: "card-4", title: "Setup project" }],
    },
  ],
  archivedLists: [],
  archivedCards: [],
}

export default mockBoard
