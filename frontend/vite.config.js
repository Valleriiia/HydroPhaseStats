import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { visualizer } from 'rollup-plugin-visualizer';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
	root: '.',
	publicDir: 'public',
	build: {
		target: 'esnext',
		minify: 'terser',
		outDir: 'build',
		rollupOptions: {
			output: {
				manualChunks: {
					'react-vendor': ['react', 'react-dom'],
					'zustand-vendor': ['zustand']
				}
			}
		},
		terserOptions: {
			compress: {
				drop_console: true,
				drop_debugger: true,
				pure_funcs: ['console.info', 'console.debug', 'console.warn']
			},
			format: {
				comments: false
			}
		},
		emptyOutDir: true,
		sourcemap: false,
		reportCompressedSize: false
	},
	resolve: {
		alias: {
			'@src': path.resolve(__dirname, 'src'),
		},
	},
	plugins: [react(),
		visualizer({
      filename: './build/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true
    })
	],
});