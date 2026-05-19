import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: "#f4f5f7",
    categories: ["finance", "productivity"],
    description: "Семейный бюджет с честным коэффициентом и календарем платежей.",
    display: "standalone",
    icons: [
      {
        purpose: "any",
        sizes: "192x192",
        src: "/icons/icon-192.png",
        type: "image/png",
      },
      {
        purpose: "maskable",
        sizes: "512x512",
        src: "/icons/icon-512.png",
        type: "image/png",
      },
    ],
    id: "/dashboard",
    lang: "ru-RU",
    name: "Семейный бюджет",
    orientation: "portrait",
    scope: "/",
    short_name: "Бюджет",
    start_url: "/dashboard",
    theme_color: "#f4f5f7",
  };
}
