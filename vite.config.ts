import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      protocolImports: true,
    }),
  ],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        // changeOrigin: true,
        // secure: false,
      },
    },
  },
  base: "/aiidalab/quantum-espresso/",
  resolve: {
    alias: {
      "@assets": "/src/assets",
      "@common": "/src/common",
      "@components": "/src/components",
      "@steps": "/src/components/steps",
      "@panels": "/src/components/panels",
    },
  },
});
