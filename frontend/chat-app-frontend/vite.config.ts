import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    port: 5173,
    host: true,
    fs: {
      strict: false, // Allows serving files outside of root
      allow: ["public", "static"], // Ensure these folders are accessible
    },
  },
});
