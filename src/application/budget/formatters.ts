export const formatMoney = (amount: number) =>
  new Intl.NumberFormat("ru-RU", {
    currency: "RUB",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(amount);

export const formatPercent = (value: number) =>
  new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 0,
    style: "percent",
  }).format(value);

export const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "long",
  }).format(new Date(value));
