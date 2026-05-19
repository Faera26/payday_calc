export const MOSCOW_OFFSET = "+03:00";

export const toMoscowDateTime = (date: string, time: string) =>
  `${date}T${time || "12:00"}:00${MOSCOW_OFFSET}`;

export const getDateInputValue = (dateTime: string) => dateTime.slice(0, 10);

export const getTimeInputValue = (dateTime: string) => dateTime.slice(11, 16);

export const getDateKey = (dateTime: string) => dateTime.slice(0, 10);

export const todayDateKey = () => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Europe/Moscow",
    year: "numeric",
  });

  return formatter.format(new Date());
};

export const currentPlanningMonth = () => todayDateKey().slice(0, 7);

export const getDaysInMonth = (month: string) => {
  const [year, monthNumber] = month.split("-").map(Number);

  return new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
};

const toDateKey = (date: Date) => date.toISOString().slice(0, 10);

export const getMonthlyDateKey = (month: string, dayOfMonth: number) => {
  const [year, monthNumber] = month.split("-").map(Number);
  const safeDay = Math.min(Math.max(dayOfMonth, 1), getDaysInMonth(month));
  const date = new Date(Date.UTC(year, monthNumber - 1, safeDay, 12));

  return toDateKey(date);
};

export const moveWeekendDateToFriday = (dateKey: string) => {
  const date = new Date(`${dateKey}T12:00:00${MOSCOW_OFFSET}`);
  const day = date.getUTCDay();

  if (day === 6) {
    date.setUTCDate(date.getUTCDate() - 1);
  }

  if (day === 0) {
    date.setUTCDate(date.getUTCDate() - 2);
  }

  return toDateKey(date);
};

export const getMonthEndDateTime = (month: string) =>
  toMoscowDateTime(getMonthlyDateKey(month, getDaysInMonth(month)), "23:59");

export const countInclusiveDays = (startDateTime: string, endDateTime: string) => {
  const start = new Date(`${startDateTime.slice(0, 10)}T12:00:00${MOSCOW_OFFSET}`);
  const end = new Date(`${endDateTime.slice(0, 10)}T12:00:00${MOSCOW_OFFSET}`);
  const diff = end.getTime() - start.getTime();

  return Math.max(1, Math.floor(diff / 86_400_000) + 1);
};
