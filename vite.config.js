import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const basePath = env.VITE_BASE_PATH || "/";

  return {
    base: basePath,
    plugins: [react(), tailwindcss()],
    test: {
      environment: "node",
      include: ["src/**/*.test.{js,jsx}"],
      coverage: {
        reporter: ["text", "html"],
      },
    },
  };
});
