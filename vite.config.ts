import { defineConfig, loadEnv } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

export default defineConfig(({ mode }) => {
  // Make server-side variables from .env (e.g. NVIDIA_API_KEY) visible to `vite dev`.
  for (const [key, value] of Object.entries(loadEnv(mode, process.cwd(), ""))) {
    if (process.env[key] === undefined) process.env[key] = value;
  }
  return {
    server: { port: 3000 },
    resolve: { dedupe: ["react", "react-dom", "@tanstack/react-router", "@tanstack/react-start"] },
    plugins: [
      tsConfigPaths(),
      // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
      tanstackStart({ server: { entry: "server" } }),
      viteReact(),
      tailwindcss(),
      // Build-time only. Set NITRO_PRESET (e.g. vercel, netlify, cloudflare_module) for your host;
      // the default builds a Node server.
      ...(process.env["NITRO_PRESET"] ? [nitro({ preset: process.env["NITRO_PRESET"] })] : [nitro()]),
    ],
  };
});
