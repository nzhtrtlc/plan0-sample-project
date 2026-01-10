import { useState, useRef, useEffect, useMemo } from "react";
import { Input } from "./Input";

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  tabIndex?: number;
  id?: string;
  name?: string;
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const DAYS_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const toISO = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const parseISO = (v: string) => {
  const [y, m, d] = v.split("-").map(Number);
  return y ? new Date(y, m - 1, d) : null;
};

export function DatePicker({
  value,
  onChange,
  disabled,
  placeholder = "Select date",
  ...props
}: DatePickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [viewMode, setViewMode] = useState<"calendar" | "year">("calendar");

  const selectedDate = useMemo(() => parseISO(value) || new Date(), [value]);
  const [viewDate, setViewDate] = useState(selectedDate);

  // Years from current year down to 2000
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from(
      { length: currentYear - 2000 + 1 },
      (_, i) => currentYear - i
    );
  }, []);

  useEffect(() => {
    if (showCalendar) {
      setViewDate(selectedDate);
      setViewMode("calendar");
    }
  }, [showCalendar, selectedDate]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) =>
      !containerRef.current?.contains(e.target as Node) &&
      setShowCalendar(false);
    if (showCalendar) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [showCalendar]);

  const calendarGrid = useMemo(() => {
    const y = viewDate.getFullYear(),
      m = viewDate.getMonth();
    const firstDay = new Date(y, m, 1).getDay();
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    return Array.from({ length: 42 }, (_, i) => new Date(y, m, i - offset + 1));
  }, [viewDate]);

  const updateDate = (d: Date) => {
    onChange(toISO(d));
    setShowCalendar(false);
  };

  const formatDisplay = (d: Date) =>
    `${DAYS_WEEK[d.getDay() === 0 ? 6 : d.getDay() - 1]}, ${
      MONTHS[d.getMonth()]
    } ${d.getDate()}, ${d.getFullYear()}`;

  const QuickBtn = ({
    label,
    days,
    icon,
  }: {
    label: string;
    days: number;
    icon: React.ReactNode;
  }) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return (
      <button
        type="button"
        onClick={() => updateDate(d)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 flex items-center justify-center text-gray-900 dark:text-gray-100">
            {icon}
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {label}
          </span>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {formatDisplay(d)}
        </span>
      </button>
    );
  };

  return (
    <div ref={containerRef} className="relative">
      <Input
        {...props}
        readOnly
        value={value ? formatDisplay(selectedDate) : ""}
        onClick={() => !disabled && setShowCalendar(true)}
        onFocus={() => !disabled && setShowCalendar(true)}
        disabled={disabled}
        placeholder={placeholder}
      />

      {showCalendar && (
        <div className="absolute z-50 mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4 w-80">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() =>
                setViewMode(viewMode === "year" ? "calendar" : "year")
              }
              className="text-lg font-semibold text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded transition-colors cursor-pointer flex items-center gap-1"
            >
              {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
              <svg
                className={`w-4 h-4 transition-transform ${
                  viewMode === "year" ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M19 9l-7 7-7-7"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {viewMode === "calendar" && (
              <div className="flex gap-1">
                {[-1, 1].map((dir) => (
                  <button
                    key={dir}
                    type="button"
                    onClick={() =>
                      setViewDate(
                        new Date(
                          viewDate.getFullYear(),
                          viewDate.getMonth() + dir,
                          1
                        )
                      )
                    }
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d={dir < 0 ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                ))}
              </div>
            )}
          </div>

          {viewMode === "calendar" ? (
            <>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS_WEEK.map((d) => (
                  <div
                    key={d}
                    className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2"
                  >
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {calendarGrid.map((date, i) => {
                  const isCurrentMonth =
                    date.getMonth() === viewDate.getMonth();
                  const isSelected = toISO(date) === value;
                  const isToday = toISO(date) === toISO(new Date());
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => isCurrentMonth && updateDate(date)}
                      className={`relative aspect-square flex items-center justify-center rounded-full text-sm transition-colors cursor-pointer
                        ${
                          !isCurrentMonth
                            ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                            : "text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }
                        ${
                          isSelected
                            ? "bg-blue-500 text-white hover:bg-blue-600"
                            : ""
                        }
                        ${
                          isToday && !isSelected
                            ? "text-red-500 dark:text-red-400 font-semibold"
                            : ""
                        }
                      `}
                    >
                      {date.getDate()}
                      {isToday && !isSelected && (
                        <span className="absolute w-1 h-1 bg-red-500 dark:bg-red-400 rounded-full bottom-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="grid grid-cols-3 gap-2 h-64 overflow-y-auto mb-4 scrollbar-thin">
              {years.map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => {
                    setViewDate(new Date(y, viewDate.getMonth(), 1));
                    setViewMode("calendar");
                  }}
                  className={`py-2 text-sm rounded transition-colors cursor-pointer ${
                    y === viewDate.getFullYear()
                      ? "bg-blue-500 text-white"
                      : "text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          )}

          <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-1">
            <QuickBtn
              label="Today"
              days={0}
              icon={<div className="w-3 h-3 bg-current rounded-sm" />}
            />
            <QuickBtn
              label="Tomorrow"
              days={1}
              icon={
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                </svg>
              }
            />
            <QuickBtn
              label="Next Week"
              days={7}
              icon={
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6-1.41 1.41zM16 6h2v12h-2V6z" />
                </svg>
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}
