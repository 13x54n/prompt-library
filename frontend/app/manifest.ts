import type { MetadataRoute } from "next";

/** Web app manifest — installable PWA (with registered service worker). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Maple",
    short_name: "Maple",
    description:
      "Maple is a platform for creating and managing your business.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#000000",
    theme_color: "#3d6b4a",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
