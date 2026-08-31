import type { MetadataRoute } from "next";
import { domain } from "@/config/domain.config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: domain.brand.name,
    short_name: domain.pwa.shortName,
    description: domain.brand.tagline,
    start_url: "/",
    display: "standalone",
    background_color: domain.pwa.backgroundColor,
    theme_color: domain.pwa.themeColor,
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
