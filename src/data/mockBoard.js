const defaultBoards = [
  {
    id: "board-1",
    title: "Bảng đầu tiên",
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
  },
]

export const defaultBoardId = "board-1"
export default defaultBoards