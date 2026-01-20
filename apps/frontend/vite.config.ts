import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import packageJson from "./package.json" assert { type: "json" };

// https://vite.dev/config/
export default defineConfig({
   plugins: [react(), tailwindcss()],
   define: {
      APP_VERSION: JSON.stringify(packageJson.version),
   },
});
