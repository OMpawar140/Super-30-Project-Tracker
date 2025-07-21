// import path from "path"
// import tailwindcss from "@tailwindcss/vite"
// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react(), tailwindcss()],
//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "./src"),
//     },
//   },
// })

// vite.config.ts
import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()], // <-- Remove tailwindcss() from here
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})