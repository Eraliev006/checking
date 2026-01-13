const pad = (value: number) => String(value).padStart(2, "0");

export const toDateKey = (date: Date) => {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export const parseDateKey = (dateKey: string) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const formatTime = (iso: string | null) => {
  if (!iso) return "—";
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export const formatDate = (dateKey: string) => {
  const date = parseDateKey(dateKey);
  return date.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
};

export const getWeekDates = (start: Date) => {
  const dates: string[] = [];
  for (let i = 0; i < 7; i += 1) {
    const next = new Date(start);
    next.setDate(start.getDate() + i);
    dates.push(toDateKey(next));
  }
  return dates;
};

export const getMonthOptions = (count = 6) => {
  const now = new Date();
  return Array.from({ length: count }).map((_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    const value = `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
    return {
      value,
      label: date.toLocaleDateString([], { month: "long", year: "numeric" })
    };
  });
};

export const getMonthRange = (monthValue: string) => {
  const [year, month] = monthValue.split("-").map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  return { start, end };
};

export const isWorkingDay = (date: Date) => {
  const day = date.getDay();
  return day !== 0 && day !== 6;
};

export const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(date.getDate() + days);
  return next;
};
