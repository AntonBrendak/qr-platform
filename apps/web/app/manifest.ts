import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'QR Café',
    short_name: 'QR Café',
    description: 'QR ordering platform',
    start_url: "/de",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0d6efd",
    icons: [
      { src: "/api/pwa/icon/192", sizes: "192x192", type: "image/png" },
      { src: "/api/pwa/icon/512", sizes: "512x512", type: "image/png" },
      { src: "/api/pwa/icon/192?maskable=1", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/api/pwa/icon/512?maskable=1", sizes: "512x512", type: "image/png", purpose: "maskable" }
    ]
  };
}