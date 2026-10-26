import { defineConfig } from "tsdown"

// ===== Main =====

export default defineConfig({
  entry: ["src/index.ts", "src/http.ts", "src/cli.ts"],
  platform: "node",
  dts: { eager: true },
})
