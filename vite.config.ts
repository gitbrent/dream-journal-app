import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// CSS - https://github.com/sass/dart-sass/issues/2280#issuecomment-2296302727
export default defineConfig({
	plugins: [react()],
	server: {
		port: 8080
	},
	css: {
		preprocessorOptions: {
			scss: {
				silenceDeprecations: ['mixed-decls', 'color-functions', 'global-builtin', 'import'],
				quietDeps: true, // Add this line to suppress warnings (above needed for bootstrap SCSS Dart messages)
				//api: 'modern',
			},
		}
	},
	/* following is suppress: `node_modules/gapi-script/gapiScript.js (44:36): Use of eval in "node_modules/gapi-script/gapiScript.js" is [...].` */
	build: {
		rollupOptions: {
			onwarn: (warning, warn) => {
				if (warning.code === 'EVAL') {  // Suppress eval warnings
					return;
				}
				warn(warning); // Otherwise, show other warnings
			}
		}
	}
})
