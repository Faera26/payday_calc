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
