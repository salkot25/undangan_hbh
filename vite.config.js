import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

import { cloudflare } from "@cloudflare/vite-plugin";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const basePath = env.VITE_BASE_PATH || "/";

  return {
    base: basePath,
    plugins: [react(), tailwindcss(), cloudflare()],
    test: {
      environment: "node",
      include: ["src/**/*.test.{js,jsx}"],
      coverage: {
        reporter: ["text", "html"],
      },
    },
  };
});