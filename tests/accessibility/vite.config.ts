import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

// Mount production components independently of authentication and live data.
export default defineConfig({
  root: fileURLToPath(new URL("./fixture/", import.meta.url)),
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": fileURLToPath(new URL("../../src/", import.meta.url)) } },
  server: { host: "127.0.0.1", port: 4174, strictPort: true },
});
