import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
// App uses path-based routing: / (login), /Signup, /Dashboard, /Freshness, /NGO, /Elite, /Report, /About, /Settings.
// Deploy at your domain (e.g. resqmeal.com) so URLs look like https://resqmeal.com/Signup, https://resqmeal.com/Dashboard, etc.
export default defineConfig({
  base: "/",
  server: {
    host: true,
    port: 5173,
    hmr: {
      overlay: false,
    },
    proxy: {
      /** REST + uploads → Spring Boot HTTP */
      "/api": { target: "http://localhost:8080", changeOrigin: true },
      "/uploads": { target: "http://localhost:8080", changeOrigin: true },
      /**
       * Socket.IO → Spring Boot (8080), same host as REST API in dev.
       */
      "/socket.io": {
        target: "http://localhost:8080",
        changeOrigin: true,
        ws: true,
        secure: false,
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("leaflet") || id.includes("react-leaflet")) {
              return "map";
            }
            if (id.includes("recharts")) {
              return "charts";
            }
            if (
              id.includes("react") ||
              id.includes("react-dom") ||
              id.includes("react-router")
            ) {
              return "vendor";
            }
          }
          if (id.includes("LanguageContext")) {
            return "i18n";
          }
        },
      },
    },
  },
});
