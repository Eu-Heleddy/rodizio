import { defineConfig } from "vite";
export default defineConfig({ base: "./", publicDir: false, build: { outDir: "dist", target: "es2020", assetsInlineLimit: 0 } });
