import { useMemo, useState } from "react"

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getStartDayIndex(year, month) {
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1
}

function isSameDate(dateA, dateB) {
  if (!dateA || !dateB) return false

  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  )
}

function pad(value) {
  return String(value).padStart(2, "0")
}

function formatDateInput(date) {
  if (!date) return ""
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`
}

function formatTimeInput(date) {
  if (!date) return "09:59"
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function addDays(date, amount) {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

function parseDateString(value) {
  if (!value?.trim()) return null

  const parts = value.split("/")
  if (parts.length !== 3) return null

  const day = Number(parts[0])
  const month = Number(parts[1]) - 1
  const year = Number(parts[2])

  if (
    Number.isNaN(day) ||
    Number.isNaN(month) ||
    Number.isNaN(year) ||
    day <= 0 ||
    month < 0 ||
    month > 11
  ) {
    return null
  }

  const date = new Date(year, month, day)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null
  }

  return date
}

function parseTimeString(value) {
  if (!value?.trim()) return { hours: 9, minutes: 59 }

  const parts = value.split(":")
  if (parts.length !== 2) return null

  const hours = Number(parts[0])
  const minutes = Number(parts[1])

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null
  }

  return { hours, minutes }
}

function buildDateTime(dateString, timeString) {
  const date = parseDateString(dateString)
  const time = parseTimeString(timeString)

  if (!date || !time) return null

  date.setHours(time.hours, time.minutes, 0, 0)
  return date
}

function CardDatePopover({
  maxHeight,
  value,
  onSave,
  onRemove,
  onClose,
}) {
  const today = useMemo(() => new Date(), [])
  const tomorrow = useMemo(() => addDays(today, 1), [today])

  const initialStartDate = value?.startDate ? new Date(value.startDate) : null
  const initialDueDate = value?.dueDate ? new Date(value.dueDate) : tomorrow

  const [viewDate, setViewDate] = useState(
    new Date(
      initialDueDate.getFullYear(),
      initialDueDate.getMonth(),
      1
    )
  )
  const [selectedDate, setSelectedDate] = useState(initialDueDate)

  const [startDateEnabled, setStartDateEnabled] = useState(Boolean(initialStartDate))
  const [dueDateEnabled, setDueDateEnabled] = useState(Boolean(initialDueDate))

  const [startDateValue, setStartDateValue] = useState(
    initialStartDate ? formatDateInput(initialStartDate) : ""
  )
  const [dueDateValue, setDueDateValue] = useState(formatDateInput(initialDueDate))
  const [dueTimeValue, setDueTimeValue] = useState(formatTimeInput(initialDueDate))

  const monthLabel = `Tháng ${viewDate.getMonth() + 1} ${viewDate.getFullYear()}`
  const weekDays = ["Th2", "Th3", "Th4", "Th5", "Th6", "Th7", "CN"]

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()
    const startDayIndex = getStartDayIndex(year, month)
    const daysInMonth = getDaysInMonth(year, month)

    const prevMonthDate = new Date(year, month - 1, 1)
    const prevMonthDays = getDaysInMonth(
      prevMonthDate.getFullYear(),
      prevMonthDate.getMonth()
    )

    const days = []

    for (let i = startDayIndex - 1; i >= 0; i -= 1) {
      days.push({
        key: `prev-${i}`,
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false,
      })
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      days.push({
        key: `current-${day}`,
        date: new Date(year, month, day),
        isCurrentMonth: true,
      })
    }

    while (days.length < 42) {
      const nextDay = days.length - (startDayIndex + daysInMonth) + 1
      days.push({
        key: `next-${nextDay}`,
        date: new Date(year, month + 1, nextDay),
        isCurrentMonth: false,
      })
    }

    return days
  }, [viewDate])

  const handlePickDate = (date) => {
    setSelectedDate(date)

    if (startDateEnabled && !startDateValue.trim()) {
      setStartDateValue(formatDateInput(date))
      return
    }

    setDueDateEnabled(true)
    setDueDateValue(formatDateInput(date))
  }

  const handleToggleStartDate = (checked) => {
    setStartDateEnabled(checked)

    if (checked) {
      if (!startDateValue.trim()) {
        setStartDateValue(formatDateInput(today))
      }
      return
    }

    setStartDateValue("")
  }

  const handleToggleDueDate = (checked) => {
    setDueDateEnabled(checked)

    if (checked) {
      if (!dueDateValue.trim()) {
        setDueDateValue(formatDateInput(tomorrow))
      }
      return
    }

    setDueDateValue("")
  }

  const handleSave = () => {
    const nextStartDate =
      startDateEnabled && startDateValue.trim()
        ? buildDateTime(startDateValue, "00:00")
        : null

    const nextDueDate =
      dueDateEnabled && dueDateValue.trim()
        ? buildDateTime(dueDateValue, dueTimeValue)
        : null

    if (dueDateEnabled && !nextDueDate) return
    if (startDateEnabled && !nextStartDate) return

    onSave?.({
      startDate: nextStartDate ? nextStartDate.toISOString() : null,
      dueDate: nextDueDate ? nextDueDate.toISOString() : null,
    })

    onClose?.()
  }

  const handleRemove = () => {
    setStartDateEnabled(false)
    setDueDateEnabled(false)
    setStartDateValue("")
    setDueDateValue("")
    setDueTimeValue("09:59")

    onRemove?.()
    onClose?.()
  }

  return (
    <div
      className="
        w-[360px]
        rounded-xl
        border border-white/10
        bg-[#2c333a]
        text-white
        shadow-2xl
        overflow-hidden
      "
    >
      <div
        className="overflow-y-auto p-4"
        style={{ maxHeight: maxHeight || "calc(100vh - 32px)" }}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="w-5" />
          <h4 className="text-base font-semibold text-white/90">Ngày</h4>
          <button
            className="text-xl text-white/60 hover:text-white"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="mb-4 flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <button
              className="rounded-md px-2 py-1 text-white/70 hover:bg-white/10 hover:text-white"
              onClick={() =>
                setViewDate(
                  new Date(viewDate.getFullYear() - 1, viewDate.getMonth(), 1)
                )
              }
            >
              ≪
            </button>
            <button
              className="rounded-md px-2 py-1 text-white/70 hover:bg-white/10 hover:text-white"
              onClick={() =>
                setViewDate(
                  new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1)
                )
              }
            >
              ‹
            </button>
          </div>

          <div className="text-[28px] font-semibold leading-none">
            {monthLabel}
          </div>

          <div className="flex items-center gap-2">
            <button
              className="rounded-md px-2 py-1 text-white/70 hover:bg-white/10 hover:text-white"
              onClick={() =>
                setViewDate(
                  new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1)
                )
              }
            >
              ›
            </button>
            <button
              className="rounded-md px-2 py-1 text-white/70 hover:bg-white/10 hover:text-white"
              onClick={() =>
                setViewDate(
                  new Date(viewDate.getFullYear() + 1, viewDate.getMonth(), 1)
                )
              }
            >
              ≫
            </button>
          </div>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-y-2 text-center text-sm font-semibold text-white/65">
          {weekDays.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        <div className="mb-6 grid grid-cols-7 gap-y-2 text-center">
          {calendarDays.map((day) => {
            const isSelected = isSameDate(day.date, selectedDate)

            return (
              <button
                key={day.key}
                className={`
                  mx-auto flex h-10 w-10 items-center justify-center rounded-md text-base transition
                  ${
                    day.isCurrentMonth
                      ? "text-white hover:bg-white/10"
                      : "text-white/35 hover:bg-white/5"
                  }
                  ${
                    isSelected
                      ? "bg-[#0c66e4] text-white hover:bg-[#0c66e4]"
                      : ""
                  }
                `}
                onClick={() => handlePickDate(day.date)}
              >
                {day.date.getDate()}
              </button>
            )
          })}
        </div>

        <div className="mb-4">
          <p className="mb-2 text-sm font-semibold text-white/80">
            Ngày bắt đầu
          </p>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={startDateEnabled}
              onChange={(e) => handleToggleStartDate(e.target.checked)}
              className="h-4 w-4 rounded"
            />
            <input
              value={startDateValue}
              onChange={(e) => setStartDateValue(e.target.value)}
              placeholder="N/T/TNNNN"
              disabled={!startDateEnabled}
              className="flex-1 rounded-md border border-white/10 bg-[#1f2428] px-3 py-2 text-sm text-white outline-none placeholder:text-white/35 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        <div className="mb-6">
          <p className="mb-2 text-sm font-semibold text-white/80">
            Ngày hết hạn
          </p>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={dueDateEnabled}
              onChange={(e) => handleToggleDueDate(e.target.checked)}
              className="h-4 w-4 rounded"
            />
            <input
              value={dueDateValue}
              onChange={(e) => setDueDateValue(e.target.value)}
              disabled={!dueDateEnabled}
              className="flex-1 rounded-md border border-white/10 bg-[#1f2428] px-3 py-2 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
            <input
              value={dueTimeValue}
              onChange={(e) => setDueTimeValue(e.target.value)}
              disabled={!dueDateEnabled}
              className="w-28 rounded-md border border-white/10 bg-[#1f2428] px-3 py-2 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        <button
          className="mb-3 w-full rounded-md bg-[#579dff] px-4 py-2.5 text-sm font-semibold text-[#172b4d] hover:brightness-110"
          onClick={handleSave}
        >
          Lưu
        </button>

        <button
          className="w-full rounded-md bg-white/10 px-4 py-2.5 text-sm font-semibold text-white/90 hover:bg-white/15"
          onClick={handleRemove}
        >
          Gỡ bỏ
        </button>
      </div>
    </div>
  )
}

export default CardDatePopover