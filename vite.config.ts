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
				api: 'modern',
				silenceDeprecations: ['mixed-decls'],
			},
		}
	}
})
