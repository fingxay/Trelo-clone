function ConfirmModal({
  open,
  title = "Xác nhận",
  message = "Bạn có chắc không?",
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  confirmButtonClassName = "bg-red-500 hover:bg-red-600 text-white",
  onConfirm,
  onClose,
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1f2430] text-white shadow-2xl">
        <div className="border-b border-white/10 px-5 py-4">
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>

        <div className="px-5 py-4">
          <p className="text-sm leading-6 text-white/80">{message}</p>
        </div>

        <div className="flex justify-end gap-3 px-5 py-4">
          <button
            type="button"
            className="rounded-lg px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition"
            onClick={onClose}
          >
            {cancelText}
          </button>

          <button
            type="button"
            className={`rounded-lg px-4 py-2 text-sm transition ${confirmButtonClassName}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal