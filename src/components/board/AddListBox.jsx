function AddListBox({
  isAddingList,
  setIsAddingList,
  addListRef,
  inputRef,
  newListTitle,
  setNewListTitle,
  commitAddList,
  resetAddList,
}) {
  if (!isAddingList) {
    return (
      <div
        className="w-72 px-3 py-2 rounded-xl text-sm text-white/70 bg-black/20 hover:bg-black/30 cursor-pointer shrink-0"
        onClick={() => setIsAddingList(true)}
      >
        + Thêm danh sách khác
      </div>
    )
  }

  return (
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
  )
}

export default AddListBox