import { defineConfig } from "vite";
import { resolve } from "path";
import minifyHTML from "rollup-plugin-minify-html-literals";
import eslint from "vite-plugin-eslint";

// TODO: auto remove console.log from build
// TODO: improve how docs are generated

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
	return {
		esbuild: {
			drop: mode === "production" ? ["console", "debugger"] : [],
		},
		build: {
			sourcemap: true,
			modulePreload: {
				polyfill: false,
			},
			rollupOptions: {
				input: {
					main: resolve(__dirname, "index.html"),
					"action-store": resolve(__dirname, "src/action-store.ts"),
				},
				output: [
					{
						entryFileNames: `[name].js`,
						assetFileNames: `assets/[name].[ext]`,
						dir: "dist",
					},
				],
				plugins: [
					eslint(),
					minifyHTML.default({
						options: {
							shouldMinify(template) {
								return template.parts.some((part) => {
									// Matches Polymer templates that are not tagged
									return part.text.includes("<style") || part.text.includes("<div");
								});
							},
						},
					}),
				],
			},
		},
	};
});
