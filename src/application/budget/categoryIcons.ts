import {
  AirplaneTilt,
  Car,
  Coffee,
  FilmSlate,
  ForkKnife,
  GameController,
  Gift,
  House,
  Lightning,
  Bank,
  ShoppingCartSimple,
  TShirt,
  Wrench,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";

export type CategoryIconKey =
  | "airplane"
  | "car"
  | "coffee"
  | "film"
  | "food"
  | "game"
  | "gift"
  | "home"
  | "light"
  | "bank"
  | "cart"
  | "style"
  | "tools";

export const categoryIconOptions: {
  icon: Icon;
  key: CategoryIconKey;
  label: string;
}[] = [
  { icon: ShoppingCartSimple, key: "cart", label: "Покупки" },
  { icon: ForkKnife, key: "food", label: "Еда" },
  { icon: Car, key: "car", label: "Авто" },
  { icon: GameController, key: "game", label: "Досуг" },
  { icon: Coffee, key: "coffee", label: "Кофе" },
  { icon: House, key: "home", label: "Дом" },
  { icon: Lightning, key: "light", label: "Свет" },
  { icon: AirplaneTilt, key: "airplane", label: "Поездки" },
  { icon: Gift, key: "gift", label: "Подарки" },
  { icon: FilmSlate, key: "film", label: "Кино" },
  { icon: TShirt, key: "style", label: "Одежда" },
  { icon: Bank, key: "bank", label: "Копилка" },
  { icon: Wrench, key: "tools", label: "Ремонт" },
];

export const getCategoryIcon = (iconKey?: string) =>
  categoryIconOptions.find((option) => option.key === iconKey)?.icon ??
  ShoppingCartSimple;
