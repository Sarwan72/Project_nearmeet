// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'



// export default defineConfig({
//   plugins: [react()
//     ],
// })



import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
        secure: false,
      },
    },
    headers: {
    "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
  },
  },
});