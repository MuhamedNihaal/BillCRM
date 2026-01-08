import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import jsconfigPaths from "vite-jsconfig-paths";
import eslint from "vite-plugin-eslint";
import svgr from "vite-plugin-svgr";
import path from "path";
import packageJson from "./package.json";
import tailwindcss from "@tailwindcss/vite";
import moment from "moment";

// https://vitejs.dev/config/

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  if (env.VITE_NODE_ENV == "production") {
    const isLocalHost = env.VITE_API_URL?.includes("localhost");
    if (isLocalHost) {
      console.log(
        "%c Warning: You are using localhost in VITE_API_URL during build!",
        "color: red; font-weight: bold;",
      );

      throw new Error("Build aborted: VITE_API_URL points to localhost.");
    }
  }

  return {
    plugins: [react(), jsconfigPaths(), svgr(), tailwindcss(), eslint()],
    define: {
      __APP_VERSION__: JSON.stringify(packageJson.version),
      _NODE_ENV_: JSON.stringify(env.VITE_NODE_ENV),
      __YEAR__: moment().year(),
    },
    server: {
      port: parseInt(env.VITE_PORT) || 3000,
      allowedHosts: ["social.srvinfotech.com"],
    },
  };
});
