"use client"

import { useState, useRef, useEffect } from "react"
import ReactDOM from "react-dom"

const DatePicker = ({ value, onChange, name, id, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(value || "")
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showYearPicker, setShowYearPicker] = useState(false)
  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const [startYear, setStartYear] = useState(currentMonth.getFullYear() - 5)

  const datePickerRef = useRef(null)
  const calendarDropdownRef = useRef(null)
  const inputRef = useRef(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  useEffect(() => {
    setSelectedDate(value || "")
  }, [value])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      const calculatePosition = () => {
        const rect = inputRef.current.getBoundingClientRect()
        setDropdownPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
        })
      }

      calculatePosition()

      window.addEventListener("resize", calculatePosition)
      window.addEventListener("scroll", calculatePosition, true)

      return () => {
        window.removeEventListener("resize", calculatePosition)
        window.removeEventListener("scroll", calculatePosition, true)
      }
    }
  }, [isOpen, inputRef])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target) &&
        calendarDropdownRef.current &&
        !calendarDropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false)
        setShowYearPicker(false)
        setShowMonthPicker(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const formatDisplayDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }

  const handleDateSelect = (day) => {
    if (!day) return

    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    const selectedDateObj = new Date(Date.UTC(year, month, day));

    const formattedDate = selectedDateObj.toISOString().split("T")[0]

    setSelectedDate(formattedDate)
    setIsOpen(false)
    setShowYearPicker(false)
    setShowMonthPicker(false)

    const event = {
      target: {
        name: name,
        value: formattedDate,
      },
    }
    onChange(event)
  }

  const navigateMonth = (direction) => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + direction)
      return newDate
    })
  }

  const navigateYear = (direction) => {
    setStartYear((prev) => prev + direction * 12)
  }

  const isSelectedDate = (day) => {
    if (!day || !selectedDate) return false
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const dayDate = new Date(Date.UTC(year, month, day));
    const selected = new Date(selectedDate);
    return dayDate.toISOString().split('T')[0] === selected.toISOString().split('T')[0];
  }

  const isToday = (day) => {
    if (!day) return false
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const dayDate = new Date(Date.UTC(year, month, day)); // Use UTC for today's date
    const today = new Date(); // Gets current local date and time
    const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));

    return dayDate.toDateString() === todayUTC.toDateString();
  }

  const getYears = () => {
    const years = []
    for (let i = 0; i < 12; i++) {
      // Display 12 years at a time
      years.push(startYear + i)
    }
    return years
  }

  const handleYearChange = (year) => {
    setCurrentMonth(new Date(year, currentMonth.getMonth(), 1))
    setShowYearPicker(false)
  }

  const handleMonthChange = (monthIndex) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), monthIndex, 1))
    setShowMonthPicker(false)
  }

  const generateMonths = () => {
    return months.map((month, index) => ({ name: month, index }))
  }

  return (
    <div className="custom-date-picker" ref={datePickerRef}>
      <div className="date-input-wrapper" onClick={() => setIsOpen(!isOpen)}>
        <input
          type="text"
          className="register-input date-display"
          value={formatDisplayDate(selectedDate)}
          placeholder={placeholder || "Select a date"}
          readOnly
          ref={inputRef}
        />
        <div className="calendar-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>
      </div>

      {isOpen &&
        ReactDOM.createPortal(
          <div
            ref={calendarDropdownRef}
            className="calendar-dropdown"
            style={{
              position: "absolute",
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
              zIndex: 12000,
            }}
          >
            <div className="calendar-header">
              <button
                type="button"
                className="nav-button"
                onClick={() => (showYearPicker ? navigateYear(-1) : navigateMonth(-1))}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15,18 9,12 15,6"></polyline>
                </svg>
              </button>
              <div className="month-year-select-wrapper">
                {showMonthPicker ? (
                  <div className="month-picker-grid">
                    {generateMonths().map((month) => (
                      <button
                        key={month.index}
                        type="button"
                        className={`month-button ${currentMonth.getMonth() === month.index ? "selected" : ""}`}
                        onClick={() => handleMonthChange(month.index)}
                      >
                        {month.name.substring(0, 3)}
                      </button>
                    ))}
                  </div>
                ) : showYearPicker ? (
                  <div className="year-picker-grid">
                    {getYears().map((year) => (
                      <button
                        key={year}
                        type="button"
                        className={`year-button ${currentMonth.getFullYear() === year ? "selected" : ""}`}
                        onClick={() => handleYearChange(year)}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                ) : (
                  <>
                    <span onClick={() => setShowMonthPicker(true)} className="month-display">
                      {months[currentMonth.getMonth()]}
                    </span>{" "}
                    <span onClick={() => setShowYearPicker(true)} className="year-display">
                      {currentMonth.getFullYear()}
                    </span>
                  </>
                )}
              </div>
              <button
                type="button"
                className="nav-button"
                onClick={() => (showYearPicker ? navigateYear(1) : navigateMonth(1))}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9,18 15,12 9,6"></polyline>
                </svg>
              </button>
            </div>

            {!showYearPicker && !showMonthPicker && (
              <div className="calendar-grid">
                <div className="weekdays">
                  {daysOfWeek.map((day) => (
                    <div key={day} className="weekday">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="days-grid">
                  {getDaysInMonth(currentMonth).map((day, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`day-button ${day ? "active" : "inactive"} ${
                        isSelectedDate(day) ? "selected" : ""
                      } ${isToday(day) ? "today" : ""}`}
                      onClick={() => handleDateSelect(day)}
                      disabled={!day}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  )
}

export default DatePicker