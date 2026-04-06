import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'  // ✅ this import is required


// https://vite.dev/config/
export default defineConfig({
  plugins: 
  [    
    tailwindcss(),
    react()
  ],
  build: {
    outDir: path.resolve(__dirname, '../static'),  // ✅ use path.resolve
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    open: true,
    host: "0.0.0.0",
  },
})
